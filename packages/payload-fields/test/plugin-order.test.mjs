import assert from "node:assert/strict";
import test from "node:test";

import {
  moneyField,
  PAYLOAD_FIELDS_PLUGIN_ORDER,
  payloadFieldsPlugin,
} from "../dist/index.js";

test("payloadFieldsPlugin sets order 900 and slug nexload-fields", () => {
  // Arrange & Act
  const plugin = payloadFieldsPlugin();

  // Assert
  assert.equal(PAYLOAD_FIELDS_PLUGIN_ORDER, 900);
  assert.equal(plugin.order, 900);
  assert.equal(plugin.slug, "nexload-fields");
});

test("collection added by a default-order plugin listed after payloadFieldsPlugin gets money hooks", () => {
  // Arrange
  const late = (cfg) => ({
    ...cfg,
    collections: [
      ...(cfg.collections ?? []),
      {
        slug: "invoices",
        fields: [moneyField({ name: "total", currency: "IRT" })],
      },
    ],
  });

  const initialConfig = { collections: [] };
  const rawPlugins = [payloadFieldsPlugin(), late];

  // Act: emulate buildConfig plugin sorting (order ?? 0 ascending)
  const sorted = [...rawPlugins].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const finalConfig = sorted.reduce((cfg, plugin) => plugin(cfg), initialConfig);

  // Assert
  const invoices = finalConfig.collections.find((c) => c.slug === "invoices");
  assert.ok(invoices);
  const args = { data: { total: "۱۲۳٬۴۵۶" } };
  const result = invoices.hooks.beforeOperation[0]({ args, collection: invoices });
  assert.equal(result.data.total, 123456);
});
