# Healthcheck OpenTelemetry compatibility

Transform and SDK ownership boundaries.

**Topic:** compatibility
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/compatibility/
The package consumes the current core report and publishes ESM, CommonJS, and declarations. Repository tests cover the plain transforms.

Because no OpenTelemetry package is imported or declared as a peer, this package makes no SDK-version or exporter compatibility claim. Your bridge owns instrument selection, batching, transport, retry, and shutdown.

The transform has no Node engine range. Its current repository verification
target is Node 22 and the `HealthReport` from Core 4.1.0. Test the returned
plain records with the exact OpenTelemetry SDK version owned by your
application.
