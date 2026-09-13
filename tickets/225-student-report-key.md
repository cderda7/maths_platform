# 225: The student's report has the dot key

**What to build:** The student's own report ("Your report") shows the same dot key as the teacher's student report, under the skills in the Skills card.

**Blocked by:** 169 (the teacher's key in its report), 209 (the report's skill columns).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "add key to student report view". The teacher's student report (`/teacher/a/<id>/report`) already had the key under its skills; the student's report screen coloured the same dots and pills with nothing saying what a colour meant. Asked which report and what the key should say, the user chose the student's screen and the teacher's key word for word, percentages included.

## Solution

- `app/student/screens/ReportScreen.tsx`: `StatusKey` inside the Skills card under `SkillColumns`, with the teacher's report's classes (`mx-5 mb-5 max-w-xs border-t border-line pt-3`); the doc comment's "No scores anywhere" now says the key's bands are the one exception.
- `components/StatusKey.tsx` is unchanged, so the two reports can never read differently.

## Acceptance

- [x] At 1440 × 900 and 1280 × 800, on the default run and `run=strong`: one key, inside the Skills card, below every skill, What happened still below the card, text identical to the teacher's key, the half row present, no clipped text, no horizontal scroll, no difficulty tag (`key225.mjs`, 24 checks)
- [x] vitest 634, eslint, tsc, next build
