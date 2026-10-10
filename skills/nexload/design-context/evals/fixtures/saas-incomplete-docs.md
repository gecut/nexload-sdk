# Scenario A — SaaS, incomplete documents

## User request
Prepare a design context for improving Persian team onboarding. Keep subscription limits and existing URLs. Do not build UI. Use these repository sources; local server is unavailable.

## Temporary repository files
### AGENTS.md
Product text is Persian, RTL. Product requirements govern intended behavior; source records current implementation. Never change billing behavior while improving onboarding.
### docs/product.md
Approved 2026-09-20. OrbitDesk helps small agencies invite teammates and assign projects. Owner invites; members cannot invite. Free plan: 3 seats. Paid plan: 20 seats. Invitation expires after 48 hours. Improve clarity before adding steps. No approved empty-state wording yet.
### docs/brand.md
Approved brand: Vazirmatn for Persian UI. Primary action #176B58. Existing dark theme must remain. Logo clear space and display font are undecided.
### src/routes.ts
export const routes = ['/login', '/onboarding/team', '/projects', '/settings/billing'];
### src/invites.ts
export type InviteState = 'idle' | 'sending' | 'sent' | 'expired' | 'seat_limit' | 'network_error';
export const canInvite = (role: string) => role === 'owner';
### src/theme.css
:root { --action: #176B58; --surface: #fff; --text: #172522; }
[data-theme=dark] { --surface: #13201C; --text: #F2F7F4; }

## Evidence availability
Files above available. No screenshots, analytics, live browser, or accessible development server. Brand logo file absent. No proof of rendered mobile behavior. Invitations have no documented resend policy. The compiler may request decisions, but must preserve unknowns rather than invent rules.
