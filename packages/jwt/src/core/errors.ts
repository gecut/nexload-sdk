export class JwtExpiredError extends Error {
  readonly code = "JWT_EXPIRED";
}

export class JwtInvalidError extends Error {
  readonly code = "JWT_INVALID";
}

export class JwtMalformedError extends Error {
  readonly code = "JWT_MALFORMED";
}
