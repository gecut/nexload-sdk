import { JwtPolicy } from "./policy";

export interface JwtAdapter {
  sign(payload: object, secret: string, policy: JwtPolicy): string;
  verify(token: string, secret: string, policy: JwtPolicy): object;
}
