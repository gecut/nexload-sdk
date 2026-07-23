# Troubleshoot Healthcheck Bun

Diagnose runtime mismatch and unavailable Bun counters.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/troubleshooting/
* `bun.runtime` is degraded: confirm the process is running in Bun, not Node.
* Memory fields are `null`: the active process did not expose the expected memory API.
* Server counters are `null`: your server object does not expose those optional properties.
* No health URL exists: the package intentionally does not register routes.

Never expose runtime revision, process identity, or activity detail publicly without reviewing its sensitivity.
