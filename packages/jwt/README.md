# @nexload-sdk/jwt

<div align="center">
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/jwt?style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/badge/runtime-node.js | bun-green?style=flat-square" alt="runtime" />
  <br><br>
  <strong>A lightweight, policy-driven, and adapter-based JWT factory for Node.js backend services.</strong>
</div>

---

## Overview

`@nexload-sdk/jwt` is a minimalist, high-security factory for creating and verifying JSON Web Tokens. It is designed for professional backend engineers building secure, modern, and maintainable systems. It enforces strong security practices through its API design and provides a clear, decoupled architecture that is easy to test and extend.

This package is not a general-purpose JWT library but a specialized tool for creating configured JWT handlers within the Nexload SDK ecosystem.

---

## Design Philosophy

The architecture is guided by several core principles suitable for senior engineers:

-   **Decoupling over Implementation:** The package uses an adapter-based design to decouple the core logic from the underlying JWT library (`jsonwebtoken`). This allows for future implementation swaps without altering the public API.
-   **Policy Enforcement:** Security policies (like token expiration) are not optional. The API requires explicit configuration, promoting a secure-by-default approach.
-   **Abstraction of Concerns:** Core concerns are separated. The `Factory` handles instance creation, the `Policy` defines token rules, the `SecretProvider` manages secret derivation, and the `Adapter` handles the JWT implementation.
-   **Domain-Agnostic Payloads:** The factory is generic and does not impose any structure on the token payload, making it universally applicable across different domains.
-   **Normalized Errors:** Errors from the underlying library are caught and mapped to a set of typed, predictable errors, providing a stable error contract for consumers.

---

## Features

-   🔒 **Secure by Default:** Enforces token expiration policies.
-   🏭 **Factory-Based:** Create multiple, isolated JWT handlers with different configurations.
-   🧩 **Adapter-Based:** Decoupled from `jsonwebtoken` for maintainability.
-   🛡️ **Abstracted Secret Management:** Pluggable `SecretProvider` for custom secret derivation strategies.
-   ⛑️ **Typed & Normalized Errors:** Predictable error handling, no raw library errors.
-   ✍️ **Fully Typed:** End-to-end TypeScript support for payloads and configuration.
-   🌲 **Node.js Optimized:** Built for Node.js and Bun runtimes.

---

## Installation

```bash
pnpm add @nexload-sdk/jwt
# or
yarn add @nexload-sdk/jwt
# or
npm install @nexload-sdk/jwt
```

---

## Quick Start

Create a configured JWT handler and use it to sign and verify tokens.

```typescript
import { createJwt, JwtExpiredError } from '@nexload-sdk/jwt';

// 1. Define a payload type for your application
interface AuthPayload {
  userId: string;
  roles: string[];
}

// 2. Create a configured JWT handler instance
const jwtHandler = createJwt<AuthPayload>({
  secret: process.env.JWT_SECRET_KEY!,
  policy: {
    expiresIn: 3600, // 1 hour in seconds
    issuer: 'my-auth-service',
  },
});

// 3. Sign a payload to create a token
const token = jwtHandler.sign({
  userId: 'user-123',
  roles: ['admin'],
});

console.log('Generated Token:', token);

// 4. Verify a token to get the payload
try {
  const payload = jwtHandler.verify(token);
  console.log('Verified Payload:', payload.userId); // 'user-123'
} catch (error) {
  if (error instanceof JwtExpiredError) {
    console.error('Token has expired!');
  } else {
    console.error('Token verification failed:', error);
  }
}
```

---

## Core Concepts

### Factory (`createJwt`)

The `createJwt` function is the entry point. It's a factory, not a class. You call it with a configuration object to produce a `signer` and `verifier` pair. This approach allows you to create multiple, independent JWT handlers in your application. For example, you can have one handler for short-lived access tokens and another for long-lived refresh tokens, each with its own secret and policy.

### Policy

A `JwtPolicy` is an object that defines the rules and metadata for a token. It is required during the creation of a handler. The `expiresIn` property is mandatory, ensuring that no token can be created without an expiration date. You can also specify standard claims like `issuer` and `audience`.

```typescript
const policy = {
  expiresIn: 60 * 15, // 15 minutes
  issuer: 'api.myapp.com',
  audience: 'user-portal',
};
```

### Secret Provider

The `secret` can be provided as a raw string or as an implementation of the `SecretProvider` interface. A `SecretProvider` abstracts the logic of how a secret is generated or derived. The package includes a default `Sha256SecretProvider` that hashes a raw string. This abstraction allows you to implement more sophisticated secret management, such as fetching secrets from a vault or using different derivation algorithms, without changing the JWT-handling logic.

### Adapter

The package uses the Adapter pattern to decouple its core logic from the `jsonwebtoken` library. The `JwtAdapter` interface defines the contract for signing and verifying tokens. This makes the system more maintainable and flexible, as the underlying implementation can be swapped out in the future with minimal impact.

---

## Error Handling

The library provides a set of typed errors to ensure predictable error handling. Instead of re-throwing raw errors from the underlying `jsonwebtoken` library, it maps them to a consistent set of custom errors:

-   `JwtExpiredError`: Thrown when a token is expired.
-   `JwtInvalidError`: Thrown for other validation failures (e.g., invalid signature, issuer, or audience).
-   `JwtMalformedError`: Thrown when the token is not a valid JWT.

Always use a `try...catch` block when verifying tokens and check for these specific error types.

---

## Runtime Support

This package is designed exclusively for **Node.js** and **Bun** runtimes. It relies on the Node.js `crypto` module for its default secret provider, which is not available in Edge or browser environments.

-   ✅ Node.js
-   ✅ Bun
-   ❌ Vercel Edge Functions
-   ❌ Cloudflare Workers
-   ❌ Browser

---

## What This Package Is NOT

-   **A general-purpose JWT utility:** It is an opinionated factory for use within the Nexload SDK ecosystem.
-   **Edge-compatible:** It requires a Node.js-like environment.
-   **A crypto library:** It adapts an existing library (`jsonwebtoken`) and does not implement any cryptographic functions itself.

---

## Security Notes

-   **Secret Management:** Always use strong, unique secrets for your tokens. Store them securely and load them from environment variables. Do not hard-code secrets in your source code.
-   **Token Lifetime:** Keep token lifetimes (`expiresIn`) as short as reasonably possible to minimize the impact of a compromised token.
-   **Payload Content:** Do not store sensitive information in JWT payloads. Payloads are encoded, not encrypted, and can be easily read by anyone with the token.

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · Scalable, modern, and robust developer tooling for next-generation software.
