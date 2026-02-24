# @nexload-sdk/eslint-config

Shared flat ESLint configurations used across the Nexload SDK monorepo.

## Exports

- `@nexload-sdk/eslint-config/base.js`
- `@nexload-sdk/eslint-config/nextjs.js`

## Usage (Flat Config)

```js
import { baseConfig } from "@nexload-sdk/eslint-config/base.js";

export default baseConfig;
```

Next.js projects:

```js
import nextJsConfig from "@nexload-sdk/eslint-config/nextjs.js";

export default nextJsConfig;
```

## What is included

- ESLint core recommended rules
- TypeScript ESLint recommended config
- Stylistic rules (`@stylistic`)
- import ordering rules
- turbo env var checks (`turbo/no-undeclared-env-vars`)
- React/Hooks/Next.js rules in the Next config
- Prettier compatibility via `eslint-config-prettier`

## Notes

- The base config expects a local `tsconfig.json` (`parserOptions.project`)
- The base config enforces `no-console` by default
