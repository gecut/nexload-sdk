---
name: nexload-healthcheck-docker-cgroup
description: Use when implementing or debugging Docker, Kubernetes, Dokploy, cgroup v1/v2, container memory, or fractional CPU limit behavior in @nexload-sdk/healthcheck-node.
---

# Docker and Cgroup Detection

Use `@nexload-sdk/healthcheck-node`.

Detection order:

1. cgroup v2 files under `/sys/fs/cgroup`.
2. cgroup v1 files under `/sys/fs/cgroup/memory`, `/sys/fs/cgroup/cpu`, and `/sys/fs/cgroup/cpuset`.
3. Node process APIs.
4. OS fallback.

Preserve fractional CPU quota values such as `0.5`. Do not round quota CPUs to an integer.

Expose source and confidence whenever reporting container data.
