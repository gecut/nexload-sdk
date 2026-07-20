import assert from "node:assert/strict";
import test from "node:test";

import { PayloadSchemaError, defineEntity, field, isPayloadSchemaError } from "../../dist/index.js";

test("static defaults are canonicalized for Payload without changing consumer schema", () => {
  const definition = field.text({ trim: true, lowercase: true, defaultValue: " READY " });
  const entity = defineEntity({ name: "Defaults", fields: { state: definition } });

  assert.equal(entity.payload.field("state").defaultValue, "ready");
  assert.equal(definition.schema.safeParse(undefined).success, false);
});

test("dynamic defaults are forwarded opaquely and schema-less native fields allow them", () => {
  const dynamicDefaultValue = ({ req }) => req ? "generated" : "unreachable";
  const entity = defineEntity({
    name: "DynamicDefaults",
    fields: {
      generated: field.text({ dynamicDefaultValue }),
      raw: field.native({ payload: { type: "json" }, dynamicDefaultValue }),
    },
  });

  assert.equal(entity.payload.field("generated").defaultValue, dynamicDefaultValue);
  assert.equal(entity.payload.field("raw").defaultValue, dynamicDefaultValue);
});

test("default invariants fail at entity definition with safe structured data", () => {
  assert.throws(
    () => defineEntity({
      name: "Conflicting",
      fields: { publishedAt: field.date({ defaultValue: "2026-07-20T12:30:00Z", dynamicDefaultValue: () => "x" }) },
    }),
    (error) => {
      assert.equal(isPayloadSchemaError(error, "CONFLICTING_DEFAULT_CONFIGURATION"), true);
      assert.deepEqual(error.data, {
        entity: "Conflicting",
        fieldPath: "publishedAt",
        fieldType: "date",
        configuredDefaults: ["defaultValue", "dynamicDefaultValue"],
      });
      return true;
    },
  );

  assert.throws(
    () => defineEntity({ name: "Invalid", fields: { count: field.number({ defaultValue: Infinity }) } }),
    (error) => isPayloadSchemaError(error, "INVALID_DEFAULT_VALUE"),
  );
  assert.throws(
    () => defineEntity({ name: "NoSchema", fields: { raw: field.native({ payload: { type: "json" }, defaultValue: {} }) } }),
    (error) => isPayloadSchemaError(error, "INVALID_FIELD_CONFIGURATION"),
  );
});

test("payload.defaultValue is reserved and errors do not serialize causes or stacks", () => {
  assert.throws(
    () => defineEntity({ name: "Reserved", fields: { title: field.text({ payload: { defaultValue: "x" } }) } }),
    (error) => isPayloadSchemaError(error, "RESERVED_PAYLOAD_OPTION") && error.data.option === "defaultValue",
  );

  const error = new PayloadSchemaError("INVALID_ENTITY_NAME", {
    phase: "definition",
    message: "invalid",
    data: { received: "" },
    cause: new Error("secret"),
  });
  assert.deepEqual(error.toJSON(), {
    name: "PayloadSchemaError",
    code: "INVALID_ENTITY_NAME",
    phase: "definition",
    message: "invalid",
    data: { received: "" },
  });
  assert.equal(JSON.stringify(error).includes("secret"), false);
});
