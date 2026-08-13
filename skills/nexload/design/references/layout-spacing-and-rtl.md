# Layout, spacing, and RTL

## Ownership

The common parent owns relationships among siblings. Prefer `gap`, grid tracks, shared padding, and explicit alignment over each child guessing its position with margins.

```css
.actions {
  display: flex;
  align-items: center;
  gap: var(--space-actions);
}
```

Child margins remain appropriate when spacing is intrinsic to document flow, such as prose rhythm, or part of a clearly documented component contract. Preserve whether an approved editorial indent is physical or logical; prose semantics alone do not authorize mirroring a locked composition. Change that direction behavior only with rendered evidence and explicit visual approval. Do not replace readable article margins with wrapper machinery merely to ban margins.

## Alignment

- Establish a shared container/grid anchor for headings, content, controls, and section edges that should align.
- Let intentional breakouts declare their exception instead of approximating alignment with arbitrary offsets.
- Keep source order meaningful; visual reordering must not obscure reading or interaction order.
- Prefer content-driven widths and `minmax()`, wrapping, and intrinsic sizing over fixed desktop assumptions.

## RTL and directional geometry

Use logical properties for product layout:

- `margin-inline`, `padding-inline`, `inset-inline-start/end`;
- `border-start-start-radius` and related logical corners when direction changes the role;
- `text-align: start` and direction-aware flex/grid alignment.

Physical `left`, `right`, and physical corners are justified for coordinate-based artwork, charts, or media whose geometry must not mirror. Keep that exception local and comment the visual reason when it is not obvious.

## Responsive checks

- Start with the narrow layout and add complexity when content requires it.
- Test long Persian/English labels, localized numbers, empty content, zoom, and direction changes.
- Watch for `min-width`, fixed heights, absolute positioning, and overflow that can hide actions.
- Breakpoints follow content failure, not a device-name catalog.

## Primary sources

- W3C CSS, [CSS Logical Properties and Values](https://www.w3.org/TR/css-logical-1/)
- W3C CSS, [Box Alignment](https://www.w3.org/TR/css-align-3/)
- Tailwind CSS, [Gap](https://tailwindcss.com/docs/gap)
