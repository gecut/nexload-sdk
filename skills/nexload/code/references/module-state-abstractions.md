# Module ownership and filenames

## File naming

Use kebab-case for every project-authored filename whose exact name is not externally mandated, including React components and other files whose exported symbols use PascalCase. For example:

- `product-card.tsx`, not `ProductCard.tsx`, `productCard.tsx`, or `product_card.tsx`;
- `parse-metrics.ts`, not `parseMetrics.ts`;
- `product-card.test.tsx` and `product-card.stories.tsx` for recognized dot-separated roles;
- `_stock-badge.tsx` when the React private-locality convention applies: `_` is the locality marker and `stock-badge` remains kebab-case.

Keep exact conventional names that an external contract requires, such as `package.json`, `README.md`, `SKILL.md`, `AGENTS.md`, `next.config.ts`, and framework-reserved route files. Generated and vendored files retain their producer's names.

Apply the rule to new files and deliberate renames. When materially changing a legacy nonconforming file, rename it only when imports, export maps, framework discovery, case-sensitive filesystems, and consumers can be updated safely within scope; otherwise record the migration conflict instead of hiding a broad rename inside unrelated work. Symbol naming remains language-specific: React component identifiers stay PascalCase even though their filenames are kebab-case.

## Cohesion and dependency direction

Keep one primary responsibility per module. Related types, contracts, and helper exports can stay together; one export per file is not a requirement. Keep implementation details private and substantive implementation out of `index.ts` when it serves as an export boundary.

Follow the existing internal dependency direction. Policy should not acquire a dependency on transport, UI, or persistence details merely to reuse a helper. Prefer direct internal imports over the package's own public barrel where the barrel obscures ownership or creates a cycle. Resolve cycles at the responsibility boundary rather than adding another barrel or generic utilities bucket. Do not invent layers, classes, or interfaces for a single simple capability.

For function extraction and abstraction decisions, use [clean code](clean-code.md). State and lifecycle rules belong to [behavior and correctness](behavior-and-correctness.md). Public exports and compatibility belong to `nexload-package`.
