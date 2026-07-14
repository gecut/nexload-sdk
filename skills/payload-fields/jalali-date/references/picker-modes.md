# Picker modes

| Mode | Calendar | Time controls | Current normalization |
|---|---:|---:|---|
| `dayOnly` | yes | no | selected local day at exact noon |
| `monthOnly` | yes | no | Jalali first day of selected month at exact noon |
| `dayAndTime` | yes | yes | selected DayPicker Date or edited local hours/minutes |
| `timeOnly` | no | yes | edits existing date, or current date when empty |

## Day only

The pure canonicalizer copies the selected date and sets local time to 12:00:00.000. Noon reduces, but does not eliminate, timezone ambiguity; storage remains ISO.

## Month only

Use `getDateLib().startOfMonth(date)` from `react-day-picker/persian`, then set local noon. Native `Date.setDate(1)` selects the first Gregorian day and is incorrect.

Regression anchor: Jalali `1403-02-15` must normalize to `1403-02-01` at exact local noon. Add Nowruz and leap-boundary cases when changing calendar math.

The current UI still renders a single-day calendar and normalizes any chosen day afterward; it is not a dedicated month picker.

## Day and time

Calendar and time controls are visible. Current calendar selection saves the Date emitted by DayPicker and may reset a previously edited time. Do not claim time preservation across date changes without a component test and corresponding implementation.

## Time only

Calendar is hidden. Existing values retain their date context when hours/minutes change. When empty, controls display 00:00 but the first edit starts from current Date and can preserve current unedited parts. Treat this as a known behavior gap until made deterministic.

Current number inputs rely on HTML min/max; native Date can roll invalid ranges and `NaN` can break ISO conversion. Validate/clamp in code before presenting the mode as hardened.
