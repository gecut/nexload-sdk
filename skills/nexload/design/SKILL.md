---
name: nexload-design
description: "Use when the primary task changes or reviews rendered visual behavior or CSS-system rules in Nexload: semantic tokens, spacing/alignment ownership, radius/control/surface roles, responsive or zoom/long-content layout, RTL-safe geometry, or UI-locked CSS cleanup. Do not use for React behavior, package metadata, CSS build-tool configuration, comprehensive accessibility audits, motion, test strategy, or performance profiling."
---

# Nexload Design Engineering

## Purpose

Create coherent, adaptable interfaces by expressing visual intent through shared roles and layout ownership while preserving approved product identity.

## Trigger boundary

- Use for design-token architecture, visual hierarchy, spacing/alignment, radii, controls, surfaces, responsive composition, RTL-safe styling, and UI-locked cleanup.
- Compose with `nexload-react` for component behavior, `nexload-code` for program structure, and `nexload-package` for distributable style entrypoints.
- Use installed specialists for full accessibility, motion, visual-test strategy, and performance policy. Otherwise preserve the approved geometry, state concrete acceptance questions, flag obvious harm, and report the deferred implementation.

## Source of truth

Use the approved design or current production UI, existing tokens/theme, shared primitives, responsive states, and actual rendered screenshots. Treat one-off CSS and framework defaults as evidence, not automatically as system rules.

## Required inspection

Inspect the affected surface at representative supported widths and directions. Read the relevant token/theme source, parent layout, child styles, shared controls/surfaces, and approved visual references or snapshots before changing values.

## Decision flow

1. State whether the task changes appearance or must preserve it.
2. Inventory primitives, semantic roles, component aliases, and raw one-offs in the affected surface.
3. Assign spacing and alignment to the common parent where it coordinates siblings.
4. Check geometry, controls, surfaces, responsive states, and RTL together.
5. Distinguish reusable system rules from justified illustration/editorial exceptions.
6. Route behavior, accessibility, motion, testing, or performance decisions to their owning skill.

## Implementation workflow

1. Capture the current/approved states before editing.
2. Reuse or introduce the smallest semantic role that expresses real shared intent.
3. Prefer parent layout/gap where the parent owns a repeated sibling relationship; retain deliberate document-flow, slot, distributed, or parent-inaccessible spacing.
4. Use logical properties for directional layout and keep physical positioning only where the artwork truly requires it.
5. Align radii, control heights, borders, and surface elevation by role, not arbitrary sameness.
6. Compare rendered states and update baselines only when visual change is explicitly approved.

## Invariants

- Components consume semantic roles; raw palette/spacing primitives remain implementation detail where practical.
- Every repeated spacing relationship has an explicit owner; the common parent is the default when it controls the siblings, with deliberate exceptions documented.
- Shared alignment anchors are explicit across related sections.
- Radius, control, and surface choices form a small coherent system tied to hierarchy.
- Layout preserves its supported responsive and direction behavior through logical geometry; mobile-first is the default for new surfaces, not a migration mandate.
- UI-preservation requests keep approved appearance stable while internals improve.
- One-off geometry, physical artwork positioning, and document-flow margins are allowed when their visual ownership is explicit and reuse would distort intent.

## Security and edge cases

Prevent overlays, clipping, fixed dimensions, long content, zoom, or direction changes from hiding essential controls or content. Preserve focus visibility and reduced-motion/contrast hooks already present, but route comprehensive accessibility or motion decisions to their dedicated standards. Do not encode user content into arbitrary CSS values or URLs without validation.

## Verification

Run relevant style/build checks and compare representative supported breakpoints, directions, themes, and interaction states. Add long/empty content and zoom when the affected surface can fail there. For UI-locked work, use strict before/after screenshots and do not approve baseline changes implicitly.

## Reference routing

- Read [tokens and semantic roles](references/tokens-and-semantic-roles.md) for token layers, naming, and exceptions.
- Read [layout, spacing, and RTL](references/layout-spacing-and-rtl.md) for ownership, alignment, responsive flow, and logical geometry.
- Read [geometry and UI preservation](references/geometry-and-ui-preservation.md) for radii, controls, surfaces, approved-state checks, and cross-skill boundaries.

## Handoff requirements

State whether visuals changed, roles/tokens affected, spacing/alignment owner, RTL/responsive evidence, exceptions retained, screenshots/checks actually run, baseline policy, and work deferred to another skill.
