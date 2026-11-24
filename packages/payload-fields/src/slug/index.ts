import type { CheckboxField, TextField } from "payload";

import { assertProtected } from "../internal/protect";
import { formatSlugHook } from "./format-slug";

export type SlugFieldOptions = {
  name?: string
  lockName?: string
  source?: string
  generator?: string
  regenerateOnSourceChange?: boolean
  overrides?: { slug?: Partial<TextField>, lock?: Partial<CheckboxField> }
};

export type SlugFieldResult = readonly [TextField, CheckboxField];

export function slugField (options: SlugFieldOptions = {}): SlugFieldResult {
  const name = options.name ?? "slug";
  const lockName = options.lockName ?? `${name}Lock`;
  const source = options.source ?? "title";
  const localized = options.overrides?.slug?.localized === true;

  if (options.overrides?.lock?.localized !== undefined && options.overrides.lock.localized !== localized) throw new Error("Slug lock localization must match slug localization.");

  const slugOverrides = options.overrides?.slug ?? {};
  const lockOverrides = options.overrides?.lock ?? {};
  assertProtected(slugOverrides, name, "text", "Slug field");
  assertProtected(lockOverrides, lockName, "checkbox", "Slug lock");
  const consumerHooks = slugOverrides.hooks?.beforeValidate ?? [];
  const slug: TextField = {
    ...slugOverrides,
    name,
    type: "text",
    index: slugOverrides.index ?? true,
    localized,
    admin: {
      ...slugOverrides.admin,
      position: slugOverrides.admin?.position ?? "sidebar",
      components: {
        ...slugOverrides.admin?.components,
        Field: {
          path: "@nexload-sdk/payload-fields/admin/slug-field#SlugFieldComponent",
          clientProps: { source, lockName, generator: options.generator, },
        },
      },
    },
    custom: { ...slugOverrides.custom, nexload: { ...(slugOverrides.custom?.nexload as object), slug: { source, lockName, generator: options.generator, }, }, },
    hooks: {
      ...slugOverrides.hooks, beforeValidate: [
        ...consumerHooks,
        formatSlugHook({ name, lockName, source, regenerateOnSourceChange: options.regenerateOnSourceChange ?? true, })
      ],
    },
  } as TextField;
  const lock: CheckboxField = {
    ...lockOverrides,
    name: lockName,
    type: "checkbox",
    localized,
    defaultValue: true,
    admin: { ...lockOverrides.admin, hidden: true, position: lockOverrides.admin?.position ?? "sidebar", },
  } as CheckboxField;

  return [
    slug,
    lock
  ];
}

export * from "./format-slug";
