import type { Linter } from "eslint";

import js from "@eslint/js";
import stylisticPlugin from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import turboPlugin from "eslint-plugin-turbo";
import unicornPlugin from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export const baseConfig: Linter.Config[] = tseslint.config(
  // 1. Global Ignores
  {
    name: "nexload/global-ignores",
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.astro/**",
      "**/build/**",
      "**/graphify-out/**",
      "**/*.d.ts",
      "**/evals/fixtures/**",
      "**/fixtures/**",
      ".agents/**",
    ],
  },

  // 2. Core JavaScript Recommended
  js.configs.recommended,

  // 3. TypeScript Recommended
  ...tseslint.configs.recommended,

  // 4. Base Language Options
  {
    name: "nexload/base-language-options",
    languageOptions: {
      globals: {
        ...globals.es2023,
      },
    },
  },

  // 5. TypeScript Project Service (applied to TypeScript source files)
  {
    name: "nexload/ts-project-service",
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
  },

  // 6. Disable type-checked rules for plain JS/MJS/CJS files
  {
    name: "nexload/js-type-checked-override",
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },

  // 7. Unicorn Plugin (Clean Code & Modern JS)
  {
    name: "nexload/unicorn",
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      // Enforce kebab-case file naming across the entire repository
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [
            "^README\\.md$",
            "^CHANGELOG\\.md$",
            "^AGENTS\\.md$",
            "^SKILL\\.md$",
            "^Dockerfile$",
            "^.*\\.d\\.ts$",
          ],
        },
      ],
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-module": "error",
      "unicorn/no-new-array": "error",
      "unicorn/throw-new-error": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/prefer-date-now": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-default-parameters": "error",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
    },
  },

  // 8. Perfectionist Plugin (Deterministic, Beautiful Imports & Exports)
  {
    name: "nexload/perfectionist",
    plugins: {
      perfectionist: perfectionistPlugin,
    },
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          ignoreCase: true,
          groups: [
            "type-import",
            "value-builtin",
            "value-external",
            "type-internal",
            "value-internal",
            ["type-parent", "type-sibling", "type-index"],
            ["value-parent", "value-sibling", "value-index"],
            "unknown",
          ],
          internalPattern: ["^@nexload-sdk/.+", "^~/.+", "^@/.+"],
          newlinesBetween: 1,
        },
      ],
      "perfectionist/sort-named-imports": [
        "error",
        {
          type: "natural",
          order: "asc",
          ignoreCase: true,
        },
      ],
      "perfectionist/sort-named-exports": [
        "error",
        {
          type: "natural",
          order: "asc",
          ignoreCase: true,
        },
      ],
      "perfectionist/sort-exports": [
        "error",
        {
          type: "natural",
          order: "asc",
          ignoreCase: true,
        },
      ],
    },
  },

  // 9. Turborepo Plugin
  {
    name: "nexload/turbo",
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },

  // 10. Stylistic Plugin (Semantic Whitespace only - does not fight Prettier)
  {
    name: "nexload/stylistic",
    plugins: {
      "@stylistic": stylisticPlugin,
    },
    rules: {
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: ["const", "let", "var"], next: "if" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "for" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "while" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "switch" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "try" },
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "directive", next: "*" },
        { blankLine: "any", prev: "directive", next: "directive" },
      ],
    },
  },

  // 11. General Nexload Invariants & Syntactic TS Rules
  {
    name: "nexload/general-rules",
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",

      // Clean Code & Safety
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // 12. Type-Aware Rules (Strictly scoped to TypeScript files with projectService)
  {
    name: "nexload/type-aware-rules",
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-condition": "warn",
    },
  },

  // 13. Prettier Compatibility (must come last to turn off conflicting formatting rules)
  eslintConfigPrettier,
) as Linter.Config[];

export default baseConfig;
