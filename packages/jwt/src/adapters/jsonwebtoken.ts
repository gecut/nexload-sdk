import * as jwt from "jsonwebtoken";
import { JwtAdapter } from "../core/adapter";
import {
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";

import {
  JwtExpiredError,
  JwtInvalidError,
  JwtMalformedError,
} from "@/core/errors";

function mapJwtError(err: unknown): Error {
  if (err instanceof TokenExpiredError) {
    return new JwtExpiredError(err.message);
  }

  if (err instanceof NotBeforeError) {
    return new JwtInvalidError(err.message);
  }

  if (err instanceof JsonWebTokenError) {
    return new JwtMalformedError(err.message);
  }

  return err instanceof Error ? err : new Error("Unknown JWT error");
}

export const jsonwebtokenAdapter: JwtAdapter = {
  sign(payload, secret, policy) {
    try {
      return jwt.sign(payload, secret, {
        expiresIn: policy.expiresIn,
        issuer: policy.issuer,
        audience: policy.audience,
      });
    } catch (err) {
      throw mapJwtError(err);
    }
  },

  verify(token, secret, policy) {
    try {
      return jwt.verify(token, secret, {
        issuer: policy.issuer,
        audience: policy.audience,
      }) as object;
    } catch (err) {
      throw mapJwtError(err);
    }
  },
};
