---
title: Check contract
---

Use `defineHealthCheck()` for custom checks.

Every check receives `scope`, `signal`, `runtime`, `service`, `profile`, `now`, and `result`.

Checks should return raw metrics and stable error codes.
