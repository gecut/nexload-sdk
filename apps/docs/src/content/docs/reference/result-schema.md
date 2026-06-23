---
title: Result schema
---

Reports use `schemaVersion: "2.0"` and include service identity, scope, status, observation time, duration, runtime identity, summary, checks, metrics, and optional resources.

Every check result includes `observedAt`, `durationMs`, `timedOut`, `attempt`, `metrics`, and optional `error`.
