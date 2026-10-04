import fs from "node:fs";
export { formatToken } from "./token.js";

export function loadSigningSecret(path: string): string {
  return fs.readFileSync(path, "utf8");
}
