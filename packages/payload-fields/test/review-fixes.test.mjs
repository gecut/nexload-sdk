import assert from "node:assert/strict";
import test from "node:test";

import { defineEntity } from "@nexload-sdk/payload-schema";
import { payloadFields } from "@nexload-sdk/payload-schema/payload";
import { normalizeIranMobile, validateIranMobile } from "@nexload-sdk/persian/mobile";

import { jalaliDateField, moneyField, payloadFieldsPlugin } from "../dist/index.js";
import { messages } from "../dist/i18n/messages.js";
import { createValidatedTextField } from "../dist/internal/validated-text.js";
import { schemaFields } from "../dist/schema/index.js";

const reqEn = { req: { i18n: { language: "en" } } };

test("jalali date: converts Jalali API strings to ISO in field time zone", async () => {
  const field = jalaliDateField({ name: "d" });
  const hook = field.hooks.beforeValidate.at(-1);
  assert.equal(await hook({ value: "۱۴۰۴/۰۷/۰۲" }), "2025-09-24T08:30:00.000Z");
  assert.equal(await hook({ value: "1404/07/02" }), "2025-09-24T08:30:00.000Z");
  assert.equal(await hook({ value: "1404/07/02 10:15" }), "2025-09-24T08:30:00.000Z");
  assert.equal(await hook({ value: "2025-09-24T08:30:00.000Z" }), "2025-09-24T08:30:00.000Z");
  const date = new Date();
  assert.equal(await hook({ value: date }), date);
  const timed = jalaliDateField({ name: "d", pickerAppearance: "dayAndTime" }).hooks.beforeValidate.at(-1);
  assert.equal(await timed({ value: "1404/07/02 10:15" }), "2025-09-24T06:45:00.000Z");
  const monthOnly = jalaliDateField({ name: "d", pickerAppearance: "monthOnly" }).hooks.beforeValidate.at(-1);
  assert.equal(await monthOnly({ value: "1404/07/15" }), "2025-09-23T08:30:00.000Z");
});

test("jalali date: validate rejects non-ISO non-Jalali strings and accepts Jalali strings", () => {
  const field = jalaliDateField({ name: "d" });
  assert.equal(field.validate("foo", reqEn), messages.en["date.invalid"]);
  assert.equal(field.validate("1404/13/40", reqEn), messages.en["date.invalid"]);
  assert.equal(field.validate("1404/07/02", reqEn), true);
  assert.equal(field.validate("2025-09-24T08:30:00.000Z", reqEn), true);
});

test("validated text: blank strings become null", async () => {
  const field = createValidatedTextField({ name: "phone", kind: "mobile", normalize: normalizeIranMobile, validate: validateIranMobile, messagePrefix: "mobile", unique: true });
  const hook = field.hooks.beforeValidate.at(-1);
  assert.equal(await hook({ value: "" }), null);
  assert.equal(await hook({ value: "   " }), null);
  assert.equal(await hook({ value: "+98 912 345 6789" }), "09123456789");
});

test("schemaFields.slug honours custom name and lockName", () => {
  const defs = schemaFields.slug({ name: "handle", source: "name" });
  assert.deepEqual(Object.keys(defs), ["handle", "handleLock"]);
  const entity = defineEntity({ name: "Thing", fields: { ...defs } });
  const fields = payloadFields(entity).all();
  assert.deepEqual(fields.map((f) => f.name), ["handle", "handleLock"]);
  assert.equal(fields[0].custom.nexload.slug.lockName, "handleLock");
  const custom = schemaFields.slug({ name: "handle", lockName: "locked" });
  assert.deepEqual(Object.keys(custom), ["handle", "locked"]);
  assert.deepEqual(Object.keys(schemaFields.slug()), ["slug", "slugLock"]);
});

function runBeforeOperation(config, collection, data) {
  const out = payloadFieldsPlugin()(config);
  const col = out.collections.find((c) => c.slug === collection.slug);
  const hook = col.hooks.beforeOperation.at(-1);
  return hook({ args: { data }, collection });
}

test("plugin resolves blocks referenced by slug from config.blocks", () => {
  const priceBlock = { slug: "price", fields: [moneyField({ name: "amount", currency: "IRT" })] };
  const collection = { slug: "pages", fields: [{ name: "layout", type: "blocks", blockReferences: ["price"], blocks: [] }] };
  const config = { blocks: [priceBlock], collections: [collection] };
  const result = runBeforeOperation(config, collection, { layout: [{ blockType: "price", amount: "۱۲۳٬۴۵۶" }] });
  assert.equal(result.data.layout[0].amount, 123456);
});

test("plugin normalizes on a copy and tolerates frozen input", () => {
  const money = moneyField({ name: "amount", currency: "IRT" });
  const collection = { slug: "orders", fields: [money, { name: "g", type: "group", fields: [moneyField({ name: "fee", currency: "IRT" })] }, { name: "rows", type: "array", fields: [moneyField({ name: "p", currency: "IRT" })] }] };
  const file = { name: "x.png" };
  const data = Object.freeze({
    amount: "۱۲۳٬۴۵۶",
    g: Object.freeze({ fee: "۵۰۰" }),
    rows: Object.freeze([Object.freeze({ p: "۷" }), Object.freeze({ p: 8 })]),
    file,
  });
  const result = runBeforeOperation({ collections: [collection] }, collection, data);
  assert.equal(result.data.amount, 123456);
  assert.equal(result.data.g.fee, 500);
  assert.equal(result.data.rows[0].p, 7);
  assert.equal(result.data.rows[1], data.rows[1]);
  assert.equal(result.data.file, file);
  assert.equal(data.amount, "۱۲۳٬۴۵۶");
  assert.equal(data.g.fee, "۵۰۰");
  assert.equal(data.rows[0].p, "۷");
  assert.notEqual(result.data, data);
});
