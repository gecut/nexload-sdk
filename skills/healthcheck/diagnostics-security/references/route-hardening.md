# Route hardening

## Construction-time validation

For the Next adapter:

- omit `protect` for an intentionally unprotected route; never pass `{}`;
- bearer token must be nonblank;
- Basic username must be nonblank and password must be non-empty; reject whitespace-only values in application config;
- bearer and Basic cannot coexist because both use Authorization;
- `allowIps` and `allowCidrs` require `trustProxy: true`;
- only valid IPv4 addresses and IPv4 CIDRs are accepted;
- only `cache: "no-store"` is valid.

Invalid config must fail route construction, not wait for the first request.

## Runtime denial

Configured policy classes use AND semantics. Bearer plus IP requires both. `allowIps` plus `allowCidrs` also requires membership in both lists.

Missing/incorrect credentials, a missing proxy header, or an invalid proxy IP return 401 with a stable unauthorized body. The default proxy header is `x-forwarded-for`; only the first comma-separated value is used. Direct socket IP is not inspected.

`trustProxy: true` only asserts that the configured header can be trusted. Verify the reverse proxy overwrites untrusted client values and that no path bypasses it.

## Cache and headers

Every response, including unauthorized responses, must retain `cache-control: no-store, max-age=0`. Next health routes allow custom headers after base headers, so application guidance must prohibit overriding cache-control or health metadata.

## Known hardening caveats

Current bearer parsing also accepts a raw matching Authorization value without the Bearer scheme. Current Basic password construction validation accepts a whitespace-only password. Treat both as reasons for stricter application configuration and tests, not as recommended contracts.

Use external private networking or reverse-proxy policy in addition to route protection for diagnostics and metrics. The adapter cannot verify proxy topology.
