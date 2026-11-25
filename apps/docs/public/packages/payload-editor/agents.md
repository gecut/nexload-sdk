# payload-editor — Agent usage

Configure a coding agent for @nexload-sdk/payload-editor.

**Topic:** agents
**Package:** `@nexload-sdk/payload-editor` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/agents/
## Install matching skills

Install the skills whose triggers match the task.

### payload-editor-core

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/core/SKILL.md)

```text
Use when integrating, changing, or reviewing the @nexload-sdk/payload-editor public interface, semantic feature definitions, merge and error contracts, Payload version compatibility, ESM packaging, or package-wide validation. Use the preset or extensions sibling when that is the primary task.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-editor-core
```

### payload-editor-presets

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/presets/SKILL.md)

```text
Use when selecting, defining, reviewing, or changing @nexload-sdk/payload-editor built-in or custom presets, including feature membership, heading policy, relational depth defaults, override merge behavior, immutability, and SemVer impact.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-editor-presets
```

### payload-editor-extensions

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-editor/extensions/SKILL.md)

```text
Use when adding, replacing, diagnosing, or reviewing native Payload Lexical feature providers through @nexload-sdk/payload-editor extendFeatures, including Blocks, duplicate keys, provider order, dependencies, server/client serialization, and project ownership.
```

```bash
npx skills add gecut/nexload-sdk --skill payload-editor-extensions
```

## Project AGENTS.md

```markdown
For @nexload-sdk/payload-editor, load payload-editor-core when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/payload-editor/llms.txt).

## Prompts

```text
Configure a Lexical article editor. Use @nexload-sdk/payload-editor and payload-editor-core. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/payload-editor integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
