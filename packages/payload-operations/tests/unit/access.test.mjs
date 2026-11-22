import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import { createPayloadEndpoints } from "../../dist/server/index.js";

function createFakeRequest({
  body = {},
  headers = {},
  user = null,
} = {}) {
  const reqHeaders = new Headers({
    "content-type": "application/json",
    ...headers,
  });

  return {
    headers: reqHeaders,
    payload: {
      config: {},
    },
    text: async () => JSON.stringify(body),
    user,
  };
}

const operations = defineCMSOperations({
  greet: operation({
    input: z.object({ name: z.string() }),
    output: z.object({ message: z.string() }),
  }),
  restricted: operation({
    input: z.object({ value: z.number() }),
    output: z.object({ doubled: z.number() }),
  }),
});

test("createPayloadEndpoints throws TypeError when access is missing", () => {
  assert.throws(
    () => createPayloadEndpoints({
      handlers: {
        greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
        restricted: async ({ input }) => ({ doubled: input.value * 2 }),
      },
      operations,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: null,
      handlers: {
        greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
        restricted: async ({ input }) => ({ doubled: input.value * 2 }),
      },
      operations,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );
});

test("createPayloadEndpoints throws TypeError when access.default is not a function", () => {
  assert.throws(
    () => createPayloadEndpoints({
      access: {},
      handlers: {
        greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
        restricted: async ({ input }) => ({ doubled: input.value * 2 }),
      },
      operations,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: { default: null },
      handlers: {
        greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
        restricted: async ({ input }) => ({ doubled: input.value * 2 }),
      },
      operations,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: { default: "not-a-function" },
      handlers: {
        greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
        restricted: async ({ input }) => ({ doubled: input.value * 2 }),
      },
      operations,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: { default: 42 },
      handlers: {
        greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
        restricted: async ({ input }) => ({ doubled: input.value * 2 }),
      },
      operations,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );
});

test("createPayloadEndpoints throws TypeError at call time before building endpoints", () => {
  assert.throws(
    () => createPayloadEndpoints({
      access: undefined,
      handlers: null,
      operations: null,
    }),
    {
      message: "createPayloadEndpoints requires access.default.",
      name: "TypeError",
    }
  );
});

test("access returning false with no req.user returns HTTP 401 UNAUTHORIZED and does not call handler", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => false,
    },
    handlers: {
      greet: async ({ input }) => {
        handlerCalled = true;
        return { message: `Hello ${input.name}` };
      },
      restricted: async ({ input }) => ({ doubled: input.value * 2 }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    body: { name: "Alice" },
    user: null,
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal(data.code, "UNAUTHORIZED");
  assert.equal(data.status, 401);
  assert.equal(handlerCalled, false);
});

test("access returning false with req.user returns HTTP 403 FORBIDDEN and does not call handler", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => false,
    },
    handlers: {
      greet: async ({ input }) => {
        handlerCalled = true;
        return { message: `Hello ${input.name}` };
      },
      restricted: async ({ input }) => ({ doubled: input.value * 2 }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    body: { name: "Alice" },
    user: { id: "user-123" },
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 403);
  const data = await response.json();
  assert.equal(data.code, "FORBIDDEN");
  assert.equal(data.status, 403);
  assert.equal(handlerCalled, false);
});

test("access returning true allows operation, calls handler, and returns HTTP 200", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async ({ input }) => {
        handlerCalled = true;
        return { message: `Hello ${input.name}` };
      },
      restricted: async ({ input }) => ({ doubled: input.value * 2 }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    body: { name: "Alice" },
    user: null,
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data, { message: "Hello Alice" });
  assert.equal(handlerCalled, true);
});

test("per-operation override wins over default: override allows when default denies", async () => {
  let greetCalled = false;
  let restrictedCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => false,
      overrides: {
        greet: () => true,
      },
    },
    handlers: {
      greet: async ({ input }) => {
        greetCalled = true;
        return { message: `Hello ${input.name}` };
      },
      restricted: async ({ input }) => {
        restrictedCalled = true;
        return { doubled: input.value * 2 };
      },
    },
    operations,
  });

  const greetPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  const restrictedPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/restricted"
  );
  assert.ok(greetPost);
  assert.ok(restrictedPost);

  // greet has override returning true -> allowed
  const greetReq = createFakeRequest({
    body: { name: "Bob" },
    user: null,
  });
  const greetRes = await greetPost.handler(greetReq);
  assert.equal(greetRes.status, 200);
  assert.deepEqual(await greetRes.json(), { message: "Hello Bob" });
  assert.equal(greetCalled, true);

  // restricted uses default returning false -> denied (401 without user)
  const restrictedReq = createFakeRequest({
    body: { value: 5 },
    user: null,
  });
  const restrictedRes = await restrictedPost.handler(restrictedReq);
  assert.equal(restrictedRes.status, 401);
  const restrictedData = await restrictedRes.json();
  assert.equal(restrictedData.code, "UNAUTHORIZED");
  assert.equal(restrictedCalled, false);
});

