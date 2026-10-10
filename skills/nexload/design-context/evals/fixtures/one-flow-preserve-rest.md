# Scenario E — One-flow redesign, preserve the rest

## User request
Prepare a scoped context for redesigning the password reset flow only. Keep login, signup, dashboard, routes, font, and brand untouched. Reuse existing context if valid, but verify it against these current sources. No UI implementation.

## Temporary repository files
### AGENTS.md
Scope requests narrowly. Approved shared tokens and authentication contracts must be preserved. Persian RTL.
### docs/auth.md
Approved 2026-10-05. Reset request accepts email and always gives the same public response whether account exists. Reset token expires in 30 minutes, can be used once. Invalid/expired token offers a new request. Network error allows retry. Do not expose email existence.
### docs/brand.md
Approved shared font Vazirmatn; --action #2F685F; --danger #B42318. Password reset can change layout and explanatory copy, not global tokens.
### src/routes.ts
export const routes = ['/login', '/signup', '/forgot-password', '/reset-password/:token', '/dashboard'];
### src/reset.ts
export type ResetState = 'idle' | 'submitting' | 'confirmation' | 'invalid_token' | 'expired_token' | 'network_error' | 'success';
export const RESET_TOKEN_MINUTES = 30;
### .design-context/brief.json
{"scope":"entire authentication and dashboard redesign","font":"Inter","generatedAt":"2026-08-01"}
### .design-context/handoff.json
{"next":"replace all auth routes and global palette"}

## Evidence availability
Existing generated context conflicts with current requested scope and brand. Browser unavailable. No approved reset screenshots. Login/signup/dashboard have no redesign permission. Shared navigation entry to forgot-password may be inventoried without redesigning other flows. Backend delivery reliability is unverified.
