# Release and compatibility evidence

## Discover live state

Before planning or claiming release coverage, inspect:

1. `packages/payload-schema/package.json` for current version, peers, scripts, files, and exports;
2. `CHANGELOG.md` and pending Changesets for released/pending impact;
3. `.github/workflows` for automation that actually exists;
4. compatibility helpers and fixtures for what they truly execute;
5. the lockfile for exact Payload-family versions.

Do not hard-code a bootstrap version or Changeset type. Choose release impact from the current version and actual public change. Do not publish or run version commands without explicit authorization.

## Current command meanings

```text
test            -> build plus unit contracts
test:types      -> public inference and compile-time failures
test:sqlite     -> current-version SQLite integration
test:postgres   -> Postgres fixture when its environment is available
test:consumer   -> packed external consumer at configured current versions
test:compat     -> packed consumer smoke; not a complete version matrix
```

Read scripts before relying on these summaries because repository behavior can change.

The compatibility shell helper installs matched Payload-family packages and runs broader checks when invoked with explicit environment variables. A helper file alone is not CI automation. Claim PR/main/tag/manual lanes only when a matching workflow file is present and inspected.

## Distribution proof

For a public or packaging change verify, as relevant:

- ESM root runtime import and the exact public runtime export set;
- independent declaration compilation without workspace aliases;
- Payload config loading in an external consumer;
- `pnpm pack` contents and package size;
- deep import rejection through package exports;
- `sideEffects: false`;
- matched `payload` and every installed `@payloadcms/*` version;
- supported minimum/current version lanes actually executed.

Report each lane as passed, failed, skipped, or absent. A current-version smoke does not prove the peer range. An orphan helper does not prove workflow coverage.

## Documentation and skill proof

When public behavior changes, update package README/site docs, regenerate LLM indexes, validate symbol coverage, and update both package skills/evals. Run package-scoped checks before workspace build/lint and separate unrelated baseline failures.
