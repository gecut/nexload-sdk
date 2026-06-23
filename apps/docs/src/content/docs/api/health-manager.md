---
title: Health manager
---

`createHealthManager(options)` returns a manager with:

- `register(check)`
- `registerCollector(collector)`
- `unregister(name)`
- `run(scope, options)`
- `setShutdownState(state, reason)`
- `isShuttingDown()`
- `dispose()`
