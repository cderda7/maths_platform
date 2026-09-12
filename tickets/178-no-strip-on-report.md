# 178: No pathway strip on the student's report

**What to build:** On the student's report screen the header no longer carries the review pathway strip (indiv working → indiv review → group review → class review). The right end of the header is the student's name and avatar alone; the space the strip took is blank. The same on the two screens the report opens (the peers view and the student's own working), so the strip does not flicker in and out on the way there and back. Every other student screen keeps the strip as ticket 151 built it.

**Blocked by:** 151.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the report screen in the split view: "in this tab, remove the indiv working -> ... pathway stuff. just have blank". On the report the pathway is behind the student: the strip's ringed pill still names the class's stage (which can differ from the student's own screen once the demo strip has jumped ahead), and it says nothing the report does not already say.

## Solution

- `app/student/StudentApp.tsx`: `stages` is an empty array at the `report`, `peers` and `history` stages and `pathwayStages(...)` everywhere else; `StudentChrome` already renders no strip for an empty list, so the header's right group is the name and avatar at the same coordinates as before.
- Nothing else changes: `PathwayStrip`, `pathwayStages` and the teacher's Pathway card are untouched; the crumb (the assignment title, ticket 168) stays.
- Docs: this ticket, `architecture/178-no-strip-on-report.md`, `ARCHITECTURE.md`, `README.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] `/student?stage=report`: no `[data-pathway-strip]` in the header; the name and avatar at the same right edge and centre line as on the working screen; nothing else in the header moved
- [x] "Your working →" (history) and the peers view: no strip; back on the report, still none
- [x] `/student?stage=working`, `class wait`, `group review` and `class review` skips: the strip present as before, four pills, the current one ringed
- [x] vitest, eslint, tsc, `next build`; click-through `strip178.mjs` at 1400 × 1000 and 1280 × 800
