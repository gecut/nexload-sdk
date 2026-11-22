import type { PayloadSDK } from "@payloadcms/sdk";
import { z } from "zod";

import {
  defineCMSOperations,
  isDefinedError,
  isTimeoutError,
  operation,
  safe,
  type CMSDefinedErrorFactories,
  type CMSDefinedOperationError,
  type CMSOperation,
  type CMSOperationCallOptions,
  type CMSOperationContract,
  type CMSOperationErrorDefinition,
  type CMSOperationErrorDefinitions,
  type CMSOperationErrorJSON,
  type CMSOperationsTree,
  type CMSSafeResult,
  type CMSValidationErrorData,
  type InferHandlerOutput,
  type InferOperationInput,
  type InferOperationOutput,
  type InferParsedOperationInput,
} from "../../src/index.js";
import {
  createOperationsClient,
  defineClientPlugin,
  type CMSClientPlugin,
  type CMSClientTransport,
  type CMSClientTransportRequest,
  type CreateOperationsClientOptions,
  type InferOperationsClient,
  type OperationsClientOptions,
} from "../../src/client/index.js";
import {
  createCMSClient,
  type CMSClient,
  type CMSClientOptions,
  type CMSPayloadClientOptions,
} from "../../src/cms/index.js";
import {
  defineCMSOperations as contractDefineCMSOperations,
  operation as contractOperation,
} from "../../src/contract/index.js";
import {
  CMSOperationError as errorsCMSOperationError,
  isCMSOperationError as errorsIsCMSOperationError,
  isDefinedError as errorsIsDefinedError,
  safe as errorsSafe,
} from "../../src/errors/index.js";
import {
  isTimeoutError as timeoutIsTimeoutError,
  timeoutPlugin,
  type TimeoutPluginOptions,
} from "../../src/plugins/timeout/index.js";
import {
  CMSOperationError,
  createPayloadEndpoints,
  DEFAULT_MAX_BODY_BYTES,
  type CMSOperationAccess,
  type CMSOperationAccessContext,
  type CMSOperationAccessOverrides,
  type CMSOperationHandler,
  type CMSOperationHandlerContext,
  type CMSOperationHandlers,
  type CMSOperationMetadata,
  type CreatePayloadEndpointsOptions,
  type PayloadOperationEndpoints,
} from "../../src/server/index.js";

type Exact<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// 1. Contract & Operation Tree definition
const operations = defineCMSOperations({
  ping: operation({
    input: z.object({ message: z.string() }),
    output: z.object({ reply: z.string() }),
    errors: {
      NOT_FOUND: {
        status: 404,
        message: "Resource not found",
        data: z.object({ id: z.string() }),
      },
    },
  }),
  nested: {
    run: operation({
      input: z.void(),
      output: z.boolean(),
    }),
  },
});

type OperationsTree = typeof operations;
const assertTreeExtends: OperationsTree extends CMSOperationsTree ? true : false = true;
type OpsClientType = InferOperationsClient<OperationsTree>;
const assertOpsClientType: Exact<typeof opsClient, OpsClientType> = true;

type PingSignature = (
  input: { message: string },
  options?: CMSOperationCallOptions
) => Promise<{ reply: string }>;

type NestedRunSignature = (
  input?: void,
  options?: CMSOperationCallOptions
) => Promise<boolean>;

const assertPingSignature: typeof opsClient.ping extends PingSignature ? true : false = true;
const assertNestedRunSignature: typeof opsClient.nested.run extends NestedRunSignature ? true : false = true;
void [assertTreeExtends, assertOpsClientType, assertPingSignature, assertNestedRunSignature];

// 2. Pure Operations Client (./client)
const opsClient = createOperationsClient({
  baseURL: "https://example.com/api",
  operations,
});

type PingInput = InferOperationInput<typeof operations.ping>;
const assertPingInput: Exact<PingInput, { message: string }> = true;

type PingOutput = InferOperationOutput<typeof operations.ping>;
const assertPingOutput: Exact<PingOutput, { reply: string }> = true;

const pingResult = opsClient.ping({ message: "hello" });
void pingResult;

const nestedResult = opsClient.nested.run(undefined);
void nestedResult;

// @ts-expect-error createOperationsClient requires baseURL
createOperationsClient({ operations });

// @ts-expect-error createOperationsClient requires operations
createOperationsClient({ baseURL: "https://example.com" });

// @ts-expect-error ping requires message
void opsClient.ping({});

// @ts-expect-error nested.run does not accept string
void opsClient.nested.run("invalid");

// 3. CMS Client (./cms)
const cmsClient = createCMSClient({
  payload: {
    baseURL: "https://example.com/api",
  },
  operations,
});

const assertCMSClientOps: Exact<typeof cmsClient.operations, InferOperationsClient<typeof operations>> = true;
const assertCMSClientPayload: Exact<typeof cmsClient.payload, PayloadSDK> = true;
void [assertCMSClientOps, assertCMSClientPayload];

