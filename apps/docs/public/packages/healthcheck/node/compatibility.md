# Healthcheck Node compatibility

Node, Linux cgroup, and module compatibility.

**Topic:** compatibility
**Package:** `@nexload-sdk/healthcheck-node` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/node/compatibility/
The package publishes ESM, CommonJS, and declarations and depends on current `@nexload-sdk/healthcheck`. It uses Node built-ins.

The manifest declares no minimum Node version. Node 22 is the current
repository verification target. Treat older Node releases as unverified until
your application runs its own build and probe tests.

Linux cgroup v1/v2 detection is supported. On non-Linux or unrestricted hosts, process and OS fallbacks may be used. TCP and DNS behavior follows the running Node environment and its network configuration. This package does not expose HTTP routes or support browser/edge execution.
