# 165: The teacher bar's tabs sit directly right of the Edexia · Maths brand

**What to build:** On every teacher page the Class, Mistakes and Groups pills move from the right end of the bar back to the left, directly right of the "Edexia · Maths" wordmark. Their colouring from ticket 163 stays (soft indigo, the current page filled deep indigo with white text). "New assignment", the teacher's name and avatar stay at the right end as they are.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the Groups page (the three indigo pills at the right beside "New assignment", as ticket 163 left them): "move the purple tabs to left -- directly right of Edexia Maths".

## Solution

- `app/teacher/TeacherChrome.tsx`: the bar's left group is the brand and the tabs (`nav[data-teacher-tabs]`) in one `flex items-center gap-5` row, the same gap the student header puts between its brand and crumb; the right group is "New assignment", the teacher's name and avatar. The `ml-1.5` that separated "New assignment" from the tabs in ticket 163 goes with the tabs. Nothing about the pills themselves changes: the same `px-3 py-1 text-[13.5px]` pills, the same fills and hover, the same 1 px border on every pill so all stand one height, the same bar height.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md` (the 2026-09-12 ticket 163 placement superseded), `FUTURE_FEATURES.md`.

## Acceptance

- [x] `/teacher`, `/teacher/mistakes`, `/teacher/groups`, `/teacher/assignments/create` at 1400 and `/teacher` at 1280: Edexia · Maths, then Class · Mistakes · Groups a gap-5 (20 layout px, 14.4 on screen under the 0.72 zoom) after "· Maths", all in the left half of the bar; New assignment · Ms Okafor · MO at the right end, inside the frame
- [x] the brand, the tabs and "New assignment" share one centre line; every pill on one line at one height
- [x] the current page's tab is deep indigo with white text and `aria-current="page"`, the others soft indigo with deep indigo text, none current on the create screen; "New assignment" white with a 1 px ink border and ink text
- [x] clicking a tab opens its page and the current mark follows
- [x] vitest (454), eslint, tsc, `next build`, headless click-through (`nav165.mjs`, 83 checks)
