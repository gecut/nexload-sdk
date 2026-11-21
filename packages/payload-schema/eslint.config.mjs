import { baseConfig } from "@nexload-sdk/eslint-config/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    name: "payload-schema/payload-entry-boundary",
    files: ["src/**/*.ts"],
    ignores: ["src/payload/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "payload",
              message: "Only src/payload/** may value-import \"payload\"; the package root must stay browser-safe. Use `import type` here.",
              allowTypeImports: true,
            },
          ],
          patterns: [
            {
              group: ["payload/*"],
              message: "Only src/payload/** may value-import Payload subpaths; the package root must stay browser-safe. Use `import type` here.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
];
