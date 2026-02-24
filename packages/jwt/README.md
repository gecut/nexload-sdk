# @nexload-sdk/jwt

Policy-driven JWT factory for Node.js/Bun services.

## Install

```bash
pnpm add @nexload-sdk/jwt
```

## Exports

- `createJwt`
- `JwtExpiredError`
- `JwtInvalidError`
- `JwtMalformedError`
- types: `JwtPolicy`, `SecretProvider`

## Quick Start

```ts
import { createJwt, JwtExpiredError, JwtMalformedError } from "@nexload-sdk/jwt";

type AuthPayload = {
  userId: string;
  roles: string[];
};

const authJwt = createJwt<AuthPayload>({
  secret: process.env.JWT_SECRET!,
  policy: {
    expiresIn: 60 * 60,
    issuer: "auth-service",
    audience: "api"
  }
});

const token = authJwt.sign({ userId: "u1", roles: ["admin"] });

try {
  const payload = authJwt.verify(token);
  console.log(payload.userId);
} catch (error) {
  if (error instanceof JwtExpiredError) {
    // token expired
  }
  if (error instanceof JwtMalformedError) {
    // invalid / malformed token input
  }
}
```

## API

### `createJwt<T>({ secret, policy })`

- `secret`: `string | SecretProvider`
- `policy`: `JwtPolicy`

Returns:

- `sign(payload: T): string`
- `verify(token: string): T`

## `JwtPolicy`

```ts
type JwtPolicy = {
  expiresIn: number;
  issuer?: string;
  audience?: string;
};
```

## Secret Providers

You may pass a custom object implementing:

```ts
type SecretProvider = {
  derive(): string;
};
```

If you pass a raw string, the package derives a hashed secret internally before signing/verifying.

## Runtime Notes

- Uses Node crypto (default provider) and `jsonwebtoken` adapter internally.
- Intended for Node.js/Bun server runtimes, not browser/edge runtimes.
