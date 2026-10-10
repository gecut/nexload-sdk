# API Reference & Compatibility

Complete public API symbol reference, entrypoint exports, and runtime compatibility matrix for Payload Operations.

**Topic:** api
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `createCMSClient`

```ts
createCMSClient<TPayloadConfig extends PayloadTypesShape = UntypedPayloadTypes, const TOperations extends CMSOperationsTree = CMSOperationsTree>(options: CMSClientOptions<TOperations>) => CMSClient<TPayloadConfig, TOperations>
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/create-cms-client.ts#L20)

### `createPayloadEndpoints`

```ts
createPayloadEndpoints<const TOperations extends CMSOperationsTree>(options: CreatePayloadEndpointsOptions<TOperations>) => Endpoint[]
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/create-payload-endpoints.ts#L23)

### `defineCMSOperations`

```ts
defineCMSOperations<const TOperations extends CMSOperationsTree>(operations: TOperations) => TOperations
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/define-cms-operations.ts#L8)

### `defineClientPlugin`

```ts
defineClientPlugin<const TPlugin extends CMSClientPlugin>(plugin: TPlugin) => TPlugin
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/plugins/define-client-plugin.ts#L3)

### `isCMSOperationError`

```ts
isCMSOperationError(error: unknown) => error is CMSOperationError
```

**Exported from:** `@nexload-sdk/payload-operations/errors`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/cms-operation-error.ts#L46)

### `isDefinedError`

```ts
isDefinedError<TError extends CMSOperationError<string, unknown, true>>(error: TError) => error is TError
isDefinedError<TError extends CMSOperationError<string, unknown, true>, TCode extends TError["code"]>(error: TError, code: TCode) => error is Extract<TError, { code: TCode; }>
isDefinedError(error: unknown, code?: string) => error is CMSOperationError<string, unknown, true>
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/errors`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/is-defined-error.ts#L5)

### `isTimeoutError`

```ts
isTimeoutError(error: unknown) => boolean
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/plugins/timeout`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/plugins/timeout/is-timeout-error.ts#L4)

### `operation`

```ts
operation<const TInput extends z.ZodType, const TOutput extends z.ZodType, const TErrors extends CMSOperationErrorDefinitions = Readonly<Record<string, never>>>(definition: { errors?: TErrors; input: TInput; output: TOutput; }) => CMSOperation<TInput, TOutput, TErrors>
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/operation.ts#L16)

### `safe`

```ts
safe<const TPromise extends PromiseLike<unknown>>(promise: TPromise) => Promise<CMSSafeResult<AwaitedData<TPromise>, DefinedError<TPromise>>>
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/errors`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/safe.ts#L14)

### `timeoutPlugin`

```ts
timeoutPlugin(options: TimeoutPluginOptions) => { readonly name: "timeout"; readonly wrapTransport: (next: CMSClientTransport) => (request: CMSClientTransportRequest) => Promise<Response>; }
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/plugins/timeout`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/plugins/timeout/timeout-plugin.ts#L6)

## Classes

### `CMSOperationError`

```ts
class CMSOperationError
```

**Exported from:** `@nexload-sdk/payload-operations/errors`, `@nexload-sdk/payload-operations/server`

Public classe exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/cms-operation-error.ts#L16)

## Interfaces

### `CMSClient`

```ts
interface CMSClient<
  TPayloadConfig extends PayloadTypesShape = PayloadTypes,
  TOperations extends CMSOperationsTree = CMSOperationsTree
> {
  readonly operations: InferOperationsClient<TOperations>
  readonly payload: PayloadSDK<TPayloadConfig>
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L50)

### `CMSClientOptions`

