# Payload Collection Design

## Purpose

This skill defines the canonical rules for building Payload CMS collections in Nexload-based projects.

It is designed to produce schemas that are:

- domain-oriented;
- relationally correct;
- predictable across projects;
- compatible with Payload CMS;
- safe for PostgreSQL;
- explicit about ownership, cardinality, constraints, lifecycle, and deletion;
- easy to understand without hidden synchronization behavior;
- resistant to duplicated sources of truth.

This skill is not only a naming guide. It is a decision framework for determining whether a concept should be:

- embedded as a field, group, or array;
- modeled as a Payload Global;
- modeled as an independent collection;
- represented by a direct relationship;
- represented by a junction collection;
- represented by an immutable snapshot;
- represented by an event, attempt, request, application, or assignment entity.

---

# Core Doctrine

## 1. Model the business, not the UI

A collection must represent a durable business or system concept.

Do not create a collection merely because:

- the Admin UI needs a section;
- a page needs a card;
- an API response needs a shape;
- a form contains multiple fields;
- a frontend feature needs local state.

UI composition, API DTOs, and database entities are different concerns.

## 2. Every persisted relationship has one owner

A relationship must be persisted in exactly one place.

The inverse side may expose a Payload `join`, but must not persist a mirrored array of IDs.

```text
one persisted relation
one owning side
zero mirrored copies
```

## 3. Database constraints enforce invariants

If an invariant can be expressed through:

- `required`;
- `unique`;
- a compound unique index;
- a foreign key;
- a check constraint;
- a transaction;

prefer the database-level guarantee over an application hook.

Hooks may provide friendly validation messages, but must not be the only protection against race conditions.

## 4. Historical truth is a snapshot

A live relationship represents the current state of another entity.

A snapshot represents what was true when a business event occurred.

Orders, invoices, payments, and audit records must not rely exclusively on mutable live relations when historical accuracy matters.

## 5. Prefer explicit models over magical synchronization

Do not synchronize duplicated relationships, counters, or arrays through hooks unless the duplication is an intentionally approved optimization with:

- a clearly identified source of truth;
- transactional update rules;
- a repair strategy;
- documented consistency expectations.

---

# Required Workflow

Before proposing a collection, answer the following questions in order.

## Step 1 — Is this concept independently identifiable?

Ask:

- Can it exist independently?
- Can it be directly queried?
- Does it have its own access control?
- Does it have its own lifecycle or status?
- Can it be referenced from multiple places?
- Can its size grow independently?
- Does it need a stable ID?
- Does it require audit information?

If all answers are no, prefer an embedded `group`, `array`, or primitive field.

If any answer is materially yes, consider an independent collection.

## Step 2 — Is this singleton configuration?

If exactly one instance exists for the entire application, prefer a Payload Global.

Examples:

- `site-settings`
- `store-settings`
- `homepage`
- `navigation`
- `footer`

Do not create a collection whose invariant is “only one document may exist.”

## Step 3 — Is this current state or historical fact?

If changes to the referenced entity should affect the consumer, use a relationship.

If future changes must not rewrite history, store a snapshot.

When both traceability and history are needed, keep both:

```ts
{
  product?: ProductId
  productSnapshot: ProductSnapshot
}
```

## Step 4 — Determine cardinality

Choose exactly one:

- one-to-one;
- one-to-many;
- many-to-many;
- self-referential hierarchy;
- polymorphic relation.

## Step 5 — Determine ownership

The owning side is normally the record that:

- cannot exist without the related parent;
- chooses the relation during its own creation;
- naturally contains the foreign key;
- changes the relation through its own lifecycle.

## Step 6 — Define constraints

Every relation must explicitly define:

- requiredness;
- uniqueness;
- indexes;
- duplicate policy;
- deletion policy;
- expected scale;
- ordering;
- access implications;
- transaction requirements.

## Step 7 — Decide inverse navigation

Add a Payload `join` only when reverse navigation is required by:

- the Admin UI;
- an application query;
- an operational workflow;
- a “where used” view.

Do not add inverse joins automatically to every relationship.

---

