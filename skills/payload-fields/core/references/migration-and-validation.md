# Migration and validation

## Migration triggers

Treat these as explicit migrations:

- positional helper calls to options objects;
- decimal/major-unit money storage to integer minor units;
- replacing older date helpers with native date-backed Jalali fields;
- field name/type/localization changes;
- adding or changing slug lock fields;
- removing legacy editor usage;
- component subpath/Import Map changes.

Update REST, GraphQL, Local API clients, hooks, fixtures, and stored data together when persistence contracts change.

## Package validation

Run in this order because tests consume `dist`:

```bash
pnpm -C packages/payload-fields build
pnpm -C packages/payload-fields lint
pnpm -C packages/payload-fields test
```

Add export smoke tests for root and documented subpaths when packaging changes. Use `pnpm pack --dry-run` when publish contents or exports change.

## Consuming app validation

- regenerate Payload's Import Map;
- typecheck/build the Payload config and Admin UI;
- open create/edit forms for each changed field;
- verify localization/read-only/access behavior;
- exercise REST/GraphQL/Local API values;
- run data migration against representative fixtures.

## Release/docs

Use Changesets; do not edit versions/changelogs directly. Update package README and relevant docs in the same behavior change. Do not claim a component or API until its source, export, and build output exist.
