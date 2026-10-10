import type { Linter } from "eslint";

import tseslint from "typescript-eslint";

import { baseConfig } from "./base.js";
import { nextJsConfig } from "./nextjs.js";
import { nodeConfig } from "./node.js";
import { payloadConfig } from "./payload.js";
import { reactConfig } from "./react.js";

export interface NexloadConfigOptions {
  /** Include React 19 rules and jsx parser options */
  react?: boolean;
  /** Include Next.js core web vitals and next-specific rules */
  next?: boolean;
  /** Include Node.js and builtin globals */
  node?: boolean;
  /** Include Payload CMS specific adjustments */
  payload?: boolean;
  /** Custom rule overrides */
  rules?: Linter.RulesRecord;
  /** Additional global ignores */
  ignores?: string[];
  /** File pattern overrides */
  files?: string[];
}

/**
 * Universal Nexload Flat Config Factory
 * Easily compose the exact ESLint configuration needed for any package or application.
 */
export function nexloadConfig(
  options: NexloadConfigOptions = {},
  ...userConfigs: (Linter.Config | Linter.Config[])[]
): Linter.Config[] {
  const configs: Linter.Config[] = [];

  if (options.next) {
    configs.push(...nextJsConfig);
  } else if (options.react) {
    configs.push(...reactConfig);
  } else if (options.node) {
    configs.push(...nodeConfig);
  } else {
    configs.push(...baseConfig);
  }

  if (options.payload) {
    configs.push(...payloadConfig);
  }

  if (options.ignores && options.ignores.length > 0) {
    configs.push({
      name: "nexload/user-ignores",
      ignores: options.ignores,
    });
  }

  if (options.rules) {
    configs.push({
      name: "nexload/user-rules",
      rules: options.rules,
    });
  }

  for (const c of userConfigs) {
    if (Array.isArray(c)) {
      configs.push(...c);
    } else {
      configs.push(c);
    }
  }

  return tseslint.config(...configs) as Linter.Config[];
}

export default nexloadConfig;
