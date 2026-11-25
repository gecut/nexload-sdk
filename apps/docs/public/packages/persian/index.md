# Overview & Quick Start

Persian and Iranian utilities.

**Topic:** overview
**Package:** `@nexload-sdk/persian` v0.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/persian/
**Package:** `@nexload-sdk/persian`

**Workspace version:** `0.0.0` (unreleased)

Zero-dependency Persian and Iranian utilities: digits, text, mobile, national code, bank, money, Jalali dates.

[Source](https://github.com/gecut/nexload-sdk/tree/main/packages/persian)

Normalize input and format output with explicit units and time zones.

```ts
import { normalizeIranMobile } from "@nexload-sdk/persian/mobile";
import { money, formatMoney } from "@nexload-sdk/persian/money";
import { formatJalali } from "@nexload-sdk/persian/date";

const mobile = normalizeIranMobile("۰۹۱۲۳۴۵۶۷۸۹");
const price = formatMoney(money(12500, "IRR"));
const date = formatJalali("2024-03-20T12:00:00+03:30");
```

## Installation

This package is unreleased. From a consumer in this SDK workspace:

```bash
pnpm add '@nexload-sdk/persian@workspace:*'
```

For the optional `./zod` subpath, install `zod` separately.

## Compatibility

| Runtime | Requirements |
|---|---|
| Node.js | 20 or newer |
| Bun, Edge, browser | `Intl` timezone data for dates |
| Zod subpath | Zod 4.1 or newer, below 5, installed separately |

The core has no runtime dependencies.

## When to use

* Normalize and validate Iranian identifiers and bank details.
* Format money with explicit units and Jalali dates in a chosen timezone.
* Search Persian text and look up provinces.

See [guides](./guides/) and the [API inventory](./api/).

## Next steps

[Optimization](./optimization/)

[Agent usage](./agents/)

[Playground](./playground/)
