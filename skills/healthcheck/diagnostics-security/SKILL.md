---
name: healthcheck-diagnostics-security
description: Use when exposing or reviewing diagnostics, metrics, route protection, redaction, or sensitive healthcheck details.
---

# Diagnostics Security

Public probe routes should be minimal.

Protect diagnostics and metrics with authentication, private networking, IP allowlists, or reverse-proxy rules.

Never expose:

- environment variables
- tokens or API keys
- authorization headers
- cookies
- database URLs
- connection strings
- stack traces in public responses

Use redaction defaults unless the route is private and explicitly intended for debugging.
