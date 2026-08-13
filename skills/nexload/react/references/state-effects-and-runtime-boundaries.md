# State, effects, and runtime boundaries

## Classify work before coding

| Work | Preferred location |
| --- | --- |
| Pure value from props/state | render or a pure helper |
| User-triggered command | event handler |
| Synchronization with DOM, timer, subscription, network, or widget | effect with cleanup |
| Shared canonical value | nearest common owner |
| Browser-only interaction | smallest client subtree |

Do not use an effect to copy props into state, derive filtered data, or react to a click that already has a handler. An effect is appropriate when React must keep an external system synchronized.

## State design

- Store the minimum canonical facts; derive labels, filtered collections, and booleans during render.
- Avoid duplicated state and impossible combinations. Prefer a discriminated status when transitions matter.
- Preserve state only while component identity should remain the same; use keys deliberately when identity changes.
- Treat memoization as a performance tool backed by evidence, not as a semantic requirement.

## Effect discipline

- Include every reactive dependency or restructure the code so the dependency is no longer reactive.
- Pair subscriptions, observers, timers, and imperative widgets with cleanup.
- Cancel or ignore stale async results. Do not let a slower request overwrite newer state.
- Keep setup safe under development remounting and repeated synchronization.

## Client and host boundaries

- Do not mark a whole page/client tree interactive when only one leaf needs state, effects, event handlers, or browser APIs.
- Prefer `fetch`, `URL`, `AbortController`, `FormData`, and semantic host controls when they satisfy the requirement.
- Keep framework-specific cache, route, action, and serialization policy out of this general React standard; compose with the future Next.js skill.

## Justified interop exception

An imperative third-party widget may require a contained assertion or loosely typed adapter. Keep that escape hatch in one boundary module, validate what can be validated, expose a typed React-facing contract, and explain why the upstream types are insufficient.

## Primary sources

- React, [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- React, [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- React, [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- React, [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
