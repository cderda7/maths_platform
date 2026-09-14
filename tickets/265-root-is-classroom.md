# 265: The site's front page is the teacher's Edexia Classroom

**What to build:** `/` opens the teacher's Edexia Classroom (what `/teacher` shows) instead of the demo chooser with the Student card first. The chooser moves to `/demo` so the presenter still has one place linking the iPad, the board and the one-tab split.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Outside review (2026-09-14): the student link "is the first card on the landing page", so a cold visitor's first impression was the student's final report. The user: "the teacher landing page should be the Edexia Classroom page, not the atomic student report", then "/ goes to teacher's edexia classroom". Sam's own landing is his Classroom at `/student` (ticket 264).

## Solution

- `app/page.tsx`: a server redirect from `/` to `/teacher` (so the address bar reads `/teacher` and the teacher chrome's links and Back behave as they do today).
- The current chooser moves to `app/demo/page.tsx` unchanged, with Reset demo.
- Every link, script and doc pointing at `/` as the chooser (`data-board-link`, `data-split-link` click-throughs, README, the landing's own tests) points at `/demo`.

## Acceptance

- [x] Click-through at 1280×800: `/` lands on Edexia Classroom with the live and past cards; `/demo` shows the chooser and its three cards and split link open their surfaces; the teacher chrome's brand link does not loop back to the chooser
- [x] vitest, eslint, tsc, next build, check:laptop
