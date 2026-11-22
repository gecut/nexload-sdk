# Architecture boundaries

## Public and private state

Field definitions expose runtime `kind` and `schema`; Payload branding is TypeScript-only. A non-exported symbol carries the private field seed. `defineEntity` binds names, paths, defaults, nested descendants, and relationship ID schemas into closure-owned state.

Entity definitions expose `name`, `idSchema`, `fields`, `schema()`, and `inspect()`. They do not carry a `.payload` facade on the entity object. Payload compilation lives in `@nexload-sdk/payload-schema/payload` via `payloadFields(entity)`. Value imports of `payload` outside `src/payload/**` are forbidden, ensuring the root package entry remains pure and browser-safe.

Do not describe entity state as a definition-time snapshot. Current factory seeds retain consumer-provided option references, including nested `payload` extras, until compilation. Mutating those input objects after `defineEntity` can change later compiled output. Consumer guidance must say not to mutate them; fixing snapshot behavior belongs to a separate package change.

There is no WeakMap registry, global singleton, metadata reflection, or public IR export.

## Compilation and cloning

Each top-level definition produces one top-level Payload field. Every `payloadFields` call compiles fresh output:

- arrays and plain objects clone recursively by property descriptor;
- cloning does not execute getters;
- functions, RegExp, editor/component objects, Map, Set, and class instances remain references;
- compiler-owned keys override or reject consumer extras;
- `all` keeps declaration order and `pick` keeps caller order;
- non-entities passed to `payloadFields` fail with `PayloadSchemaError` (`INVALID_ENTITY`).

Test both independence between compilation calls and getter non-execution. Do not equate fresh compiled containers with immutable input seeds.

## Adapter boundary

The server-side canonical adapter is appended after consumer field `beforeValidate` hooks:
- `undefined` and `null` bypass canonical hook parsing. Payload's required validator handles presence when `required: true`.
- For `field.date()`, runtime hooks accept valid JavaScript `Date` instances and convert them to ISO strings before canonical validation.
- Built-in normalizations (`trim`, `lowercase`, `uppercase`, `slug`, `date`) use Zod `.overwrite()` instead of `.transform()`, ensuring codec reversibility for `z.encode`.
- A successful parse returns the canonical result.

Canonical data failures become Payload `ValidationError`:
- carry `req`;
- use dot-based paths such as `gallery.0.alt` or `layout.0.headline`;
- never become `PayloadSchemaError`.

Native `validate` remains untouched. Group, array, and blocks parent adapters validate container shape, nullability, row bounds, and blockType discriminator; nested field adapters parse each child once. Payload row IDs survive lifecycle processing: array item schemas exclude Payload row metadata, but `field.blocks()` member schemas accept optional `id` (string) and `blockName` (string | null).

## Async boundary

Canonical parsing is synchronous. Do not inspect private Zod metadata. Catch the public sync-parser Promise encounter and convert it to `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED` with phase `definition`. Because refinements may be conditional, detection can occur only on the first value that exercises the async path.
