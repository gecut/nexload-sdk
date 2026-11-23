import { nexloadConfig } from "@nexload-sdk/eslint-config";

/** @type {import("eslint").Linter.Config[]} */
export default nexloadConfig(
  { node: true },
  {
    rules: {
      // Logger package writes directly to stdout/stderr/console
      "no-console": "off",
    },
  },
);
