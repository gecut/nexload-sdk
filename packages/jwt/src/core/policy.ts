export interface JwtPolicy {
  expiresIn: number;
  issuer?: string;
  audience?: string;
}
