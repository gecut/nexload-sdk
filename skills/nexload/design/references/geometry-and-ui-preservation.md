# Geometry and UI preservation

## Coherent geometry

Define a small set of roles rather than one radius for everything:

- controls share compatible heights, padding, borders, and focus geometry;
- nested surfaces usually do not look more prominent than their containers;
- radius and elevation increase only when hierarchy or interaction requires it;
- pills and circles are semantic shapes, not a shortcut for inconsistent rounding.

Consistency means the relationship is understandable, not that every value is identical. A marketing hero, data table, input, and avatar can need different geometry.

## Preserve approved UI

When visuals are locked:

1. Capture representative states before editing.
2. Record computed values for affected colors, spacing, typography, radii, and layout.
3. Refactor tokens/selectors/layout ownership without changing those outputs.
4. Compare strict screenshots at the same viewport, content, fonts, theme, direction, and state.
5. Treat a changed baseline as a product decision requiring explicit approval, not as validator cleanup.

If the approved source and current runtime disagree, surface the mismatch before choosing one.

## Exceptions

- Keep one-off geometry local when it belongs to illustration, editorial composition, data visualization, or a single product identity moment.
- Keep physical coordinates for artwork that should not mirror in RTL.
- Keep document-flow margins when they own prose rhythm, including physical indentation when that is part of the approved composition; do not convert it to logical geometry without visual evidence and approval.
- Do not create global tokens from accidental repeated numbers alone.

## Cross-skill boundary

This skill preserves obvious hooks such as focus styles and reduced-motion media queries, but comprehensive keyboard/screen-reader/contrast acceptance belongs to accessibility guidance. Animation choreography and easing belong to motion guidance. Visual regression infrastructure belongs to testing guidance; bundle/render cost belongs to performance guidance.

## Handoff evidence

Report viewport and direction coverage, screenshots or computed-style comparisons, changed roles, retained exceptions, and whether visual baselines were unchanged or explicitly approved.

## Primary sources

- W3C CSS, [Box Model](https://www.w3.org/TR/css-box-4/)
- W3C CSS, [Media Queries](https://www.w3.org/TR/mediaqueries-5/)
