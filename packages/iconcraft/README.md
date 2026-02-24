# @nexload-sdk/iconcraft

CLI for managing Iconify icons as local generated React-compatible TSX components.

## Install

```bash
pnpm add -D @nexload-sdk/iconcraft
```

## CLI Commands

Global option for all commands:

- `--out-dir`, `-o` (default: `icons`)

### Add

```bash
pnpm iconcraft add mdi:home
pnpm iconcraft add mdi:home --out-dir src/icons
```

### Remove

```bash
pnpm iconcraft remove mdi:home
```

### List

```bash
pnpm iconcraft list
```

### Sync

```bash
pnpm iconcraft sync
```

## Generated Files

Inside the output directory (default `icons/`), IconCraft manages:

- `*.tsx` icon component files
- `index.ts` barrel file exporting `Icon`
- `.ic-meta.json` registry (internal manifest)

Example generated usage:

```tsx
import { MdiHome } from "./icons/mdi-home";
import { Icon } from "./icons";

export function Example() {
  return (
    <div>
      <MdiHome className="size-5" />
      <Icon.MdiHome className="size-5" />
    </div>
  );
}
```

## Library API

The package also exports the engine/types for programmatic usage:

- `IconCraftEngine`
- `IconCraftOptions`
- `IconMeta`
- `Registry`

## Notes

- Icons are fetched from `https://api.iconify.design/...` at generation time.
- Generated component files are TSX and include `"use client"`.
- The registry file is `.ic-meta.json` (not `iconcraft.json`).
