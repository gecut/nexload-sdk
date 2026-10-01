import { config } from "@nexload-sdk/eslint-config";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    rules: {
      "no-console": "off",
      "@stylistic/function-call-argument-newline": "off",
      "@stylistic/function-paren-newline": "off",
      "@stylistic/array-bracket-newline": "off",
      "@stylistic/array-element-newline": "off",
      "@stylistic/object-curly-newline": "off",
      "@stylistic/implicit-arrow-linebreak": "off",
      "@stylistic/operator-linebreak": "off",
      "@stylistic/space-before-function-paren": "off",
      "@stylistic/comma-dangle": "off",
      "@stylistic/lines-between-class-members": "off",
      "@stylistic/newline-per-chained-call": "off",
      "@stylistic/member-delimiter-style": "off",
      "@stylistic/quotes": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/order": "off",
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
