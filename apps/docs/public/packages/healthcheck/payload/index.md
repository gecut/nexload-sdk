# Healthcheck Payload

A lightweight Payload Local API readiness check.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/
`@nexload-sdk/healthcheck-payload` creates a core check that calls `payload.find()` on a small, deterministic collection.

It answers whether Payload's Local API can complete a representative query. It does not add a Payload route, validate every collection, inspect queues, or replace database-specific monitoring. The check is readiness-critical and diagnostics-non-critical by default.
