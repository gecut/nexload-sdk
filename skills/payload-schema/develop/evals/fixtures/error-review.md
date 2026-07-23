# Package fixture: unsafe error proposal

A proposed diagnostic change adds these fields to `PayloadSchemaError.data` and `toJSON()`:

```text
rejectedDefault
canonicalSchema
fieldConfig
dynamicDefaultValue.toString()
secret
stack
cause
```

The contributor argues this is useful for debugging invalid defaults and compiler failures.

Review task: define the safe structured alternative, distinguish native instance cause from serialized output, and list observable tests for `INVALID_DEFAULT_VALUE` and compilation failures.
