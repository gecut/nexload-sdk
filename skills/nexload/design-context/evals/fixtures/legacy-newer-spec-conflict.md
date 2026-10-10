# Scenario D — Legacy implementation and newer specification

## User request
Compile design context for the return-request flow. Use the approved new policy for intended behavior, but show the current implementation conflicts. I ran the compiler last month; do not carry old policy forward.

## Temporary repository files
### AGENTS.md
Approved policy controls intended behavior. Implementation records current behavior. Do not silently resolve conflicts or modify application code.
### docs/returns-policy.md
Approved 2026-10-02; supersedes 2026-08-01. Return window is 14 calendar days after delivery, previously 7. Customer may upload up to 3 photos; photo is optional. Refund destination must be original payment method; bank-account entry is removed. States: submitted, reviewing, accepted, rejected, completed.
### src/returns.ts
export const RETURN_DAYS = 7;
export const MAX_PHOTOS = 1;
export const requiresPhoto = true;
export type ReturnState = 'submitted' | 'reviewing' | 'approved' | 'denied';
### src/routes.ts
export const routes = ['/orders/:id/return', '/returns/:id', '/account/bank-details'];
### docs/old-notes.md
Archived 2026-08-01. Returns allowed within 7 days; one mandatory photo and bank-account refund. Superseded by returns-policy.md.
### .design-context/manifest.json
{"schemaVersion":"0.0.1","generatedAt":"2026-09-01","authoritativePolicy":"docs/old-notes.md"}
### .design-context/claims.json
{"claims": ["Seven days remains approved",

## Evidence availability
Current runtime unavailable. Prior generated context is stale and malformed. It is derived output, not an authoritative input. Existing public routes must be reported; policy change does not authorize deleting bank-details route used elsewhere. Old source and new policy should appear as a conflict with desired/current distinction, not a blended claim.
