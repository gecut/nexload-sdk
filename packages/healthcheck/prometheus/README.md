# @nexload-sdk/healthcheck-prometheus

Prometheus/OpenMetrics text serializers for `@nexload-sdk/healthcheck`.

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/api/)

```ts
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

const text = toPrometheusText(report, {
  prefix: "nexload",
  includeDescriptions: true
});
```

Exporters serialize `report.metrics`, which come from metric collectors. Metrics embedded in individual check results remain available in JSON reports and are not exported as monitoring series. Unsupported or high-cardinality labels are dropped by the Prometheus label allowlist.
