import { config } from "@nexload-sdk/eslint-config";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    rules: {
      "@stylistic/function-call-argument-newline": "off",
      "@stylistic/function-paren-newline": "off",
      "@stylistic/array-bracket-newline": "off",
      "@stylistic/array-element-newline": "off",
      "@stylistic/object-curly-newline": "off",
      "@stylistic/implicit-arrow-linebreak": "off",
      "@stylistic/operator-linebreak": "off",
      "@stylistic/space-before-function-paren": "off",
      "@stylistic/indent-binary-ops": "off",
      "@stylistic/comma-dangle": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "import/order": "off",
    },
  },
];
