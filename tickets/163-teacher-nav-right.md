# 163: The teacher bar's tabs sit at the right as indigo pills; "New assignment" is a white pill

**What to build:** On every teacher page the Class, Mistakes and Groups tabs move from beside the brand to the right end of the bar, just before "New assignment", and take the indigo pill colouring "New assignment" had (soft indigo fill, deep indigo text; the current page filled deep indigo with white text). "New assignment" becomes a white pill with a black border and black text.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the teacher bar on the create screen (Class · Mistakes · Groups at the left as plain text, "New assignment" as a soft indigo pill at the right): "move Class Mistakes Groups to the right, over towards 'New Assignment'. also make those have the current coloration New Assignment has. change New Assignment to a white pill with black border & black text".

## Solution

- `app/teacher/TeacherChrome.tsx`: the brand stands alone at the bar's left; the right-hand row is the tabs (`nav[data-teacher-tabs]`), "New assignment", the teacher's name and avatar. Every tab is a pill: `bg-accent-soft text-accent-deep` (hover `bg-accent-line`), the current page `bg-accent-deep text-white`. "New assignment" is `border border-ink bg-white text-ink` (hover `bg-cream-deep`) with `ml-1.5` on top of the row's gap so it reads as a separate action from the places. Nothing else moves: the same `px-3 py-1 text-[13.5px]` pills, the same bar height.
- "Black" is the design's ink (`#14123a`, the navy every heading and body text uses), not `#000`: a pure black would be the only pure black on the screen.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] `/teacher`, `/teacher/mistakes`, `/teacher/groups`, `/teacher/assignments/create` at 1400 and 1280: Class · Mistakes · Groups · New assignment · Ms Okafor · MO in that order at the right of the bar, on one line, inside the frame
- [x] the current page's tab is deep indigo with white text and `aria-current="page"`; the other tabs are soft indigo with deep indigo text; on the create screen no tab is current
- [x] "New assignment" is white with a 1 px ink border and ink text, tinted cream on hover without resizing
- [x] vitest, eslint, tsc, `next build`, headless click-through (`nav163.mjs`)
