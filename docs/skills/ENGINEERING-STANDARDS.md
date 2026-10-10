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
| **`nexload-design-context`** | Pre-design Context | Compiles source-grounded product, brand, experience and page contracts into validated JSON; no UI design or implementation. |

---

## 2. Key Standards in Detail

### A. `nexload-cto-review` (The Architecture Gatekeeper)
- **Role:** High-judgment technical evaluation and final approval layer for architecture proposals, packages, public APIs, refactors, and production-readiness decisions.
- **Strict Invariant:** This skill is strictly **review-only**. Even on mixed requests ("Review and fix this"), the CTO review skill only evaluates, scores, and describes the required architectural properties that must become true—it never writes patch code, replacement APIs, shell commands, or implementation steps.
- **Review Modes:** Automatically binds one of four review modes: `proposal`, `implementation`, `change`, or `readiness`.
- **Traceable Evidence & Authority:** Every finding must have a concrete evidence anchor (file, line, symbol, manifest, or runtime trace). Distinguishes Instruction Authority from Factual Authority, enforces version-aware technical truth, and evaluates verification freshness (`Fresh`, `Existing`, `Stale`, `Missing`).
- **Scoring & Verdict:**
  - **Verdict:** `Approved`, `Approved with minor issues`, `Needs revision`, `Blocked` (fixable blocker), `Rejected` (fundamentally wrong direction), or `Withheld` (missing decisive evidence).
  - **Score:** Calibrated discrete scores (e.g., 9.5, 9.0, 8.5 ... or `Not assessable`).
  - **Priorities:**
    - `P0`: Blocker (trust/security failure, data corruption, materially false public/runtime contract, or invalid direction).
    - `P1`: Material architecture flaw, unjustified speculative complexity, boundary leak, or business invariant gap.
    - `P2`: Minor non-blocking improvement or public contract polish with local blast radius.


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

### Pre-design context compilation

Use [nexload-design-context](../../skills/nexload/design-context/SKILL.md) before handing a project or scoped flow to a separate design agent. It produces `.design-context/` with sources, claims, observed codebase, brief, brand, experience, layered IA, page contracts, semantic tokens, assets, unknowns and a handoff index. Its bundled JSON Schema validator checks integrity and computes ready/conditional/blocked separately from structural validity. It requires Python 3.10+ and the pinned validator dependency; it does not implement UI or select components. See the skill references for authority, provenance, repeat invocation and validation limits.
