# Nexload Engineering Standards

This document outlines the specialized engineering standards and gatekeeping skills available in `nexload-sdk` under `skills/nexload/`. These skills encode principal-engineer standards directly into the agent's operating model.

---

## 1. Overview of Standards Skills

| Skill | Focus Area | Primary Responsibility |
| --- | --- | --- |
| **`nexload-cto-review`** | Principal Architecture & Approval | Issues a final CTO verdict, score, and priority-ranked (P0/P1/P2) material findings. Strictly review-only (never emits executable fix code). |
| **`nexload-code`** | TypeScript Precision & Correctness | Enforces strict type inference, zero unwarranted `any`, exhaustive switch/enums, immutability, and boundary validation. |
| **`nexload-package`** | Package & Module Architecture | Enforces clean package boundaries, explicit `package.json` exports, dependency direction, and prevention of cyclical or hidden coupling. |
| **`nexload-react`** | React Render Safety & Lifecycle | Enforces React 19 rules, hook dependencies, prevention of unnecessary re-renders, and proper Server Component / Client Component boundaries. |
| **`nexload-design`** | Visual Design Systems & Layout | Enforces design system consistency, layout tokens, responsive design, Solar Icons, and typography rules. |

---

## 2. Key Standards in Detail

### A. `nexload-cto-review` (The Architecture Gatekeeper)
- **Role:** High-judgment technical evaluation of proposed or completed architectural changes.
- **Strict Invariant:** This skill is strictly **review-only**. Even if the user asks "Review and fix this", the CTO review skill only evaluates, scores, and describes the required architectural properties that must become true—it never writes patch code or implementation steps.
- **Scoring & Verdict:**
  - **Verdict:** `Approved`, `Changes Requested`, or `Rejected`.
  - **Priorities:**
    - `P0`: Blocker (security vulnerability, data corruption, broken public contract).
    - `P1`: Material architecture flaw, significant boundary leak, or maintainability risk.
    - `P2`: Minor gap or non-blocking technical debt.

### B. `nexload-code` (TypeScript Excellence)
- **Rules:**
  1. Types represent domain reality, not convenience.
  2. Avoid type assertions (`as Type`) unless interfacing with untyped legacy boundaries.
  3. Narrow unknown types using Zod or custom type guards before consumption.
  4. Preserve full return types on public SDK entrypoints.

### C. `nexload-package` (Monorepo Package Boundaries)
- **Rules:**
  1. Every public package must expose explicit `exports` in `package.json`.
  2. Internal source files in `src/` must never be imported across package boundaries using relative paths (e.g., `../../packages/other/src/...` is strictly prohibited).
  3. Peer dependencies must be explicitly declared and externalized during bundling.
  4. Zero circular dependencies across packages.

### D. `nexload-react` (Render Safety & Lifecycle)
- **Rules:**
  1. Server Components by default; Client Components (`'use client'`) only at leaves requiring browser state or interactivity.
  2. Never synchronize props to state unless implementing an intentional reset pattern.
  3. Stable callback references with `useCallback` when passed to memoized children.
  4. Strict adherence to React 19 concurrent features.
