# Glossary

Shared terms used across Healthcheck and Payload package documentation.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/start/glossary/
## Healthcheck

* **Check:** work whose status can affect an aggregated health report.
* **Collector:** monitoring data that does not independently change health status.
* **Scope:** the operational question being answered: liveness, readiness, startup, or diagnostics.
* **Runtime adapter:** the package-owned seam that provides runtime identity and snapshots.
* **Exporter:** a formatter that converts an existing report; it does not run checks.

## Payload

* **Canonical schema:** the Zod schema that owns intrinsic field value validation and normalization.
* **Compiled field:** an ordinary Payload field configuration produced from a higher-level definition.
* **Consumer hook:** a hook supplied by the application rather than the package.
* **Native field:** a Payload data field passed through an explicit escape hatch.
* **Populated relationship:** a related document returned instead of its stored ID; it belongs to an output contract, not a canonical relationship schema.
* **Minor units:** integer currency units used for persistence, such as the smallest configured denomination.
