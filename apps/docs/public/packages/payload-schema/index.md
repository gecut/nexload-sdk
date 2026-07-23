# Payload Schema

Define canonical field validation once for Payload and reusable Zod schemas.

**Topic:** overview
**Package:** `@nexload-sdk/payload-schema` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/
**Package:** `@nexload-sdk/payload-schema`

**Current released version:** `1.1.0`

Canonical Payload field definitions with reusable Zod schemas.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-schema) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-schema)

`@nexload-sdk/payload-schema` 1.1.0 defines intrinsic validation and normalization once, compiles it to ordinary Payload fields, and exposes the same Zod schemas to application boundaries.

Use it for reusable data-field contracts. It does not create collections, infer CRUD schemas, model populated relationship documents, own access control or collection hooks, provide an editor, or replace Payload-generated persistence types.

## What you get

* scalar, relationship, upload, container, rich-text, and native field factories;
* a closed entity facade for Payload compilation and schema derivation;
* canonical normalization in Payload `beforeValidate`;
* structured configuration errors and safe inspection metadata.

The facade and exposed definition containers are frozen. However, nested option objects supplied by the caller are not a guaranteed immutable snapshot before compilation. Treat all factory input as write-once and do not mutate it after `defineEntity`.

## Learning path

1. [Install Payload and Zod peers](./installation/).
2. Follow the [quick start](./quick-start/).
3. Learn ownership, schema availability, and lifecycle in [concepts](./concepts/).
4. Use [guides](./guides/) for defaults, relationships, native fields, and derivation.
5. Consult [API](./api/) and [troubleshooting](./troubleshooting/).

See [source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-schema/src), [tests](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-schema/tests), and [issues](https://github.com/gecut/nexload-sdk/issues). These docs cover the current version only.
