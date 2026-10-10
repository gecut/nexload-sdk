import type { Linter } from "eslint";

import tseslint from "typescript-eslint";

import { baseConfig } from "./base.js";

export const payloadConfig: Linter.Config[] = tseslint.config(
  ...baseConfig,
  {
    name: "nexload/payload",
    rules: {
      // In Payload collection/field configurations, certain dynamic schemas and properties are required
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
) as Linter.Config[];

export default payloadConfig;
