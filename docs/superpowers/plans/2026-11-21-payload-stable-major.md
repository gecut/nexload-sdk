# Payload Schema 3.0 & Payload Operations 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every verified defect in `@nexload-sdk/payload-schema` and `@nexload-sdk/payload-operations`, add `field.blocks()`, and ship them as stable majors (3.0.0 / 2.0.0) with docs and agent skills that match the code.

**Architecture:** payload-schema gets a pure root entry and a Node-only `./payload` entry that holds all Payload compilation. payload-operations switches to a Zod-codec wire model (handler returns `z.output`, the server `encode`s and the client `decode`s), requires `access.default`, limits body size, and splits its client entries so only `./cms` needs `@payloadcms/sdk`. Every defect gets a regression test that runs against real Payload (SQLite; Postgres for NEW-01).

**Tech Stack:** TypeScript, Zod `>=4.1 <5`, Payload `>=3.85 <4`, `node --test`, esbuild via `@nexload-sdk/bundler`, pnpm + turbo, Changesets, Astro Starlight docsite.

**Spec:** `docs/superpowers/specs/2026-11-21-payload-stable-major-design.md` (approved). Read it before any task; section numbers below refer to it.

## Global Constraints

- Versions: `@nexload-sdk/payload-schema` **3.0.0**, `@nexload-sdk/payload-operations` **2.0.0** (via Changesets, major). No npm publish.
- Peers: `payload: ">=3.85.0 <4.0.0"`, `zod: ">=4.1.0 <5.0.0"`; ops: `@payloadcms/sdk: ">=3.85.0 <4.0.0"` marked optional in `peerDependenciesMeta`.
- Node `>=20.9.0`, ESM-only, `createBundler(..., false)`. Never edit `dist/`.
- No compatibility switches that keep the old unsafe behavior (spec section 2, anti-goals).
- In payload-schema, only `src/payload/**` may value-import `payload`. In payload-operations, only `src/server/**` may value-import `payload`, and only `src/cms/**` may import `@payloadcms/sdk`.
- Docs and skills describe only implemented behavior; update READMEs, `docs/packages/PAYLOAD-SUITE.md`, docsite and skills in the docs tasks.
- Work on branch `feat/payload-stable-major`. Never commit `.enola/`.
- Test commands: payload-schema `pnpm -C packages/payload-schema test` (builds, then `node --test tests/unit/*.test.mjs`); one file: `pnpm -C packages/payload-schema build && node --test packages/payload-schema/tests/unit/<file>.test.mjs`. The payload-operations scripts are added in Task 7 with the same pattern.

## Review Focus

1. **Nested `null` on update:** an empty optional field inside an array row or a group, and the document is updated later. Expected: the update succeeds. Test added in Task 3.
2. **Invalid `Date` object** (`new Date("nope")`) written through the Local API. Expected: a field `ValidationError`, not a crash or "Invalid Date" stored. Test added in Task 4.
3. **Oversized body without `Content-Length`** (chunked/streamed). Expected: `413 PAYLOAD_TOO_LARGE`, with the stream not fully buffered. Test added in Task 9.
4. **Operation with no output value** (`output: z.undefined()`, handler returns `undefined`). Expected: `204`, client resolves `undefined`. Test added in Task 11.
5. **`z.looseObject` output schema:** extra keys are intentionally sent. Expected: documented behavior, pinned by a test so it can't change silently. Test added in Task 11.

---

## Phase 0 — Setup

### Task 0: Branch, baseline, dependency floor

**Files:**
- Modify: `pnpm-workspace.yaml` (catalog `payload: ^3.85.0`)
- Modify: `packages/payload-schema/package.json`, `packages/payload-operations/package.json` (zod peer `>=4.1.0 <5.0.0`)

- [ ] **Step 1:** `git switch -c feat/payload-stable-major`
- [ ] **Step 2:** Pin the architecture baseline: enola MCP `generate_snapshot`, then `set_baseline` (or `enola baseline pin`).
- [ ] **Step 3:** Apply the catalog and peer edits above, then run `pnpm install`. Expected: lockfile updates with no peer warnings for these two packages.
- [ ] **Step 4:** Run `pnpm -C packages/payload-schema test` and `pnpm -C packages/payload-operations build`. Expected: PASS (the baseline is green).
- [ ] **Step 5:** Commit `chore(payload): raise zod floor to 4.1 and align payload catalog`.

