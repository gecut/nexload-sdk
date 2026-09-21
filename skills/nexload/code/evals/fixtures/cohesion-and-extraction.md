# Export-service refactor

An internal `run-export.ts` module prepares input, validates access, computes an export eligibility decision, writes through an injected store, and returns the existing receipt. Two entry functions repeat the same 12-line eligibility policy; changes to this policy must apply to both. Each also contains a one-line `const label = input.label.trim()` used only locally. A 32-line byte-encoding loop is cohesive and tested.

The proposal moves every statement to a one-line helper, splits the encoding loop to meet a 20-line limit, and merges eligibility with a visually similar marketing filter (owned by marketing with different change requirements). It puts the shared policy in `store.ts`. The existing dependency direction is `run-export.ts -> eligibility.ts` and `run-export.ts -> store.ts`; `store.ts` already imports eligibility types. The proposal also changes `eligibility.ts` to import `store.ts` to obtain the policy, creating a cycle.

Propose the smallest coherent refactor. Keep behavior, effect order, and export surface unchanged. Explain which extraction is worthwhile and which proposed changes should be rejected.
