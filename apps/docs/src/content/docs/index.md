---
title: Healthcheck
description: Production health and monitoring data foundation for Nexload SDK services.
---

`@nexload-sdk/healthcheck` is the runtime-neutral core for health orchestration, monitoring reports, redaction, and JSON output.

Use separate packages for runtime, framework, and exporter integrations. The core package does not import Next.js, Payload, Prometheus, OpenTelemetry, Bun, `ping`, or `systeminformation`.