---

## Phase 1 — payload-schema 3.0.0

### Task 1: Codec-safe built-in normalizations

**Files:**
- Modify: `packages/payload-schema/src/fields/index.ts` (`buildTextSchema` ~L139-157, `date` ~L377)
- Test: `packages/payload-schema/tests/unit/codec-safety.test.mjs`

**Interfaces:** Produces built-in field schemas that `z.encode` accepts (used by Task 11 docs/tests).

- [ ] **Step 1: Write the failing test** `codec-safety.test.mjs`:
  - `test("every built-in field schema survives z.encode")`: for `text({trim:true})`, `text({lowercase:true})`, `text({uppercase:true})`, `textarea({trim:true})`, `slug()`, `date()`, `number()`, `money({currency:"IRR"})`, `boolean()`, `select({values:["a"]})`, `relationship({relationTo:"x"})`, assert that `z.encode(f.schema, sample)` does not throw.
  - `test("normalization results are unchanged")`: `slug().schema.parse("  Cordless__Drill  ") === "cordless-drill"`; `text({trim:true,lowercase:true}).schema.parse("  AB ") === "ab"`; `date().schema.parse("2026-01-01T03:30:00+03:30") === "2026-01-01T00:00:00.000Z"`.
- [ ] **Step 2:** Run `pnpm -C packages/payload-schema build && node --test packages/payload-schema/tests/unit/codec-safety.test.mjs`. Expected: FAIL with `ZodEncodeError` (unidirectional transform).
- [ ] **Step 3:** Replace each `.transform(fn)` in the slug, trim, lowercase, uppercase and date normalization with `.overwrite(fn)`. Leave `options.schema(...)` untouched.
- [ ] **Step 4:** Run the new test plus the full `pnpm -C packages/payload-schema test` and `test:types`. Expected: PASS (existing behavior is unchanged).
- [ ] **Step 5:** Commit `fix(payload-schema): make built-in normalizations codec-safe`.

### Task 2: Pure root + `./payload` entry (`payloadFields`)

**Files:**
- Create: `packages/payload-schema/src/payload/index.ts`, `src/payload/payload-fields.ts`, `src/payload/compile-field.ts`, `src/payload/canonical-hook.ts`
- Create: `packages/payload-schema/src/internal/entity-binding.ts`
- Modify: `src/entity/define-entity.ts` (remove the `ValidationError` import, compile code and the `payload` facade; attach the binding), `src/types.ts` (`EntityDefinition` without `payload`; export `EntityPayloadFacade` from `./payload` types), `src/errors.ts` (new code), `esbuild.config.mjs` (entries `src/index.ts`, `src/payload/index.ts`, `splitting: true`, `chunkNames: "internal/[name]-[hash]"`), `package.json` (`exports["./payload"]`), `eslint.config.mjs` (`no-restricted-imports`)
- Modify: every test and fixture using `entity.payload.*` (`tests/unit/*.test.mjs`, `tests/fixtures/*.mjs`, `tests/consumer-smoke.mjs`, `tests/types/public-api.ts`)
- Test: `tests/unit/entry-points.test.mjs`

**Interfaces:**
- Produces: `payloadFields(entity: AnyEntityDefinition): EntityPayloadFacade<TFields>` with `.all(): Field[]`, `.field(key): Field`, `.pick(keys): Field[]`, exported from `@nexload-sdk/payload-schema/payload`.
- Produces (internal): `entityBindingSymbol: unique symbol` and `getEntityBinding(value: unknown): { name: string; entries: ReadonlyArray<readonly [string, FieldSeed]> }`, which throws `PayloadSchemaError("INVALID_ENTITY", { phase: "payload-compilation", data: { receivedType } })`.
- Produces: `PayloadSchemaErrorCode` gains `"INVALID_ENTITY"` (data `{ receivedType: string }`).

- [ ] **Step 1: Write the failing tests** in `entry-points.test.mjs`:
  - `test("root bundles for the browser")`: run workspace esbuild on `dist/index.js` with `platform: "browser", bundle: true, write: false`; assert no errors.
  - `test("payloadFields compiles an entity")`: `payloadFields(entity).field("title")` has `type: "text"` and one `beforeValidate` hook.
  - `test("payloadFields rejects non-entities")`: `payloadFields({})` throws, and `isPayloadSchemaError(e) && e.code === "INVALID_ENTITY"`.
  - `test("entity has no payload facade")`: `"payload" in entity === false`.
