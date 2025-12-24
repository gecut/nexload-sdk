import { JwtPolicy } from "./core/policy";
import { SecretProvider } from "./core/secret";
import { jsonwebtokenAdapter } from "./adapters/jsonwebtoken";
import { Sha256SecretProvider } from "./providers/sha256-secret";

export function createJwt<T extends object>(config: {
  secret: string | SecretProvider;
  policy: JwtPolicy;
}) {
  const provider =
    typeof config.secret === "string"
      ? new Sha256SecretProvider(config.secret)
      : config.secret;

  const adapter = jsonwebtokenAdapter;

  return {
    sign(payload: T): string {
      return adapter.sign(payload, provider.derive(), config.policy);
    },

    verify(token: string): T {
      return adapter.verify(token, provider.derive(), config.policy) as T;
    },
  };
}
