import { formatSlugHook } from "./format-slug";

import type { CheckboxField, TextField } from "payload";

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
  if (options.overrides?.slug?.name && options.overrides.slug.name !== name) throw new Error("Slug field name is protected.");
  if (options.overrides?.lock?.name && options.overrides.lock.name !== lockName) throw new Error("Slug lock name is protected.");
  if (options.overrides?.lock?.localized !== undefined && options.overrides.lock.localized !== localized) throw new Error("Slug lock localization must match slug localization.");
  if (options.overrides?.slug?.type && options.overrides.slug.type !== "text") throw new Error("Slug field type is protected.");
  if (options.overrides?.lock?.type && options.overrides.lock.type !== "checkbox") throw new Error("Slug lock type is protected.");

  const slugOverrides = options.overrides?.slug ?? {};
  const lockOverrides = options.overrides?.lock ?? {};
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
