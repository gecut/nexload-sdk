import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import stylisticPluginTs from "@stylistic/eslint-plugin";
import importPlugin from "eslint-plugin-import";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  stylisticPluginTs.configs.recommended,

  {
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2023,
        sourceType: "module",
      },
    },
  },

  ...tseslint.configs.recommended,

  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },

  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-unresolved": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "unknown",
            "type",
          ],
          "newlines-between": "always",
          warnOnUnassignedImports: true,
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  {
    plugins: {
      onlyWarn,
    },
  },

  {
    rules: {
      "@stylistic/array-bracket-newline": [
        "error",
        { minItems: 4, multiline: true },
      ],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/array-element-newline": ["error", "always"],
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/arrow-spacing": ["error"],
      "@stylistic/block-spacing": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/indent": ["error", 2],
      "@stylistic/comma-dangle": [
        "error",
        {
          arrays: "never",
          objects: "always",
          imports: "never",
          exports: "never",
          functions: "never",
          importAttributes: "never",
          dynamicImports: "never",
          enums: "never",
          generics: "never",
          tuples: "never",
        },
      ],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],
      "@stylistic/comma-style": ["error", "last"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/function-call-argument-newline": ["error", "never"],
      "@stylistic/function-call-spacing": ["error", "never"],
      "@stylistic/function-paren-newline": ["error", { minItems: 2 }],
      "@stylistic/generator-star-spacing": [
        "error",
        { before: true, after: false },
      ],
      "@stylistic/implicit-arrow-linebreak": ["error", "beside"],
      "@stylistic/no-multi-spaces": [
        "error",
        { exceptions: { Property: true } },
      ],
      "@stylistic/key-spacing": [
        "error",
        { beforeColon: false, afterColon: true },
      ],
      "@stylistic/quote-props": ["error", "as-needed"],
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/line-comment-position": "off",
      "@stylistic/lines-around-comment": "off",
      "@stylistic/lines-between-class-members": ["error", "always"],
      "@stylistic/max-len": ["error", { code: 180 }],
      "@stylistic/member-delimiter-style": "error",
      "@stylistic/newline-per-chained-call": [
        "error",
        { ignoreChainWithDepth: 2 },
      ],
      "@stylistic/no-confusing-arrow": "error",
      "@stylistic/no-extra-semi": "error",
      "@stylistic/object-curly-newline": [
        "error",
        { minProperties: 5, multiline: true },
      ],
      "@stylistic/object-curly-spacing": [
        "error",
        "always",
        { overrides: { ImportAttributes: "never" } },
      ],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", "always"],
      "@stylistic/space-in-parens": ["error", "never"],
      "@stylistic/space-infix-ops": ["error"],
      "@stylistic/space-unary-ops": ["error", { words: true, nonwords: false }],
      "@stylistic/spaced-comment": ["error", "always", { markers: ["/"] }],
      "@stylistic/switch-colon-spacing": [
        "error",
        { after: true, before: false },
      ],
      "@stylistic/template-curly-spacing": ["error", "never"],
      "@stylistic/template-tag-spacing": ["error", "never"],
      "@stylistic/type-annotation-spacing": ["error"],
      "@stylistic/type-generic-spacing": ["error"],
      "@stylistic/type-named-tuple-spacing": ["error"],
      "@stylistic/wrap-iife": ["error", "inside"],
      "@stylistic/wrap-regex": "error",
      "@stylistic/yield-star-spacing": [
        "error",
        { before: true, after: false },
      ],
      "@stylistic/jsx-child-element-spacing": "error",
      "@stylistic/jsx-closing-bracket-location": ["error", "line-aligned"],
      "@stylistic/jsx-curly-brace-presence": ["error", "never"],
      "@stylistic/jsx-curly-newline": [
        "error",
        { multiline: "consistent", singleline: "consistent" },
      ],
      "@stylistic/jsx-curly-spacing": ["error", { when: "never" }],
      "@stylistic/jsx-equals-spacing": ["error", "never"],
      "@stylistic/jsx-first-prop-new-line": ["error", "multiline"],
      "@stylistic/jsx-function-call-newline": ["error", "always"],
      "@stylistic/jsx-indent-props": ["error", 2],
      "@stylistic/jsx-max-props-per-line": ["error", { maximum: 3 }],
      "@stylistic/jsx-newline": ["error", { prevent: true }],
      "@stylistic/jsx-one-expression-per-line": ["error", { allow: "literal" }],
      "@stylistic/jsx-pascal-case": ["error"],
      "@stylistic/jsx-self-closing-comp": "error",
      "@stylistic/jsx-sort-props": [
        "error",
        { ignoreCase: false, reservedFirst: true },
      ],
      "@stylistic/jsx-tag-spacing": [
        "error",
        {
          beforeSelfClosing: "always",
          afterOpening: "never",
          beforeClosing: "never",
        },
      ],
      "@stylistic/jsx-wrap-multilines": [
        "error",
        {
          declaration: "parens-new-line",
          assignment: "parens-new-line",
          return: "parens-new-line",
        },
      ],

      "no-console": "error",
    },
  },

  {
    ignores: ["dist/**", "node_modules/**", "*.mjs", "*.js", "**/importMap.js"],
  },
];
