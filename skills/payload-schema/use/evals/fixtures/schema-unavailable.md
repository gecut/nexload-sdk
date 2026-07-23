# Consumer fixture: blocked container schema

```ts
const address = defineEntity({
  name: "Address",
  fields: {
    details: field.group({
      fields: {
        label: field.text({ trim: true }),
        metadata: field.native({ payload: { type: "json" } }),
      },
    }),
  },
})
```

Payload compilation must remain available. A JavaScript consumer calls:

```ts
address.schema(({ pick }) => pick(["details"]))
```

Review task: describe the exact structured failure, including code, phase, reason, and first blocking path. Give two valid consumer designs without silently omitting `metadata`.
