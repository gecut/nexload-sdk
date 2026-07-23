# Migrate Healthcheck Prometheus

Protect dashboards and alerts during an exporter upgrade.

**Topic:** migration
**Package:** `@nexload-sdk/healthcheck-prometheus` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/migration/
This page targets `@nexload-sdk/healthcheck-prometheus` 2.1.0 with Core 4.1.0.
Identify your source version in the
[Prometheus changelog](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/prometheus/CHANGELOG.md).

Upgrade core and exporter together. Snapshot representative Prometheus and OpenMetrics output, including status, durations, descriptions, prefixes, default labels, collector values, escaping, and EOF.

Compare metric and label names before deployment. Any change can break dashboards or alert rules. Roll back the exporter if scrape output changes unintentionally.
