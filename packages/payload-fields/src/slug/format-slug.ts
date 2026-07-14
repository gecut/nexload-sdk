import type { FieldHook } from "payload";

export type SlugHookOptions = {
  name: string
  lockName: string
  source: string
  regenerateOnSourceChange: boolean
};

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits (value: string): string {
  return value.replace(
    /[۰-۹٠-٩]/g, (digit) => {
      const index = persianDigits.indexOf(digit);
      return String(index >= 0 ? index : arabicDigits.indexOf(digit));
    }
  );
}

function getPath (
  value: unknown, path: string
): unknown {
  return path.split(".").reduce<unknown>(
    (
      current, key
    ) => {
      if (current && typeof current === "object") return (current as Record<string, unknown>)[key];
      return undefined;
    }, value
  );
}

function hasPath (
  value: unknown, path: string
): boolean {
  return path.split(".").every((key) => {
    if (!value || typeof value !== "object" || !(key in value)) return false;
    value = (value as Record<string, unknown>)[key];
    return true;
  });
}

export function formatSlug (value: string): string {
  return normalizeDigits(value.normalize("NFKC"))
    .replace(
      /[يى]/g, "ی"
    )
    .replace(
      /ك/g, "ک"
    )
    .replace(
      /[\u064B-\u065F\u0670]/g, ""
    )
    .replace(
      /[\s_]+/g, "-"
    )
    .replace(
      /[^\p{L}\p{N}-]+/gu, ""
    )
    .replace(
      /-+/g, "-"
    )
    .replace(
      /^-+|-+$/g, ""
    );
}

export const formatSlugHook = (options: SlugHookOptions): FieldHook => ({
  data,
  operation,
  originalDoc,
  siblingData,
  previousSiblingDoc,
  value,
}) => {
  const lock = siblingData?.[options.lockName] ?? data?.[options.lockName];
  const previousSlug = previousSiblingDoc?.[options.name] ?? originalDoc?.[options.name];
  const sourceChanged = hasPath(
    data, options.source
  )
  && getPath(
    data, options.source
  ) !== getPath(
    originalDoc, options.source
  );
  const source = hasPath(
    data, options.source
  )
    ? getPath(
      data, options.source
    )
    : getPath(
      originalDoc, options.source
    );

  if (lock !== false && typeof source === "string" && source.trim() && (operation === "create" || (options.regenerateOnSourceChange && sourceChanged))) {
    return formatSlug(source);
  }

  if (operation === "update" && lock !== false && sourceChanged && !source && previousSlug !== undefined) {
    return previousSlug;
  }

  if (lock !== false && operation === "update" && previousSlug !== undefined) return previousSlug;
  if (typeof value === "string") return formatSlug(value);
  return value;
};
