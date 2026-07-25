export const apiPackages = [
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
    entry: "../../packages/payload-fields/src/index.ts",
    sourcePath: "packages/payload-fields",
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
    entry: "../../packages/payload-schema/src/index.ts",
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
