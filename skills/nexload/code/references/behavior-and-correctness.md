# Behavior and correctness

## Contracts

Define or preserve predictable inputs, outputs, side effects, and failure behavior. Check the actual caller and consumer contract before changing a return shape, timing, ordering, mutation, or error. Refactoring preserves observable behavior unless the request authorizes a change.

## Error integrity

Use the validation rules in [type and trust boundaries](type-trust-boundaries.md). Handle an error where the code can recover, translate, or add useful context; otherwise let it propagate with its cause. Do not swallow errors, return fabricated success, replace a meaningful error with a generic message, or log credentials, raw bodies, tokens, or unreviewed error text in exposed diagnostics. Internal error propagation must still preserve the original cause. Keep established nullable or result-union contracts for expected outcomes; do not universally replace them with exceptions or empty collections. A documented fallback is recovery only when the contract permits it. Detailed error taxonomies and public envelopes belong to the specialist that owns them.

## Asynchronous work

Every async operation has an owner. Await work whose completion or failure is part of the current contract. For intentionally detached work, document why it is detached and define its error reporting, cancellation, and shutdown behavior. Do not create background tasks that outlive their owner accidentally. `void promise` does not handle rejection; `.finally()` creates another promise whose failure also needs ownership. Parallelize only independent work; preserve ordering when effects depend on it.

## Concurrency and data integrity

Identify whether concurrent calls can observe or mutate shared state. Preserve the domain's existing atomic claim, transaction, lock, cursor, or recovery mechanism when one exists. Add coordination only for a reachable race or invariant; state who owns it, what happens on restart, duplicate delivery, cancellation, and partial failure.

Multi-step changes must preserve relevant invariants under failure. Use the owning domain's transaction or recovery boundary instead of prescribing a universal database architecture.

A process-local map cannot coordinate multiple processes; a transaction alone does not automatically deduplicate operations or protect an external side effect. Use the actual invariant and existing domain mechanism to decide what must be atomic. Do not retry non-idempotent work without a defined recovery contract.

## Resource lifecycle

Timers, subscriptions, listeners, files, connections, queues, caches, and buffers need explicit creation, ownership, cleanup, and retention bounds when they can outlive one call or grow over time. Keep configuration distinct from mutable runtime state; do not mutate caller configuration invisibly. Prefer consumer-owned instances when consumers need independent state. Do not introduce hidden mutable globals or convenience singletons; preserve an intentional shared instance when its contract and lifetime require it. Local mutation inside an owned algorithm is acceptable. Use cleanup on success and failure (such as `finally` where appropriate); prevent cleanup errors from masking the primary failure.

## Review questions

- What behavior is observable by callers, consumers, or operators?
- Which boundary validates input and preserves failure context?
- Who owns completion, cancellation, cleanup, and recovery?
- What invariant could concurrent or partial execution violate?
- Which specialist owns details outside this foundational standard?

Async rationale: [typescript-eslint no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) distinguishes discarded promises from handled rejections.