test("per-operation override wins over default: override denies when default allows", async () => {
  let greetCalled = false;
  let restrictedCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
      overrides: {
        restricted: () => false,
      },
    },
    handlers: {
      greet: async ({ input }) => {
        greetCalled = true;
        return { message: `Hello ${input.name}` };
      },
      restricted: async ({ input }) => {
        restrictedCalled = true;
        return { doubled: input.value * 2 };
      },
    },
    operations,
  });

  const greetPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  const restrictedPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/restricted"
  );
  assert.ok(greetPost);
  assert.ok(restrictedPost);

  // greet uses default returning true -> allowed
  const greetReq = createFakeRequest({
    body: { name: "Charlie" },
    user: null,
  });
  const greetRes = await greetPost.handler(greetReq);
  assert.equal(greetRes.status, 200);
  assert.deepEqual(await greetRes.json(), { message: "Hello Charlie" });
  assert.equal(greetCalled, true);

  // restricted has override returning false -> denied (401 with no user)
  const reqNoUser = createFakeRequest({
    body: { value: 10 },
    user: null,
  });
  const resNoUser = await restrictedPost.handler(reqNoUser);
  assert.equal(resNoUser.status, 401);
  assert.equal((await resNoUser.json()).code, "UNAUTHORIZED");
  assert.equal(restrictedCalled, false);

  // restricted has override returning false -> denied (403 with user)
  const reqWithUser = createFakeRequest({
    body: { value: 10 },
    user: { id: "user-456" },
  });
  const resWithUser = await restrictedPost.handler(reqWithUser);
  assert.equal(resWithUser.status, 403);
  assert.equal((await resWithUser.json()).code, "FORBIDDEN");
  assert.equal(restrictedCalled, false);
});

test("async access functions returning Promise<boolean> are supported", async () => {
  let handlerCalled = false;
  let restrictedCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return true;
      },
      overrides: {
        restricted: async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return false;
        },
      },
    },
    handlers: {
      greet: async ({ input }) => {
        handlerCalled = true;
        return { message: `Async ${input.name}` };
      },
      restricted: async ({ input }) => {
        restrictedCalled = true;
        return { doubled: input.value * 2 };
      },
    },
    operations,
  });

  const greetPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  const restrictedPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/restricted"
  );

  const greetRes = await greetPost.handler(createFakeRequest({
    body: { name: "Dave" },
  }));
  assert.equal(greetRes.status, 200);
  assert.deepEqual(await greetRes.json(), { message: "Async Dave" });
  assert.equal(handlerCalled, true);

  const restrictedRes = await restrictedPost.handler(createFakeRequest({
    body: { value: 3 },
    user: { id: "u1" },
  }));
  assert.equal(restrictedRes.status, 403);
  assert.equal(restrictedCalled, false);
});

test("access receives context with operation metadata and req", async () => {
  let observedContext = null;

  const endpoints = createPayloadEndpoints({
    access: {
      default: (context) => {
        observedContext = context;
        return true;
      },
    },
    handlers: {
      greet: async ({ input }) => ({ message: `Hello ${input.name}` }),
      restricted: async ({ input }) => ({ doubled: input.value * 2 }),
    },
    operations,
  });

  const greetPost = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  const req = createFakeRequest({
    body: { name: "Eve" },
    user: { id: "eve-1" },
  });

  await greetPost.handler(req);

  assert.ok(observedContext);
  assert.equal(observedContext.operation.name, "greet");
  assert.equal(observedContext.operation.path, "/operations/greet");
  assert.equal(observedContext.operation.definition, operations.greet);
  assert.equal(observedContext.req, req);
});
