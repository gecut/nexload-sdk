# Configuration Guides & Recipes

Type-aware linting with projectService, customizing factory rules, and migrating from legacy .eslintrc.

**Topic:** guides
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/eslint-config/guides/
## Type-Aware Linting with `projectService`

`@nexload-sdk/eslint-config` uses `typescript-eslint` v8's `projectService: true` instead of static `project: "./tsconfig.json"` arrays.

### Benefits of `projectService`

* **Dynamic Project Discovery**: Resolves `tsconfig.json` contexts automatically per file without parsing slow monolithic solution files.
* **Standalone Script Safety**: Standalone configuration scripts (`eslint.config.mjs`, `esbuild.config.mjs`) are automatically parsed without triggering type-information crashes.
* **Zero Configuration Boilerplate**: No need to maintain manual tsconfig path lists in your lint config.

```js title="eslint.config.mjs"
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  typeAware: true, // Enables full type-checked rules
});
```

***

## Customizing Rules with `nexloadConfig`

The `nexloadConfig` factory accepts custom rules, extra flat configs, and custom ignore patterns:

```js title="eslint.config.mjs"
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  framework: "next",
  ignores: [
    "dist/**",
    ".next/**",
    "public/static/**",
  ],
  rules: {
    // Override or add project-specific rules safely
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  extraConfigs: [
    {
      files: ["scripts/**/*.mjs"],
      rules: {
        "no-console": "off",
      },
    },
  ],
});
```

***

## Prettier Integration & Zero Conflicts

Many teams experience conflicts between ESLint stylistic rules and Prettier. `@nexload-sdk/eslint-config` handles this deterministically:

1. **Semantic Padding Preserved**: `@stylistic/padding-line-between-statements` handles logical separation lines between statements and returns.
2. **Prettier Conflict Termination**: `eslint-config-prettier` is applied as the final configuration object in the flat config chain. It turns off all formatting rules that might fight Prettier (quotes, semicolons, indentations).
3. **Format Separation**: Use Prettier for syntax formatting (`prettier --write .`) and ESLint for structural, semantic, and type rules (`eslint --fix .`).

***

## Migrating from Legacy `.eslintrc.js`

To migrate a repository from ESLint 8 (`.eslintrc.*`) to `@nexload-sdk/eslint-config`:

### Step 1: Remove Deprecated Dependencies

```bash
pnpm remove eslint-plugin-import eslint-plugin-only-warn @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Step 2: Delete Old Config & Ignore Files

Remove legacy files from the repository root:

* `.eslintrc.js`, `.eslintrc.json`, or `.eslintrc.yml`
* `.eslintignore` (migrated to `ignores` in flat config)

### Step 3: Create `eslint.config.mjs`

```js title="eslint.config.mjs"
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  framework: "node", // Select: "node", "react", "next", or "payload"
});
```

### Step 4: Update Package Scripts

ESLint 9 Flat Config lints JavaScript and TypeScript by default. Remove deprecated `--ext` flags from `package.json`:

```json title="package.json"
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  }
}
```

### Step 5: Run Automated Fixes

```bash
pnpm lint:fix
```

This automatically sorts imports according to perfectionist groupings, normalizes statement spacing, and surfaces any remaining strictness errors.
