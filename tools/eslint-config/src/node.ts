import type { Linter } from "eslint";

import globals from "globals";
import tseslint from "typescript-eslint";

import { baseConfig } from "./base.js";

export const nodeConfig: Linter.Config[] = tseslint.config(
  ...baseConfig,
  {
    name: "nexload/node",
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.builtin,
      },
    },
  },
) as Linter.Config[];

export default nodeConfig;
