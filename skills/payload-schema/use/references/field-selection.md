# Field selection

Use scalar factories for their documented canonical shapes. Money is a safe integer with currency metadata. Date requires a timezone and normalizes to UTC. Relationship and upload values are IDs or polymorphic references.

Use group and array only when the full canonical nested shape is useful. A native child without schema intentionally disables its parent's canonical schema rather than silently omitting data.

Use `field.native` for data-affecting Payload fields outside the built-ins. Add an explicit schema when the field belongs in consumer contracts. Keep tabs, rows, collapsibles, and other layout fields directly in collection config.
