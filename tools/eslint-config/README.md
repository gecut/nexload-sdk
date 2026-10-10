# @nexload-sdk/eslint-config

Authoritative, modern ESLint 9 Flat Configurations for the Nexload SDK monorepo and ecosystem.

## Features

- **ESLint 9 Flat Config Native**: Full support for ESLint 9 and modern flat config composition.
- **`projectService` Integration**: Type-aware linting powered by `typescript-eslint` v8 without fragile manual `tsconfig.json` paths.
- **Enforced Kebab-Case**: Complete repository file naming enforcement via `eslint-plugin-unicorn`.
- **Deterministic Imports**: Automated, natural alphabetical import/export grouping with zero resolver lag via `eslint-plugin-perfectionist`.
- **Type Boundaries**: Strict zero-`any` policy and inline `import type` enforcement (`@typescript-eslint/consistent-type-imports`).
- **Semantic Spacing**: Intentional line padding between statement phases (`@stylistic/padding-line-between-statements`) without fighting Prettier.
- **Zero Prettier Conflicts**: Prettier compatibility (`eslint-config-prettier`) cleanly terminates every preset.
- **Modular Presets & Factory**: Tailored configs for Base, Node, React 19, Next.js, and Payload CMS.

## Usage

### 1. Using the Universal Factory (Recommended)

In `eslint.config.mjs`:

```js
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  // options: node | react | next | payload
});
```

For a React UI library:

```js
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  react: true,
});
```

For Next.js:

```js
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  next: true,
});
```

For Payload CMS:

```js
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  payload: true,
});
```

With custom rules or ignores:

```js
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig(
  { react: true },
  {
    rules: {
      // package-specific overrides
    },
  }
);
```

### 2. Using Composable Presets Directly

```js
import { base, react, node, nextjs, payload } from "@nexload-sdk/eslint-config";

export default [
  ...base,
  ...react,
];
```

## Available Subpath Exports

- `@nexload-sdk/eslint-config`
- `@nexload-sdk/eslint-config/base`
- `@nexload-sdk/eslint-config/node`
- `@nexload-sdk/eslint-config/react`
- `@nexload-sdk/eslint-config/nextjs`
- `@nexload-sdk/eslint-config/payload`
