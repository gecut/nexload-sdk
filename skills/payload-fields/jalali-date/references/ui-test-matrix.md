# UI test matrix

## Field state

- valid initial ISO hydrates selected state and formatted Jalali text;
- external value update refreshes selection;
- null/invalid value renders safely without NaN controls;
- clear button and DayPicker deselect call `setValue(null)`;
- read-only disables calendar/time and hides clear;
- label targets a real input; hour/minute controls have accessible names.

## Modes

- dayOnly: calendar visible, time hidden, exact local noon;
- monthOnly: first Jalali day/noon across ordinary, Nowruz, and leap boundaries;
- dayAndTime: calendar/time visible and date changes preserve the intended time contract;
- timeOnly existing: calendar hidden and date context retained;
- timeOnly empty: deterministic documented baseline rather than current-clock leakage;
- hour/minute: reject or clamp empty, NaN, negative, 24+, and 60+ values.

## Formatting and cell

- Persian versus Latin digits affect digits only;
- timezone changes formatted output without mutating storage;
- null/invalid field display is empty;
- null/invalid cell display is an em dash;
- timezone/control mismatch is either prevented or documented.

## Virtual timestamps

`withJalaliTimestamps` returns a new top-level array and defaults both `createdAtJalali` and `updatedAtJalali`. Each is text, virtual, read-only, and populated from root sibling timestamps in `afterRead`.

Test independent opt-out, formatted source, missing source returning null, duplicate-name throw, consumer hook order, and protected structural settings. Root-collection usage is guidance; nested `siblingData` may not contain root timestamps.

## Test layers

Keep pure calendar/formatter tests fast. Add component tests for state and controls, then one real Payload Admin/browser smoke for Import Map, rendering, selection, clear, read-only, and accessibility. Current package coverage is pure only; do not claim the full matrix has passed until those tests exist.
