---
name: payload-fields-jalali-date
description: Use when adding, migrating, debugging, or reviewing @nexload-sdk/payload-fields Jalali date behavior, including native ISO persistence, Persian presentation, display timezone boundaries, dayOnly/dayAndTime/timeOnly/monthOnly picker modes, canonical local noon, Jalali month normalization, null/clear behavior, virtual Jalali timestamps, Admin UI limitations, or date-focused tests.
---

# Payload Jalali Date Fields

## Purpose

Preserve native Payload date storage while providing explicit, tested Jalali presentation and picker behavior across timezone and mode boundaries.

## Trigger boundary

- Use for `jalaliDateField`, `formatJalaliDate`, picker modes, timezone display, nulls, Admin date UI, and `withJalaliTimestamps`.
- Do not use for generic Import Map architecture, money, slugs, or non-Payload date arithmetic.
- Compose with `payload-fields-core` only when exports, protected overrides, or consuming Import Map setup also change.

## Source of truth

Use date factory/formatter source, Admin field/cell/helper source, package tests, README, and actual browser behavior. Treat docs claims unsupported by component tests as caveats, not guarantees.

## Required inspection

Read `src/date/index.ts`, `format-date.ts`, picker types, Admin date field/cell and canonicalization helper, both package test files, package exports, and the consuming Payload timezone/configuration.

## Decision flow

1. Keep storage as a native Payload ISO date and choose the presentation timezone.
2. Choose one of four picker appearances from required user behavior.
3. Define canonicalization, null/clear, and time-edit behavior explicitly.
4. Use virtual timestamps only for derived read-only presentation.
5. Add pure date tests and Admin component/browser coverage for the selected mode.

## Implementation workflow

1. Write a failing test for the exact Jalali date and local-time result.
2. Put calendar arithmetic in a pure helper using the Persian DateLib; avoid native Gregorian `setDate(1)` for month-only.
3. Persist through `toISOString()` and clear with `null`.
4. Test formatter timezone/digits separately from picker local-time editing.
5. Verify Admin accessibility, read-only, invalid input, and external value updates.

## Invariants

- Jalali is input/presentation only; persistence is a normal ISO date value.
- `dayOnly` canonicalizes the selected local day to 12:00:00.000.
- `monthOnly` uses Jalali-aware start-of-month, then canonical local noon.
- `dayAndTime` and `timeOnly` retain date/time context only to the extent tested; do not overclaim current UI behavior.
- `display.timeZone` changes formatting only, not stored instant or picker arithmetic.
- Clear/deselect persists `null`; invalid formatter input returns `null`.
- Virtual timestamps are read-only, non-persisted derived text fields.

## Security and edge cases

Local noon depends on browser/runtime timezone and may map to a different UTC date substring. Invalid IANA timezones throw. Current Admin gaps include unvalidated time inputs, inconsistent empty `timeOnly`, date selection potentially resetting prior time, and missing full component/accessibility coverage; preserve these as known caveats until fixed and tested.

## Verification

Run package build/lint/test. Cover 1403-02-15 to 1403-02-01, Nowruz/leap boundaries, local noon, ISO/null persistence, four modes, timezone formatting, invalid values, clear/read-only flows, virtual timestamp defaults/opt-outs/collisions/hook order, and Admin accessibility.

## Reference routing

- Read [persistence and timezone](references/persistence-and-timezone.md) before choosing storage/display behavior.
- Read [picker modes](references/picker-modes.md) for current mode contracts and caveats.
- Read [UI test matrix](references/ui-test-matrix.md) before claiming Admin behavior complete.

## Handoff requirements

State storage format, browser/display timezone assumptions, mode, canonicalization, null behavior, virtual fields, known UI caveats, exact pure/component/browser tests, and any data migration impact.
