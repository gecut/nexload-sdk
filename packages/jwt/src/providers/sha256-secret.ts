import { createHash } from "crypto";
import { SecretProvider } from "../core/secret";

export class Sha256SecretProvider implements SecretProvider {
  constructor(private readonly raw: string) {}

  derive(): string {
    return createHash("sha256").update(this.raw).digest("hex").slice(0, 32);
  }
}
