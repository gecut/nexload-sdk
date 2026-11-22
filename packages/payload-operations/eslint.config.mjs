import { baseConfig } from "@nexload-sdk/eslint-config/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    name: "payload-operations/no-restricted-imports",
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              allowTypeImports: true,
              message: "Only src/server/** may value-import \"payload\"; other entry points must stay browser-safe. Use `import type` here.",
              name: "payload",
            },
            {
              allowTypeImports: false,
              message: "Only src/cms/** may import \"@payloadcms/sdk\".",
              name: "@payloadcms/sdk",
            },
          ],
          patterns: [
            {
              allowTypeImports: true,
              group: ["payload/*"],
              message: "Only src/server/** may value-import Payload subpaths; other entry points must stay browser-safe. Use `import type` here.",
            },
            {
              allowTypeImports: false,
              group: ["@payloadcms/sdk/*"],
              message: "Only src/cms/** may import \"@payloadcms/sdk\" subpaths.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/server/**/*.ts"],
    name: "payload-operations/server-allow-payload",
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              allowTypeImports: false,
              message: "Only src/cms/** may import \"@payloadcms/sdk\".",
              name: "@payloadcms/sdk",
            },
          ],
          patterns: [
            {
              allowTypeImports: false,
              group: ["@payloadcms/sdk/*"],
              message: "Only src/cms/** may import \"@payloadcms/sdk\" subpaths.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/cms/**/*.ts"],
    name: "payload-operations/cms-allow-sdk",
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              allowTypeImports: true,
              message: "Only src/server/** may value-import \"payload\"; other entry points must stay browser-safe. Use `import type` here.",
              name: "payload",
            },
          ],
          patterns: [
            {
              allowTypeImports: true,
              group: ["payload/*"],
              message: "Only src/server/** may value-import Payload subpaths; other entry points must stay browser-safe. Use `import type` here.",
            },
          ],
        },
      ],
    },
  },
];
