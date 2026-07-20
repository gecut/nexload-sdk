# Event and Audit Policy

Use domain events when the occurrence itself is a business fact.

A domain event should be:

- immutable;
- timestamped;
- actor-aware when applicable;
- append-only;
- named in past tense at the event-type level.

Examples:

```text
order.created
order.paid
order.cancelled
design.approved
shipment.dispatched
```

The collection may be named:

```text
order-events
payment-events
shipment-events
```

Use audit logs for technical accountability, not as the primary source of domain state.

Do not reconstruct current business state solely from logs unless the system explicitly adopts event sourcing.

---

# Access Control Policy

Every collection must define:

- who may create;
- who may read;
- who may update;
- who may delete;
- which fields are privileged;
- whether Local API calls must use `overrideAccess: false`.

For child collections, ownership checks usually flow through the parent relation.

For junction collections, authorization must validate access to both participating parents.

A join must never become a path for bypassing the target collection's access rules.

---

# Payload-Specific Rules

## Collection config is the persistence source of truth

Payload fields define document schema, generated types, Admin UI behavior, validation, access, hooks, and database mappings.

Do not create parallel persistence types manually.

Use Payload's official type generation.

## Use joins as inverse navigation

Payload joins are virtual and do not store duplicated data.

Use them instead of maintaining mirrored relationship arrays.

## Keep join depth controlled

Prefer:

- `depth: 0` when IDs are sufficient;
- explicit `select`;
- bounded join population;
- pagination for large reverse collections.

Avoid deep automatic population chains.

## Avoid synchronization hooks

A hook whose only purpose is to update the inverse side of a relationship is prohibited.

## Preserve transactions

When a hook performs additional writes that must be atomic, pass the original `req` into nested Payload operations so they participate in the same transaction.

## Hide technical junction collections when appropriate

A junction collection may be hidden from primary Admin navigation when it is not edited directly.

Do not hide it if operators need to manage relation metadata or lifecycle.

---

