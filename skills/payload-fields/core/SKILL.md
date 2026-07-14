---
name: payload-fields-core
description: Use when integrating or reviewing the overall @nexload-sdk/payload-fields factory architecture, including options-object compatibility, protected field names/types/components, safe overrides, hook composition, Payload Import Map subpaths, server versus Admin client boundaries, plugin registration decisions, major-version migration, or package-wide validation. Use a specialized sibling for one slug, Jalali, or money contract.
---

# Payload Fields Core

## Purpose

Integrate semantic Payload field factories without breaking package-owned invariants, hook order, Import Map resolution, or server/client separation.

## Trigger boundary

- Use for cross-factory architecture, override policy, Import Map exports, plugin/Admin boundaries, migration, and package validation.
- Do not use as the primary skill for a single slug synchronization, Jalali picker, or money conversion task.
- Compose with the relevant specialized skill when package-wide changes touch one semantic field contract.

## Source of truth

Use package exports, `src/index.ts`, each factory source, Admin entrypoints, tests, README, and Payload configuration in the consuming app. Docs must not promise unexported components or removed APIs.

## Required inspection

Read `packages/payload-fields/README.md`, `package.json`, `src/index.ts`, targeted factory/Admin/plugin files, `esbuild.config.mjs`, tests, and the consuming `payload.config` plus generated Import Map.

## Decision flow

1. Choose the semantic factory instead of assembling raw fields manually.
2. Confirm tuple versus single-field return shape and use the correct collection syntax.
3. Separate consumer-extensible options from protected name/type/component metadata.
4. Decide whether the server plugin is needed; register it only for slug generators.
5. Rebuild the Payload Import Map and verify server/client imports.

## Implementation workflow

1. Write a failing contract test against the package root or documented subpath.
2. Apply the smallest options-object factory change and preserve existing hooks/metadata.
3. Keep Admin React code behind exported `./admin/*` entrypoints; keep root helpers server-safe.
4. Test protected overrides, hook composition, public exports, and plugin behavior.
5. Update README/docs and migration notes with behavior changes.

## Invariants

- Factories use options objects and preserve their documented return shapes.
- Semantic field names/types and required Admin component paths are package-owned.
- Consumer hooks run in the documented order without replacing package hooks.
- Admin component paths match package exports and generated Import Map entries.
- Root exports remain safe for server config; Admin components are client-only subpaths.
- `payloadFieldsPlugin` is required only for registered server-side slug generation.

## Security and edge cases

Never send generator callbacks or secrets to Admin client props. Plugin authentication precedes custom access; endpoint output is normalized. Treat changes to persisted field type, money units, date storage, localization, or tuple shape as migrations, not harmless overrides.

## Verification

Run payload-fields build, lint, and test; inspect package exports; verify Import Map generation in a consuming Payload app when component paths change; run docs/skills validation and `git diff --check` for cross-package work.

## Reference routing

- Read [factory contracts](references/factory-contracts.md) for return shapes and protected semantics.
- Read [overrides and Import Map](references/overrides-and-import-map.md) for extension and client resolution rules.
- Read [migration and validation](references/migration-and-validation.md) for compatibility and release checks.

## Handoff requirements

List factories/subpaths changed, protected versus extensible options, hook order, plugin decision, Import Map verification, migration impact, package/docs tests, and unresolved consuming-app work.
