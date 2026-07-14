---
name: healthcheck-container-resources
description: Use when implementing, debugging, or reviewing @nexload-sdk/healthcheck-node container resource detection and policy across Docker, Kubernetes, Dokploy, Linux cgroup v1/v2, memory and swap limits, CPU quota/cpuset, fractional CPU, source/confidence evidence, readiness thresholds, collector selection, or cgroup test fixtures.
---

# Container Resource Health

## Purpose

Interpret cgroup and host evidence without rounding away limits, confusing unlimited values with failure, or turning telemetry into unsafe readiness policy.

## Trigger boundary

- Use for cgroup v1/v2 parsing, container memory/CPU evidence, fractional quotas, pressure thresholds, and resource check-versus-collector choices.
- Do not use for generic custom checks, exporter naming, Next route wiring, or Payload queries.
- Compose with core for manager policy and exporters when resource collectors feed monitoring.

## Source of truth

Use `packages/healthcheck/node/src/cgroup.ts`, root exports, tests, and README. Kernel files and deployment limits are runtime evidence; container platform labels are not proof by themselves.

## Required inspection

Read the Node package README/package exports, `src/index.ts`, complete `src/cgroup.ts`, `test/cgroup.test.mjs`, and the consuming manager/check/collector configuration before editing.

## Decision flow

1. Identify platform and available cgroup version/files.
2. Parse unlimited sentinels, quotas, cpusets, and numeric values without premature rounding.
3. Preserve source, confidence, warnings, and detection hints.
4. Decide whether the data should affect health (check) or only monitoring (collector).
5. Add readiness thresholds only when limit/ratio evidence is reliable and operationally justified.

## Implementation workflow

1. Reproduce behavior with a temporary cgroup fixture using `root` and `platform` overrides.
2. Add a failing parser/snapshot test for the exact file values.
3. Keep v2-first then v1 fallback behavior and fractional CPU precision.
4. Test check thresholds and collector resources independently when policy changes.
5. Update Node README when detection or public behavior changes.

## Invariants

- Linux detection checks cgroup v2 before v1; non-Linux does not inspect cgroups.
- `max`, very large v1 memory values, and non-positive v1 CPU quota mean unlimited/null.
- CPU quota is quota divided by period and may be fractional.
- Effective CPU is the minimum positive finite quota, cpuset, runtime parallelism, and host count.
- Snapshot evidence includes source/confidence/warnings; detection is not proof of Docker/Kubernetes.
- Monitoring collectors do not affect health status.

## Security and edge cases

Treat permission-denied paths as warnings and missing paths as normal fallback. Do not treat null/unlimited as zero, round fractional CPU, or gate readiness on host-level values when container limits are unknown. Validate threshold ordering in application config because runtime does not enforce it.

## Verification

Run Node package build/lint/test. Cover v1 and v2, unlimited sentinels, fractional CPU, cpuset ranges, malformed/permission cases, non-Linux fallback, threshold boundaries, and collector/check separation.

## Reference routing

- Read [cgroup contract](references/cgroup-contract.md) for detection and parsing rules.
- Read [operational policy](references/operational-policy.md) before making resource data health-critical.
- Read [test fixtures](references/test-fixtures.md) for deterministic v1/v2 coverage.

## Handoff requirements

State detected inputs/version, parsed limits, source/confidence/warnings, effective CPU calculation, check-versus-collector decision, threshold policy, fixture coverage, and validation commands.
