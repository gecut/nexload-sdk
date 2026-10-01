import assert from "node:assert/strict";
import test from "node:test";

import { IRT, formatJalaliDate, formatMoney, formatSlug, moneyField, parseMoneyToMinorUnits, payloadFieldsPlugin, slugField, withJalaliTimestamps } from "../dist/index.mjs";

test("builds every documented server subpath", async () => {
  const [slug, date, money] = await Promise.all([
    import("../dist/slug/index.mjs"),
    import("../dist/date/index.mjs"),
    import("../dist/money/index.mjs"),
  ]);

  assert.equal(typeof slug.slugField, "function");
  assert.equal(typeof date.jalaliDateField, "function");
  assert.equal(typeof money.moneyField, "function");
});

test("normalizes Unicode slugs", () => {
  assert.equal(formatSlug("  كِتاب_جدید 😀 ۱۲ "), "کتاب-جدید-12");
});

test("parses exact Persian money", () => {
  assert.equal(parseMoneyToMinorUnits("۱۲۳٬۴۵۶", IRT), 123456);
  assert.equal(formatMoney(123456, IRT), "۱۲۳٬۴۵۶ تومان");
});

test("keeps money server contract integer-only", () => {
  const field = moneyField({ name: "price", currency: "IRT" });
  assert.equal(field.validate?.(12.5, { required: false }), "مبلغ باید یک عدد صحیح معتبر باشد.");
});

test("enforces money bounds and negative policy", () => {
  const field = moneyField({
    name: "price",
    currency: "IRT",
    minMinorUnits: 100,
    maxMinorUnits: 1_000,
  });

  assert.equal(field.validate?.(-1, { required: false }), "مبلغ منفی مجاز نیست.");
  assert.equal(field.validate?.(99, { required: false }), "مبلغ کمتر از حد مجاز است.");
  assert.equal(field.validate?.(1_001, { required: false }), "مبلغ بیشتر از حد مجاز است.");
  assert.equal(field.validate?.(100, { required: false }), true);
  assert.throws(() => moneyField({ name: "price", currency: "IRT", minMinorUnits: 2, maxMinorUnits: 1 }));
});

test("builds localized lock and collision-safe timestamps", () => {
  const [, lock] = slugField({ overrides: { slug: { localized: true } } });
  assert.equal(lock.localized, true);
  assert.throws(() => withJalaliTimestamps([{ name: "createdAtJalali", type: "text" }]));
});

test("formats invalid Jalali date as null", () => {
  assert.equal(formatJalaliDate("invalid"), null);
});

test("regenerates locked slugs when the source changes", async () => {
  const [field] = slugField();
  const hook = field.hooks?.beforeValidate?.at(-1);

  assert.equal(await hook?.({
    data: { title: "عنوان جدید", slugLock: true },
    operation: "update",
    originalDoc: { title: "عنوان قبلی", slug: "عنوان-قبلی" },
    previousSiblingDoc: { slug: "عنوان-قبلی" },
    siblingData: { slugLock: true },
    value: "عنوان-قبلی",
  }), "عنوان-جدید");

  assert.equal(await hook?.({
    data: { title: "", slugLock: true },
    operation: "update",
    originalDoc: { title: "عنوان قبلی", slug: "عنوان-قبلی" },
    previousSiblingDoc: { slug: "عنوان-قبلی" },
    siblingData: { slugLock: true },
    value: "عنوان-قبلی",
  }), "عنوان-قبلی");

  assert.equal(await hook?.({
    data: { title: null, slugLock: true },
    operation: "update",
    originalDoc: { title: "عنوان قبلی", slug: "اسلاگ-سفارشی" },
    previousSiblingDoc: { slug: "اسلاگ-سفارشی" },
    siblingData: { slugLock: true },
    value: "اسلاگ-سفارشی",
  }), "اسلاگ-سفارشی");
});

test("protects slug generation with auth and access checks", async () => {
  const plugin = payloadFieldsPlugin({
    generateSlugAccess: ({ req }) => req.user?.role === "editor",
    slugGenerators: {
      ai: async ({ sourceValue }) => `${sourceValue} ویژه`,
    },
  });
  const endpoint = plugin({}).endpoints?.at(-1);

  const unauthenticated = await endpoint.handler({ user: null });
  assert.equal(unauthenticated.status, 401);

  const forbidden = await endpoint.handler({
    user: { role: "viewer" },
    json: async () => ({ generator: "ai", sourceValue: "محصول" }),
  });
  assert.equal(forbidden.status, 403);

  const allowed = await endpoint.handler({
    user: { role: "editor" },
    json: async () => ({ generator: "ai", sourceValue: "محصول" }),
  });
  assert.equal(allowed.status, 200);
  assert.deepEqual(await allowed.json(), { slug: "محصول-ویژه" });
});

test("rejects invalid and inherited slug generator input", async () => {
  const plugin = payloadFieldsPlugin({ slugGenerators: {} });
  const endpoint = plugin({}).endpoints?.at(-1);

  const nullBody = await endpoint.handler({
    user: { role: "editor" },
    json: async () => null,
  });
  assert.equal(nullBody.status, 400);

  const inherited = await endpoint.handler({
    user: { role: "editor" },
    json: async () => ({ generator: "toString", sourceValue: "محصول" }),
  });
  assert.equal(inherited.status, 404);
});
