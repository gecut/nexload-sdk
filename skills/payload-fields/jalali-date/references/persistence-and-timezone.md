# Persistence and timezone

## Native storage

`jalaliDateField` returns a Payload `date` field. The Admin component saves `Date.toISOString()` and clears with `null`. Do not store Jalali strings, split year/month/day columns, or duplicate timestamps.

The factory defaults to Persian digits and medium Jalali date display. `dayAndTime` and `timeOnly` additionally default to short time presentation.

## Formatting

`formatJalaliDate(value, options)` uses `Intl.DateTimeFormat` with the Persian calendar. It accepts Date/string/number, returns null for null/undefined/invalid date values, and supports short/medium/long/full date style, short/medium time style, Persian/Latin digits, and IANA timezone.

An invalid IANA timezone throws; only invalid date values normalize to null. Validate configured timezone during startup/build.

## Timezone boundary

`display.timeZone` affects formatted presentation only. It does not alter:

- the stored ISO instant;
- picker calendar arithmetic;
- local `setHours` canonical noon;
- hours/minutes edited by Admin controls.

The picker uses browser-local `Date` semantics. A stored local noon instant may have a previous/next UTC date substring in some zones. Define acceptance in terms of the selected Jalali day in the intended local/display zone, not string slicing the ISO value.

If display timezone differs from browser timezone, formatted text and time controls can disagree. Either align application/browser expectations or expose this caveat and test the intended deployment.

## Migration

Moving from stored Jalali strings to ISO dates requires an explicit timezone-aware data migration. Formatting-only changes require no persistence migration. Adding a new nullable field can still require a schema migration or deployment step in the consuming Payload app; inspect its database adapter, migration workflow, and generated schema before claiming otherwise. Never infer historical timezone silently.