```ts
interface CMSClientOptions<
  TOperations extends CMSOperationsTree
> {
  basePath?: string
  operations: TOperations
  payload: CMSPayloadClientOptions
  plugins?: readonly CMSClientPlugin[]
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L24)

### `CMSClientPlugin`

```ts
interface CMSClientPlugin {
  readonly name: string
  wrapTransport(next: CMSClientTransport): CMSClientTransport
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/transport/types.ts#L15)

### `CMSClientTransportRequest`

```ts
interface CMSClientTransportRequest {
  readonly init: RequestInit
  readonly operation?: {
    readonly name: string
    readonly path: string
  }
  readonly source: "operation" | "payload"
  readonly url: string
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/transport/types.ts#L1)

### `CMSOperation`

```ts
interface CMSOperation<
  TInputSchema extends z.ZodType = z.ZodType,
  TOutputSchema extends z.ZodType = z.ZodType,
  TErrors extends CMSOperationErrorDefinitions = CMSOperationErrorDefinitions
> {
  readonly [CMS_OPERATION_SYMBOL]: true
  readonly errors: TErrors
  readonly input: TInputSchema
  readonly output: TOutputSchema
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L20)

### `CMSOperationAccessContext`

```ts
interface CMSOperationAccessContext<
  TOperation extends CMSOperationContract = CMSOperationContract
> {
  readonly operation: CMSOperationMetadata<TOperation>
  readonly req: PayloadRequest
}
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L22)

### `CMSOperationErrorJSON`

```ts
interface CMSOperationErrorJSON {
  code: string
  data?: unknown
  defined: boolean
  message: string
  status: number
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/errors`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L9)

### `CMSOperationHandlerContext`

```ts
interface CMSOperationHandlerContext<
  TOperation extends CMSOperationContract
> {
  readonly errors: CMSDefinedErrorFactories<TOperation>
  readonly input: InferParsedOperationInput<TOperation>
  readonly operation: CMSOperationMetadata<TOperation>
  readonly req: PayloadRequest
}
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L35)

### `CMSOperationMetadata`

```ts
interface CMSOperationMetadata<
  TOperation extends CMSOperationContract = CMSOperationContract
> {
  readonly definition: TOperation
  readonly name: string
  readonly path: string
}
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L14)

### `CMSPayloadClientOptions`

```ts
interface CMSPayloadClientOptions {
  baseInit?: RequestInit
  baseURL: string
  fetch?: typeof fetch
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L18)

### `CMSValidationErrorData`

```ts
interface CMSValidationErrorData {
  issues: Array<{
    code?: string
    message: string
    path: Array<number | string>
  }>
}
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/errors`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L17)

### `CreatePayloadEndpointsOptions`

```ts
interface CreatePayloadEndpointsOptions<
  TOperations extends CMSOperationsTree
> {
  access?: {
    default?: CMSOperationAccess
    overrides?: CMSOperationAccessOverrides<TOperations>
  }
  basePath?: string
  handlers: CMSOperationHandlers<TOperations>
  operations: TOperations
}
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L70)

### `TimeoutPluginOptions`

```ts
interface TimeoutPluginOptions { timeout: number }
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/plugins/timeout`

Public interface exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/plugins/timeout/timeout-plugin.ts#L4)

## Types

### `CMSClientTransport`

```ts
type CMSClientTransport = (
  request: CMSClientTransportRequest
) => Promise<Response>;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/transport/types.ts#L11)

### `CMSDefinedErrorFactories`

```ts
type CMSDefinedErrorFactories<
  TOperation extends CMSOperationContract
> = {
  readonly [TCode in keyof TOperation["errors"] & string]:
  ErrorFactoryFromDefinition<TCode, TOperation["errors"][TCode]>;
};
```

**Exported from:** `@nexload-sdk/payload-operations/errors`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L53)

### `CMSDefinedOperationError`

```ts
type CMSDefinedOperationError<
  TOperation extends CMSOperationContract = CMSOperationContract
> = {
  [TCode in keyof TOperation["errors"] & string]: DefinedErrorFromDefinition<
    TCode,
    TOperation["errors"][TCode]
  >;
}[keyof TOperation["errors"] & string];
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/errors`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L32)

### `CMSOperationAccess`

```ts
type CMSOperationAccess<
  TOperation extends CMSOperationContract = CMSOperationContract
> = (
  context: CMSOperationAccessContext<TOperation>
) => boolean | Promise<boolean>;
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L29)

### `CMSOperationAccessOverrides`

```ts
type CMSOperationAccessOverrides<
  TOperations extends CMSOperationsTree
> = {
  readonly [TKey in keyof TOperations]?:
  TOperations[TKey] extends CMSOperationContract
    ? CMSOperationAccess<TOperations[TKey]>
    : TOperations[TKey] extends CMSOperationsTree
      ? CMSOperationAccessOverrides<TOperations[TKey]>
      : never;
};
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L59)

### `CMSOperationCallOptions`

```ts
type CMSOperationCallOptions = Omit<RequestInit, "body" | "method">;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L35)

### `CMSOperationContract`

```ts
type CMSOperationContract = CMSOperation;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L31)

### `CMSOperationErrorDefinition`

