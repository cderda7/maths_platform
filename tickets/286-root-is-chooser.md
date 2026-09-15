# 286: The site's front page is the presenter's chooser again

**What to build:** `/` shows the chooser (Student iPad, Teacher laptop, Smartboard, and the link to the one-tab split view) instead of redirecting to the teacher's Edexia Classroom. Reverses ticket 265's move; `/demo` redirects to `/`.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "localhost:3000 I was expecting to take me to the choice between student, teacher, or board, & to see the split screen option", then "let's change it back. localhost:3000/ goes to the screen where you can choose between teacher, student, board, or split view".

## Solution

- `app/page.tsx`: the chooser, moved back from `app/demo/page.tsx` unchanged (its ticket 265 fixes kept).
- `app/demo/page.tsx`: a server `redirect("/")`, so a `/demo` link or bookmark still lands on the chooser.
- README and the system diagram name `/` as the chooser.

## Acceptance

- [x] Click-through at 1280×800: `/` shows the chooser (no redirect, address bar `/`); its Student, Teacher and Smartboard cards and the split link open `/student`, `/teacher`, `/board`, `/split`; `/demo` lands on `/`; `/teacher` still shows Edexia Classroom
- [x] vitest, eslint, tsc, next build, check:laptop