// @ts-expect-error createCMSClient requires payload.baseURL
createCMSClient({ operations, payload: {} });

// @ts-expect-error createCMSClient requires operations
createCMSClient({ payload: { baseURL: "https://example.com" } });

// 4. Safe & Error handling (. and ./errors)
async function testSafe() {
  const result = await safe(opsClient.ping({ message: "ping" }));
  if (result[1] !== undefined) {
    const reply: string = result[1].reply;
    void reply;
  } else if (result[2]) {
    if (isDefinedError(result[0], "NOT_FOUND")) {
      const id: string = result[0].data.id;
      void id;
      // @ts-expect-error NOT_FOUND data has id, not unknownField
      void result[0].data.unknownField;
    }
  } else {
    if (isTimeoutError(result[0])) {
      void result[0];
    }
  }
}
void testSafe;

// 5. Plugins (./plugins/timeout and ./client)
const plugin: CMSClientPlugin = timeoutPlugin({ timeout: 5000 });
const customPlugin: CMSClientPlugin = defineClientPlugin({
  name: "custom",
  wrapTransport: (next) => (req) => next(req),
});
void [plugin, customPlugin];

// 6. Server endpoints (./server)
const assertDefaultMaxBodyBytes: Exact<typeof DEFAULT_MAX_BODY_BYTES, 1_048_576> = true;
void assertDefaultMaxBodyBytes;

const endpoints = createPayloadEndpoints({
  access: {
    default: () => true,
  },
  maxBodyBytes: 1048576,
  operations,
  handlers: {
    ping: async ({ input }) => {
      return { reply: `echo: ${input.message}` };
    },
    nested: {
      run: async () => true,
    },
  },
});
void endpoints;

const serverError = new CMSOperationError({
  code: "NOT_FOUND",
  status: 404,
  message: "Not found",
  defined: true,
  data: { id: "123" },
});
void serverError;

// 7. Verify contract/errors identical exports
const assertContractOp: Exact<typeof operation, typeof contractOperation> = true;
const assertContractDef: Exact<typeof defineCMSOperations, typeof contractDefineCMSOperations> = true;
const assertErrorsSafe: Exact<typeof safe, typeof errorsSafe> = true;
const assertErrorsDefined: Exact<typeof isDefinedError, typeof errorsIsDefinedError> = true;
const assertTimeoutIsTimeout: Exact<typeof isTimeoutError, typeof timeoutIsTimeoutError> = true;
const assertErrorsCMSOpError: Exact<typeof CMSOperationError, typeof errorsCMSOperationError> = true;
const assertErrorsIsCMSOpError: Exact<typeof errorsIsCMSOperationError, (error: unknown) => error is errorsCMSOperationError> = true;
void [
  assertContractOp,
  assertContractDef,
  assertErrorsSafe,
  assertErrorsDefined,
  assertTimeoutIsTimeout,
  assertErrorsCMSOpError,
  assertErrorsIsCMSOpError,
];

// 8. Type assignments to verify exported type aliases
type _T1 = CMSOperation;
type _T2 = CMSOperationCallOptions;
type _T3 = CMSOperationContract;
type _T4 = CMSOperationErrorDefinition;
type _T5 = CMSOperationErrorDefinitions;
type _T6 = InferHandlerOutput<typeof operations.ping>;
type _T7 = InferParsedOperationInput<typeof operations.ping>;
type _T8 = CMSDefinedErrorFactories<typeof operations.ping>;
type _T9 = CMSDefinedOperationError;
type _T10 = CMSOperationErrorJSON;
type _T11 = CMSSafeResult<string, CMSOperationError>;
type _T12 = CMSValidationErrorData;
type _T13 = OperationsClientOptions;
type _T14 = CreateOperationsClientOptions;
type _T15 = CMSClientTransport;
type _T16 = CMSClientTransportRequest;
type _T17 = CMSClient;
type _T18 = CMSClientOptions<typeof operations>;
type _T19 = CMSPayloadClientOptions;
type _T20 = TimeoutPluginOptions;
type _T21 = CMSOperationAccess;
type _T22 = CMSOperationAccessContext;
type _T23 = CMSOperationAccessOverrides<typeof operations>;
type _T24 = CMSOperationHandler<typeof operations.ping>;
type _T25 = CMSOperationHandlerContext<typeof operations.ping>;
type _T26 = CMSOperationHandlers<typeof operations>;
type _T27 = CMSOperationMetadata;
type _T28 = CreatePayloadEndpointsOptions<typeof operations>;
type _T29 = PayloadOperationEndpoints;

// @ts-expect-error createPayloadEndpoints without access
createPayloadEndpoints({ operations, handlers: { ping: async () => ({ reply: "" }), nested: { run: async () => true } } });

// @ts-expect-error createPayloadEndpoints without access.default
createPayloadEndpoints({ access: {}, operations, handlers: { ping: async () => ({ reply: "" }), nested: { run: async () => true } } });
