<div align="center">

<a href="https://github.com/gecut/nexload-sdk">
  <img src="https://img.shields.io/badge/cli-iconcraft-purple?style=for-the-badge" alt="cli" />
</a>
<a href="https://www.npmjs.com/package/@nexload-sdk/iconcraft">
  <img src="https://img.shields.io/npm/v/@nexload-sdk/iconcraft?style=for-the-badge" alt="npm version" />
</a>
<a href="https://github.com/gecut/nexload-sdk/blob/main/LICENSE">
  <img src="https://img.shields.io/npm/l/@nexload-sdk/iconcraft?style=for-the-badge" alt="license" />
</a>
<a href="https://www.typescriptlang.org/">
  <img src="https://img.shields.io/badge/types-typescript-blue?style=for-the-badge" alt="typescript" />
</a>

<br/>
<br/>

# 🎨 IconCraft

**A powerful CLI tool for effortlessly managing and generating type-safe icon components from [Iconify](https://iconify.design/) in your projects.**

_Transform your icon workflow from a manual chore to an automated delight._

</div>

---

## 🌟 Why IconCraft?

In modern web development, managing icons can be a surprising source of friction. Developers often grapple with:

-   **Inconsistent APIs:** Different icon libraries have different usage patterns, leading to messy and hard-to-maintain code.
-   **Performance Bottlenecks:** Loading entire icon sets when you only need a few can significantly bloat your application and slow down load times.
-   **Lack of Type Safety:** Using string-based icon names is a recipe for typos, bugs, and a frustrating developer experience. No autocompletion, no compile-time checks.
-   **Manual Management:** Manually adding, removing, and updating SVG files is tedious and error-prone.

**IconCraft** is the solution. It streamlines your entire icon workflow by providing a single, consistent, and automated way to manage icons.

---

## ✨ Features

-   📦 **Iconify Powered:** Access over 200,000 icons from 100+ icon sets, including Material Design, Font Awesome, Remix Icon, and more.
-   🚀 **Local Component Generation:** Instead of fetching icons at runtime, IconCraft generates local, framework-agnostic TypeScript components. This means better performance, offline availability, and more reliable builds.
-   🛡️ **Type-Safe by Default:** Say goodbye to stringly-typed errors. IconCraft generates TypeScript files with exported functions for each icon, giving you autocompletion and compile-time safety.
-   ⚙️ **Automated Syncing:** A local `iconcraft.json` meta file is your single source of truth. Add, remove, and update icons with simple commands, and let IconCraft handle the file system changes.
-   🔥 **Simple & Intuitive CLI:** A clean and easy-to-use command-line interface for adding, removing, listing, and syncing your icons.
-   🧩 **Customizable:** Easily configure the output directory for your generated icons to fit your project's structure.
-   🌳 **Tree-Shakeable:** By generating individual components, you ensure that only the icons you actually use are included in your final bundle.

---

## 💾 Installation

Install IconCraft as a development dependency in your project.

```bash
pnpm add @nexload-sdk/iconcraft -D
# or
yarn add @nexload-sdk/iconcraft -D
# or
npm install @nexload-sdk/iconcraft -D
```

---

## 🚀 Getting Started in 3 Steps

### 1. Add an Icon

Use the `add` command with an Iconify icon name (format: `collection:icon-name`).

```bash
pnpm iconcraft add mdi:home
```

This command will:
1.  Fetch the `home` icon from the `mdi` (Material Design Icons) collection.
2.  Generate a TypeScript component file (e.g., `icons/mdi-home.ts`).
3.  Create or update the `iconcraft.json` meta file.

### 2. Use the Icon

The generated components are simple functions that return an SVG string. You can import and use them in any framework.

```typescript
// Example in a vanilla TypeScript project
import { MdiHome } from './icons/mdi-home';

const homeIconSvg = MdiHome(); // returns '<svg>...</svg>'

document.body.innerHTML = `
  <a href="/">
    ${homeIconSvg}
    <span>Home</span>
  </a>
`;
```

### 3. Sync Your Project

Use the `sync` command to ensure your icon components are in sync with your `iconcraft.json` file.

```bash
pnpm iconcraft sync
```

This is useful if you've pulled changes that update `iconcraft.json` or if you need to regenerate all icons.

---

## 📚 Commands API

### `add <name>`

Adds a new icon to your project.

```bash
pnpm iconcraft add <iconify-name> [options]
```

-   `<name>`: The full Iconify icon name (e.g., `mdi:account-circle`, `lucide:arrow-right`).

**Example:**
```bash
pnpm iconcraft add fa6-solid:star
```

### `remove <name>`

Removes an icon from your project.

```bash
pnpm iconcraft remove <icon-name> [options]
```

-   `<name>`: The name of the icon to remove (as listed in `iconcraft.json`).

**Example:**
```bash
pnpm iconcraft remove fa6-solid:star
```

### `list`

Lists all the locally managed icons as defined in `iconcraft.json`.

```bash
pnpm iconcraft list [options]
```

**Example:**
```bash
pnpm iconcraft list
```

### `sync`

Synchronizes your icon directory with the `iconcraft.json` meta file. It will:
-   Generate any missing icon components.
-   Remove any icon files that are not listed in the meta file.

```bash
pnpm iconcraft sync [options]
```

**Example:**
```bash
pnpm iconcraft sync
```

---

## ⚙️ Configuration

### Command-Line Options

-   `--out-dir <directory>` (alias: `-o`): Specify a custom output directory for your icons. Defaults to `icons`.

```bash
pnpm iconcraft add mdi:home --out-dir src/components/icons
```

### The `iconcraft.json` file

This file is the heart of IconCraft. It acts as a manifest for all the icons in your project. You should commit this file to your version control system.

**Example `iconcraft.json`:**
```json
{
  "icons": {
    "mdi:home": {
      "name": "mdi:home",
      "componentName": "MdiHome",
      "fileName": "icons/mdi-home.ts"
    },
    "fa6-solid:star": {
      "name": "fa6-solid:star",
      "componentName": "Fa6SolidStar",
      "fileName": "icons/fa6-solid-star.ts"
    }
  }
}
```

---

## 💡 Best Practices & Usage with Frameworks

-   **NPM Scripts:** Add IconCraft commands to your `package.json` for easy access.
    ```json
    "scripts": {
      "icon:add": "iconcraft add",
      "icon:remove": "iconcraft remove",
      "icon:list": "iconcraft list",
      "icon:sync": "iconcraft sync"
    }
    ```

-   **Git Ignore:** Add your icon output directory to `.gitignore` if you prefer to generate icons as part of your build process rather than committing them. However, committing the generated files is often simpler.
    ```
    # .gitignore
    /icons
    ```

-   **Usage with React:** Use `dangerouslySetInnerHTML` to render the SVG string.
    ```jsx
    import { MdiHome } from './icons/mdi-home';

    const HomeIcon = () => <span dangerouslySetInnerHTML={{ __html: MdiHome() }} />;

    function MyComponent() {
      return (
        <div>
          <h1><HomeIcon /> Welcome Home</h1>
        </div>
      );
    }
    ```

-   **Usage with Svelte:** Use the `{@html ...}` tag.
    ```svelte
    <script>
      import { MdiHome } from './icons/mdi-home';
    </script>

    <h1>{@html MdiHome()} Welcome Home</h1>
    ```

-   **Usage with Vue:** Use the `v-html` directive.
    ```vue
    <template>
      <h1><span v-html="homeIcon"></span> Welcome Home</h1>
    </template>

    <script>
    import { MdiHome } from './icons/mdi-home';
    export default {
      data() {
        return {
          homeIcon: MdiHome()
        }
      }
    }
    </script>
    ```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  Fork this repository.
2.  Create a new feature branch (`git checkout -b feat/your-feature-name`).
3.  Make your changes. Ensure all types, tests, and linting checks pass.
4.  Follow the commit message convention (e.g., `feat(cli): add new option for xyz`).
5.  Open a pull request.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/gecut/nexload-sdk/blob/main/LICENSE) file for details.

---

<div align="center">
  Built by <a href="https://github.com/gecut/nexload-sdk">NexLoad SDK</a> · Scalable, modern, and robust developer tooling for next-generation software.
</div>