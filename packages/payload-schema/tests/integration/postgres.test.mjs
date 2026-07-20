import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { getPayload } from "payload";
import { generateTypes } from "payload/node";

import { createFixtureConfig } from "../fixtures/config.mjs";

const databaseURL = process.env.PAYLOAD_SCHEMA_POSTGRES_URL;

test("Postgres boots, generates types, and persists IDs and relationships", { skip: !databaseURL }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "payload-schema-postgres-"));
  const generatedTypesPath = path.join(directory, "payload-types.ts");
  const schemaName = `payload_schema_${Date.now()}`;
  const config = await createFixtureConfig({
    databaseAdapter: postgresAdapter({ pool: { connectionString: databaseURL }, schemaName }),
    generatedTypesPath,
    uploadDirectory: path.join(directory, "media"),
  });
  const payload = await getPayload({ key: schemaName, config });

  try {
    await generateTypes(config, { log: false });
    assert.match(await readFile(generatedTypesPath, "utf8"), /category\?: \(number \| null\) \| Category/u);

    const category = await payload.create({ collection: "categories", data: { title: "Hardware" } });
    const media = await payload.create({
      collection: "media",
      data: { alt: "Cover" },
      file: {
        data: Buffer.from("payload-schema"),
        mimetype: "text/plain",
        name: "cover.txt",
        size: 14,
      },
    });
    const product = await payload.create({
      collection: "products",
      data: { title: "Drill", slug: "Drill", category: category.id, cover: media.id, gallery: [{ alt: "Main" }] },
    });
    assert.equal(typeof product.id, "number");
    assert.equal(typeof category.id, "number");
    assert.equal(product.slug, "drill");
    assert.equal(typeof media.id, "number");
  } finally {
    await payload.destroy();
    await rm(directory, { force: true, recursive: true });
  }
});
