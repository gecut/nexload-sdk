# Payload Admin composition and verification

## Server and client entrypoints

Payload custom components are Server Components by default. Classify each component before packaging it; add `"use client"` only when it needs state, effects, event handlers, browser APIs, or client-only Payload hooks. Existing Nexload field controls are client components because their behavior requires those features, not because every Admin component is inherently client-only.

Keep client components behind deliberate subpath exports such as `./admin/slug-field` so importing a server-safe root does not eagerly pull client React, styles, or browser assumptions into server consumers. Preserve server-capable custom components when client behavior is unnecessary.

Before changing an Admin component:

1. Inspect its package `exports`, build entrypoints, Payload component reference, and current server/client classification.
2. Confirm the props contract supplied by Payload and any project-owned props.
3. Preserve `readOnly`, disabled, path, validation, and form ownership semantics.
4. Check that server-facing field factories refer to the Admin component without importing its runtime implementation into the root.
5. Keep user-visible errors clear and Persian in Persian products.

Detailed Payload access control, hooks, field configuration, import-map policy, and server behavior belong to a future Payload standard. Use this reference only for the React/runtime seam.

## Verification matrix

| Change | Minimum evidence |
| --- | --- |
| Pure render or props | typecheck, lint, focused render test |
| State/effect lifecycle | update, cleanup/unmount, stale async scenario |
| Server/client boundary | server import/build plus client build when client behavior exists |
| Payload Admin field | package build and focused Admin/form behavior |
| Public export | package exports and packed-consumer check; compose with `nexload-package` |

Record commands and exact outcomes. Keep unrelated baseline failures separate. A build proves compilation, not browser behavior; a unit test proves only its exercised contract.

## Boundary map

- Visual tokens, spacing, radius, and RTL layout: `nexload-design`.
- Generic TypeScript trust boundaries or error modeling: `nexload-code`.
- Export maps, peer dependencies, and publication compatibility: `nexload-package`.
- Detailed Next.js, Payload, accessibility, motion, testing, and performance policy: future dedicated skills.

## Primary sources

- Payload, [Custom Components](https://payloadcms.com/docs/custom-components/overview)
- React, [`useEffect`](https://react.dev/reference/react/useEffect)
