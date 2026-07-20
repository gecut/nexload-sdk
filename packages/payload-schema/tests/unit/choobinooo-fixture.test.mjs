import assert from "node:assert/strict";
import test from "node:test";

import {
  collectionStubs,
  createProductSchema,
  productCardSchema,
} from "../fixtures/choobinooo.mjs";

test("the self-contained Choobinooo fixture compiles entities, contracts, rich text, and hooks", () => {
  assert.deepEqual(collectionStubs.map(({ slug }) => slug), ["categories", "media", "products"]);
  assert.equal(createProductSchema.safeParse({ title: "Chair", slug: "chair", basePrice: 100 }).success, true);
  assert.equal(productCardSchema.safeParse({ id: 1, title: "Chair", basePrice: 100 }).success, true);
  assert.equal(collectionStubs[0].fields[1].hooks.beforeValidate.length, 2);
});
