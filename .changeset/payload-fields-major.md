---
"@nexload-sdk/payload-fields": major
---

Rebuild Payload field factories around managed Unicode slugs, Jalali dates, integer minor-unit money values, and server-side slug generation. Month-only Jalali selections now persist the first Jalali day of the selected month at canonical local noon. Slug generation rejects malformed or inherited registry keys, and locked slugs retain their prior value when a source is cleared with null.
