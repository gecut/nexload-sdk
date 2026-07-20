---
name: payload-editor-core
description: Use when integrating, changing, or reviewing the @nexload-sdk/payload-editor public interface, semantic feature definitions, merge and error contracts, Payload version compatibility, ESM packaging, or package-wide validation. Use the preset or extensions sibling when that is the primary task.
---

# Payload Editor Core

## Purpose

Configure Payload Lexical editors through the package's explicit semantic interface while preserving deterministic resolution, server safety, and upstream compatibility.

## Trigger boundary

- Use for `createEditor`, `defineEditorPreset`, feature states, validation/errors, package compatibility, and release checks.
- Use `payload-editor-presets` for membership/default changes and `payload-editor-extensions` for native providers.
- Do not use for rich-text fields, frontend serialization, project Blocks schemas, AI, or themes.

## Source of truth

Read package source, exports, tests, README, canonical docs, and the consuming Payload config. Payload official feature types define the upstream adapter contract.

## Required inspection

Inspect `package.json`, `src/index.ts`, public types/errors, `create-editor.ts`, tests, peer versions, and the root and field editor call sites.

## Decision flow

1. Require an explicit preset or features definition.
2. Prefer semantic options when supported.
3. Keep advanced Payload options behind a native replacement.
4. Match all Payload package versions exactly.
5. Verify the built ESM artifact through a real Payload config.

## Implementation workflow

1. Add a failing test through the public interface.
2. Change private validation, merge, registry, or adapters minimally.
3. Preserve readonly input and fresh provider creation.
4. Update README and canonical docs for behavior changes.
5. Run package, artifact, Payload, docs, and skills gates.

## Invariants

- No implicit default, `defaultFeatures`, or `rootFeatures` inheritance.
- Feature object merge is shallow; nested arrays replace.
- `false` disables and `true` resets adapter options.
- Errors are synchronous, coded, and path-aware.
- Root is ESM-only, server-safe, and has no custom client JavaScript.
- Registry, adapters, merge helpers, and canonical order remain private.

## Security and edge cases

Reject unknown keys, `null`, invalid depths, unsafe collection values, invalid extensions, and duplicates before Payload. Never add provider credentials, functions intended for clients, React UI, or CSS to the root.

## Verification

Run build, lint, tests, type fixtures, minimum/latest matched Payload consumers, pack inspection, bundle budget checks, docs build, skills validation, and `git diff --check`.

## Reference routing

- Read [semantic contract](references/semantic-contract.md) for states, merge, and errors.
- Read [Payload compatibility](references/payload-compatibility.md) for peers and real config verification.
- Read [release validation](references/release-validation.md) for artifact and delivery gates.

## Handoff requirements

Report public behavior changed, compatibility pair tested, artifact/runtime checks, docs/skills updates, Changeset impact, and any unrelated workspace failures.
