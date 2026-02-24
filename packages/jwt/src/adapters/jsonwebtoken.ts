import * as jwt from "jsonwebtoken";
import { JwtAdapter } from "../core/adapter";

import {
  JwtExpiredError,
  JwtInvalidError,
  JwtMalformedError,
} from "@/core/errors";

const jwtImpl = ((jwt as unknown as { default?: typeof jwt }).default ??
  jwt) as typeof jwt;

function mapJwtError(err: unknown): Error {
  if (
    typeof jwtImpl.TokenExpiredError === "function" &&
    err instanceof jwtImpl.TokenExpiredError
  ) {
    return new JwtExpiredError(err.message);
  }

  if (
    typeof jwtImpl.NotBeforeError === "function" &&
    err instanceof jwtImpl.NotBeforeError
  ) {
    return new JwtInvalidError(err.message);
  }

  if (
    typeof jwtImpl.JsonWebTokenError === "function" &&
    err instanceof jwtImpl.JsonWebTokenError
  ) {
    const message = err.message.toLowerCase();

    if (
      message.includes("jwt malformed") ||
      message.includes("invalid token") ||
      message.includes("jwt must be provided")
    ) {
      return new JwtMalformedError(err.message);
    }

    return new JwtInvalidError(err.message);
  }

  return err instanceof Error ? err : new Error("Unknown JWT error");
}

export const jsonwebtokenAdapter: JwtAdapter = {
  sign(payload, secret, policy) {
    try {
      const options = {
        expiresIn: policy.expiresIn,
        ...(policy.issuer ? { issuer: policy.issuer } : {}),
        ...(policy.audience ? { audience: policy.audience } : {}),
      };

      return jwtImpl.sign(payload, secret, options);
    } catch (err) {
      throw mapJwtError(err);
    }
  },

  verify(token, secret, policy) {
    try {
      const options = {
        ...(policy.issuer ? { issuer: policy.issuer } : {}),
        ...(policy.audience ? { audience: policy.audience } : {}),
      };

      return jwtImpl.verify(token, secret, options) as object;
    } catch (err) {
      throw mapJwtError(err);
    }
  },
};
