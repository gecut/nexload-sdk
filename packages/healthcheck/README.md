# @nexload-sdk/healthcheck

<div align="center">
  <img src="https://img.shields.io/badge/healthcheck-k8s--ready-green?style=flat-square" alt="healthcheck" />
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/healthcheck?style=flat-square" alt="npm version" />
  <br><br>
  <strong>Ultra-lightweight, extensible, and framework-agnostic health checking for Node.js & Kubernetes.</strong>
</div>

---

## Features

- ✅ **Built-in health types:** `liveness` & `readiness`
- 🧩 **Composable:** Add custom checks or DB adapters easily
- ⚡ **Bundled checks:** memory, CPU, uptime, ping, DB (Payload adapter)
- 🧱 **Framework-agnostic** (Next.js, Nest, Payload, raw Node.js)
- 🪶 **Zero Express/HTTP dependency**
- 🧠 **Fully async, type-safe (TS)**
- 🔒 **Optional token/IP security**
- 🕊️ **Graceful shutdown awareness**
- 🧰 **Structured, machine- and human-friendly JSON output**

---

## Installation

```bash
npm install @nexload-sdk/healthcheck
```

---

## Quick Start

```typescript
import {
  HealthManager,
  MemoryHealthCheck,
  ProcessorHealthCheck,
  UptimeHealthCheck,
  NetworkHealthCheck,
  DatabaseHealthCheck,
  PayloadAdapter,
} from "@nexload-sdk/healthcheck";

const health = new HealthManager({
  checks: [
    new MemoryHealthCheck(),
    new ProcessorHealthCheck(),
    new UptimeHealthCheck(),
    new NetworkHealthCheck("8.8.8.8"),
    new DatabaseHealthCheck(
      new PayloadAdapter(payload, { collection: "users", limit: 1 })
    ),
  ],
  security: { token: process.env.HEALTH_TOKEN },
});

health.setShutdownSignal(["SIGTERM", "SIGINT"]);

const liveness = await health.run("liveness");
console.log(JSON.stringify(liveness, null, 2));
```

---

## Advanced & Extensibility

### Write a custom health check

```typescript
class CustomCheck extends HealthCheck<"custom"> {
  constructor() {
    super("custom", ["readiness"]);
  }
  async run() {
    // return custom HealthCheckResult
  }
}
```

### Implement a custom database adapter

Implement the `DatabaseClientAdapter` interface for your DB driver of choice, then use it with `DatabaseHealthCheck`.

---

## API Reference

| Export                  | Description                                              |
|-------------------------|----------------------------------------------------------|
| `HealthManager`         | Core orchestrator for managing checks                    |
| `HealthCheck`           | Abstract base class for all health checks                |
| `MemoryHealthCheck`     | Monitors system memory                                   |
| `ProcessorHealthCheck`  | Monitors system CPU load                                 |
| `UptimeHealthCheck`     | Reports Node.js process uptime                           |
| `NetworkHealthCheck`    | Reports latency to a remote host                         |
| `DatabaseHealthCheck`   | Pings a database via an adapter (payload adapter built-in)|
| `PayloadAdapter`        | Payload CMS adapter for DB health checks                 |
| `DatabaseClientAdapter` | Interface for writing new DB adapters                    |
| `HealthCheckResult`     | Standard typed output for every check                    |

---

## Kubernetes Integration

Add as liveness/readiness probe in your Kubernetes manifest:

```yaml
livenessProbe:
  httpGet:
    path: /api/health/liveness
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /api/health/readiness
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

Trigger these endpoints using:

```typescript
await health.run("liveness");
await health.run("readiness");
```

---

## Output Example

```json
{
  "name": "summary",
  "type": ["readiness"],
  "status": "ok",
  "metrics": { "total": 3, "ok": 3, "degraded": 0, "unhealthy": 0 },
  "details": {
    "memory": { "status": "ok", "metrics": { ... } },
    "processor": { "status": "ok", "metrics": { ... } },
    "database": { "status": "ok", "metrics": { ... } }
  }
}
```

---

## Best Practices

- Use as a lightweight, universal probe—no web dependencies!
- Extend via subclassing or write adapters for any DB/service.
- Secure endpoints using the built-in token/IP filters.
- Always run in async/parallel mode for max performance.

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) — Cloud-ready developer tools for robust apps.
