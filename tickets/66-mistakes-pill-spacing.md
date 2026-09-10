# 66: Mistakes view: more room between the student's name and the slip pill

**What to build:** On `/teacher/mistakes` the gap between a student's name and the red slip pill under it grows from 6px to 14px.

**Blocked by:** 64

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the ticket-64 view: "add a bit more space between the student name & the red skill mistake. a bit crowded."

## Solution

The student tile's bottom padding goes from `pb-1.5` to `pb-3.5` in `TeacherMistakes.tsx`; the pill row's own padding is unchanged, so the pill and the card's bottom edge keep their relationship.

## Acceptance

- [x] The pill's top edge sits 14px below the name's bottom edge (was 6px)
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
