# 168: The assignment title is the crumb beside the wordmark on every student screen

**What to build:** The student's header shows the assignment title ("ROOTS OF A QUADRATIC — SET 3") after "Edexia · Maths" on every screen, as the class-review screen already did. The per-stage crumbs ("Warm-up", "Your report", "Where the class is finding it hard", "Your working", the class name, and the empty crumb ticket 164 gave the group review) all go: the pathway strip names the stage, each screen's own heading names itself, and the title is the one thing in the header that never changes.

**Blocked by:** 164.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with two screenshots (the class-review header reading "· Maths  ROOTS OF A QUADRATIC — SET 3  [indiv working] → …", and the report header reading "Edexia · Maths  Your report  [indiv working] → …"): "actually add the ROOTS OF A... to group review. have this be a rule throughout the header on the student side. also for your report view."

## Solution

- `app/student/StudentApp.tsx`: the `CRUMB` map and the stage-list fallback are removed; `crumb` is `title` (the assignment on the classroom store, `useAssignment()`), so every stage passes the same string.
- `app/student/StudentChrome.tsx`: `crumb` is a plain optional string again; the comment on the strip's placement now says the crumb is the title everywhere.
- Nothing else moves: the strip stays pinned beside the name, the brand and the crumb sit where they did, and the title (the longest crumb the header now carries, 212 px at 13 px) ends over 200 px clear of the strip.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] every skip target (start, warm-up, working, indiv review, class wait, group review, class review, report) and the peers and history deep links: the header's left group is the brand then "ROOTS OF A QUADRATIC — SET 3", at the same coordinates on every screen, ending clear of the strip
- [x] vitest (454), eslint, tsc, `next build`, headless click-through (`crumb168.mjs`, 29 checks); group review and report screenshots read by eye
