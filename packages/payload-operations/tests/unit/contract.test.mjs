import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { defineCMSOperations, operation } from "../../dist/contract/index.js";

test("operation rejects non-object definition", () => {
  assert.throws(
    () => operation(null),
    {
      message: "Operation definition must be an object.",
      name: "TypeError",
    }
  );
  assert.throws(
    () => operation("not-an-object"),
    {
      message: "Operation definition must be an object.",
      name: "TypeError",
    }
  );
});

test("operation rejects non-Zod input and output", () => {
  assert.throws(
    () => operation({
      input: null,
      output: z.void(),
    }),
    {
      message: "Operation input must be a Zod schema.",
      name: "TypeError",
    }
  );
  assert.throws(
    () => operation({
      input: z.void(),
      output: {},
    }),
    {
      message: "Operation output must be a Zod schema.",
      name: "TypeError",
    }
  );
});

test("operation rejects non-object error definitions", () => {
  assert.throws(
    () => operation({
      errors: "invalid",
      input: z.void(),
      output: z.void(),
    }),
    {
      message: "Operation errors must be an object.",
      name: "TypeError",
    }
  );
  assert.throws(
    () => operation({
      errors: 123,
      input: z.void(),
      output: z.void(),
    }),
    {
      message: "Operation errors must be an object.",
      name: "TypeError",
    }
  );
});

test("operation rejects invalid error codes (\"bad\", reserved segments, lower-case, etc.)", () => {
  assert.throws(
    () => operation({
      errors: {
        bad: { message: "Invalid error code", status: 400 },
      },
      input: z.void(),
      output: z.void(),
    }),
    {
      message: "Invalid operation error code: bad",
      name: "TypeError",
    }
  );

  assert.throws(
    () => operation({
      errors: {
        ["__proto__"]: { message: "Reserved code", status: 400 },
      },
      input: z.void(),
      output: z.void(),
    }),
    {
      message: "Invalid operation error code: __proto__",
      name: "TypeError",
    }
  );

  assert.throws(
    () => operation({
      errors: {
        "1ABC": { message: "Invalid start with number", status: 400 },
      },
      input: z.void(),
      output: z.void(),
    }),
    {
      message: "Invalid operation error code: 1ABC",
      name: "TypeError",
    }
  );
});

test("operation rejects status outside 400-599", () => {
  for (const status of [200, 399, 600, 400.5, "400", null, undefined]) {
    assert.throws(
      () => operation({
        errors: {
          INVALID_STATUS: { message: "Invalid status", status },
        },
        input: z.void(),
        output: z.void(),
      }),
      {
        message: "Error definition INVALID_STATUS has an invalid status.",
        name: "TypeError",
      }
    );
  }
});

test("operation rejects empty error message", () => {
  for (const message of ["", "   ", null, undefined, 123]) {
    assert.throws(
      () => operation({
        errors: {
          EMPTY_MSG: { message, status: 400 },
        },
        input: z.void(),
        output: z.void(),
      }),
      {
        message: "Error definition EMPTY_MSG must have a message.",
        name: "TypeError",
      }
    );
  }
});

test("operation rejects non-Zod error data", () => {
  for (const data of ["not-a-schema", 123, {}, { parse: () => {} }, null]) {
    assert.throws(
      () => operation({
        errors: {
          BAD_DATA: { data, message: "Bad data", status: 400 },
        },
        input: z.void(),
        output: z.void(),
      }),
      {
        message: "Error definition BAD_DATA data must be a Zod schema.",
        name: "TypeError",
      }
    );
  }
});

test("defineCMSOperations rejects invalid path segments (\"__proto__\", \"1abc\", etc.)", () => {
  const op = operation({
    input: z.void(),
    output: z.void(),
  });

  assert.throws(
    () => defineCMSOperations({
      ["__proto__"]: op,
    }),
    {
      message: "Invalid operation path segment: __proto__",
      name: "TypeError",
    }
  );

  assert.throws(
    () => defineCMSOperations({
      "1abc": op,
    }),
    {
      message: "Invalid operation path segment: 1abc",
      name: "TypeError",
    }
  );

  assert.throws(
    () => defineCMSOperations({
      users: {
        "1abc": op,
      },
    }),
    {
      message: "Invalid operation path segment: 1abc",
      name: "TypeError",
    }
  );

  assert.throws(
    () => defineCMSOperations({
      users: {
        ["prototype"]: op,
      },
    }),
    {
      message: "Invalid operation path segment: prototype",
      name: "TypeError",
    }
  );
});

test("defineCMSOperations rejects non-object or empty operations namespaces", () => {
  assert.throws(
    () => defineCMSOperations({}),
    {
      message: "Operations namespace must not be empty.",
      name: "TypeError",
    }
  );

  assert.throws(
    () => defineCMSOperations(null),
    {
      message: "Operations namespace must be an object.",
      name: "TypeError",
    }
  );

  assert.throws(
    () => defineCMSOperations({
      users: {},
    }),
    {
      message: "Operations namespace must not be empty.",
      name: "TypeError",
    }
  );
});

test("returned trees are frozen (deep freeze of tree, operations, errors, and error definitions)", () => {
  const op = operation({
    errors: {
      TEST_ERROR: {
        data: z.object({ detail: z.string() }),
        message: "Test error message",
        status: 400,
      },
    },
    input: z.void(),
    output: z.void(),
  });

  assert.equal(Object.isFrozen(op), true, "operation must be frozen");
  assert.equal(Object.isFrozen(op.errors), true, "operation.errors must be frozen");
  assert.equal(Object.isFrozen(op.errors.TEST_ERROR), true, "operation.errors[code] must be frozen");

  const tree = defineCMSOperations({
    nested: {
      action: op,
    },
    rootOp: op,
  });

  assert.equal(Object.isFrozen(tree), true, "tree root must be frozen");
  assert.equal(Object.isFrozen(tree.nested), true, "tree namespaces must be frozen");
  assert.equal(Object.isFrozen(tree.nested.action), true, "tree operations must be frozen");
  assert.equal(Object.isFrozen(tree.rootOp), true, "tree root operations must be frozen");

  assert.throws(() => {
    tree.nested.extra = 1;
  }, TypeError);

  assert.throws(() => {
    tree.newRoot = 1;
  }, TypeError);
});
