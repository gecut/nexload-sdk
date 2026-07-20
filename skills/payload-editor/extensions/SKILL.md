---
name: payload-editor-extensions
description: Use when adding, replacing, diagnosing, or reviewing native Payload Lexical feature providers through @nexload-sdk/payload-editor extendFeatures, including Blocks, duplicate keys, provider order, dependencies, server/client serialization, and project ownership.
---

# Payload Editor Extensions

## Purpose

Integrate project-owned Payload Lexical providers through one controlled native seam without weakening managed feature guarantees.

## Trigger boundary

- Use for `extendFeatures`, managed replacement, Blocks, custom feature providers, collisions, and dependency behavior.
- Use core for semantic options and presets for membership/default questions.
- Do not create an advanced registry export or generic client capability bag.

## Source of truth

Use the extension docs/tests, Payload official custom feature contract, provider `key` and dependencies, consuming Blocks schemas, and generated Payload import map when a client feature exists.

## Required inspection

Inspect the managed enabled keys, extension provider keys/order, feature dependencies, server/client props, import-map requirements, project Blocks, and consuming Payload version.

## Decision flow

1. Use a semantic feature when its supported options are enough.
2. Otherwise append an official/project provider.
3. Disable the managed feature before replacing its key.
4. Keep client props JSON-safe and credentials server-only.
5. Let Payload sort declared dependencies.

## Implementation workflow

1. Add a failing public extension contract test.
2. Add the smallest native provider array entry.
3. Validate non-empty unique keys before Payload.
4. Build a real Payload config and Admin import map when client code exists.
5. Measure any new client bundle and update extension docs.

## Invariants

- Extensions are an array, retain caller order, and append after managed providers.
- Managed/native and native/native duplicate keys fail synchronously.
- Replacement requires disabling the managed feature.
- Payload owns dependency and priority sorting.
- Native provider objects are not frozen or mutated by Nexload.
- No extension callback, public registry, or public resolver ships.

## Security and edge cases

Do not serialize server functions, secrets, provider SDKs, or credentials into client props. AI needs a separate authenticated endpoint/plugin contract. Code blocks remain project-owned Blocks because schemas and weight vary.

## Verification

Test append, order, collisions, replacement, real Payload sanitization, import-map generation for client providers, bundle impact, package ESM safety, and matched Payload versions.

## Reference routing

- Read [native seam](references/native-seam.md) for append and replacement rules.
- Read [Blocks and clients](references/blocks-and-clients.md) for project/client ownership.
- Read [collision diagnosis](references/collision-diagnosis.md) for provider failures.

## Handoff requirements

List provider keys, managed features disabled, dependency/order behavior, client/import-map impact, security review, Payload versions, and tests performed.
