/** Resolve a docs route against Astro's configured deployment base path. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;

  return `${base}${route}`;
}
