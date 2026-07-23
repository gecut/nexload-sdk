# Package fixture: clone boundary

```ts
let reads = 0
const payload = {
  admin: {
    get description() {
      reads += 1
      return "Title"
    },
  },
}

const entity = defineEntity({
  name: "Product",
  fields: { title: field.text({ payload }) },
})
```

Current package behavior retains caller option references until compilation. Compilation must clone plain containers by descriptor without executing the getter and each facade call must return independent containers.

Review task: specify tests for getter reads, independent outputs, opaque references, and mutation before/after compilation. Do not falsely call the definition-time seed immutable.