- [ ] **Step 2:** Build and run. Expected: FAIL (`./payload` is missing; the browser bundle fails with `child_process`).
- [ ] **Step 3:** Move `compileField`, `canonicalHook`, `appendCanonicalHook`, `dataFieldTypes` and the facade into `src/payload/*`. `defineEntity` stores the binding under `entityBindingSymbol` (non-enumerable) and returns the entity without `payload`. Add the ESLint rule forbidding value imports of `"payload"` outside `src/payload/**` (type imports are allowed).
- [ ] **Step 4:** Migrate all existing tests and fixtures to `payloadFields(entity).*`. Run `pnpm -C packages/payload-schema test`, `test:types`, `test:sqlite` and `lint`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(payload-schema)!: move Payload compilation to ./payload entry`.

### Task 3: `null` passes the canonical hook (NEW-01)

**Files:**
- Modify: `packages/payload-schema/src/payload/canonical-hook.ts`
- Modify: `packages/payload-schema/tests/integration/sqlite.test.mjs`, `tests/integration/postgres.test.mjs` (shared cases via a helper in `tests/fixtures/round-trip.mjs`)
- Test: `tests/unit/canonical-hook.test.mjs`

- [ ] **Step 1: Write the failing tests.**
  - Unit: the hook for `text()`, `text({required:true})` and a group child each return `null` when called with `value: null`.
  - Integration helper `runNullRoundTrips(payload)`, called from both DB tests. The collection has `title` (required), `bio` (optional text), `publishedAt` (optional date), `meta` group `{ tag: required text, note: optional text }`, and `rows` array `{ label: required text, hint: optional text }`. Assert that each of these succeeds:
    - (a) create without `bio`, `publishedAt` or `meta.note`, then update `title` only;
    - (b) set `bio`, then update `bio: null`, and `bio === null` afterwards;
    - (c) a row without `hint`, then update `title` *(Review Focus 1)*.
  - Assert that creating with `title: null` rejects with `ValidationError` and the message `"This field is required."` at path `title`.
  - SEC-007 stays false: `meta: { tag: 1 }` rejects at path `meta.tag`; `meta: { tag: "x", injected: true }` saves, and the re-read `meta` has no `injected`.
- [ ] **Step 2:** Run `pnpm -C packages/payload-schema test:sqlite`. Expected: FAIL with `expected string, received null`.
- [ ] **Step 3:** In the hook, return `value` unchanged when `value === undefined || value === null`.
- [ ] **Step 4:** Run `test`, `test:sqlite` and `test:postgres` (Postgres needs the env the existing test expects). Expected: PASS.
- [ ] **Step 5:** Commit `fix(payload-schema): accept null as empty in canonical hook`.

### Task 4: Date hook accepts `Date` objects (SEC-010)

**Files:**
- Modify: `packages/payload-schema/src/fields/index.ts` (`date`: `runtimeSchema` differs from `schema`)
- Test: `tests/unit/scalars.test.mjs` (append), integration helper from Task 3 (append)

- [ ] **Step 1: Write the failing tests.**
  - Unit: the date field's runtime parse of `new Date("2026-01-01T00:00:00Z")` gives `"2026-01-01T00:00:00.000Z"`.
  - Unit: `fields.publishedAt` (the canonical schema) still rejects a `Date`.
  - Unit *(Review Focus 2)*: runtime parse of `new Date("nope")` fails with the message `"Invalid date"`.
  - Integration: `payload.create({ data: { publishedAt: new Date(...) } })` stores the ISO string.
- [ ] **Step 2:** Run. Expected: FAIL (`expected string, received Date`).
- [ ] **Step 3:** Set `runtimeSchema = z.union([z.date().refine(d => !Number.isNaN(d.getTime()), { error: "Invalid date" }).transform(d => d.toISOString()), z.string()]).pipe(schema)`, applying nullable as `schema` does. Keep `schema` unchanged.
- [ ] **Step 4:** Run `test` and `test:sqlite`. Expected: PASS.
- [ ] **Step 5:** Commit `fix(payload-schema): accept Date objects in date field hook`.

### Task 5: `pick(keys, { optional: "auto" })` (SEC-006)

**Files:**
- Modify: `packages/payload-schema/src/entity/define-entity.ts` (`pick`), `src/types.ts` (`optional?: readonly K[] | "all" | "auto"`; for `"auto"`, the picked object type marks keys optional where the field's `required` is not literally `true`)
- Test: `tests/unit/vertical-slice.test.mjs` (append), `tests/types/public-api.ts` (append)

- [ ] **Step 1: Write the failing tests.**
  - With `title` (`required:true`) and `bio` (optional): `pick(["title","bio"],{optional:"auto"}).safeParse({title:"x"}).success === true`.
  - `.safeParse({bio:"y"}).success === false`.
  - `pick([...],{optional:"auto",required:["bio"]})` rejects `{title:"x"}`.
  - Type test: `z.infer<...>` equals `{ title: string; bio?: string }`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Under `"auto"`, a key is optional when `!seed.required`; the `required` list still wins.
- [ ] **Step 4:** Run `test` and `test:types`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(payload-schema): add optional "auto" to pick`.

