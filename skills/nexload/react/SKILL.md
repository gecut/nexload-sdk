---
name: nexload-react
description: "Use when the primary task changes or reviews React component or hook behavior and locality in Nexload: render purity, state/effect ownership, component file boundaries, named exports and props, narrow client/browser boundaries, or Payload Admin component contracts and entrypoint placement. Use nexload-package when publication is primary. Do not use for visual styling, accessibility or motion audits, test strategy, performance profiling, or detailed Next.js/Payload policy."
---

# Nexload React Engineering

## Purpose

Keep React modules predictable by making render, state, effects, component ownership, and runtime boundaries explicit without forcing framework-specific policy into every component.

## Trigger boundary

- Use for React component/hook implementation, review, or refactoring, including Payload Admin UI components.
- Compose with `nexload-code` for language-wide type or trust-boundary work, `nexload-package` for exports/peer metadata, and `nexload-design` for visual-system decisions.
- Use installed specialists for route caching/actions, Payload access/config policy, accessibility, motion, testing, and performance. Otherwise bound those decisions, preserve obvious safety and behavior, and report the deferred work.

## Source of truth

Prefer the target component, its callers, the package entrypoints, repo TypeScript/ESLint settings, and current React/framework documentation. Treat existing code as evidence, not automatic precedent; record conflicts rather than broadening the task into migration work.

## Required inspection

Read the complete component and adjacent hooks/helpers, its imports and callers, relevant tests or stories, and the nearest package entrypoints. Identify server/client ownership and browser-only APIs. For Payload Admin UI, inspect the dedicated admin subpath and the field/component contract before changing code.

## Decision flow

1. State the component's responsibility and runtime owner.
2. Separate render-time derivation, event work, and external synchronization.
3. Keep canonical state minimal; derive everything else during render when pure and cheap.
4. Place the client boundary at the smallest interactive subtree that needs it.
5. Confirm whether an apparent React issue instead belongs to code, package, design, Next.js, Payload, accessibility, motion, testing, or performance policy.

## Implementation workflow

1. Reproduce or characterize current behavior before restructuring.
2. For new or non-breaking component surfaces, define a named props contract and named export; preserve framework-required or established public default exports.
3. Move user-caused work into handlers and reserve effects for synchronizing with external systems.
4. Prefer host platform APIs and existing repo dependencies over wrappers.
5. Keep one significant component per file; follow `nexload-code` kebab-case filenames for components and use `_`-prefixed kebab-case names for private local modules when extraction helps.
6. Preserve public behavior and update only the directly affected tests/docs.

## Invariants

- Rendering and Hooks are pure: no mutation of non-local values or externally visible work during render.
- State has one clear owner; redundant or contradictory state is removed.
- Effects synchronize with external systems and include complete cleanup/dependency reasoning.
- Named exports and named props contracts are Nexload defaults for new public components; framework contracts, prop-free components, and public compatibility are explicit exceptions.
- One significant component per file and `_`-prefixed private locality are prospective Nexload defaults, not universal syntax rules; tests, stories, generated files, and tightly coupled trivial helpers may stay grouped.
- Component identifiers remain PascalCase, while component filenames whose exact names are not externally mandated follow the repository-wide kebab-case rule owned by `nexload-code`; externally reserved and generated filenames keep their required names.
- Browser-only code and `"use client"` remain as local as practical.
- Payload Admin components use deliberate admin entrypoints rather than leaking client dependencies through a server-safe root.

## Security and edge cases

Trust follows provenance, not React transport. Validate URL, storage, network, user, and server ingress before preserving their typed contract downstream; internal canonical props do not need redundant validation. Avoid raw HTML unless sanitization and ownership are explicit. Handle stale async work, cleanup, empty/error/loading states, controlled transitions, hydration-sensitive values, and read-only behavior when the changed component can encounter them.

## Verification

Run the narrowest applicable typecheck, lint, component tests, and package build. Exercise only affected lifecycle and state lanes—such as updates, cleanup, async races, read-only behavior, or server/client import safety. Do not claim browser or Payload integration coverage unless it ran.

## Reference routing

- Read [component contracts and locality](references/component-contracts-and-locality.md) for exports, props, file ownership, and exceptions.
- Read [state, effects, and runtime boundaries](references/state-effects-and-runtime-boundaries.md) for render/event/effect decisions and client placement.
- Read [Payload Admin composition and verification](references/payload-admin-and-verification.md) for admin entrypoints, cross-skill boundaries, and handoff evidence.

## Handoff requirements

State the component/runtime boundary, state and effect ownership, public/private file decisions, exceptions used, behavior preserved or changed, commands actually run, and any work deferred to another skill.
