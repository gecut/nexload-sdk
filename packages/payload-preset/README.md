# @nexload-sdk/payload-preset

Plain Payload plugins for Persian defaults, the SDK logger, field hooks, and audit logging. Use in Node.js Payload configuration only. This package is ESM only.

```sh
pnpm add @nexload-sdk/payload-preset payload @payloadcms/translations
```

```ts
import { configureLogger } from '@nexload-sdk/logger';
import { nexloadPreset } from '@nexload-sdk/payload-preset';
import { buildConfig } from 'payload';

configureLogger({ service: 'shop-cms' }); // Before buildConfig.
export default buildConfig({
  // Add db, secret, and collections here.
  plugins: [...nexloadPreset()],
});
```

| Option | Default | Purpose |
| --- | --- | --- |
| `persian` | `true` | Add Persian admin defaults. |
| `logger` | `true` | Apply SDK logging settings when the host leaves `config.logger` unset. |
| `fields` | `{}` | Options for `payloadFieldsPlugin`; `false` disables it. |
| `audit` | `{}` | Options for `auditPlugin`; `false` disables it. |

Call `configureLogger()` before `buildConfig()` to set the service name and other logging options. The plugin reads those options when Payload runs it. Payload creates its own logger with SDK redaction, serializers, request context, formatting, and any explicit destination. It uses standard pino levels and maps `success` to `warn` for filtering. Rebuild the Payload config to apply a forced SDK reconfiguration.

The Persian plugin never adds locales or creates localization. It sets RTL only on existing `fa` locale objects without an explicit value, preserves host defaults and languages, and adds Tehran to supported timezones. Plugins never change collection fields. Audit logs identifiers and counts, not bodies, emails, or tokens. Reads are disabled by default.

| Plugin | Order |
| --- | ---: |
| `payloadFieldsPlugin` | 900 |
| `auditPlugin` | 1000 |

Payload sorts plugins by order, allowing ordinary host plugins to add collections first.

- Payload creates its implicit `users` auth collection after plugins run, so audit cannot target it; explicitly declare it for auth and write events. See [payload-hooks](../payload-hooks/README.md).
- Audit write events occur before transaction commit and may describe rolled-back changes. See [payload-hooks](../payload-hooks/README.md).

## Do it yourself: admin branding

Branding is not provided by this package. Set Payload's `admin.components.graphics.Logo` and `admin.components.graphics.Icon` to your own component paths in `buildConfig`.

## Do it yourself: admin font

Font setup is not provided by this package. Load your font in `app/(payload)/layout.tsx` and apply its class to the Payload layout, following your host application's Payload layout setup.
