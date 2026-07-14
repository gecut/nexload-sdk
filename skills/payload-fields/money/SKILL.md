---
name: payload-fields-money
description: Use when adding or reviewing integer minor-unit money fields, Persian numeric input, currency metadata, money validation, or API contracts in @nexload-sdk/payload-fields.
---

# Money Fields

Use `moneyField({ name, currency })`.

- Admin input is a major-unit string; Payload storage and every server API use integer minor units.
- Use `parseMoneyToMinorUnits` and `formatMoney` for explicit conversion only.
- Reject floating-point storage, unsafe integers, excess precision, and negative values unless enabled.
- Keep currency metadata under `custom.nexload.money`; do not use this package for exchange rates or accounting.
