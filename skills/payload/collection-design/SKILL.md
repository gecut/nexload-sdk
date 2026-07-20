---
name: payload-collection-design
description: Design, name, review, and refactor Payload CMS collections and PostgreSQL-backed data relationships. Use whenever choosing embedded fields versus Globals or collections, modeling cardinality and ownership, defining junction collections, naming resources and fields, selecting indexes and constraints, setting deletion behavior, preserving historical snapshots, or auditing a Payload schema for data-model correctness.
---

# Payload Collection Design

## Purpose

Apply the canonical Nexload rules for domain-oriented, relationally correct Payload CMS collection design while preserving one source of truth for every relationship.

## Trigger boundary

- Use for collection boundaries, Globals, relationship cardinality and ownership, junction entities, naming, constraints, deletion, snapshots, events, access, and schema review.
- Use when a UI or API requirement must be translated into a durable Payload and PostgreSQL model.
- Do not use for isolated field-factory integration, Admin component resolution, or general PostgreSQL work unrelated to Payload collection design.

## Source of truth

Treat the bundled references as the canonical design doctrine. For implementation details, inspect the target project's Payload config, generated types, migrations, query patterns, and current official documentation linked in the references.

## Required inspection

Read [doctrine and workflow](references/doctrine-and-workflow.md) first. Then inspect the existing collection configs, Globals, generated types, database migrations, access rules, hooks, indexes, and the exact queries or workflows that consume the model.

## Decision flow

1. Establish whether the concept is embedded data, singleton configuration, an independent entity, or historical truth.
2. Determine cardinality, the single persistence owner, and whether reverse navigation is actually required.
3. Decide whether relation metadata or lifecycle requires a junction entity.
4. Define requiredness, uniqueness, indexes, deletion, access, scale, ordering, and transaction boundaries.
5. Review the result with the canonical template and final algorithm.

## Implementation workflow

1. State the business meaning and why the concept is not embedded or a Global.
2. Name collections and fields using the routed naming references.
3. Put each persisted relationship on one owning side and use joins only for inverse navigation.
4. Encode invariants in database constraints and transactions where possible.
5. Preserve historical facts with snapshots and define deletion behavior explicitly.
6. Produce the collection review template before changing schema code.
7. Implement the smallest compatible schema change and verify generated types, migrations, and representative queries.

## Invariants

- Model durable business concepts rather than UI sections or DTO shapes.
- Persist every relationship in exactly one place.
- Use database constraints for enforceable invariants.
- Use snapshots for historical truth.
- Avoid mirrored relationships and synchronization hooks.
- Treat collection slug changes and persisted-shape changes as migrations.

## Security and edge cases

Define access for every operation and privileged field. Junction authorization must validate both parents. Prevent self-relation cycles or duplicate undirected pairs, bound reverse joins and population depth, preserve transaction context in nested writes, and restrict deletion of financial, legal, audit, or historical records.

## Verification

Check generated Payload types, schema migrations, unique and foreign-key behavior, indexes against real query shapes, access rules with representative roles, deletion behavior, snapshot stability after source edits, transaction rollback, reverse joins, and bounded query depth. Run the target project's relevant lint, tests, and build.

## Reference routing

- Always begin with [doctrine and workflow](references/doctrine-and-workflow.md).
- Read [collection naming standard](references/collection-naming-standard.md) and [industry naming patterns](references/industry-naming-patterns.md) when choosing resource names.
- Read [semantic naming patterns](references/semantic-naming-patterns.md), [semantic suffixes and technical mappings](references/semantic-suffixes-and-technical-mappings.md), and [field naming standard](references/field-naming-standard.md) when naming domain entities and fields.
- Read [relation decision guide](references/relation-decision-guide.md) for embedding, Globals, cardinality, ownership, joins, junctions, hierarchy, and polymorphism.
- Read [constraints, deletion, and snapshots](references/constraints-deletion-and-snapshots.md) for database invariants and lifecycle policy.
- Read [events, access, and Payload rules](references/events-access-and-payload-rules.md) for historical events, authorization, joins, transactions, and Admin visibility.
- Finish with [review algorithm, prohibitions, and sources](references/review-algorithm-prohibitions-and-sources.md).

## Handoff requirements

Report the business boundary, selected model, slug and type names, cardinality and owner for every relation, inverse joins, constraints and indexes, deletion and snapshot policies, access and transaction requirements, migration impact, verification performed, and unresolved risks.
