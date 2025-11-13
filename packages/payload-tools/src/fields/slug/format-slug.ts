import type { FieldHook } from "payload";

export function formatSlug (val: string): string | undefined {
  const formatted = val
    ?.replace(
      / /g, "-"
    )
    .replace(
      /[^\w-]+/g, ""
    )
    .toLowerCase();

  return formatted;
}

export const formatSlugHook
  = (fallback: string): FieldHook => ({ data, operation, value, }) => {
    if (typeof value === "string") {
      return formatSlug(value);
    }

    if (operation === "create" || data?.slug === undefined) {
      const fallbackData = data?.[fallback];

      if (typeof fallbackData === "string") {
        return formatSlug(fallbackData);
      }
    }

    return value;
  };
