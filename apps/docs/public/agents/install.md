# Install agent skills

Install Nexload package Skills with the official skills CLI for a project, globally, or for Codex.

**Topic:** agents
**Canonical page:** https://gecut.github.io/nexload-sdk/agents/install/
The repository ships validated, self-contained Skills. The official `skills` CLI discovers the current `skills/**/SKILL.md` files, so the list command is the source of truth instead of a hard-coded count. Each Skill keeps its core workflow in `SKILL.md`, routes deeper package contracts through `references/`, and commits behavior plus trigger cases under `evals/`.

1. Inspect the available Skills before installing:

   ```bash
   npx skills add gecut/nexload-sdk --list
   ```

2. Install a specific Skill for the current project:

   ```bash
   npx skills add gecut/nexload-sdk --skill healthcheck-core
   ```

3. Update installed Skills when you intentionally want newer guidance:

   ```bash
   npx skills update
   ```

## Example: a Next.js health route

```bash
npx skills add gecut/nexload-sdk --skill healthcheck-nextjs-routes
```

## Source layout

* skills
  * healthcheck
    * nextjs-routes
      * SKILL.md
      * references
        * route-matrix.md
        * protection-and-proxy.md
        * app-router-playbook.md
      * evals
        * evals.json
        * trigger-evals.json
  * payload-fields
    * money
      * SKILL.md
      * references
      * evals
  * payload-editor
    * core
      * SKILL.md
      * references
      * evals
  * payload-schema
    * use
      * SKILL.md
      * references
      * evals
    * develop
      * SKILL.md
      * references
      * evals

### Review before broad installation

`--all` can install every Skill for every detected agent. Prefer a specific Skill or the interactive command unless the repository is intentionally your shared agent baseline.

Run `pnpm skills:validate` in a repository checkout to verify frontmatter, path/name consistency, references, line limits, behavior evals, and balanced trigger evals.
