# Healthcheck Prometheus compatibility

Text-format and package compatibility.

**Topic:** compatibility
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/compatibility/
The package consumes current core `HealthReport` values and publishes ESM, CommonJS, and declarations. It has no Prometheus SDK dependency.

Repository tests cover serializer behavior. This documentation does not claim compatibility with every Prometheus server release. Validate scrape content and content type in your deployed monitoring stack.

The serializer has no Node engine or Prometheus peer range. Its current
repository verification target is Node 22 and the `HealthReport` from Core
4.1.0. Prometheus server versions remain application-verified because the
package only emits text.
