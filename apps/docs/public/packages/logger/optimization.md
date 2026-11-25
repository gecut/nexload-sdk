# logger — Optimization

Production choices for @nexload-sdk/logger.

**Topic:** optimization
**Package:** `@nexload-sdk/logger` v5.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/logger/optimization/
## Extend redaction for deeper objects

Default redaction covers keys at the top level and one level below it. Add explicit paths for sensitive fields deeper in the object.

## Configure once

Call `configureLogger()` at startup. A subsequent call without `force: true` keeps the existing configuration.

## Respect browser and Edge behavior

Browser and Edge builds use Pino browser output. `withLogContext` is pass-through, and `pretty` and `destination` do not configure a server stream.

## Rebuild Payload configuration after replacement

A forced logger reconfiguration requires rebuilding Payload configuration created with `getPayloadLoggerConfig()` to pick up the change.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/logger/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/logger/SKILL.md).
