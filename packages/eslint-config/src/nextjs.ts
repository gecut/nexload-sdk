import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import next from "@next/eslint-plugin-next";
import { baseConfig } from "./base.js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * ESLint configuration for Next.js projects.
 * Extends the base configuration and adds React + Next.js specific rules.
 */
export const nextJsConfig = defineConfig([
  baseConfig,
  react.configs.flat,
  reactHooks.configs.flat.recommended,

  next.configs.recommended,
  next.configs["core-web-vitals"],

  // Prettier overrides (must come last)
  eslintConfigPrettier,
]);

export default nextJsConfig;
