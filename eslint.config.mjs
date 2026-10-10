import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig(
  {
    node: true,
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/graphify-out/**",
      "apps/**",
      "packages/**",
      "tools/**",
      "skills/**",
      ".agents/**",
    ],
  },
  {
    files: ["scripts/**", "tests/**", "*.test.*"],
    rules: {
      "no-console": "off",
    },
  },
);
