const keys = ["password", "token", "secret", "apiKey", "authorization", "cookie", "otp", "phone", "mobile", "merchant"];

export const DEFAULT_REDACT_PATHS: readonly string[] = [
  ...keys.flatMap((key) => [key, `*.${key}`]),
  "req.headers.authorization", "req.headers.cookie", "headers.authorization", "headers.cookie", "body", "req.body",
];
