# @nexload-sdk/typescript-config

Shared TypeScript configuration presets for the Nexload SDK monorepo.

## Presets

- `base.json`: strict shared defaults
- `node.json`: Node.js library/package preset
- `react.json`: React library preset (declaration-only emit)
- `next.json`: Next.js app preset
- `vite.json`: Vite app preset

## Usage

`tsconfig.json` example:

```json
{
  "extends": "@nexload-sdk/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

## Notes

- `base.json` enables strict mode and declaration generation defaults
- `react.json` uses `jsx: react-jsx`
- `next.json` is app-oriented (`noEmit: true`)
- `vite.json` is app-oriented (`noEmit: true`, DOM libs enabled)
