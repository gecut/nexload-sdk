export function formatToken(token: string): string {
  const parts = token.split(".");
  return parts.length === 3 ? `${parts[0]}.${parts[1]}.[signature]` : token;
}
