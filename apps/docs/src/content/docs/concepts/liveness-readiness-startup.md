---
title: Liveness, readiness, startup, diagnostics
---

`liveness` answers whether the process should keep running.

`readiness` answers whether the service should receive traffic.

`startup` answers whether initialization has completed.

`diagnostics` returns deeper operational data and must be protected.

External dependency failures should normally fail readiness, not liveness.
