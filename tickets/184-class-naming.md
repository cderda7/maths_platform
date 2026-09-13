# 184: The class is 11 Methods on the 2025 syllabus, and today's set is Problem Set 2 — Roots of a quadratic

**What to build:** Every screen that names the class, the unit or the set uses the new names. The header brand reads "Edexia · 11 Methods" (was "Edexia · Maths"). The class is "11 Methods" (was "11 Methods B"), with the timetable code "11MAM2" where a code is shown. The unit line is "Unit 1 · Topic 1 · Surds and quadratic functions" (was "Unit 1 · Topic 2 · Functions and graphs", the 2019 syllabus). Today's assignment is "Problem Set 2 — Roots of a quadratic" (was "Roots of a quadratic — Set 3"), still due Thu 10 Sep. Nothing else changes.

**Blocked by:** none. First of the Edexia Classroom run (184–189).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), planning Edexia Classroom: "we need to figure out what to title it, this is a year 11 class doing Unit 1, but idk the QCE Australia system for naming classes, so make a suggestion." Research: the QCAA Mathematical Methods 2025 syllabus (v1.3, Jan 2026) applies to students completing in 2026 or later; Unit 1 is "Surds, algebra, functions and probability" and roots of a quadratic sit in Topic 1 "Surds and quadratic functions". Queensland schools code the subject MAM (e.g. Mansfield SHS Year 11–12 Curriculum Guide 2025–26) and class groups year + code + group ("11MAM2"); people say "11 Methods". The user approved: header "Edexia · 11 Methods", eyebrow "11MAM2 · Mathematical Methods · 20 students" on the Classroom (ticket 186), the corrected unit line everywhere, the "B" dropped, and the set renamed "Problem Set 2 — Roots of a quadratic" with "Set 3" gone everywhere; due stays Thu 10 Sep ("even though it's a passed date, that's fine").

## Solution

- `data/assignment.ts`: `title`, `className`, `unit` (and a new class `code: "11MAM2"` if a place needs it); the student side and every teacher/board screen read these.
- `components/Brand.tsx`: the brand's suffix is the class's short name.
- Grep the repo (app, components, lib, data, scripts, tests) for "Set 3", "SET 3", "Methods B", "Functions and graphs", "Topic 2" and fix every user-visible hit; update tests and fixtures that assert the old strings.

## Acceptance

- [x] No user-visible "Set 3", "Methods B", "Topic 2" or "Functions and graphs" anywhere (grep of app/components/lib/data)
- [x] /teacher, /teacher/mistakes, /teacher/groups, /student overview, /board show the new names (screenshot each)
- [x] vitest, eslint, tsc, next build, check:laptop
