# Browser entrypoint leak

`package.json` exports `./client`, but `src/client/index.ts` re-exports the root barrel. The root imports `node:fs`, reads `process.env.API_SECRET` during module evaluation, and creates a mutable default singleton. The browser bundle compiles because the bundler replaces Node globals.

Review the boundary and propose a minimal safe correction.
