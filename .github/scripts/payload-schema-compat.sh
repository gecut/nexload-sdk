#!/usr/bin/env bash
set -euo pipefail

pnpm -C packages/payload-schema add --save-dev --lockfile=false \
  "payload@${PAYLOAD_VERSION}" \
  "zod@${ZOD_VERSION}" \
  "@payloadcms/db-postgres@${PAYLOAD_VERSION}" \
  "@payloadcms/db-sqlite@${PAYLOAD_VERSION}" \
  "@payloadcms/next@${PAYLOAD_VERSION}" \
  "@payloadcms/richtext-lexical@${PAYLOAD_VERSION}"

pnpm -C packages/payload-schema lint
pnpm -C packages/payload-schema test
timeout 30s pnpm -C packages/payload-schema test:types
pnpm -C packages/payload-schema test:sqlite
pnpm -C packages/payload-schema test:postgres
pnpm -C packages/payload-schema build
node packages/payload-schema/tests/consumer-smoke.mjs "${PAYLOAD_VERSION}" "${ZOD_VERSION}"

if [[ "${RUN_META_CHECKS:-false}" == "true" ]]; then
  pnpm skills:payload-schema:validate
  pnpm --filter docs build
fi
