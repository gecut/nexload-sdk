# payload-hooks — Optimization

Production choices for @nexload-sdk/payload-hooks.

**Topic:** optimization
**Package:** `@nexload-sdk/payload-hooks` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-hooks/optimization/
## Declare the auth collection

Declare an auth collection in the config to include it in auditing. Payload creates its implicit users collection after plugins run.

## Interpret write events in context

Write events from afterChange and afterDelete run before the database transaction commits.

## Avoid read auditing by default

Read auditing is off by default. When enabled, `find` logs once per request with a count, while `findByID` logs the document ID.

## Treat audit output as logs

The plugin does not persist database audit records. Authentication auditing covers successful logins and password resets, not failed logins.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-hooks/src/index.ts).
