# Foundational engineering standards: research summary

## Method and limits

This research separates three kinds of evidence: current repository behavior, the intended direction supplied in the task prompt, and claims owned by official platform/framework sources. Existing code is evidence, not an automatic standard; repeated legacy behavior is recorded in [migration notes](05-migration-notes.md) instead of being normalized.

The prompt says an older Gecut front-end guide exists, but that guide is not present in the repository or supplied attachments. Only the prompt's summary of its themes—server-first rendering, minimal client JavaScript, semantic HTML, token-first styling, responsive/RTL behavior, UI preservation, and dependency discipline—was used as historical evidence. No wording or unverified rule is attributed to the unavailable guide.

## Repository evidence

- The root [AGENTS.md](../../AGENTS.md) requires narrow, architecture-preserving changes; package README/export inspection; strict TypeScript; truthful verification; and no edits to generated `dist/` output.
- The shared [TypeScript configuration](../../tools/typescript-config/base.json) enables `strict`, `noUncheckedIndexedAccess`, declarations, and isolated modules. The shared [ESLint configuration](../../tools/eslint-config/src/base.ts) already owns formatting, import ordering, and many syntax rules, so the new skills should not repeat those rules.
- [Package manifests](../../packages/payload-fields/package.json), entry barrels, and the shared [bundler](../../tools/bundler/index.js) show that exports, declaration output, externalization, and ESM/CJS behavior form one package contract. The repository legitimately contains both dual-format packages and ESM-only packages; neither format is a universal invariant.
- The healthcheck family separates a runtime-neutral [core](../../packages/healthcheck/core/src/index.ts) from Node, Bun, Next.js, Payload, and exporter packages. This is the clearest repository precedent for core-to-adapter dependency direction and runtime ownership.
- `payload-fields` keeps server-safe factories at the root and client code behind explicit `./admin/*` exports; its [Admin components](../../packages/payload-fields/src/admin/slug-field.tsx) use Payload's supported UI/hooks. `payload-editor` also documents a deliberately contained `any` at a third-party generic interoperability seam in [its types](../../packages/payload-editor/src/types.ts).
- Existing first-party skills, especially [payload-fields-core](../../skills/payload-fields/core/SKILL.md), use compact trigger boundaries, required inspection, invariants, verification, routed references, fixture-backed evals, and separate trigger evals. That progressive-disclosure shape is the delivery model for the four foundational skills.
- The docs stylesheet already uses Starlight semantic variables, logical block properties, parent `gap`, responsive rules, and focus-visible states in [docs.css](../../apps/docs/src/styles/docs.css), while also exposing opportunities to consolidate repeated raw spacing/radius values.

## External evidence matrix

| Area | Primary-source evidence | Conclusion for Nexload |
| --- | --- | --- |
| Type safety | TypeScript's [`strict`](https://www.typescriptlang.org/tsconfig/strict) option enables a family of stronger correctness checks. | Strict typing is an invariant. Untrusted values enter as `unknown` and are narrowed or validated; a contained assertion/`any` is allowed only when a third-party type seam cannot model a value safely. |
| Package surface | Node documents [`exports`](https://nodejs.org/api/packages.html#package-entry-points) as an explicit, encapsulated public interface and warns that adding it can break existing deep imports. | Export maps and subpaths are compatibility decisions, not filesystem conveniences. Do not expose internals or introduce `exports` to a released legacy package without a compatibility audit. |
| Dependency metadata | npm distinguishes runtime dependencies from [`peerDependencies`](https://docs.npmjs.com/cli/configuring-npm/package-json/#peerdependencies), which express compatibility with a host supplied by the consumer. | Classify dependencies by ownership and the packed artifact, not a blanket rule. Framework hosts normally belong in peers; bundled implementation libraries may remain development inputs when they are actually bundled. |
| Release compatibility | [SemVer 2.0.0](https://semver.org/) ties version increments to a declared public API. | JavaScript entrypoints, types, runtime behavior, and documented contracts all consume the public API budget. Release execution remains outside Phase 1. |
| React behavior | React requires [pure components and hooks](https://react.dev/reference/rules/components-and-hooks-must-be-pure): render is idempotent, props/state are snapshots, and side effects stay outside render. | Render purity is an invariant. Minimal state/effects is a strong default; synchronization with a real external system remains a valid effect. |
| Server/client boundary | Next.js says Client Components are for state, events, effects, browser APIs, and custom hooks; [`"use client"`](https://nextjs.org/docs/app/getting-started/server-and-client-components#using-client-components) defines a client module-graph boundary. | Keep client entrypoints narrow and serializable. Server-first is a framework-context default, not a universal React package rule. |
| Payload Admin | Payload resolves custom components by [component paths](https://payloadcms.com/docs/custom-components/overview#component-paths), defaults them to Server Components, and recommends `@payloadcms/ui` inside Admin UI. | Put Admin/client code behind dedicated package entrypoints, use Payload extension APIs, and avoid pulling client or non-serializable config into server-safe roots. |
| Directional layout | W3C [logical properties](https://www.w3.org/TR/css-logical-1/) map box-model concepts to writing mode and direction. | Prefer logical properties where direction matters; physical positioning remains valid for artwork or geometry whose meaning is physically anchored. |
| Sibling spacing | W3C defines [`gap`](https://www.w3.org/TR/css-align-3/#gaps) on flex/grid/multicol containers. | Parent-owned `gap` is the default for repeated sibling relationships. Document-flow margins and isolated external spacing are legitimate exceptions. |
| Design tokens | Tailwind describes [theme variables](https://tailwindcss.com/docs/theme) as design tokens exposed through utilities and CSS variables. | Components should consume semantic roles/tokens before raw values. Tailwind syntax itself is contextual because not every Nexload UI uses Tailwind. |

## Architectural conclusions

1. The foundational layer should govern decisions static tooling cannot fully enforce: ownership, boundaries, public API cost, state/lifecycle, client/runtime leakage, visual relationships, and honest evidence.
2. Invariants must be few. Most preferred structures are strong defaults with explicit exceptions; repository conventions such as named React exports, one significant component per file, and `_`-prefixed private component locality are deliberate Nexload conventions rather than universal framework requirements.
3. Production code should not be bulk-refactored to satisfy a new skill. Apply standards to new work and significantly touched areas; route specialized topics to future skills.
