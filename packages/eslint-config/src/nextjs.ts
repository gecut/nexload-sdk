import reactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import pluginNext from "@next/eslint-plugin-next";
import { baseConfig } from "./base.js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * ESLint configuration for Next.js projects.
 * Extends the base configuration and adds React + Next.js specific rules.
 */
export const nextJsConfig = defineConfig([
  baseConfig,
  pluginReact.configs.flat,
  reactHooks.configs.flat["recommended-latest"],

  // Next.js plugin
  {
    plugins: { "@next/next": pluginNext },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },

  // Prettier overrides (must come last)
  eslintConfigPrettier,
]);

export default nextJsConfig;
