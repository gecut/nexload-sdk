# Migrate Healthcheck Bun

Verify Bun runtime output after an upgrade.

**Topic:** migration
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/migration/
This page targets `@nexload-sdk/healthcheck-bun` 2.1.0 with Core 4.1.0.
Identify your source version in the
[Bun changelog](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/bun/CHANGELOG.md).

Upgrade core and Bun together. Type-check the manager and server object, then compare runtime name/version, nullable memory fields, check names, scopes, and pending-request metrics.

Test under the Bun version used in production. Keep your route and authentication behavior unchanged; this package does not own either.
