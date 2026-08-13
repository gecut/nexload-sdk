# Tokens and semantic roles

## Layers

Use the minimum useful layers:

1. **Primitives** name raw scales, such as `--blue-600` or `--space-4`.
2. **Semantic roles** name product intent, such as `--color-action-primary` or `--space-section`.
3. **Component aliases** are optional when a component has a stable, distinct contract, such as `--button-primary-bg`.

Components should usually consume semantic roles. This makes theme changes and product-wide corrections possible without searching every component for raw values.

```css
:root {
  --blue-600: oklch(55% 0.2 255);
  --color-action-primary: var(--blue-600);
  --space-control-inline: 1rem;
}

.button-primary {
  color: var(--color-on-action);
  background: var(--color-action-primary);
  padding-inline: var(--space-control-inline);
}
```

## Decision rules

- Add a semantic role when two or more consumers share intent, or when a single public role must vary by theme/product.
- Reuse an existing role only when its meaning matches; visual coincidence is insufficient.
- Keep names independent of current color, size, DOM position, or framework utility.
- Map Tailwind theme utilities to the same roles when Tailwind is present; do not create a parallel token language.
- A justified one-off is better than a falsely generic token. Record why it is local.
- Do not convert every literal automatically. Typography metrics, artwork coordinates, or isolated editorial composition may be intentionally local.

## Review checklist

- Can dark/high-contrast themes change the role without editing components?
- Does the role describe purpose rather than present appearance?
- Are deprecated roles migrated deliberately rather than silently aliased forever?
- Does a component alias add a stable contract, or merely another indirection?

## Primary sources

- W3C CSS, [Custom Properties for Cascading Variables](https://www.w3.org/TR/css-variables-1/)
- Tailwind CSS, [Theme variables](https://tailwindcss.com/docs/theme)