### Task 6: `field.blocks()` (COMPAT-006)

**Files:**
- Modify: `packages/payload-schema/src/fields/index.ts` (new `blocks`, added to `field`), `src/internal/field-definition.ts` (`composite?: "array" | "group" | "blocks"`, `blocks?: ReadonlyArray<readonly [slug: string, children: ReadonlyArray<readonly [string, FieldSeed]>, payloadExtras: Record<string, unknown>]>`), `src/entity/define-entity.ts` (`bindSeed` binds block children), `src/payload/compile-field.ts` (emit `blocks: [{ slug, fields, ...extras }]`), `src/types.ts` (`BlocksFieldOptions`, `BlockDefinitionOptions`, canonical type), `src/index.ts` (export the types)
- Test: `tests/unit/blocks.test.mjs`, integration helper (append)

**Interfaces:**
- Produces: `field.blocks<const TBlocks extends Record<string, BlockDefinitionOptions<EntityFieldMap>>, TNullable extends boolean = false>(options: BlocksFieldOptions<TBlocks, TNullable>): FieldDefinition<"blocks", BlocksCanonicalSchema<TBlocks, TNullable>, BlocksField>`
- `BlockDefinitionOptions<TFields> = { fields: TFields; payload?: NativePayloadExtras<Block, "fields" | "slug"> }`
- `BlocksFieldOptions = { blocks; required?; nullable?; minRows?; maxRows?; defaultValue?; dynamicDefaultValue?; payload?: NativePayloadExtras<BlocksField, "blocks" | "minRows" | "maxRows"> }`

- [ ] **Step 1: Write the failing tests.**
  - Compile: `payloadFields(e).field("layout")` has `type:"blocks"`, block slugs `["hero","quote"]`, and each child has a `beforeValidate` hook.
  - Schema: parses `[{blockType:"hero",title:"x"},{blockType:"quote",body:"y",id:"abc",blockName:null}]`; rejects `blockType:"nope"`; rejects `{blockType:"hero"}` (missing title); rejects unknown keys.
  - `minRows: 1` rejects `[]`.
  - Definition errors: empty `blocks` → `INVALID_FIELD_CONFIGURATION`; a child `field.native({payload:{type:"point"}})` without a schema makes `fields.layout.schema === undefined`, and `pick(["layout"])` throws `SCHEMA_UNAVAILABLE` with `blockingFieldPath` `"layout.hero.<child>"`.
  - Integration: create with a hero row whose `title` is a number rejects at path `layout.0.title`; a valid layout saves and re-reads.
