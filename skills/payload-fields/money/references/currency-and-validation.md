# Currency and validation

## Currency definitions

Use `"IRR"`, `"IRT"`, or a custom `{ code, label, fractionDigits }`. Custom code/label must be nonblank and fraction digits an integer from 0 through 20. Resolved metadata is passed to Admin and stored in `custom.nexload.money`.

Changing fraction digits or currency on an existing field changes value interpretation and requires migration.

## Field validation order

Built-in validation runs before `overrides.validate`:

1. null/undefined/empty is true unless Payload passes required;
2. value must be a safe integer number;
3. negative is rejected unless allowed;
4. min/max minor-unit bounds are enforced;
5. consumer validation runs only after package invariants pass.

Consumer validators cannot accept structurally invalid or out-of-policy values. Test this order when composing rules.

Bounds must be safe integers and min <= max. Semantic bounds drive package validation but are not automatically copied into Payload native `min`/`max`; avoid conflicting override bounds.

## Formatting

`formatMoney(null | undefined)` returns null. Other values must be safe integers. Formatting divides by currency scale, uses grouping by default, enforces exact fraction digits, and appends the currency label unless `showCurrency` is false.

Default locale is `fa-IR`. `digits: "latin"` selects `fa-IR-u-nu-latn` only when locale is not explicitly supplied; an explicit locale wins.

## Admin behavior

Admin displays major units without currency text inside the input and renders the label separately. Valid input immediately becomes a minor-unit integer; blank becomes null. Invalid/partial text is temporarily passed as a string so the user can continue editing and server validation can reject submission.

Keep the package-owned Admin component path and do not parse again in hooks.
