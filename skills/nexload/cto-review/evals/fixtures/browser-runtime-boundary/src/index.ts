import fs from "node:fs";
import process from "node:process";
export { formatToken } from "./token.js";

// Top-level Node initialization executed on module import
const secretFile = process.env.SECRET_FILE_PATH ?? "/etc/secrets/key.pem";
export const signingSecret = fs.readFileSync(secretFile, "utf8");

export function signPayload(data: string): string {
  return `${data}.${Buffer.from(signingSecret).toString("base64")}`;
}
