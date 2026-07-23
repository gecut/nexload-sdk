# Consumer fixture: relationships, rows, and layout

The entity needs:

- one `category` relationship to `categories`;
- many polymorphic `owners` relationships to `users` or `teams`;
- an array `gallery` with canonical `alt` text;
- a native `point` field with a consumer tuple schema.

Payload adds an `id` to each persisted gallery row. The collection wraps the compiled fields in tabs and applies an access function. API responses populate `category` at depth 1.

Review task: give the canonical relationship shapes, explain row-ID behavior, place tabs/access in the correct owner, and separate the populated response schema from canonical entity schemas.
