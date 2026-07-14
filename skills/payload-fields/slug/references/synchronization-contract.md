# Synchronization contract

## Factory shape

`slugField(options?)` returns readonly `[TextField, CheckboxField]`. Use:

```ts
fields: [
  { name: "title", type: "text" },
  ...slugField({ source: "title" }),
]
```

Defaults: slug name `slug`, lock name `${name}Lock`, source `title`, regeneration enabled, slug index true, lock default true/hidden, and sidebar positions.

Slug localization is enabled only by `overrides.slug.localized === true`. Lock localization is forced to match and mismatch throws. It is not inferred from the source field.

## Hook transitions

Lock is active unless the resolved lock value is exactly false.

- create + locked + non-empty string source: return normalized source;
- update + locked + source changed + non-empty + regeneration enabled: regenerate;
- update + locked otherwise: preserve previous slug;
- source changed to empty string or null: preserve previous slug;
- regeneration disabled: preserve previous locked slug on source edits;
- unlocked + string manual value: normalize the manual value;
- unlocked + non-string: return unchanged.

Dot-path source lookup works on `data` and `originalDoc`. Explicitly present null/undefined is a clear, not fallback to the old source.

Consumer `beforeValidate` hooks run first; package synchronization/normalization is appended last. Do not replace hooks after factory creation.

## Normalization

`formatSlug` performs NFKC, Persian/Arabic digit to ASCII conversion, Arabic yeh/kaf normalization, diacritic removal, whitespace/underscore to hyphen, punctuation/emoji removal, and repeated/edge hyphen collapse. Unicode letters/numbers remain.

It does not lowercase Latin, guarantee non-empty output, check uniqueness, resolve collisions, or enforce reserved words. Implement those separately with explicit persistence/access semantics.

## Nested Admin caveat

The lock path is sibling-relative to the slug field. Admin generator source uses `getDataByPath(source)` as supplied and is not automatically parent-relative. Test nested collection/group/array paths in the real form.
