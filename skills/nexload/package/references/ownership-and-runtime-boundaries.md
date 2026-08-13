# Ownership and runtime boundaries

## Choose the owner

Before creating a package, ask in order:

1. Does an existing package already own the capability?
2. Is this a runtime adapter of an existing core contract?
3. Is it an optional framework or host integration?
4. Does it have an independent consumer, dependency, runtime, or release boundary that justifies a package?

Package count is not the objective. Clear ownership is. Avoid `utils`, `common`, or `manager` packages whose only theme is reuse.

## Dependency direction

```text
framework/integration (Next.js, Payload, exporters)
        → runtime adapter (Node, Bun, browser)
        → runtime-neutral core
```

Arrows mean “may depend on.” Core must not import toward the adapter or integration. An integration may translate host requests into core operations, but route handlers and adapters should not quietly become domain managers.

## Runtime matrix

State which environments each entrypoint supports before implementation:

- Node or Bun server;
- browser;
- runtime-neutral/config-time;
- Next.js server/client;
- Payload server/Admin.

Do not infer a universal ESM/CJS policy from current packages. Select ESM-only or dual output from real consumer needs, then test every declared lane. Keep application lifecycle outside an adapter unless the package genuinely owns it.

## Stateful APIs

Prefer factories or instances when consumers need independent state, configuration, cleanup, or tests. A process-scoped singleton is acceptable only when process-wide identity is the actual contract; keep configuration explicit and avoid hidden mutable global replacement.

## Review questions

- Can one sentence name the package's owned capability?
- Does every dependency arrow point toward less runtime-specific knowledge?
- Can a browser-safe import be evaluated without server/client leakage?
- Is the proposed package boundary cheaper to maintain than an internal module?
