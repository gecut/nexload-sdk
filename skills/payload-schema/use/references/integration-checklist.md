# Integration checklist

Preserve collection slug, access, hooks, versions, upload settings, admin layout, and field names. Replace only selected data field configs with `entity.payload.pick(...)` or `all()`.

Verify consumer parsing, Local API create/update, normalization, defaults, nested traversal, relationship IDs, generated Payload types, and existing hooks. Keep all Payload family packages on one exact version.

For migration, move one field group at a time. Keep populated output projections separate and use Payload-generated types for persistence.
