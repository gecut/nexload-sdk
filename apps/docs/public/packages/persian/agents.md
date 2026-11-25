# persian — Agent usage

Configure a coding agent for @nexload-sdk/persian.

**Topic:** agents
**Package:** `@nexload-sdk/persian` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/persian/agents/
## Install matching skills

Install the skills whose triggers match the task.

### persian

[Trigger](https://github.com/gecut/nexload-sdk/blob/main/skills/persian/SKILL.md)

```text
Use when a project handles Persian, Farsi, or Iranian input or output, including mobile numbers, کد ملی (national code), postal codes, landlines, card numbers, Sheba/IBAN, Rial/Toman prices, Jalali/Shamsi dates, relative time, Persian digits, ي/ك normalization, slugs, provinces, or Zod validation of these values.
```

```bash
npx skills add gecut/nexload-sdk --skill persian
```

## Project AGENTS.md

```markdown
For @nexload-sdk/persian, load persian when its trigger matches. Read the package bundle and check public exports against the installed version before editing.
```

## Package context

[Scoped Markdown bundle](/nexload-sdk/packages/persian/llms.txt).

## Prompts

```text
Normalize Persian digits and display a price. Use @nexload-sdk/persian and persian. Inspect the installed version and show a minimal typed example for my project.
```

```text
Review my @nexload-sdk/persian integration against the optimization page. Identify the relevant source for each finding and one test for the highest-risk behavior.
```
