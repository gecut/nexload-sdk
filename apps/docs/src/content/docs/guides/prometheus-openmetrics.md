---
title: Prometheus and OpenMetrics
---

Use `@nexload-sdk/healthcheck-prometheus`.

```ts
import { toPrometheusText } from "@nexload-sdk/healthcheck-prometheus";

const text = toPrometheusText(report, {
  prefix: "nexload",
  defaultLabels: { service: "api" },
});
```

Labels are intentionally low-cardinality. Raw error messages are never labels.
