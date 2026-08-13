# Component contracts and locality

## Public shape

- Prefer `export function ProductCard(...)` or a named `const` export. Named exports make package surfaces, refactors, and diagnostics explicit.
- Give a reusable or non-trivial component a named props `type` or `interface`. Keep the contract close to the component unless it is intentionally public.
- Do not export helpers, child parts, or props merely for test convenience. Export only consumers' supported surface.
- Preserve an established default export when changing it would be a public break; record a migration instead of hiding the cost.

## File ownership

Use one significant component per file as the Nexload default. A significant component has its own responsibility, state/effects, reuse boundary, or meaningful contract.

Grouping is reasonable for:

- trivial render helpers that are unreadable when separated;
- tests and stories centered on one public component;
- generated source;
- tightly coupled private parts whose separation adds navigation without hiding complexity.

When a component owns several extracted modules, mark locality with `_`, for example:

```text
product-card/
├── product-card.tsx
├── _format-price.ts
└── _parts/
    └── _stock-badge.tsx
```

The underscore means “private to this local feature,” not “skip quality checks.” Do not apply it to published entrypoints or modules imported across unrelated features.

The repository-wide filename rule is owned by `nexload-code`: component filenames whose exact names are not externally mandated are kebab-case even though component identifiers remain PascalCase. Keep exact framework-reserved and generated filenames unchanged.

## Review questions

1. Can a reader name the component's single responsibility?
2. Is the props contract narrower than the implementation details?
3. Does each export have a real consumer?
4. Would extraction clarify ownership, or only increase file count?
5. Is an exception documented where a public contract prevents the preferred shape?

## Primary sources

- React, [Your First Component](https://react.dev/learn/your-first-component)
- React, [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components)
