# Protection and proxy

## Valid protection

The route factories support bearer, Basic, IPv4 exact addresses, and IPv4 CIDRs. Omit `protect` for an intentionally unprotected minimal probe. `protect: {}` is invalid.

Bearer token and Basic username/password must be configured with nonblank application secrets. Bearer and Basic cannot coexist because both use the Authorization header.

IP/CIDR rules require `trustProxy: true`. The default header is `x-forwarded-for`; the first comma-separated address is evaluated. Configure a different trusted header only when the reverse proxy contract guarantees it.

## Fail-closed behavior

Invalid protection or CIDR config throws while the route is built. At runtime, missing/incorrect credentials, a missing proxy header, or invalid proxy IP return 401 with:

```json
{ "code": "HEALTHCHECK_ROUTE_UNAUTHORIZED", "message": "Unauthorized." }
```

Policy classes compose with AND semantics. Bearer plus allowIps requires both; allowIps plus allowCidrs requires both lists to match.

## Proxy trust

The adapter does not inspect direct socket IP or validate proxy chains. `trustProxy: true` is a caller assertion. Verify that the trusted proxy overwrites client-supplied forwarding headers and that the application cannot be reached through a bypass path.

Current CIDR support is IPv4-only. Reject IPv6 requirements explicitly rather than silently widening access.

## Caveats

Current bearer parsing accepts a raw matching Authorization value even without the Bearer scheme, and Basic construction permits a whitespace-only password. Do not rely on either behavior; validate real secrets strictly and test expected schemes.

Custom health-route headers can override base cache-control because they merge later. Never set cache-control in custom headers.
