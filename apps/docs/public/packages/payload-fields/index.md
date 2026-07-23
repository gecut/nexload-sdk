# Payload Fields

Semantic Payload field factories for Unicode slugs, Jalali dates, and integer money values.

**Topic:** overview
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/
**Package:** `@nexload-sdk/payload-fields`

**Current released version:** `3.1.0`

Production-grade semantic field factories and Admin integrations for Payload CMS.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-fields) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-fields)

`@nexload-sdk/payload-fields` 3.1.0 supplies three opinionated field families for Payload 3: managed Unicode slugs, ISO dates with Jalali Admin presentation, and safe-integer money values. Use it when these persistence and Admin contracts match your product. Use native Payload fields when they do not.

## What it owns

* Field factories, server validation, normalization, and package Admin components.
* Stable persistence shapes: slugs are strings, dates remain Payload ISO date values, and money is stored as integer minor units.
* An optional authenticated endpoint for project-owned slug generators.

It does not create collections, define access control, choose currencies for your domain, or replace `@nexload-sdk/payload-editor`. The editor package exists separately and can be installed alongside this package.

## Choose a path

1. [Install the package](./installation/) and its matched Payload/React peers.
2. Follow the [quick start](./quick-start/) for one collection.
3. Read [concepts](./concepts/) before changing storage or localization.
4. Use [guides](./guides/) for slugs, Jalali dates, money, and the plugin endpoint.
5. Consult the [API](./api/) and [troubleshooting](./troubleshooting/) pages while integrating.

The package runs in Payload server/config code. Its exported Admin component subpaths are consumed through Payload's Import Map; do not import those React components into ordinary application code.

## Source of truth

* [Package source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-fields/src)
* [Tests](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-fields/test)
* [Package manifest](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/package.json)
* [Report an issue](https://github.com/gecut/nexload-sdk/issues)

These docs describe the current package version only. Check the package changelog or release history before upgrading across a major version.
