---
name: payload-fields-jalali-date
description: Use when adding or reviewing Jalali Payload date fields, Jalali formatting, picker appearances, timestamps, display timezones, or native date persistence.
---

# Jalali Dates

Use `jalaliDateField({ name, pickerAppearance, display })`.

- Persist native Payload ISO dates only; Jalali is presentation and input behavior.
- Pin `dayOnly` and `monthOnly` values to 12:00.
- Keep Payload field timezone separate from `display.timeZone`.
- Clear nullable values to `null`.
- Use `withJalaliTimestamps` only for root collection field arrays and treat duplicate virtual names as configuration errors.
