# Consumer fixture: Local API normalization

The application parses an HTTP body with `z.string().trim()`, but this direct Payload call stores `"  Draft  "`:

```ts
await payload.create({
  collection: "posts",
  data: { title: "  Draft  " },
})
```

The entity has `field.text({ trim: true })`. The collection currently uses a hand-written `{ name: "title", type: "text" }`. A consumer field `beforeValidate` hook will later lowercase the value and returns the lowercase result.

Review task: identify the ownership/integration error, specify final hook order and normalized value, and give a real Local API regression test outline that proves stored output rather than only parsing an application schema.
