/** Resolve a docs route against Astro's configured deployment base path. */
export function withBase(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:")) {
    return path;
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;

  return `${base}${route}`;
}

