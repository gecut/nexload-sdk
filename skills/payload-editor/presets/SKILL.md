---
name: payload-editor-presets
description: Use when selecting, defining, reviewing, or changing @nexload-sdk/payload-editor built-in or custom presets, including feature membership, heading policy, relational depth defaults, override merge behavior, immutability, and SemVer impact.
---

# Payload Editor Presets

## Purpose

Choose and maintain explicit, task-oriented editor contracts without hidden defaults or mutable shared configuration.

## Trigger boundary

- Use for built-in preset selection, custom reusable presets, membership/default changes, and preset migrations.
- Compose with core for package-wide work and extensions when project-native providers are involved.
- Do not use for raw Payload feature implementation or application content schemas.

## Source of truth

Use private preset definitions, preset contract tests, public types, README, and canonical preset docs. Existing preset behavior is a major-version contract.

## Required inspection

Inspect the consuming authoring task, current editor feature array, preset definitions, merge tests, heading requirements, relational collections, and depth expectations.

## Decision flow

1. Pick the closest task-oriented built-in preset.
2. Override only deliberate differences.
3. Use `defineEditorPreset` for repeated organization policy.
4. Use `true` to reset and `false` to disable.
5. Treat membership/default changes as major unless adding a new preset.

## Implementation workflow

1. Write a failing public-interface contract test.
2. Change one preset definition or consumer call.
3. Assert exact enabled keys and mapped options.
4. Verify caller input is not mutated and providers are fresh.
5. Update preset and migration docs plus Changeset.

## Invariants

- Preset selection is always visible at the call site.
- Built-in names are `compact`, `standard`, `structured-content`, `article`, and `product-description`.
- Relational preset defaults use `maxDepth: 1`.
- Custom presets are validated and snapshotted.
- Object overrides shallow-merge and arrays replace.
- Existing membership, defaults, order, and heading policy are versioned.

## Security and edge cases

Avoid high population depth by default. Do not enable upload, relationship, CodeBlock, or future client features in generic compact presets. Reject invalid and forged preset objects.

## Verification

Assert all preset memberships, options, reset/disable behavior, immutability, deterministic ordering, Payload config build, docs, skills, and SemVer classification.

## Reference routing

- Read [preset matrix](references/preset-matrix.md) for exact memberships.
- Read [override rules](references/override-rules.md) for merge semantics.
- Read [versioning](references/versioning.md) before changing a stable preset.

## Handoff requirements

Name the selected/changed preset, exact feature delta, heading/depth policy, override behavior, migration and release level, and tests run.
