# Operational policy

## Check or collector

`containerResourceCheck` defaults to diagnostics and non-critical. It returns snapshot data in details and raw check metrics. Use it in readiness only when resource pressure should actively remove an instance from traffic and the ratio is based on a reliable limit.

`containerMetricsCollector` defaults to diagnostics and emits report metrics/resources without changing health status. Prefer it for monitoring. Manager-normalized collector failure appears as `collector.container.metrics.up = 0`.

## Thresholds

Optional memory-used-ratio thresholds map below degraded to ok, at/above degraded to degraded, and at/above unhealthy to unhealthy. Application configuration should enforce:

```text
0 <= degraded < unhealthy <= 1
```

The package does not currently validate that ordering. Do not apply hard thresholds when memory limit/ratio is null, host-derived, or low-confidence without a documented fallback policy.

## CPU policy

Never round effective CPU to an integer. A quota of 0.5 CPU is operationally distinct from 1 CPU. Use the minimum reliable constraint rather than host CPU count alone.

## Common failure modes

- treating unlimited null as exhausted capacity;
- using monitoring collection as a readiness gate;
- assuming cgroup detection proves a particular platform;
- ignoring source/confidence/warnings;
- using host resources instead of the effective container limit;
- adding liveness failures for pressure that should degrade readiness or alert only.

Document whether orchestration already enforces memory/CPU eviction so application readiness policy does not amplify churn.
