# API reference

Public root and subpath exports for Payload Operations 0.1.0.

**Topic:** api
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/api/
## Functions

### `createCMSClient`

```ts
createCMSClient<TPayloadConfig extends PayloadTypesShape = UntypedPayloadTypes, const TOperations extends CMSOperationsTree = CMSOperationsTree>(options: CMSClientOptions<TOperations>) => CMSClient<TPayloadConfig, TOperations>
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/client`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/create-cms-client.ts#L19)

### `createPayloadEndpoints`

```ts
createPayloadEndpoints<const TOperations extends CMSOperationsTree>(options: CreatePayloadEndpointsOptions<TOperations>) => Endpoint[]
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public function exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/create-payload-endpoints.ts#L22)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/operation.ts#L15)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L49)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L23)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L19)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L21)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L8)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L34)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L13)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L17)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L16)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L69)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L52)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L31)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L28)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L58)

### `CMSOperationCallOptions`

```ts
type CMSOperationCallOptions = Omit<RequestInit, "body" | "method">;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L34)

### `CMSOperationContract`

```ts
type CMSOperationContract = CMSOperation;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L30)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L7)

### `CMSOperationErrorDefinitions`

```ts
type CMSOperationErrorDefinitions = Readonly<
  Record<string, CMSOperationErrorDefinition<z.ZodType | undefined>>
>;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L15)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L43)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L49)

### `CMSOperationsTree`

```ts
type CMSOperationsTree = Readonly<{ [key: string]: CMSOperationContract | CMSOperationsTree }>;
```

**Exported from:** `@nexload-sdk/payload-operations`, `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L32)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/errors/types.ts#L59)

### `InferHandlerOutput`

```ts
type InferHandlerOutput<TOperation extends CMSOperationContract>
  = z.input<TOperation["output"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L48)

### `InferOperationInput`

```ts
type InferOperationInput<TOperation extends CMSOperationContract>
  = z.input<TOperation["input"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L38)

### `InferOperationOutput`

```ts
type InferOperationOutput<TOperation extends CMSOperationContract>
  = z.output<TOperation["output"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L45)

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

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/client/types.ts#L40)

### `InferParsedOperationInput`

```ts
type InferParsedOperationInput<
  TOperation extends CMSOperationContract
> = z.output<TOperation["input"]>;
```

**Exported from:** `@nexload-sdk/payload-operations/contract`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/contract/types.ts#L41)

### `PayloadOperationEndpoints`

```ts
type PayloadOperationEndpoints = readonly Endpoint[];
```

**Exported from:** `@nexload-sdk/payload-operations/server`

Public type exported by @nexload-sdk/payload-operations.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/src/server/types.ts#L81)

## Entrypoints

| Subpath            | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------- |
| package root       | Universal contract, client, error, and timeout helpers              |
| `/contract`        | `operation`, `defineCMSOperations`, and contract types              |
| `/client`          | `createCMSClient`, `defineClientPlugin`, and client/transport types |
| `/errors`          | `CMSOperationError`, guards, `safe`, and error types                |
| `/plugins/timeout` | `timeoutPlugin`, `isTimeoutError`, and timeout options              |
| `/server`          | `createPayloadEndpoints`, `CMSOperationError`, and server types     |

## Contract

`operation({ input, output, errors? })` brands one immutable operation definition while preserving schema identity. Error codes must be uppercase snake case, status must be 400–599, and messages must be non-empty.

`defineCMSOperations(tree)` validates and snapshots a direct recursive namespace. It accepts no `query` or `command` wrapper.

## Client

`createCMSClient(options)` returns `{ payload, operations }`. `payload` is the actual `PayloadSDK<Config>` instance. `operations` mirrors the supplied contract.

`CMSClientOptions` accepts `operations`, `payload`, optional `plugins`, and optional operation `basePath`. `payload.baseInit` is merged before per-call options. Operation calls accept `Omit<RequestInit, "body" | "method">`; the package always supplies POST and the serialized body.

`defineClientPlugin(plugin)` validates and freezes a named transport wrapper. Plugin names must be unique; the first plugin is outermost.

## Errors

`safe(promise)` resolves to `[null, data, false]`, `[definedError, undefined, true]`, or `[unknownError, undefined, false]`.

`isDefinedError(error, code?)` validates the shared error brand and optionally narrows the declared code. `isTimeoutError(error)` recognizes operation timeout errors.

## Server

`createPayloadEndpoints(options)` returns Payload `Endpoint[]` containing a POST endpoint and matching OPTIONS preflight endpoint for each contract leaf. Options include exact `handlers`, partial access overrides, an optional default access policy, and `basePath`.

See the [package source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-operations/src) for the live export surface.