```ts
type CMSOperationErrorDefinition<
  TDataSchema extends z.ZodType | undefined = z.ZodType | undefined
> = Readonly<{
  data?: TDataSchema
  message: string
  status: number
}>;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L8)

### `CMSOperationErrorDefinitions`

```ts
type CMSOperationErrorDefinitions = Readonly<
  Record<string, CMSOperationErrorDefinition<z.ZodType | undefined>>
>;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L16)

### `CMSOperationHandler`

```ts
type CMSOperationHandler<
  TOperation extends CMSOperationContract
> = (
  context: CMSOperationHandlerContext<TOperation>
) => Promise<InferHandlerOutput<TOperation>>;
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L44)

### `CMSOperationHandlers`

```ts
type CMSOperationHandlers<TOperations extends CMSOperationsTree> = {
  readonly [TKey in keyof TOperations]:
  TOperations[TKey] extends CMSOperationContract
    ? CMSOperationHandler<TOperations[TKey]>
    : TOperations[TKey] extends CMSOperationsTree
      ? CMSOperationHandlers<TOperations[TKey]>
      : never;
};
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L50)

### `CMSOperationsTree`

```ts
type CMSOperationsTree = Readonly<{ [key: string]: CMSOperationContract | CMSOperationsTree }>;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L33)

### `CMSSafeResult`

```ts
type CMSSafeResult<TData, TDefinedError>
  = | readonly [error: null, data: TData, isDefined: false]
    | readonly [
      error: TDefinedError,
      data: undefined,
      isDefined: true
    ]
    | readonly [error: unknown, data: undefined, isDefined: false];
```

**Exported from:** `@nexload-sdk/payload-operations/errors`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L60)

### `InferHandlerOutput`

```ts
type InferHandlerOutput<TOperation extends CMSOperationContract>
  = z.input<TOperation["output"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L49)

### `InferOperationInput`

```ts
type InferOperationInput<TOperation extends CMSOperationContract>
  = z.input<TOperation["input"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L39)

### `InferOperationOutput`

```ts
type InferOperationOutput<TOperation extends CMSOperationContract>
  = z.output<TOperation["output"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L46)

### `InferOperationsClient`

```ts
type InferOperationsClient<TOperations extends CMSOperationsTree> = {
  readonly [TKey in keyof TOperations]:
  TOperations[TKey] extends CMSOperationContract
    ? CMSOperationMethod<TOperations[TKey]>
    : TOperations[TKey] extends CMSOperationsTree
      ? InferOperationsClient<TOperations[TKey]>
      : never;
};
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L41)

### `InferParsedOperationInput`

```ts
type InferParsedOperationInput<
  TOperation extends CMSOperationContract
> = z.output<TOperation["input"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L42)

### `PayloadOperationEndpoints`

```ts
type PayloadOperationEndpoints = readonly Endpoint[];
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L82)

***

## Exported Subpaths

To preserve clean bundle boundaries and prevent leaking Payload server code into client applications, `@nexload-sdk/payload-operations` exposes explicit subpaths:

| Subpath | Target Environment | Description |
|---|---|---|
| `@nexload-sdk/payload-operations` | Universal (Browser/Node) | Root entrypoint exporting `createCMSClient`, `defineCMSOperations`, `operation`, `safe`, `isDefinedError`, `timeoutPlugin`. |
| `@nexload-sdk/payload-operations/contract` | Universal (Browser/Node) | Pure contract modeling: `defineCMSOperations`, `operation`, and type inference helpers. Zero dependencies on Payload. |
| `@nexload-sdk/payload-operations/client` | Universal (Browser/Node) | Client factory and RPC proxy generator: `createCMSClient`, `defineClientPlugin`, `InferOperationsClient`. |
| `@nexload-sdk/payload-operations/errors` | Universal (Browser/Node) | Error boundaries and pattern matching: `CMSOperationError`, `safe`, `isDefinedError`. |
| `@nexload-sdk/payload-operations/plugins/timeout` | Universal (Browser/Node) | Timeout plugin: `timeoutPlugin`, `isTimeoutError`. |
| `@nexload-sdk/payload-operations/server` | **Node.js / Payload Server Only** | Server endpoint generator: `createPayloadEndpoints`. Never import in client bundles! |

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Verified on Payload 3.86.0 |
| **`@payloadcms/sdk`** | `>=3.85.0 <4.0.0` | Verified on SDK 3.86.0 |
| **Zod** | `>=4.0.0 <5.0.0` | Verified on Zod 4.4.3 |
| **Module Format** | ESM only | Native ECMAScript Modules (`"type": "module"`) |
| **Side Effects** | `false` | Tree-shaking enabled across all bundlers |
