import { EnvManager, merge } from "@nexload-sdk/env";
import { $NodePreset } from "@nexload-sdk/env/presets";
import logger from "@nexload-sdk/logger";
import { Pool } from "undici";

/**
 * Pool metadata for lifecycle tracking.
 */
interface PoolInfo {
  pool: Pool
  created: number
  lastUsed: number
}

/**
 * Singleton manager for Undici connection pools.
 * Handles:
 * - Automatic cleanup of idle pools
 * - Graceful shutdown on process signals
 * - Runtime-safe (Next.js / Edge compatible)
 *
 * Optimized for low GC pressure and minimal object churn.
 */
export class ConnectionPoolManager {
  // ────────────────────────────────────────────────────────────────
  // Dependencies
  // ────────────────────────────────────────────────────────────────

  private static instance: ConnectionPoolManager;

  protected readonly env = new EnvManager(
    "connection-manager", merge(
      $NodePreset, {
        NEXT_DEV_SERVER: { type: "boolean", default: false, },
        NEXT_RUNTIME: { type: "boolean", default: false, },
      }
    )
  );

  protected readonly logger: typeof logger = logger.child({
    package: "@nexload-sdk/pool-fetch",
    class: "ConnectionPoolManager",
  });

  // ────────────────────────────────────────────────────────────────
  // Internal state
  // ────────────────────────────────────────────────────────────────

  private readonly pools = new Map<string, PoolInfo>();

  private cleanupTimer: NodeJS.Timeout | null = null;

  private readonly listenersRegistered = false;

  // Shared immutable config object — reused per Pool creation
  private readonly CONFIG = Object.freeze({
    connections: this.env.$("NODE_ENV") === "development" ? 5 : 15,
    pipelining: 6,
    keepAliveTimeout: 60_000,
    keepAliveMaxTimeout: 600_000,
    headersTimeout: 30_000,
    bodyTimeout: 60_000,
    maxRedirections: 3,
    maxRequestsPerClient: 0,
  });

  // Cleanup configuration
  private static readonly CLEANUP_INTERVAL = 300_000; // 5 min

  private static readonly MAX_IDLE_TIME = 600_000; // 10 min

  // ────────────────────────────────────────────────────────────────
  // Construction & Singleton
  // ────────────────────────────────────────────────────────────────

  private constructor () {
    if (!this.isNextRuntime()) this.startCleanup();
    this.registerShutdownHandlers();
  }

  public static getInstance (): ConnectionPoolManager {
    if (!this.instance) this.instance = new ConnectionPoolManager();
    return this.instance;
  }

  // ────────────────────────────────────────────────────────────────
  // Runtime Detection
  // ────────────────────────────────────────────────────────────────

  private isNextRuntime (): boolean {
    return Boolean(this.env.$("NEXT_RUNTIME")
      || (this.env.$("NODE_ENV") === "development"
        && this.env.$("NEXT_DEV_SERVER")));
  }

  // ────────────────────────────────────────────────────────────────
  // Pool Retrieval / Creation
  // ────────────────────────────────────────────────────────────────

  /**
   * Returns an active pool for a given URL origin.
   * If it doesn’t exist, creates a new one using shared configuration.
   */
  public getPool (url: string): Pool {
    const origin = new URL(url).origin;
    const now = Date.now();

    // Micro-opt: get() call once
    const existing = this.pools.get(origin);
    if (existing) {
      existing.lastUsed = now;
      return existing.pool;
    }

    // Create and store pool
    const pool = new Pool(
      origin, this.CONFIG
    );
    this.pools.set(
      origin, { pool, created: now, lastUsed: now, }
    );

    this.logger.debug(
      { origin, }, "Created new connection pool"
    );
    return pool;
  }

  // ────────────────────────────────────────────────────────────────
  // Cleanup Cycle
  // ────────────────────────────────────────────────────────────────

  private startCleanup (): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(
      () => void this.cleanup(), ConnectionPoolManager.CLEANUP_INTERVAL
    );

    // Prevent timer from keeping Node process alive unnecessarily
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

  /**
   * Iterates through all connection pools and closes idle ones.
   */
  private async cleanup (): Promise<void> {
    const now = Date.now();

    // Fast filter pass — precollect to avoid Map mutation during iteration
    const idleOrigins: string[] = [];

    this.pools.forEach((
      info, origin
    ) => {
      if (now - info.lastUsed > ConnectionPoolManager.MAX_IDLE_TIME) {
        idleOrigins.push(origin);
      }
    });

    if (idleOrigins.length === 0) return;

    await Promise.allSettled(idleOrigins.map(async (origin) => {
      const info = this.pools.get(origin);
      if (!info) return;

      try {
        await info.pool.close();
        this.pools.delete(origin);
        this.logger.debug(
          { origin, }, "Cleaned idle pool"
        );
      } catch (err) {
        this.logger.warn(
          { origin, err, }, "Failed to close pool"
        );
      }
    }));
  }

  // ────────────────────────────────────────────────────────────────
  // Shutdown Handling
  // ────────────────────────────────────────────────────────────────

  /**
   * Registers graceful shutdown hooks for process signals.
   */
  private registerShutdownHandlers (): void {
    if (this.isNextRuntime() || this.listenersRegistered) return;

    const shutdown = async (signal: string) => {
      this.logger.debug(
        { signal, }, "Graceful shutdown started"
      );
      try {
        await this.closeAll();
      } catch (err) {
        this.logger.error(
          { err, }, "Error during shutdown"
        );
      }

      // Avoid exiting on Next.js runtimes
      if (!this.isNextRuntime()) process.exit(0);
    };

    // Use `once` to prevent memory leaks in dev watch mode
    process.once(
      "SIGTERM", () => void shutdown("SIGTERM")
    );
    process.once(
      "SIGINT", () => void shutdown("SIGINT")
    );
    process.once(
      "beforeExit", () => this.closeAll().catch(() => null)
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Pool Lifecycle & Health
  // ────────────────────────────────────────────────────────────────

  /**
   * Closes all pools immediately.
   * Used during service shutdown or process exit.
   */
  public async closeAll (): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    await Promise.allSettled(Array.from(this.pools.values()).map(({ pool, }) => pool.close()));

    this.pools.clear();
    this.logger.debug(
      {}, "All pools closed"
    );
  }

  /**
   * Returns lightweight health snapshot for observability.
   */
  public getHealth (): {
    status: "healthy" | "warning" | "error"
    pools: number
    totalConnections: number
    oldestPool: number
  } {
    const count = this.pools.size;
    const total = count * this.CONFIG.connections;
    const now = Date.now();

    // Micro-opt: single loop instead of map() + spread + Math.max
    let oldest = 0;
    for (const info of Array.from(this.pools.values())) {
      const age = now - info.created;
      if (age > oldest) oldest = age;
    }

    let status: "healthy" | "warning" | "error" = "healthy";
    if (count > 10 || oldest > 3_600_000) status = "warning";

    return { status, pools: count, totalConnections: total, oldestPool: oldest, };
  }
}
