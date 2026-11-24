import type { FieldHook } from "payload";

import { slugify } from "@nexload-sdk/persian/text";

export type SlugHookOptions = {
  name: string
  lockName: string
  source: string
  regenerateOnSourceChange: boolean
};

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

export const formatSlug: (value: string) => string = slugify;

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
