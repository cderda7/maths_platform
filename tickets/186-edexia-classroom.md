# 186: Edexia Classroom: every assignment on one page

**What to build:** `/teacher` is the Edexia Classroom. Header: "Edexia · 11 Methods", Ms Okafor's name and avatar, a Groups link (the class default groups page) — no Class/Mistakes tabs here. Page eyebrow "11MAM2 · Mathematical Methods · 20 students", title "Edexia Classroom", a "+ New assignment" button on the title row going to the create screen. Below, the assignments as cards: a LIVE section (assignments still in individual working) above a PAST section (review stages or finished), newest first. Each card shows the title, the due date, a status line and one insight: live — "● live · 10/20 submitted · 7 mistakes so far" (counts update as work arrives, ticket 189); past — "in review" or "done", submitted count, and "top gap: <the most common mistake cluster across the set>". Clicking a card opens the assignment (ticket 185's landing rule). The live card's status dot pulses softly.

**Blocked by:** 185.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "a place where the teacher can see all assignments laid out at once, the option to create an assignment … that's what we'll call this, Edexia Classroom … for rn we'll work with the assumption that the teacher only has one class (this class of 20 students), add to assumptions." Approved sketch (round 1 Q6, "yep -- add top gap to Set 1 as well"):

```
Edexia · 11 Methods                      [Groups]        Ms Okafor MO
─────────────────────────────────────────────────────────────────────
11MAM2 · MATHEMATICAL METHODS · 20 STUDENTS
Edexia Classroom                                   ( + New assignment )

LIVE
┌────────────────────────────────────────────────┐
│ Problem Set 2 — Roots of a quadratic  due Thu 10 Sep│
│ ● live · 10/20 submitted · 7 mistakes so far    │
└────────────────────────────────────────────────┘
PAST
┌────────────────────────────────────────────────┐
│ Problem Set 1 — Features of a parabola  due Thu 3 Sep│
│ done · 19/20 · top gap: <cluster>               │
└────────────────────────────────────────────────┘
```

Before the teacher creates Problem Set 2 the Classroom holds only Problem Set 1 (ticket 188 adds Problem Set 2 on Create; ticket 189 streams it). Until 187 and 188 land, show whatever the registry holds.

## Solution

- `app/teacher/page.tsx` → a Classroom component reading the registry; `TeacherChrome` knows when it is on the Classroom (no assignment tabs, a Groups link).
- A pure `topGap(assignment)` in lib with a test (the cluster with the most students across all problems; ties by problem order).
- Brand tokens and type from `app/globals.css`; cards in the existing card style; 1280 × 800 laptop and 1400 wide both clean. ASSUMPTIONS.md gains "ONE CLASS".

## Acceptance

- [ ] Header, eyebrow, title, New assignment as above; Groups link opens the class default groups
- [ ] Live above past; card contents as above; top gap computed, not hard-coded
- [ ] Card click lands per ticket 185
- [ ] ASSUMPTIONS.md "ONE CLASS" bullet
- [ ] vitest, eslint, tsc, next build, check:laptop (add the Classroom); screenshots at 1280 and 1400
