# Universal Agent Config Setup Prompt

Use this prompt to instruct any AI coding agent (Claude Code, Cursor Agent, Copilot Workspace, Gemini CLI, Antigravity) to configure `@nexload-sdk/typescript-config` and `@nexload-sdk/eslint-config` in any existing or new project.

---

```markdown
You are tasked with modernizing and standardizing this repository's TypeScript and ESLint configurations using @nexload-sdk/typescript-config and @nexload-sdk/eslint-config.

Follow this phased protocol systematically:

### Phase 1: Environment & Dependency Audit
1. Inspect package.json and project files to identify:
   - Package manager: pnpm, npm, yarn, or bun.
   - Project type: Next.js (App Router/Pages), React/Vite, Node.js backend/CLI, Payload CMS, or Monorepo.
   - Existing lint/TypeScript configs: .eslintrc*, .eslintignore, tsconfig.json.
2. Remove deprecated or conflicting packages:
   - Uninstall: eslint-plugin-import, eslint-plugin-only-warn, @typescript-eslint/parser (if legacy), @typescript-eslint/eslint-plugin (if legacy).
   - Remove legacy config files: .eslintrc.js, .eslintrc.json, .eslintrc.yml, and .eslintignore.

### Phase 2: Install Modern Tooling
Install the required modern configuration packages using the detected package manager:
- @nexload-sdk/typescript-config
- @nexload-sdk/eslint-config
- eslint@^9.0.0
- typescript@^5.9.0
- prettier (if not already installed)

### Phase 3: Modernize tsconfig.json
Update the project's tsconfig.json (or workspace package tsconfigs):
1. Set "extends" to the appropriate preset:
   - For Next.js: "@nexload-sdk/typescript-config/next.json"
   - For React/Vite: "@nexload-sdk/typescript-config/vite.json" (or "/react.json")
   - For Node.js: "@nexload-sdk/typescript-config/node.json"
   - For core libraries/shared: "@nexload-sdk/typescript-config/base.json"
2. Keep local paths, outDir, rootDir, and include/exclude definitions intact.
3. Verify strictness flags are active (moduleDetection: "force", forceConsistentCasingInFileNames: true).

### Phase 4: Configure ESLint 9 Flat Config (eslint.config.mjs)
Create or replace eslint.config.mjs in the project root:
```js
import { nexloadConfig } from "@nexload-sdk/eslint-config";

export default nexloadConfig({
  framework: "<DETECTED_FRAMEWORK>", // "next" | "react" | "node" | "payload" | "none"
  typeAware: true,
  ignores: [
    "dist/**",
    ".next/**",
    "build/**",
    "node_modules/**",
  ],
});
```

### Phase 5: Modernize package.json Scripts
1. Update lint scripts to remove deprecated flags (such as --ext):
   - "lint": "eslint ."
   - "lint:fix": "eslint --fix ."
2. Ensure a typecheck script exists:
   - "typecheck": "tsc --noEmit"

### Phase 6: Codebase Normalization & Safe Remediation
1. Run the automatic fixer:
   <pm> run lint:fix (or <pm> exec eslint --fix .)
   This automatically applies perfectionist import groupings and stylistic statement spacing.
2. Audit remaining lint failures:
   - Filename errors (unicorn/filename-case): Safely rename files to kebab-case (e.g., UserProfile.tsx -> user-profile.tsx) and update all references.
   - Any-types (@typescript-eslint/no-explicit-any): Narrow types cleanly using domain types, unknown, or Zod schemas. Do NOT suppress with // eslint-disable unless strictly required and justified.
   - Floating promises (@typescript-eslint/no-floating-promises): Ensure promises are awaited or explicitly handled.

### Phase 7: Verification
Before completing:
1. Run the linter: Verify exit code is 0 with 0 errors.
2. Run the typechecker: Verify tsc --noEmit passes with 0 errors.
3. Run the test suite: Verify all tests pass without regressions.
4. Run the project build: Verify clean compilation.
Report a concise summary of changes made and verification results.
```