- [ ] **Step 2:** Run. Expected: FAIL (`field.blocks is not a function`).
- [ ] **Step 3:** Implement following `array`. The container `runtimeSchema` is `z.array(z.looseObject({ blockType: z.enum(slugs) }))` with min/max and nullable; the canonical schema is per spec 6.3.
- [ ] **Step 4:** Run `test`, `test:types`, `test:sqlite` and `lint`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(payload-schema): add field.blocks`.

---

## Phase 2 — payload-operations 2.0.0

### Task 7: Test harness, entry restructure, public `createOperationsClient`

**Files:**
- Modify: `packages/payload-operations/package.json`:
  - scripts: `test: "pnpm build && node --test tests/unit/*.test.mjs"`, `test:types: "tsc --project tests/types/tsconfig.json"`, `test:sqlite: "pnpm build && node --test tests/integration/*.test.mjs"`
  - `exports["./cms"]`
  - `peerDependenciesMeta: { "@payloadcms/sdk": { optional: true } }`
  - devDependency `@payloadcms/db-sqlite: 3.86.0`
- Create: `src/cms/index.ts` (move `create-cms-client.ts` here), `tests/types/tsconfig.json`, `tests/types/public-api.ts`
- Modify: `src/index.ts` (root = `operation`, `defineCMSOperations`, `safe`, `isDefinedError`, `isTimeoutError` + types; no client), `src/client/index.ts` (`createOperationsClient`, `defineClientPlugin`, types), `src/client/create-operations-client.ts` (public options signature; rename the transport-taking internal to `buildOperationsClient`), `esbuild.config.mjs` (add `src/cms/index.ts`), `eslint.config.mjs` (`payload` value imports only in `src/server/**`; `@payloadcms/sdk` only in `src/cms/**`)
- Test: `tests/unit/entry-points.test.mjs`

**Interfaces:**
- Produces: `createOperationsClient<const TOperations extends CMSOperationsTree>(options: { operations: TOperations; baseURL: string; basePath?: string; fetch?: typeof fetch; baseInit?: RequestInit; plugins?: readonly CMSClientPlugin[] }): InferOperationsClient<TOperations>` from `./client`.
- Produces: `createCMSClient` (same options as today) from `./cms`, built on `buildOperationsClient` + the shared transport.

- [ ] **Step 1: Write the failing tests** in `entry-points.test.mjs`:
  - Browser-bundle `dist/index.js`, `dist/contract/index.js`, `dist/errors/index.js`, `dist/client/index.js` and `dist/plugins/timeout/index.js` with esbuild (`platform:"browser"`, `external: []`). Assert no errors and that the output contains neither `PayloadSDK` nor `from "payload"`.
  - Spawn `node --input-type=module -e 'await import(".../dist/client/index.js")'` with a loader hook (or `--import` of a resolve hook) that makes `@payloadcms/sdk` unresolvable. Expected exit 0.
  - `createOperationsClient({operations, baseURL:"http://x/api", fetch: stub})` calls `http://x/api/operations/<path>`, and a plugin added via `plugins` sees the request.
- [ ] **Step 2:** Run `pnpm -C packages/payload-operations test`. Expected: FAIL.
- [ ] **Step 3:** Restructure per spec 6.2 (entry table) and add the ESLint rules.
- [ ] **Step 4:** Run `test`, `test:types`, `lint` and `typecheck`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(payload-operations)!: pure root/client entries, createCMSClient moves to ./cms`.

### Task 8: Required `access.default` (SEC-003)

**Files:**
- Modify: `src/server/types.ts` (`access: { default: CMSOperationAccess; overrides?: CMSOperationAccessOverrides<TOperations> }`, non-optional), `src/server/create-payload-endpoints.ts` (delete `DEFAULT_ACCESS`; throw `TypeError("createPayloadEndpoints requires access.default.")` when `typeof options.access?.default !== "function"`)
- Test: `tests/unit/access.test.mjs`, `tests/types/public-api.ts` (`// @ts-expect-error` without `access`)

- [ ] **Step 1: Write the failing tests:**
  - Missing `access` throws the exact message above; `access: {}` throws the same.
  - With `default: () => false`: no user → 401 `UNAUTHORIZED`; user → 403 `FORBIDDEN`.
  - An override `() => true` wins over a default `() => false`.
  - The handler is not called when access is denied.
- [ ] **Step 2:** Run. Expected: FAIL (no throw).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `test` and `test:types`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(payload-operations)!: require access.default`.

### Task 9: Request body limit (SEC-009)

**Files:**
- Modify: `src/server/types.ts` (`maxBodyBytes?: number`), `src/server/create-payload-endpoints.ts` (validate a positive integer; pass it down), `src/server/execute-operation.ts` (`parseRequestInput(req, maxBodyBytes)`), add `export const DEFAULT_MAX_BODY_BYTES = 1_048_576` in `src/server/limits.ts`
- Test: `tests/unit/request-body.test.mjs`

- [ ] **Step 1: Write the failing tests:**
  - `Content-Length: 2000000` → 413 `PAYLOAD_TOO_LARGE`, and the handler is not called.
  - A streamed `ReadableStream` body with no `Content-Length`, 2 MiB in 64 KiB chunks → 413, and the test's stream records that it was cancelled before the last chunk *(Review Focus 3)*.
  - `maxBodyBytes: 10` with an 11-byte JSON body → 413.
  - The existing 415 (non-JSON content type) and 400 (malformed JSON) cases still pass.
  - `maxBodyBytes: 0` or `-1` throws at endpoint creation.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Reject on `Content-Length` greater than the limit; otherwise read `req.body` through its reader, counting bytes, and `cancel()` the reader and throw `createFrameworkError("PAYLOAD_TOO_LARGE", "Request body exceeds the size limit.")` when over. Fall back to `req.text()` only when `req.body` is absent.
- [ ] **Step 4:** Run `test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(payload-operations): limit request body size`.

### Task 10: Codec wire model on the server (SEC-001, SEC-008)

**Files:**
- Modify: `src/contract/types.ts` (`InferHandlerOutput = z.output<TOperation["output"]>`), `src/errors/types.ts` (defined-error factory `data: z.output<TSchema>`, ~L47), `src/server/execute-operation.ts` (encode output), `src/errors/defined-error.ts` (`validateDefinedError` encodes `data`)
- Test: `tests/unit/server-codec.test.mjs`, `tests/types/public-api.ts`

**Interfaces:** Produces the server wire format consumed by Task 11: success body = `JSON(z.encodeAsync(output, handlerResult))`; defined-error envelope `data` = `z.encodeAsync(definition.data, error.data)`.

- [ ] **Step 1: Write the failing tests** (call the endpoint handler with a fake `PayloadRequest`):
  - The handler returns `{id, email, passwordHash}` with output `z.object({id, email})` → the body JSON has exactly the keys `["email","id"]`.
  - With output `z.object({ at: isoDateCodec })` (a test-local `z.codec(z.iso.datetime(), z.date(), …)`), the handler returns a `Date` → the body is `"2026-01-01T00:00:00.000Z"`.
  - Output `z.object({ n: z.string().transform(s => s.length) })` → 500 `INTERNAL_SERVER_ERROR`, and the body contains no `cause`.
  - Handler output failing the schema → 500.
  - Defined error `data` with an extra key `internal` → the envelope `data` lacks `internal`.
  - A definition without `data` that receives `undefined` → envelope without data.
  - Type test: a handler returning `Date` for a codec output compiles; returning `string` is a `@ts-expect-error`.
- [ ] **Step 2:** Run. Expected: FAIL (`passwordHash` is present).
- [ ] **Step 3:** Replace `safeParseAsync` + raw return with `await z.encodeAsync(definition.output, handlerResult)`; catch `ZodError`/`$ZodEncodeError` → `createInternalError(cause)`. Apply the same in `validateDefinedError`.
- [ ] **Step 4:** Run `test` and `test:types`. Expected: PASS.
- [ ] **Step 5:** Commit `fix(payload-operations)!: encode operation output and error data with codecs`.

### Task 11: Codec wire model on the client + original input

**Files:**
- Modify: `src/client/response.ts` (`decodeAsync` for output and defined data), `src/client/request-operation.ts` (validate, then serialize the original `options.input`)
- Test: `tests/unit/client-codec.test.mjs`

- [ ] **Step 1: Write the failing tests** (stub `fetch`):
  - A response `{"at":"2026-01-01T00:00:00.000Z"}` with a codec output → the client resolves `at instanceof Date`.
  - With input `z.object({ q: z.string().transform(s => s.toUpperCase()) })` called with `{q:"a"}` → the sent body is `{"q":"a"}`.
  - Invalid input → rejects with `INPUT_VALIDATION_FAILED` and `fetch` is not called.
  - Input `{ n: 1n }` (BigInt) with a schema accepting `z.any()` → rejects `BAD_REQUEST` "Operation input is not JSON serializable."
  - *(Review Focus 4)* Output `z.undefined()`, handler returns `undefined`: server responds 204, client resolves `undefined`. End-to-end via Tasks 10 + 11 on the fake request.
  - *(Review Focus 5)* Output `z.looseObject({id: z.string()})`: an extra key reaches the wire and the client (pins the documented opt-in).
  - Defined error data decoding through a codec yields a `Date`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per the spec's "Client input steps".
- [ ] **Step 4:** Run `test`. Expected: PASS.
- [ ] **Step 5:** Commit `fix(payload-operations)!: decode responses with codecs and send original input`.

### Task 12: Remaining unit coverage + SQLite end-to-end (SEC-005)

**Files:**
- Test: `tests/unit/contract.test.mjs`, `tests/unit/timeout-plugin.test.mjs`, `tests/integration/sqlite.test.mjs`, `tests/fixtures/config.mjs`

- [ ] **Step 1: Write the tests:**
  - Contract: invalid segment names (`"__proto__"`, `"1abc"`) throw; an invalid error code (`"bad"`) throws; status out of 400-599 throws; empty message throws; non-Zod `data` throws; duplicate flattened paths throw; trees are frozen.
  - Timeout plugin: aborts after `ms` with `isTimeoutError(e) === true`.
  - Integration: boot Payload on a temporary SQLite with `endpoints: createPayloadEndpoints({...})` (an `orders.create` operation that writes via `req.payload.create({ req, overrideAccess: false })`), then:
    - serve via `payload`'s REST handler or a minimal `Request` → endpoint dispatch;
    - call through `createOperationsClient` with `fetch` routed to it;
    - assert success, the stripped output, 401 without a user, 422 on bad input, and the `OUT_OF_STOCK` defined error with decoded data.
- [ ] **Step 2:** Run `pnpm -C packages/payload-operations test && pnpm -C packages/payload-operations test:sqlite`. Expected: PASS. Fix code only if a test exposes a real defect, with a separate commit.
- [ ] **Step 3:** Commit `test(payload-operations): unit and SQLite integration suites`.

---

## Phase 3 — CI and architecture gate

### Task 13: CI workflow

**Files:**
- Create: `.github/workflows/test.yml`
- Modify: `turbo.json` only if the `test` task lacks `dependsOn: ["^build"]`

- [ ] **Step 1:** Write the workflow:
  - Trigger on `push` to `main` and on `pull_request`.
  - Job `unit`: checkout, pnpm/action-setup, setup-node 22 with pnpm cache, `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm lint`. Then `pnpm -C packages/payload-schema test`, `test:types`, `test:sqlite`, and `pnpm -C packages/payload-operations test`, `test:types`, `test:sqlite`.
  - Job `postgres`: `services.postgres` (image `postgres:17`, health check), the env vars the existing `postgres.test.mjs` reads, then `pnpm -C packages/payload-schema test:postgres`.
- [ ] **Step 2:** Validate with `actionlint` if available; otherwise run every listed command locally. Expected: all PASS.
- [ ] **Step 3:** Commit `ci: add test workflow for payload packages`.

### Task 14: Architecture check

- [ ] **Step 1:** Run enola `generate_snapshot` then `diff_snapshot` (baseline from Task 0). Expected: no new cycles or layer findings; the only `payload` runtime edges come from `payload-schema/src/payload/**` and `payload-operations/src/server/**`. If a new finding appears, fix the change, don't accept it.
- [ ] **Step 2:** Record the diff summary in the final report (no commit).

---

## Phase 4 — Documentation and skills

### Task 15: payload-schema docs

**Files:**
- Modify: `packages/payload-schema/README.md` (new import of `payloadFields`; remove the fixed caveats; keep "Known limitations": no inline Admin validation, `options.schema` transforms break codec use, `pick` default)
- Modify: `apps/docs/src/content/docs/packages/payload-schema/{index,api,guides}.mdx` (blocks section, `optional: "auto"`, null semantics, browser-safe root, the caution aside updated)
- Create: `apps/docs/src/content/docs/packages/payload-schema/migration.mdx` (2.x → 3.0: one before/after snippet per breaking item in spec section 9)
- Modify: `apps/docs/examples/payload-schema.ts`, `apps/docs/src/content/docs/start/payload-packages.mdx`, `apps/docs/src/content/docs/index.mdx` (where they show `entity.payload`), `docs/packages/PAYLOAD-SUITE.md` §A

- [ ] **Step 1:** Edit the files.
- [ ] **Step 2:** Run `pnpm -C apps/docs content:api:write && pnpm -C apps/docs content:llms:write && pnpm -C apps/docs content:examples && pnpm -C apps/docs test`. Expected: PASS; `api-catalog.json` regenerated.
- [ ] **Step 3:** Run `grep -rn "entity.payload\|\.payload\.all()" apps/docs/src docs packages/payload-schema/README.md`. Expected: no matches.
- [ ] **Step 4:** Commit `docs(payload-schema): document 3.0 API and migration`.

### Task 16: payload-operations docs

**Files:**
- Modify: `packages/payload-operations/README.md` (entry table with `./cms`; codec rule; required `access.default`; `maxBodyBytes`; remove the fixed caveats; keep: no automatic transaction, Local API `overrideAccess`)
- Modify: `apps/docs/src/content/docs/packages/payload-operations/{index,api,guides}.mdx` (fix the snippets importing `createCMSClient` and `timeoutPlugin` from root; replace the "Output is validated…" paragraph with the codec model; a codec recipe for `Date`)
- Create: `apps/docs/src/content/docs/packages/payload-operations/migration.mdx` (1.x → 2.0)
- Modify: `apps/docs/examples/payload-operations.ts`, `docs/packages/PAYLOAD-SUITE.md` §B

- [ ] **Step 1:** Edit the files.
- [ ] **Step 2:** Run the same docsite commands as Task 15. Expected: PASS.
- [ ] **Step 3:** Run `grep -rn 'createCMSClient.*from "@nexload-sdk/payload-operations"' apps/docs docs packages/payload-operations/README.md`. Expected: no matches (only `/cms`).
- [ ] **Step 4:** Commit `docs(payload-operations): document 2.0 API and migration`.

### Task 17: Skills

**Files:**
- Modify: `skills/payload-schema/use/{SKILL.md,references/*.md,evals/*.json,evals/fixtures/*.md}`, `skills/payload-schema/develop/{SKILL.md,references/architecture-invariants.md,references/release-matrix.md,evals/*}`
- Modify: `skills/payload-operations/{core,server,client}/{SKILL.md,references/*.md,evals/*.json}`; in particular `server/references/access-and-local-api.md`, `client/references/client-construction.md`, `core/references/package-boundaries.md`, `core/references/contract-model.md` (codec rule), `core/references/error-model.md` (encoded error data)

- [ ] **Step 1:** Rewrite each skill for: the `./payload` entry, `null` semantics, `optional:"auto"`, `field.blocks()`, `.overwrite()`/codec safety, required `access.default`, `./client` vs `./cms`, codec wire model, `maxBodyBytes`. Update the eval expectations that encode old behavior; add one eval per breaking change.
- [ ] **Step 2:** Run `grep -rnE "entity\.payload|Boolean\(req\.user\)|InferHandlerOutput.*input|createCMSClient.*payload-operations\"" skills/payload-schema skills/payload-operations`. Expected: no stale matches. Validate the JSON (`node -e` parse each `evals/*.json`).
- [ ] **Step 3:** Commit `docs(skills): update payload-schema and payload-operations skills for stable majors`.

---

## Phase 5 — Release preparation

### Task 18: Changesets and final verification

**Files:**
- Create: `.changeset/payload-schema-3.md` (`"@nexload-sdk/payload-schema": major`), `.changeset/payload-operations-2.md` (`"@nexload-sdk/payload-operations": major`); bodies = the spec section 9 bullets + a link to the migration pages.

- [ ] **Step 1:** Write both changesets.
- [ ] **Step 2:** Run `pnpm build && pnpm lint && pnpm test` and every package script from Task 13, plus `pnpm -C packages/payload-schema test:consumer`. Expected: all PASS.
- [ ] **Step 3:** Run `pnpm changeset status`. Expected: shows 3.0.0 and 2.0.0.
- [ ] **Step 4:** Commit `chore(release): changesets for payload-schema 3.0.0 and payload-operations 2.0.0`. Do **not** run `changeset version` or publish without explicit instruction.
- [ ] **Step 5:** Final report: test results, the enola diff, the remaining follow-up (upgrade `nexload-e-commerce`: 40 `payload-schema` imports → `payloadFields`, root `createCMSClient`/`timeoutPlugin` imports → `/cms` and `/plugins/timeout`, add `access.default`).
