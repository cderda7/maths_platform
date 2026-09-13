# 184 · The class is 11 Methods on the 2025 syllabus, and today's set is Problem Set 2 — Roots of a quadratic

Routes: every route that shows the brand, the class, the unit or the set (`/`, `/student`, `/teacher/*`, `/board`, `/split`).

## Files touched

| File | What it does |
|---|---|
| `data/assignment.ts` | The fixture's `title` is "PROBLEM SET 2 — ROOTS OF A QUADRATIC", `className` "11 Methods", new `classCode` "11MAM2", `unit` Topic 1 "Surds and quadratic functions" (QCAA Mathematical Methods 2025 syllabus). |
| `data/types.ts` | `Assignment.classCode`: the timetable code for the class group. |
| `data/draft-seed.ts` | The create screen's seeded title reads "Problem Set 2 — Roots of a quadratic". |
| `components/Brand.tsx` | The wordmark's suffix defaults to the class's short name, so every header reads "Edexia · 11 Methods". |
| `app/layout.tsx` | The browser tab title reads "Edexia · 11 Methods — closed-loop demo". |
| `lib/board.test.ts`, `lib/classroom.test.ts` | Assert the new class name and title. |
| `tickets/184–189`, `FUTURE_FEATURES.md` | The Edexia Classroom run's six tickets and its deferred ideas, from the 2026-09-13 planning session. |

## How it connects

```
 data/assignment.ts  ASSIGNMENT { title, className, classCode, unit, due }
        │
        ├──► components/Brand.tsx ── "Edexia · {className}" ──► every chrome
        │      (StudentChrome, TeacherChrome, SmartBoard, SplitView, home)
        │
        ├──► unitLabel(unit) ── "Unit 1 · Topic 1 · Surds and quadratic functions"
        │      ──► home, student overview, Class View eyebrow
        │
        └──► title ── "PROBLEM SET 2 — ROOTS OF A QUADRATIC"
               ──► lib/assignment activeAssignment() ──► Mistakes, Groups,
                   report, compare, board, student chrome

 data/draft-seed.ts  DEMO_DRAFT_TITLE ──► create screen's seeded title
```
