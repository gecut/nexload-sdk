# Production Guides & Recipes

Attaching health metrics to OpenTelemetry spans, semantic conventions, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-otel` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/guides/
## Attaching Health Reports to OpenTelemetry Spans

When running a health check endpoint under an active distributed trace:

```ts
import { otelExporter } from "@nexload-sdk/healthcheck-otel";
import { trace } from "@opentelemetry/api";
import { health } from "@/lib/health";

const exporter = otelExporter({ namespace: "service" });

export async function handleHealthCheck() {
  const tracer = trace.getTracer("health-tracer");

  return tracer.startActiveSpan("health.check", async (span) => {
    try {
      const report = await health.run("readiness");
      const attributes = exporter.exportAttributes(report);

      // Attach structured attributes directly to span
      span.setAttributes(attributes);

      if (report.status === "unhealthy") {
        span.setStatus({ code: 2, message: "Health check failed" });
      }

      return Response.json(report);
    } finally {
      span.end();
    }
  });
}
```

***

## Troubleshooting & Common Pitfalls

### 1. Attribute Type Mapping

OpenTelemetry spans accept string, number, and boolean attribute values. Nested objects in `report.checks[].data` are serialized as JSON strings or flattened automatically according to OTel semantic guidelines.

### 2. Standalone Operation

`@nexload-sdk/healthcheck-otel` does not initialize or configure the OpenTelemetry Node SDK itself. It acts as a converter; your application must initialize the OpenTelemetry SDK provider.
