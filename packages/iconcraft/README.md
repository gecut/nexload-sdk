# @nexload-sdk/iconcraft

<div align="center">
  <img src="https://img.shields.io/badge/cli-iconcraft-purple?style=flat-square" alt="cli" />
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/iconcraft?style=flat-square" alt="npm version" />
  <br><br>
  <strong>A powerful CLI tool for effortlessly managing and generating type-safe icon components from Iconify in your projects.</strong>
</div>

---

## Why IconCraft?

In modern web development, using icons from various libraries can be a hassle. You often have to deal with:

- **Inconsistent APIs:** Different icon libraries have different ways of being used.
- **Performance Issues:** Loading entire icon sets can slow down your application.
- **Lack of Type Safety:** Using icons as strings can lead to typos and bugs.

IconCraft solves these problems by providing a single, consistent way to manage and use icons in your projects. It allows you to:

- **Generate Local Components:** Instead of fetching icons from a CDN at runtime, IconCraft generates local, framework-agnostic components that you can bundle with your application. This improves performance and reliability.
- **Ensure Type Safety:** IconCraft generates TypeScript files with proper types for your icons, so you can catch errors at compile time, not runtime.
- **Sync Your Icons:** IconCraft keeps your local icon set in sync with a meta file, so you can easily add, remove, and update icons without having to manually manage files.

---

## Features

- 📦 **Iconify Powered:** Access over 100,000 icons from 100+ icon sets, including Material Design Icons, Font Awesome, and more.
- 🚀 **Component Generation:** Automatically generates framework-agnostic icon components that can be used in any project.
- 🛡️ **Type-Safe:** Generates TypeScript files with proper types for your icons, enabling autocompletion and compile-time error checking.
- ⚙️ **Local Sync:** Keeps your local icon set in sync with a meta file, making it easy to manage your icons.
- 🔥 **Simple Commands:** Easy-to-use commands for adding, removing, listing, and syncing icons.
- 🧩 **Customizable:** Configure the output directory for your generated icons to fit your project's structure.

---

## Installation

```bash
pnpm add @nexload-sdk/iconcraft -D
# or
yarn add @nexload-sdk/iconcraft -D
# or
npm install @nexload-sdk/iconcraft -D
```

---

## Quick Start

### 1. Add an Icon

To add a new icon, use the `add` command with the Iconify icon name (e.g., `collection:icon-name`).

```bash
pnpm iconcraft add mdi:home
```

This will generate an icon component in the default `icons` directory and update the `iconcraft.json` meta file.

### 2. Use the Icon

You can then import and use the generated icon component in your application. The generated components are simple, framework-agnostic functions that return an SVG string.

```typescript
import { MdiHome } from './icons/mdi-home';

function MyComponent() {
  return (
    <div>
      <h1>Welcome Home</h1>
      <div dangerouslySetInnerHTML={{ __html: MdiHome() }} />
    </div>
  );
}
```

---

## Commands

### `add <name>`

Adds a new icon to your project. The `<name>` argument is the full Iconify icon name.

```bash
pnpm iconcraft add mdi:account-circle
```

### `remove <name>`

Removes an icon from your project. This will delete the icon component and update the `iconcraft.json` meta file.

```bash
pnpm iconcraft remove mdi:account-circle
```

### `list`

Lists all the locally generated icons, as defined in the `iconcraft.json` meta file.

```bash
pnpm iconcraft list
```

### `sync`

Syncs the generated icons with the local meta file. This is useful if you have manually deleted icon files or want to regenerate all icons.

```bash
pnpm iconcraft sync
```

---

## Options

### `--out-dir <directory>`

You can specify a custom output directory for your icons using the `--out-dir` (or `-o`) option.

```bash
pnpm iconcraft add mdi:home --out-dir src/components/icons
```

This will generate the icon component in the `src/components/icons` directory.

---

## Best Practices

- **Keep your icons in a dedicated directory.** This makes it easy to manage your icons and configure your build tools.
- **Use the `sync` command to keep your project clean.** This will ensure that your generated icons are always in sync with your meta file.
- **Add the `iconcraft` commands to your `package.json` scripts for easier access.**

```json
{
  "scripts": {
    "icon:add": "iconcraft add",
    "icon:remove": "iconcraft remove",
    "icon:list": "iconcraft list",
    "icon:sync": "iconcraft sync"
  }
}
```

- **Commit the `iconcraft.json` meta file to your repository.** This will ensure that all developers on your team have the same set of icons.

---

## Contributing

1. Fork this repo, create a feature branch (`feat/name`)
2. Make your changes — ensure all types, tests, and lint pass
3. Follow commit message convention: `feat(scope): your description`
4. Open a pull request (PR) — BugBot checks and feedback required

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · Scalable, modern, and robust developer tooling for next-generation software.
