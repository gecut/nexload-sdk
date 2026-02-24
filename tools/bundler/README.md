# @nexload-sdk/bundler

Internal workspace helper for building Nexload SDK packages with:

- `esbuild` (ESM/CJS bundles)
- `tsc` (type declarations)
- optional Sass handling via `esbuild-sass-plugin`

This package is intended for use inside the monorepo.

## Usage

Create a package-local `esbuild.config.mjs` and call `createBundler`:

```js
import { createBundler } from "@nexload-sdk/bundler";

export default createBundler("src/index.ts", "dist", process.cwd());
```

Typical package script:

```json
{
  "scripts": {
    "build": "node esbuild.config.mjs"
  }
}
```

## API

### `createBundler(entryFile?, outDir?, baseDir?, esbuildOptions?, isCJS?)`

Returns a function that:

1. cleans `outDir`
2. builds ESM output
3. optionally builds CJS output (`isCJS = true`)
4. runs `tsc --project tsconfig.json` for declaration files

## Notes

- Externals are inferred from `dependencies` and `peerDependencies`
- Output banner includes package name/version/build timestamp
- `tsc` is invoked via `npx tsc --project tsconfig.json`
