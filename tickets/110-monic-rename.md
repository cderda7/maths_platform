# 110: The monic skill is "Monic factorisation"

**What to build:** The skill the taxonomy calls "Monic trinomials" is named "Monic factorisation", matching ticket 108's "Non-monic factorisation". The full name shows on the teacher's skills tree (the individual report's drill); the student still sees this leaf as plain "Factorising" (the student-name override in `data/taxonomy.ts`, which is unchanged).

**Blocked by:** 108.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), after ticket 108: "ah change monic trinomials to monic factorisation, as well".

## Solution

- `data/taxonomy.ts`: the `algebra.expand-factor.monic` leaf's `name` is "Monic factorisation". Its `short` ("monic factorising"), description, id and the student-facing override ("Factorising" / "factorising") are unchanged.

## Acceptance

- [x] Mia's teacher report, "Algebra" then "expanding & factorising" opened: non-monic factorisation, distributive expansion, monic factorisation (headless, `drill.mjs`)
- [x] Q1's "I need help" picker still lists "Factorising", "Null factor law" (the student override)
- [x] vitest (340), eslint, `next build`; architecture note, root docs, future features
