export interface SignerOptions {
  readonly secretKey: string;
}

export class HeaderSigner {
  constructor(private readonly options: SignerOptions) {}

  sign(payload: string): string {
    return `sig_${Buffer.from(payload + this.options.secretKey).toString("base64")}`;
  }
}

// Unintentional public leakage of internal low-level helper with local blast radius
export function _internalNormalizeHeaderCase(raw: string): string {
  return raw.trim().toLowerCase();
}
