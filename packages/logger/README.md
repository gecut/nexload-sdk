# @nexload-sdk/logger

<div align="center">
  <img src="https://img.shields.io/badge/logger-pino--based-orange?style=flat-square" alt="logger" />
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/logger?style=flat-square" alt="npm version" />
  <br><br>
  <strong>Structured, high-performance logging with type safety, environment integration, and Next.js-ready wrappers.</strong>
</div>

---

## Features
- 🚀 **Pino-powered:** Super-fast, versatile logger with pretty print out-of-the-box
- 🛡️ **Redacts sensitive fields:** Safe defaults for user/password/token/cookies
- 🟦 **TypeScript-first:** All logging operations and wrappers are fully typed
- 🌐 **Environment-aware:** Integrates `@nexload-sdk/env` for type-safe env config
- 🔎 **Structured logs:** Timestamped, colored, and clearly formatted
- ⚙️ **Customizable:** Configure log level, service name, extra fields easily
- ⚡ **Next.js Friendly:** `withLogger()` helper makes SSR/data fetch logging a breeze
- 🧩 **Composable:** Use directly or via helper for operation tracking & perf

---

## Installation
```bash
pnpm add @nexload-sdk/logger
# or
yarn add @nexload-sdk/logger
# or
npm install @nexload-sdk/logger
```

---

## Quick Start

### Basic Logger Usage
```typescript
import logger from '@nexload-sdk/logger';

logger.info('Service started');
logger.warn({ user: 'bob' }, 'Potential issue');
logger.error(new Error('Boom!'), 'Something failed');
```

---

## Advanced: Next.js/Operation Wrapper

Easily log SSR, API, or async operations — complete with structured timing and error tracking.

```typescript
import { withLogger } from '@nexload-sdk/logger';

export async function getServerSideProps() {
  return withLogger({ route: '/home', type: 'get-data', functionName: 'getServerSideProps' }, async (timingShot) => {
    timingShot('start-db');
    // fetch DB...
    timingShot('done-db');
    return { props: { /* ... */ } };
  });
}
```

---

## API Reference

### Default export: `logger`
- Fully-configured [pino](https://getpino.io/#/) instance
- Configured by env (`SERVICE_NAME`, `LOG_LEVEL`, ...), redact secrets by default
- Pretty/clean terminal output

### `withLogger(options, fn)`
- Wrap sync/async code and get structured, perf-aware logs with automatic timing, error, completion logs
- Parameters:
  - `options: { route: string, type: "render" | "get-data", functionName? }`
  - `fn(timingShot) => T | Promise<T>` - Call `timingShot(name)` in your code for granular timings
- Returns: `Promise<T>`

### Example error log
Logs errors with operation context:
```typescript
await withLogger({ route: '/test', type: 'get-data', functionName: 'fetch' }, async () => {
  throw new Error('fail')
});
// Output: ... { route: '/test', functionName: 'fetch', duration: '12.00ms' } Operation failed Error: fail
```

---

## Configuration & Environment
- Uses `@nexload-sdk/env` for all env management
- By default, loads all variables in `$NodePreset` (i.e. `LOG_LEVEL`, `SERVICE_NAME`, ...)
- All sensitive fields like passwords/tokens/cookies are redacted from logs
- Formatting and fields customizable via standard pino config

---

## Best Practices
- Use `withLogger` for every major SSR/data/op in Next.js projects: automatic timing & errors
- Log structure, not raw strings: `{ userId, error }` — better for search and alerts
- Set sensible LOG_LEVEL via env for prod/dev/test

---

## Contributing
1. Fork this repo, create a feature branch (`feat/name`)
2. Make your changes — ensure all types, tests, and lint pass
3. Use commit messages of the format: `feat(scope): your description`
4. Open a pull request (PR) — BugBot checks and feedback required

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · Enabling modern, observable, and resilient applications with top-notch developer tools.
