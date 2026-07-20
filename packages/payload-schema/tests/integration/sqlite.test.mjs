import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { generateTypes } from "payload/node";
import { getPayload } from "payload";

import { createFixtureConfig } from "../fixtures/config.mjs";

test("SQLite boots, generates types, and persists canonical normalized data", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "payload-schema-sqlite-"));
  const generatedTypesPath = path.join(directory, "payload-types.ts");
  const config = await createFixtureConfig({
    databaseAdapter: sqliteAdapter({ client: { url: `file:${path.join(directory, "db.sqlite")}` } }),
    generatedTypesPath,
    uploadDirectory: path.join(directory, "media"),
  });
  const payload = await getPayload({ key: `payload-schema-${Date.now()}`, config });

  try {
    await generateTypes(config, { log: false });
    assert.match(await readFile(generatedTypesPath, "utf8"), /export interface Product/u);

    const category = await payload.create({ collection: "categories", data: { title: "  Hardware  " } });
    const product = await payload.create({
      collection: "products",
      data: {
        title: "  Drill  ",
        slug: "  Cordless__Drill  ",
        category: category.id,
        gallery: [{ alt: "  Main image  " }],
      },
    });

    assert.equal(product.title, "Drill");
    assert.equal(product.slug, "cordless-drill");
    assert.equal(product.inventory, 0);
    assert.equal(product.gallery[0].alt, "Main image");
    assert.ok(product.gallery[0].id);

    await assert.rejects(
      payload.update({ collection: "products", id: product.id, data: { gallery: [{ alt: "x" }] } }),
      (error) => error?.name === "ValidationError",
    );
  } finally {
    await payload.destroy();
    await rm(directory, { force: true, recursive: true });
  }
});
