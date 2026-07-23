# Consumer fixture: default ownership

Review these definitions:

```ts
field.number({
  defaultValue: 0,
  dynamicDefaultValue: ({ req }) => req.user?.quota ?? 0,
})

field.text({
  defaultValue: " draft ",
  trim: true,
  payload: { defaultValue: "fallback" },
})

field.native({
  payload: { type: "json" },
  defaultValue: {},
})
```

Review task: determine the first error for each definition, its phase where defined, whether any default changes the consumer Zod schema, and the safe correction. Do not include rejected values or full config in serialized error data.
