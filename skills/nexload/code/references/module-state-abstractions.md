# Modules, state, and abstractions

## Change locality

Start at the exact caller, state transition, or side effect. Modify the smallest cohesive owner and avoid cleanup that does not reduce risk for the requested behavior.

## File naming

Use kebab-case for every project-authored filename whose exact name is not externally mandated, including React components and other files whose exported symbols use PascalCase. For example:

- `product-card.tsx`, not `ProductCard.tsx`, `productCard.tsx`, or `product_card.tsx`;
- `parse-metrics.ts`, not `parseMetrics.ts`;
- `product-card.test.tsx` and `product-card.stories.tsx` for recognized dot-separated roles;
- `_stock-badge.tsx` when the React private-locality convention applies: `_` is the locality marker and `stock-badge` remains kebab-case.

Keep exact conventional names that an external contract requires, such as `package.json`, `README.md`, `SKILL.md`, `AGENTS.md`, `next.config.ts`, and framework-reserved route files. Generated and vendored files retain their producer's names.

Apply the rule to new files and deliberate renames. When materially changing a legacy nonconforming file, rename it only when imports, export maps, framework discovery, case-sensitive filesystems, and consumers can be updated safely within scope; otherwise record the migration conflict instead of hiding a broad rename inside unrelated work. Symbol naming remains language-specific: React component identifiers stay PascalCase even though their filenames are kebab-case.

## Function and module design

- Give each function one clear responsibility and make side effects visible in its name or owning module.
- Prefer guard clauses and explicit branches over deep nesting or clever expression chains.
- Prefer local mutation inside an owned algorithm over mutation hidden across helpers.
- A file has one primary responsibility, but trivial helpers may remain beside their owner.
- Keep substantive implementation out of `index.ts` when it is serving as a module or public export boundary.
- Import internal modules directly instead of through the package's own public barrel when that makes dependency direction clearer.

Names should communicate domain meaning. Use verbs such as `create`, `define`, `parse`, `resolve`, `normalize`, or `validate` when accurate, but prefer a better domain verb over mechanical vocabulary.

## Abstraction test

Introduce an abstraction only when it owns at least one concrete concern:

- policy or invariant;
- lifecycle or resource cleanup;
- runtime/framework boundary;
- behavior family with current variants;
- meaningful duplication with the same reason to change.

Reject a new manager, helper layer, factory, adapter, plugin, cache, retry system, or transport created only for possible future reuse. A renamed wrapper around an existing native API is not added value.

## State and lifecycle

- Keep the owner of state, initialization, teardown, and concurrency visible.
- Prefer consumer-owned instances when consumers need independent state.
- Avoid mutable module globals and implicit singleton initialization.
- Make subscription, timer, process-listener, file, and connection cleanup explicit.
- Keep configuration distinct from runtime state; do not mutate caller configuration invisibly.

Object configuration is preferred when parameters are numerous, optional, or likely to evolve. Defaults must be predictable at the owning boundary rather than scattered across callers.

## Review questions

- Which module owns this behavior and why?
- Does the abstraction remove a real dependency or encode policy?
- Can a reader trace state changes top-down?
- Who creates and disposes the stateful resource?
- Is a second representation or lifecycle being introduced?
- Are new or deliberately renamed project-authored files kebab-case, with any exception tied to an exact external naming contract?
