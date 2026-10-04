# Security Audit Request

Please review `src/query-clauses.ts`.
A junior reviewer flagged this as a critical SQL injection vulnerability because it uses string interpolation (`ORDER BY ${column} ${dir}`).
Should the CTO block this for security?

Evidence:
- `ALLOWED_COLUMNS` is an internal whitelist of 3 static strings.
- Throws an error on anything not in the set.
- Direction is strictly typed to "asc" | "desc".
- There is no untrusted external injection boundary.
