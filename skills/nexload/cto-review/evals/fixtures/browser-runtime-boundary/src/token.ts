export function formatToken(raw: string): string {
  if (!raw.includes(".")) return raw;
  const [header, payload] = raw.split(".");
  return `${header}.${payload}.[redacted]`;
}
