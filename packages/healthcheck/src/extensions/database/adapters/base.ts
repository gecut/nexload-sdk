export interface DatabaseClientAdapter {
  /** Try to connect and optionally run a lightweight query */
  ping(): Promise<number> // returns latency (ms)
  /** Close connection (optional, for cleanup) */
  close?(): Promise<void>
}
