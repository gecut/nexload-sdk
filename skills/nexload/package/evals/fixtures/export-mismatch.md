# Export mismatch

The manifest documents `./slug` with JavaScript and declaration targets. `src/slug/index.ts` exists and the README imports it, but the bundler only builds `src/index.ts`. The workspace source test passes through a path alias; a clean installed consumer gets `ERR_PACKAGE_PATH_NOT_EXPORTED` or a missing target.

Diagnose the exact contract gap and define verification.
