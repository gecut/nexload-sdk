import type { Linter } from "eslint";

import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

import { reactConfig } from "./react.js";

export const nextJsConfig: Linter.Config[] = tseslint.config(
  ...reactConfig,
  {
    name: "nexload/nextjs",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  eslintConfigPrettier,
) as Linter.Config[];

export default nextJsConfig;
