---
name: payload-fields-slug
description: Use when adding, debugging, migrating, or reviewing @nexload-sdk/payload-fields managed slugs, including the slug/lock tuple and spread usage, Unicode/Persian normalization, lock and localization synchronization, nested source paths, regeneration on source changes, source clearing and manual edits, protected Admin wiring, or registered server-side generator authentication, access, input validation, and final normalization.
---

# Payload Managed Slugs

## Purpose

Keep slug and lock state synchronized and normalized while making optional server-side generation authenticated, authorized, registry-safe, and server-only.

## Trigger boundary

- Use for `slugField`, `formatSlug`, synchronization hooks, localization, lock behavior, source paths, Admin control, and generator endpoint security.
- Do not use for generic routing/SEO slugs outside Payload, package-wide factory architecture, uniqueness/collision databases, money, or dates.
- Compose with `payload-fields-core` when Import Map/export or cross-factory plugin setup is also in scope.

## Source of truth

Use slug factory/hook source, Admin slug component, plugin endpoint, package tests, README, and target collection localization. Do not infer uniqueness, lowercasing, rate limits, or CSRF behavior not implemented by the package.

## Required inspection

Read `src/slug/index.ts`, `format-slug.ts`, `src/admin/slug-field.tsx`, `src/plugin.ts`, tests, package exports, collection source/localization, existing endpoints, and Payload access/auth configuration.

## Decision flow

1. Choose source path, slug/lock names, localization, and regeneration policy.
2. Spread the returned tuple so both fields exist.
3. Define create/update/locked/unlocked/cleared-source behavior before editing hooks.
4. Use local hook generation unless a registered server generator is actually required.
5. For server generators, enforce auth, access, own-key lookup, input validation, failure normalization, and final `formatSlug`.

## Implementation workflow

1. Write failing pure hook/normalization tests for the exact state transition.
2. Preserve consumer-before-package hook ordering and package-owned Admin metadata.
3. Register generator callbacks only in `payloadFieldsPlugin`; pass only a key to Admin.
4. Test endpoint unauthenticated/forbidden/invalid/unknown/success/failure cases.
5. Run package build/lint/test and verify localized/nested behavior in Payload Admin.

## Invariants

- `slugField` returns `[slug, lock]` and must be spread into collection fields.
- Lock localization exactly matches slug localization; it is not inferred from the source.
- Lock is active unless its resolved value is exactly false.
- Locked create/update derives from a non-empty changed source; clearing preserves the previous slug.
- Unlocked manual strings are normalized; package normalization runs last.
- Generator implementation and request stay server-side; client props contain only the key.
- Endpoint checks auth before access, resolves own registered keys only, and normalizes final output.

## Security and edge cases

Do not claim uniqueness, lowercase Latin, reserved-word handling, rate limiting, timeout, audit logging, or CSRF policy. Use explicit `generateSlugAccess` for sensitive generators. Current access-callback exceptions and Admin fetch errors are not fully normalized/rendered; treat them as known hardening gaps and add tests before changing behavior.

## Verification

Run package build/lint/test. Cover normalization, tuple/defaults, create/update, locked/unlocked, regeneration disabled, empty and null clearing, dot paths, localization mismatch, hook order, protected overrides, auth/access, malformed/null input, inherited/unknown keys, context/currentSlug forwarding, generator failure/output normalization, and Admin error/lock/nested paths.

## Reference routing

- Read [synchronization contract](references/synchronization-contract.md) for exact hook transitions.
- Read [generator security](references/generator-security.md) before enabling the server endpoint.
- Read [test matrix](references/test-matrix.md) before claiming slug behavior complete.

## Handoff requirements

State tuple usage, source/lock/localization/regeneration policy, clearing behavior, normalization scope, generator/auth/access decisions, known endpoint/Admin gaps, exact test matrix, and whether uniqueness remains an application concern.
