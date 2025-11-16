// eslint.config.ts
import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import { baseConfig } from "./base.js";

/**
 * Type-safe Flat Config for Next.js + React + Hooks + Prettier
 * Avoids TypeScript errors with Plugin typings
 */
export default defineConfig([
  // Base config
  baseConfig,

  reactHooks.configs.flat.recommended,

  // React & Hooks
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { react },
    rules: {
      ...react.configs.recommended.rules, // React recommended
      "react/react-in-jsx-scope": "off", // Next.js doesn’t require this
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Next.js Core Web Vitals
  next.configs["core-web-vitals"],

  eslintConfigPrettier,
]);
