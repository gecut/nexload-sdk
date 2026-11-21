# Payload Schema & Operations — Stable Major Release Design

- **Date:** 2026-11-21
- **Packages:** `@nexload-sdk/payload-schema` 2.0.0 → **3.0.0**, `@nexload-sdk/payload-operations` 1.0.0 → **2.0.0**
- **Input:** verified audit of `~/teamwork_projects/nexload-production-readiness` (see "Defect register" below; the audit's own "CONFIRMED" labels are not trusted).

## 1. Intent

Bring both packages to a state other teams can depend on without reading the source: secure by default, honest types, safe to import where the docs say, and documentation (READMEs, `docs/packages`, docsite, agent skills) that matches runtime behavior exactly. Today the only consumer is `nexload-e-commerce` (owner-controlled); several more consumers will adopt the packages after this release, so the public API must be right now, not patched later.

## 2. Goals, non-goals, anti-goals

**Goals**
- Fix every verified defect (section 5).
- Breaking changes are allowed freely (decided by the technical lead), with a written migration guide per package.
- Defaults are safe: a forgotten setting must fail loudly, never silently grant access or leak data.
- The root entry of each package is importable in any runtime, browser included.
- Automated tests for `payload-operations` (currently zero) and regression tests for every fixed defect, run in CI.
- All five documentation surfaces updated in the same change set.
- One new feature: `field.blocks()`.

**Non-goals (stay out, as already documented)**
- Recursive/self-referential field trees (Payload has none; self-reference uses `relationship`).
- Populated-relationship document types (Payload-generated types stay authoritative).
- CJS builds (Payload 3 is ESM-only).
- Automatic transactions, scoped Local API proxy, inline Admin `validate` compilation — deferred to later minors.
- Zod 3 support.
- Upgrading `nexload-e-commerce` (separate follow-up task after release).
- Publishing to npm (only on explicit instruction).

**Anti-goals (a "working" result that still counts as failure)**
- Any compatibility switch that keeps the old unsafe behavior reachable (e.g. `access: "legacy"`, `serializeRaw: true`).
- A root entry that still pulls `payload` or `@payloadcms/sdk` at runtime.
- Docs or skills describing APIs that do not exist (the previous `defineStringField` problem).
- Tests that only parse schemas in isolation instead of exercising a real Payload write (the mistake behind the false SEC-007).

## 3. Constraints

- Payload `>=3.85.0 <4`, Node `>=20.9.0`, ESM-only, built with `@nexload-sdk/bundler` (`createBundler(..., false)`).
- Zod floor rises to `>=4.1.0 <5` (codecs: `z.encode`/`z.decode`, verified on 4.4.3).
- Payload recognizes field errors only via `instanceof ValidationError` from the main `payload` entry (verified: not exported from `payload/shared`), so Payload compilation must live in a Node-only entry.
- Repo rules: never edit `dist/`; README + `docs/packages` + docsite updated with behavior changes; Changesets for versions; enola baseline before edits, `enola check` before concluding.

## 4. Approaches considered

| Decision | Options | Picked | Why |
| --- | --- | --- | --- |
| Breaking policy | (1) break freely + migration guide; (2) deprecation shims | **1** (lead) | One controlled consumer; stable API must start correct; shims keep unsafe paths alive. |
| Operation output on the wire (SEC-001/008) | (A) Zod codecs: handler returns `z.output`, server `encode`s, client `decode`s; (B) "output schema = JSON shape", parse on both sides | **A** (lead) | Only option that is both leak-proof and type-honest; supports `Date` etc. B silently breaks on non-idempotent transforms (verified). |
| Browser-safe schema (SEC-002) | (A) pure root + `./payload` compile entry; (C) unsafe root + extra `./schema` entry | **A** (lead) | Safe by default for future consumers; C keeps the footgun. |
| Default access (SEC-003) | required `access.default`; required per-operation access; deny-by-default | **required default** (lead) | Cannot be forgotten, not verbose. Deny-by-default makes an unconfigured package useless; per-operation is verbose. |
| `null` for empty optional fields | hook-only; `nullable` defaults to `!required` | **hook-only** (lead) | Derived/form schemas stay strict (`string`, not `string \| null`); Payload types remain authoritative for stored data. |
| Feature scope | blocks, opt-in transactions, scoped Local API, inline Admin validation | **blocks only** (lead) | Others move to later minors. |

## 5. Defect register and resolution

Severity is the verified one, not the audit's.

### payload-schema

| ID | Verified status | Resolution |
| --- | --- | --- |
| NEW-01 empty optional field breaks later updates (Payload stores `null`; hook rejects it) | Real, critical | The canonical hook passes `null` through unchanged for **every** field (Payload's "empty"), exactly like `undefined` today. Required fields then fail through Payload's own required check ("This field is required.", Payload's path/label), not a Zod message. Applies to every field kind, including nested children of group/array/blocks rows. Regression test: create without the field → update another field → succeeds; set → clear with `null` → succeeds; SQLite **and** Postgres. |
| SEC-002 root imports `payload` at runtime | Real, high | Split entries (see 6.1). Root has no runtime `payload` import; enforced by a test that bundles the root with esbuild `--platform=browser` and fails on any Node built-in. |
| SEC-010 `Date` objects rejected by date hook | Real, low | Runtime hook only: a `Date` (valid) is converted to ISO before canonical parsing; invalid `Date` → field error. Derived schema unchanged (ISO string). |
| SEC-006 `pick()` ignores `required: false` | Design, low | Default unchanged (documented invariant: optionality belongs to derived schemas). Add `optional: "auto"` → optional exactly for fields whose `required` is not `true`. Precedence: explicit `required` list > `optional`. |
| COMPAT-006 no blocks factory | Feature | `field.blocks()` (see 6.3). |
| COMPAT-001 Zod 4 only | Design | Keep; raise floor to `>=4.1.0`. |
| COMPAT-007 catalog `payload: ^3.68.5` vs peers `>=3.85` | Hygiene | Align catalog to `^3.85.0`; peers unchanged (covered by `test:compat`). |
| COMPAT-008/SEC-014 no CJS | Doc error | Already corrected in knowledge base; no code change. |
| COMPAT-005 no inline Admin validation | Deferred | Documented as a known limitation. |
| SEC-007, COMPAT-004, COMPAT-009, SEC-012, SEC-015 | False / non-goal | No code change. Add a real-Payload regression test proving SEC-007 stays false (nested child errors, unknown group keys dropped). |

### payload-operations

| ID | Verified status | Resolution |
| --- | --- | --- |
| SEC-001 raw handler result serialized | Real, high | Codec model (6.2). |
| SEC-008 raw defined-error `data` serialized | Real, medium | Same codec model for error `data`. |
| SEC-003 default access = any `req.user` | Real, medium | `access.default` required: type-level (`access` and `access.default` non-optional) and runtime (`createPayloadEndpoints` throws `TypeError` at config time if missing). `overrides` stay optional. No built-in default function exists any more. |
| COMPAT-002/003 root pulls `@payloadcms/sdk`; pure client not exported | Real, low | Entry restructure (6.2). `createOperationsClient` exported from `./client`. `@payloadcms/sdk` becomes an optional peer (`peerDependenciesMeta`); only `createCMSClient` needs it. |
| SEC-009 unbounded body read | Real, low | `maxBodyBytes` option on `createPayloadEndpoints` (default `1_048_576`). Reject early on `Content-Length` over limit; otherwise count while reading the stream and abort over limit. Response: built-in `PAYLOAD_TOO_LARGE` (413). |
| SEC-005 zero tests | Real, high | Test suite (section 7). |
| SEC-004 no transaction | Non-goal | Docs only (already corrected); opt-in transaction is a later minor. |
| ARCH-OPS-02 Local API `overrideAccess: true` | Payload behavior | Docs/skills only. |
| COMPAT-010 no README | Real | Done; keep in sync with the new API. |
| SEC-011, SEC-013, SEC-016 | False | No change. |

## 6. Design

### 6.1 payload-schema 3.0.0 entry points

```ts
// "@nexload-sdk/payload-schema" — pure, any runtime
export { field, defineEntity, defaultIdSchema, PayloadSchemaError, isPayloadSchemaError };
// + types

// "@nexload-sdk/payload-schema/payload" — Node / Payload config only
export { payloadFields };
payloadFields(entity).all(): Field[]
payloadFields(entity).field(key): Field
payloadFields(entity).pick(keys): Field[]
```

- `EntityDefinition` loses `.payload`; it keeps `name`, `idSchema`, `fields`, `schema()`, `inspect()`.
- The bound field seeds the compiler needs are carried on the entity under a non-enumerable internal symbol; `payloadFields` rejects anything that is not an entity created by `defineEntity` (`PayloadSchemaError`, new code `INVALID_ENTITY`).
- All Payload compilation code (`compileField`, `canonicalHook`, `appendCanonicalHook`, field-type allow-list) moves to `src/payload/`. `src/` outside it may use `import type` from `payload` only — enforced by an ESLint `no-restricted-imports` rule (value imports of `payload` forbidden outside `src/payload/**`).
- Behavior of compiled fields is otherwise unchanged (fresh containers per call, hook appended after consumer hooks, getters preserved).
- **Codec safety (so entity-derived schemas work as operation outputs):** every built-in normalization becomes `.overwrite()` instead of `.transform()`: text/textarea `trim`/`lowercase`/`uppercase`, slug normalization, date ISO normalization. These are all string→string, so parse results and inferred types are identical (verified on Zod 4.4.3: same output, and `z.encode` succeeds). A test asserts every built-in field schema survives `z.encode`. User-supplied `options.schema(...)` refinements may still add transforms; docs state that such fields are then not usable in operation outputs.

### 6.2 payload-operations 2.0.0

**Entry points**

| Import | Contents | Runtime deps |
| --- | --- | --- |
| `.` | `operation`, `defineCMSOperations`, `safe`, `isDefinedError`, `isTimeoutError`, types | `zod` |
| `./contract` | `operation`, `defineCMSOperations` | `zod` |
| `./errors` | `safe`, `isDefinedError`, types | — |
| `./client` | `createOperationsClient`, `defineClientPlugin`, transport types | — (pure; imports cleanly without `@payloadcms/sdk` installed) |
| `./cms` | `createCMSClient` | `@payloadcms/sdk` (optional peer, required only for this entry) |
| `./plugins/timeout` | `timeoutPlugin`, `isTimeoutError` | — |
| `./server` | `createPayloadEndpoints`, `CMSOperationError` | `payload` |

`createCMSClient` moves to its own `./cms` entry, so plain Node ESM and dev servers never resolve `@payloadcms/sdk` unless that entry is imported. `timeoutPlugin` leaves the root. Bundle test: root, `./contract`, `./errors`, `./client`, `./plugins/timeout` each bundle for the browser as whole entries without `payload` or `@payloadcms/sdk`; an import test loads `./client` in Node with `@payloadcms/sdk` unresolvable.

**`createOperationsClient` public signature** (mirrors `createCMSClient`, minus the SDK):

```ts
createOperationsClient({
  operations,
  baseURL: string,          // same normalization rules as today
  basePath?: string,        // default "/operations"
  fetch?: typeof fetch,     // default globalThis.fetch
  baseInit?: RequestInit,
  plugins?: CMSClientPlugin[],
}): InferOperationsClient<typeof operations>
```

`createCMSClient({ operations, payload: { baseURL, fetch?, baseInit? }, basePath?, plugins? })` keeps its shape and builds on the same internals (one transport shared by `payload` and `operations`). The internal transport factories stay private.

**Codec model (data direction)**

| Direction | Caller/handler type | Wire (JSON) | Mechanism |
| --- | --- | --- | --- |
| Input | caller passes `z.input<input>` | caller's value as JSON | client pre-validates with `safeParseAsync` for fast `422`, then sends the **original** value; server `safeParseAsync` → handler receives `z.output<input>` |
| Output | handler returns `z.output<output>` | `z.encodeAsync(output, value)` | client `z.decodeAsync(output, json)` → caller gets `z.output<output>` |
| Defined error data | factory takes `z.output<data>` | `z.encodeAsync(data, value)` | client `z.decodeAsync(data, json)` |

- `InferHandlerOutput` becomes `z.output<output>` (breaking; type-honest).
- Encode failures (wrong value, or a unidirectional `.transform()` in an output/error schema) → `500 INTERNAL_SERVER_ERROR`; the cause is kept server-side only. Docs and skills state the rule: output and error-data schemas must be codec-safe (plain schemas, checks/overwrites like `.trim()`/`.toLowerCase()`, or `z.codec`); input schemas may use any transform.
- Stripping is guaranteed by `z.object` encode (unknown keys dropped, verified). `z.looseObject`/`.passthrough()` outputs would pass extra keys through — documented as an explicit opt-in to exposure.
- Input JSON caveat documented: `z.input<input>` must be JSON-serializable (use codecs for `Date`).
- Client input steps, in order: (1) `safeParseAsync` the original value → `422 INPUT_VALIDATION_FAILED` on failure; (2) `JSON.stringify` the **original** value → `400 BAD_REQUEST` ("not JSON serializable") on failure; (3) send it. The client-side parse result is discarded on purpose: defaults and transforms run once, on the server.

**Endpoints**

```ts
createPayloadEndpoints({
  operations,
  handlers,
  access: { default: CMSOperationAccess, overrides?: ... }, // required
  basePath?: string,      // default "/operations"
  maxBodyBytes?: number,  // default 1_048_576
});
```

### 6.3 `field.blocks()`

```ts
field.blocks({
  blocks: {
    hero: { fields: { title: field.text({ required: true }) }, payload?: { labels, ... } },
    quote: { fields: { body: field.textarea({ required: true }) } },
  },
  required?, nullable?, minRows?, maxRows?, defaultValue?, dynamicDefaultValue?,
  payload?: NativePayloadExtras<BlocksField, "blocks" | "minRows" | "maxRows">,
})
```

- Payload output: `{ type: "blocks", blocks: [{ slug: "hero", fields: [...compiled children] }, ...] }`; every child field gets its own canonical hook, as with `group`/`array`.
- Canonical schema: `z.array(z.discriminatedUnion("blockType", [z.strictObject({ blockType: z.literal(slug), ...childSchemas }), ...]))` with `minRows`/`maxRows` and `nullable` applied. Payload-managed keys `id` and `blockName` are accepted as optional (`id: string`, `blockName: string | null`), so stored rows parse.
- Runtime (container) hook: array + each row has a known `blockType`; child validation stays per-field.
- If any child has no canonical schema, the block field has no canonical schema (same `blockingFieldPath` rule as `group`/`array`).
- Block slugs validated at definition time (non-empty, unique); `blockReferences` is out of scope.

## 7. Tests and gates

- **payload-operations (new):** `node --test` unit suites for contract validation, tree flattening, access (missing default throws; 401 vs 403), body parsing (415, malformed JSON 400, 413 by header and by stream), codec encode/decode (secret keys stripped, `Date` round-trip, unidirectional transform → 500), defined errors (data stripped, mismatched definition → 500), client response parsing, timeout plugin; plus an integration test booting Payload on SQLite with `createPayloadEndpoints` and calling it through `createOperationsClient`.
- **payload-schema (added):** NEW-01 create/update/clear round-trips (SQLite + Postgres), `Date` acceptance, `optional: "auto"`, `field.blocks()` (compile, nested child errors, discriminated parse), `payloadFields` rejects non-entities, SEC-007 stays false.
- **Both:** browser-bundle test of the pure entries; type tests (`tests/types`) for the new signatures; `test:consumer` / `test:compat` updated.
- **CI:** create a new workflow `.github/workflows/test.yml` (only `docs.yml` exists today) on push/PR: pnpm install with cache, build, then lint, type tests, unit and SQLite integration tests for both packages, plus a job with a `postgres` service container running `test:postgres` for payload-schema. The NEW-01 regression therefore runs on both databases in CI.
- **Architecture:** enola baseline pinned before edits; `enola check` must show no new cycles or layer crossings (in particular nothing outside `src/payload/` / `src/server/` importing `payload` at runtime).

## 8. Documentation and skills

Updated in the same change set, describing only implemented behavior:
- `packages/payload-schema/README.md`, `packages/payload-operations/README.md` (remove fixed caveats, document new API and remaining limits).
- `docs/packages/PAYLOAD-SUITE.md`, `docs/architecture/PROJECT-KNOWLEDGE-BASE.md` if entry points are listed.
- Docsite: `apps/docs/src/content/docs/packages/payload-schema/{index,api,guides}.mdx`, `.../payload-operations/{index,api,guides}.mdx`, `start/payload-packages.mdx`; new **migration** page per package (2→3, 1→2) with before/after snippets for every breaking change; regenerate `apps/docs/src/generated/api-catalog.json` via `apps/docs/scripts`.
- Skills: `skills/payload-schema/{use,develop}` and `skills/payload-operations/{core,server,client}` — SKILL.md, references and eval fixtures rewritten for the new entries, codec rule, required access, `null` semantics, blocks; evals that encoded old behavior updated.
- Changesets: major for both packages, body = migration summary.

## 9. Breaking changes summary (feeds the migration guides)

**payload-schema 3.0.0:** `entity.payload.*` → `payloadFields(entity).*` from `/payload`; Zod floor `4.1`; `null` passes the canonical hook (empty optional fields work; required ones now report Payload's "This field is required." instead of a Zod message); `Date` accepted by date hook; built-in normalizations are `.overwrite()` (same results, now codec-safe).

**payload-operations 2.0.0:** `createCMSClient` moves to `/cms` (no longer in root or `/client`); `timeoutPlugin` no longer exported from root; `createOperationsClient` is public in `/client`; the client sends the caller's original input (no client-side transforms/defaults on the wire); `access.default` required; handler return type is `z.output<output>` and is encoded (extra keys never sent); output/error-data schemas must be codec-safe; Zod floor `4.1`; `@payloadcms/sdk` optional peer; request bodies over 1 MiB rejected with 413 by default.

## 10. Calls made after the builder check (author's calls, not lead decisions)

1. Built-in normalizations move to `.overwrite()` so entity-derived schemas are codec-safe (6.1).
2. `createOperationsClient` takes `fetch`/`plugins` like `createCMSClient`; transport factories stay private (6.2).
3. `createCMSClient` gets its own `./cms` entry so `./client` imports without `@payloadcms/sdk` (6.2).
4. The hook passes `null` through for all fields; Payload's required check reports required ones (5).
5. The client validates and then sends the original input; the serializability check runs on the original (6.2).
6. A new `test.yml` workflow with a Postgres service (7).

## 11. Left to the builder

- Internal file layout inside `src/payload/` and test file organization.
- Exact wording of error messages and the new `INVALID_ENTITY` error data shape (follow existing `PayloadSchemaError` conventions).
- How `maxBodyBytes` counting is implemented (stream reader vs. `arrayBuffer` with header pre-check), as long as both checks exist.
- Whether the browser-bundle test uses esbuild from the workspace or the bundler package.
- Changeset prose.
