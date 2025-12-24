export interface SecretProvider {
  derive(): string;
}
