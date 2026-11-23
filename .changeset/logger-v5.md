---
"@nexload-sdk/logger": major
---

### Migration

- Log levels in output are now lowercase. `LOG_LEVEL` values are lowercase; uppercase values remain accepted.
- `NexloadLogger`, renderers, and the `log-test` subpath have been removed.
- Configure logging once with `configureLogger`.
