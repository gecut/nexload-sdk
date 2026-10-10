# Overview & Quick Start

Strict, zero-compromise ESLint 9 Flat Config enforcing clean architecture, deterministic imports, and zero-any rules.

**Topic:** overview
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/eslint-config/
`@nexload-sdk/eslint-config` provides a unified, strict ESLint 9 Flat Config system for TypeScript repositories. Built on `typescript-eslint` v8, `eslint-plugin-perfectionist`, and `eslint-plugin-unicorn`, it enforces clean architectural discipline, deterministic import order, semantic whitespace padding, and zero-`any` type safety.

***

## 10-Second Code Snippet

Create `eslint.config.mjs` in your project root using the `nexloadConfig()` universal factory:

```js title="eslint.config.mjs"
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  framework: "next", // "next" | "react" | "node" | "payload" | "none"
  typeAware: true,
});
```

***

## The Enforced Mental Model

This configuration enforces unambiguous, production-grade engineering standards:

### 1. Mandatory Kebab-Case Filenames (`unicorn/filename-case`)

Every file in your source tree must use `kebab-case.ts`. CamelCase, PascalCase, or snake\_case file names trigger compile-blocking linter errors.

```text
✅ src/user-profile.ts
✅ src/auth-guard.spec.ts
❌ src/UserProfile.ts
❌ src/user_profile.ts
```

### 2. Deterministic Perfectionist Imports (`perfectionist/sort-imports`)

Imports are automatically organized alphabetically into strict semantic groups separated by blank lines:

1. Type imports (`import type { ... }`)
2. Node.js built-ins (`node:fs`, `node:path`)
3. External dependencies (`react`, `zod`, `payload`)
4. Internal ecosystem packages (`@nexload-sdk/*`)
5. Parent & sibling relative imports (`../`, `./`)

### 3. Absolute Zero-`any` Policy (`@typescript-eslint/no-explicit-any`)

Using `any` is treated as a hard error. Types must be properly narrowed at boundary points using unknown, generics, type guards, or Zod schemas.

### 4. Semantic Whitespace Padding (`@stylistic/padding-line-between-statements`)

Blank lines are enforced around returns, classes, exports, and multi-line declarations to eliminate visual clutter and ensure code remains human-readable and AI-friendly.

### 5. Floating Promise Prevention (`@typescript-eslint/no-floating-promises`)

Async operations must be explicitly awaited or handled with `.catch()`. Unhandled background promises fail CI immediately.

***

## Available Presets & Factory

| Preset Export | Target Environment | Included Plugins |
|---|---|---|
| `baseConfig` | Universal TypeScript foundation | `typescript-eslint`, `perfectionist`, `unicorn`, `@stylistic`, `prettier` |
| `nodeConfig` | Node.js backend services | Base + Node globals and environment rules |
| `reactConfig` | React libraries & SPAs | Base + `react-hooks` |
| `nextjsConfig` | Next.js App Router | Base + `react-hooks` + `@next/eslint-plugin-next` |
| `payloadConfig` | Payload CMS applications | Base + `react-hooks` + Payload-specific admin & server boundary rules |
| `nexloadConfig(options)` | Universal configurable factory | Combines presets, custom rules, ignores, and overrides in one call |

***

## Installation & Requirements

```bash
pnpm add -D @nexload-sdk/eslint-config eslint@^9.0.0 typescript
```

Peer requirements: `eslint >= 9.0.0`, `typescript >= 5.0.0`.
