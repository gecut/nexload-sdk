---
title: Docker, Kubernetes, and Dokploy
---

Container detection reads cgroup v2 and v1 data before falling back to Node or host OS data.

Use `containerResourceCheck()` for diagnostics and readiness thresholds only when you explicitly want memory pressure to affect readiness.

Fractional CPU quotas are preserved in `container.cpu.quota_cpus`.
