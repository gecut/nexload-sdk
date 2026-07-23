# Integration checklist

## Inspect the right environment

Inside `nexload-sdk`, inspect the package root exports, relevant option types, public tests, docs, and consuming collection. For an installed npm consumer, inspect `package.json` exports, `dist/index.d.ts`, README/docs, lockfile versions, and local collection code. Do not require monorepo source from external consumers.

## Incremental migration

1. Record collection slug, field order, hooks, access, versions, upload, localization, layout, and generated type usage.
2. Move one cohesive data group into `defineEntity`.
3. Replace only those native field entries with ordered `entity.payload.pick(...)` or `all()`.
4. Rebuild named application schemas through `entity.schema(...)`.
5. Keep tabs/access/hooks and populated projections in their current owners.
6. Test both direct parsing and Local API create/update before moving another group.

## Normalization diagnosis

If a Local API write stores an unnormalized value:

1. Confirm the collection uses fields compiled by the same entity definition.
2. Inspect field `hooks.beforeValidate`: consumer hooks must run first and return the next value; the canonical adapter is appended last.
3. Confirm the write does not use a separate hand-written field config.
4. Reproduce with Local API and assert both stored and returned normalized values.
5. Confirm all `payload` and `@payloadcms/*` packages use one exact version.

An application schema transform does not affect Payload writes unless the compiled field's canonical schema owns the same normalization.

## Verification

From this repository, choose the smallest relevant commands:

```text
pnpm -C packages/payload-schema test
pnpm -C packages/payload-schema test:types
pnpm -C packages/payload-schema test:sqlite
pnpm -C packages/payload-schema test:consumer
git diff --check
```

Use Postgres only when the behavior touches its fixture or persistence boundary. `test:consumer` and `test:compat` are current packed-consumer smokes, not proof of the full supported version cross-product.

Report unrun database lanes and external-service blockers explicitly. Never claim a compatibility matrix from one current-version smoke.
