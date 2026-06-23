---
title: Status model
---

Statuses are `ok`, `degraded`, and `unhealthy`.

Critical unhealthy checks make the report unhealthy. Critical degraded checks make it degraded. Non-critical failures degrade the report by default.

Default HTTP mapping is `ok -> 200`, `degraded -> 200`, and `unhealthy -> 503`.
