# @nexload-sdk/healthcheck-prometheus

Prometheus/OpenMetrics text serializers for `@nexload-sdk/healthcheck`.

```ts
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

const text = toPrometheusText(report, { prefix: "nexload" });
```
