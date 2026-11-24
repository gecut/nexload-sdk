export const apiPackages = [
  {
    id: "logger",
    name: "@nexload-sdk/logger",
    entries: [
      {
        exportPath: "@nexload-sdk/logger",
        entry: "../../packages/logger/src/index.ts",
      },
      {
        exportPath: "@nexload-sdk/logger/testing",
        entry: "../../packages/logger/src/testing.ts",
      },
    ],
    sourcePath: "packages/logger",
  },
  {
    id: "persian", name: "@nexload-sdk/persian",
    entries: [
      { exportPath: "@nexload-sdk/persian", entry: "../../packages/persian/src/index.ts" },
      { exportPath: "@nexload-sdk/persian/digits", entry: "../../packages/persian/src/digits/index.ts" },
      { exportPath: "@nexload-sdk/persian/text", entry: "../../packages/persian/src/text/index.ts" },
      { exportPath: "@nexload-sdk/persian/mobile", entry: "../../packages/persian/src/mobile/index.ts" },
      { exportPath: "@nexload-sdk/persian/identity", entry: "../../packages/persian/src/identity/index.ts" },
      { exportPath: "@nexload-sdk/persian/bank", entry: "../../packages/persian/src/bank/index.ts" },
      { exportPath: "@nexload-sdk/persian/money", entry: "../../packages/persian/src/money/index.ts" },
      { exportPath: "@nexload-sdk/persian/date", entry: "../../packages/persian/src/date/index.ts" },
      { exportPath: "@nexload-sdk/persian/relative", entry: "../../packages/persian/src/relative/index.ts" },
      { exportPath: "@nexload-sdk/persian/geo", entry: "../../packages/persian/src/geo/index.ts" },
      { exportPath: "@nexload-sdk/persian/zod", entry: "../../packages/persian/src/zod/index.ts" },
    ],
    sourcePath: "packages/persian",
  },
  {
    id: "healthcheck",
    name: "@nexload-sdk/healthcheck",
    entry: "../../packages/healthcheck/core/src/index.ts",
    sourcePath: "packages/healthcheck/core",
  },
  {
    id: "healthcheck-node",
    name: "@nexload-sdk/healthcheck-node",
    entry: "../../packages/healthcheck/node/src/index.ts",
    sourcePath: "packages/healthcheck/node",
  },
  {
    id: "healthcheck-bun",
    name: "@nexload-sdk/healthcheck-bun",
    entry: "../../packages/healthcheck/bun/src/index.ts",
    sourcePath: "packages/healthcheck/bun",
  },
  {
    id: "healthcheck-next",
    name: "@nexload-sdk/healthcheck-next",
    entry: "../../packages/healthcheck/next/src/index.ts",
    sourcePath: "packages/healthcheck/next",
  },
  {
    id: "healthcheck-prometheus",
    name: "@nexload-sdk/healthcheck-prometheus",
    entry: "../../packages/healthcheck/prometheus/src/index.ts",
    sourcePath: "packages/healthcheck/prometheus",
  },
  {
    id: "healthcheck-otel",
    name: "@nexload-sdk/healthcheck-otel",
    entry: "../../packages/healthcheck/otel/src/index.ts",
    sourcePath: "packages/healthcheck/otel",
  },
  {
    id: "healthcheck-payload",
    name: "@nexload-sdk/healthcheck-payload",
    entry: "../../packages/healthcheck/payload/src/index.ts",
    sourcePath: "packages/healthcheck/payload",
  },
  {
    id: "payload-fields",
    name: "@nexload-sdk/payload-fields",
    entries: [
      {
        exportPath: "@nexload-sdk/payload-fields",
        entry: "../../packages/payload-fields/src/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-fields/slug",
        entry: "../../packages/payload-fields/src/slug/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-fields/date",
        entry: "../../packages/payload-fields/src/date/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-fields/money",
        entry: "../../packages/payload-fields/src/money/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-fields/schema",
        entry: "../../packages/payload-fields/src/schema/index.ts",
      },
    ],
    sourcePath: "packages/payload-fields",
  },
  {
    id: "payload-hooks",
    name: "@nexload-sdk/payload-hooks",
    entry: "../../packages/payload-hooks/src/index.ts",
    sourcePath: "packages/payload-hooks",
  },
  {
    id: "payload-preset",
    name: "@nexload-sdk/payload-preset",
    entry: "../../packages/payload-preset/src/index.ts",
    sourcePath: "packages/payload-preset",
  },
  {
    id: "payload-editor",
    name: "@nexload-sdk/payload-editor",
    entry: "../../packages/payload-editor/src/index.ts",
    sourcePath: "packages/payload-editor",
  },
  {
    id: "payload-schema",
    name: "@nexload-sdk/payload-schema",
    entries: [
      {
        exportPath: "@nexload-sdk/payload-schema",
        entry: "../../packages/payload-schema/src/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-schema/payload",
        entry: "../../packages/payload-schema/src/payload/index.ts",
      },
    ],
    sourcePath: "packages/payload-schema",
  },
  {
    id: "payload-operations",
    name: "@nexload-sdk/payload-operations",
    entries: [
      {
        exportPath: "@nexload-sdk/payload-operations",
        entry: "../../packages/payload-operations/src/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-operations/contract",
        entry: "../../packages/payload-operations/src/contract/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-operations/client",
        entry: "../../packages/payload-operations/src/client/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-operations/cms",
        entry: "../../packages/payload-operations/src/cms/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-operations/errors",
        entry: "../../packages/payload-operations/src/errors/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-operations/plugins/timeout",
        entry: "../../packages/payload-operations/src/plugins/timeout/index.ts",
      },
      {
        exportPath: "@nexload-sdk/payload-operations/server",
        entry: "../../packages/payload-operations/src/server/index.ts",
      },
    ],
    sourcePath: "packages/payload-operations",
  },
];
