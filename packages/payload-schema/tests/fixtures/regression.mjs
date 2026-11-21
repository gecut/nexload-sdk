import assert from "node:assert/strict";

import { defineEntity, field } from "../../dist/index.js";
import { payloadFields } from "../../dist/payload/index.js";

export const postEntity = defineEntity({
  name: "Post",
  fields: {
    title: field.text({ required: true }),
    bio: field.text(),
    publishedAt: field.date(),
    meta: field.group({
      fields: {
        tag: field.text({ required: true }),
        note: field.text(),
      },
    }),
    rows: field.array({
      fields: {
        label: field.text({ required: true }),
        hint: field.text(),
      },
    }),
  },
});

export function createPostCollection() {
  return {
    slug: "posts",
    fields: payloadFields(postEntity).all(),
  };
}

export async function runRegressionCases(payload) {
  // (a) create without bio/publishedAt/meta.note, then update only title -> succeeds
  const docA = await payload.create({
    collection: "posts",
    data: {
      title: "Initial Title",
      meta: { tag: "tag-a" },
    },
  });
  assert.equal(docA.title, "Initial Title");
  assert.equal(docA.meta.tag, "tag-a");

  const updatedDocA = await payload.update({
    collection: "posts",
    id: docA.id,
    data: {
      title: "Updated Title",
    },
  });
  assert.equal(updatedDocA.title, "Updated Title");
  assert.ok(updatedDocA.bio == null);
  assert.ok(updatedDocA.publishedAt == null);
  assert.ok(updatedDocA.meta.note == null);

  // (b) set bio, then update bio: null -> succeeds and bio is null afterwards
  const withBio = await payload.update({
    collection: "posts",
    id: docA.id,
    data: {
      bio: "Author bio",
    },
  });
  assert.equal(withBio.bio, "Author bio");

  const clearedBio = await payload.update({
    collection: "posts",
    id: docA.id,
    data: {
      bio: null,
    },
  });
  assert.equal(clearedBio.bio, null);

  const reReadBio = await payload.findByID({
    collection: "posts",
    id: docA.id,
  });
  assert.equal(reReadBio.bio, null);

  // (c) a row without hint, then update title -> succeeds
  const withRow = await payload.update({
    collection: "posts",
    id: docA.id,
    data: {
      rows: [{ label: "Row 1" }],
    },
  });
  assert.equal(withRow.rows?.length, 1);
  assert.equal(withRow.rows[0].label, "Row 1");

  const updatedAfterRow = await payload.update({
    collection: "posts",
    id: docA.id,
    data: {
      title: "Title After Row",
    },
  });
  assert.equal(updatedAfterRow.title, "Title After Row");
  assert.equal(updatedAfterRow.rows?.length, 1);
  assert.equal(updatedAfterRow.rows[0].label, "Row 1");
  assert.ok(updatedAfterRow.rows[0].hint == null);

  // (d) create with title: null -> ValidationError "This field is required." at path title
  await assert.rejects(
    payload.create({
      collection: "posts",
      data: {
        title: null,
        meta: { tag: "tag-d" },
      },
    }),
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const titleError = error.data?.errors?.find((e) => e.path === "title");
      assert.ok(titleError, "expected error at path title");
      assert.equal(titleError.message, "This field is required.");
      return true;
    },
  );

  // (e) meta: { tag: 1 } -> rejected at path meta.tag
  await assert.rejects(
    payload.create({
      collection: "posts",
      data: {
        title: "Post E",
        meta: { tag: 1 },
      },
    }),
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const tagError = error.data?.errors?.find((e) => e.path === "meta.tag");
      assert.ok(tagError, "expected error at path meta.tag");
      return true;
    },
  );

  // (f) meta: { tag: "x", injected: true } saves and the re-read meta has no "injected" key
  const injectedDoc = await payload.create({
    collection: "posts",
    data: {
      title: "Post F",
      meta: { tag: "x", injected: true },
    },
  });
  assert.equal(injectedDoc.meta.tag, "x");

  const reReadF = await payload.findByID({
    collection: "posts",
    id: injectedDoc.id,
  });
  assert.equal(reReadF.meta.tag, "x");
  assert.equal("injected" in reReadF.meta, false);

  // (g) create with meta: { tag: null } rejects with ValidationError at path meta.tag
  await assert.rejects(
    payload.create({
      collection: "posts",
      data: {
        title: "Post G",
        meta: { tag: null },
      },
    }),
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const tagError = error.data?.errors?.find((e) => e.path === "meta.tag");
      assert.ok(tagError, "expected error at path meta.tag");
      assert.equal(tagError.message, "This field is required.");
      return true;
    },
  );

  // (h) create with rows: [{ label: null }] rejects with ValidationError at path rows.0.label
  await assert.rejects(
    payload.create({
      collection: "posts",
      data: {
        title: "Post H",
        meta: { tag: "tag-h" },
        rows: [{ label: null }],
      },
    }),
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const labelError = error.data?.errors?.find((e) => e.path === "rows.0.label");
      assert.ok(labelError, "expected error at path rows.0.label");
      assert.equal(labelError.message, "This field is required.");
      return true;
    },
  );

  // (i) publishedAt with valid Date stores ISO string
  const dateDoc = await payload.create({
    collection: "posts",
    data: {
      title: "Post with Date",
      meta: { tag: "tag-date" },
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    },
  });
  assert.equal(dateDoc.publishedAt, "2026-01-01T00:00:00.000Z");

  const reReadDateDoc = await payload.findByID({
    collection: "posts",
    id: dateDoc.id,
  });
  assert.equal(reReadDateDoc.publishedAt, "2026-01-01T00:00:00.000Z");

  // (j) publishedAt with new Date("nope") rejects with ValidationError at path publishedAt
  await assert.rejects(
    payload.create({
      collection: "posts",
      data: {
        title: "Post with invalid Date",
        meta: { tag: "tag-invalid-date" },
        publishedAt: new Date("nope"),
      },
    }),
    (error) => {
      assert.equal(error?.name, "ValidationError");
      const dateError = error.data?.errors?.find((e) => e.path === "publishedAt");
      assert.ok(dateError, "expected error at path publishedAt");
      assert.equal(dateError.message, "Invalid date");
      return true;
    },
  );
}
