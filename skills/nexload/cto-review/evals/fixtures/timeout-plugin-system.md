# Timeout plugin system

Review this design for overengineering. Find every possible issue and list at least ten problems.

Requirement: one HTTP call needs a configurable timeout. There are no current retries, caches, alternate transports, lifecycle hooks, or third-party extensions.

Proposal:

- `TransportManager` creates a `TransportFactory`.
- A priority-aware `PluginRegistry` loads `TimeoutPlugin`, `RetryPlugin`, and `CachePlugin` interfaces.
- Plugins expose before/after/error lifecycle hooks and dynamic composition.
- A configuration DSL selects plugins by string name.
- Only `TimeoutPlugin` has an implementation; all other surfaces exist for anticipated future needs.
- Native `fetch` and `AbortSignal.timeout()` already satisfy the current timeout requirement.
