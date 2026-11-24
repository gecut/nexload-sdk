import type { CheckboxField, FieldHook, TextField, TextFieldSingleValidation } from "payload";

import { text } from "payload/shared";

import { assertProtected } from "../internal/protect";
import { formatSlugHook } from "./format-slug";

export type SlugFieldOptions = {
  unique?: boolean
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
  const unique = options.unique ?? true;
  const format = formatSlugHook({ name, lockName, source, regenerateOnSourceChange: options.regenerateOnSourceChange ?? true });
  const normalize: FieldHook = async (args) => {
    const base = await format(args);

    if (!unique || typeof base !== "string" || !base || !args.req?.payload || !args.collection?.slug || (args.path && (Array.isArray(args.path) ? args.path.length !== 1 || args.path[0] !== name : args.path !== name))) return base;
    const id = args.originalDoc?.id ?? (args as typeof args & { id?: string | number }).id;

    for (let n = 1; n <= 50; n++) {
      const candidate = n === 1 ? base : `${base}-${n}`;
      const found = await args.req.payload.find({
        collection: args.collection.slug,
        where: { and: [{ [name]: { equals: candidate } }, ...(id !== undefined && id !== null ? [{ id: { not_equals: id } }] : [])] },
        limit: 1, depth: 0, pagination: false, locale: args.req.locale ?? undefined, req: args.req, overrideAccess: true,
      });

      if (!found.docs.length) return candidate;
    }

    return base;
  };
  const consumerValidate = slugOverrides.validate;
  const validate: TextFieldSingleValidation = (value, args) => {
    const result = text(value, args);

    if (result !== true) return result;

    return consumerValidate ? (consumerValidate as TextFieldSingleValidation)(value, args) : true;
  };
  const slug: TextField = {
    ...slugOverrides,
    name,
    type: "text",
    index: unique ? true : slugOverrides.index,
    unique,
    validate,
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
        normalize
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
