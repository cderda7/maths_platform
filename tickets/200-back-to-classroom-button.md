# 200: The way back to the Classroom is a dark purple button

**What to build:** "← Edexia Classroom", above the eyebrow on every assignment and Create page, renders as white text on a dark purple box instead of a small indigo text link, so the way back reads at a glance. The arrow stays.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshot of the Mistakes tab): "put Edexia Classroom in a dark purple box, white text. i like the arrow to signal 'back' -- keep that. just need the return to classroom view to be more obvious".

## Solution

- `app/globals.css`: a new token `--color-accent-dark` (#2f2491), a darker step of the indigo accent family; the existing `accent-deep` (#4535c8) read as bright indigo on screen rather than dark purple.
- `app/teacher/AssignmentContext.tsx`: `BackToClassroom` is an `inline-flex` box, `bg-accent-dark`, white 13.5 px medium text, `px-3 py-1.5`, `rounded-md`, `mb-1` so the eyebrow below keeps air; hover lightens to `accent-deep`; a focus-visible outline in the accent. One component, so every page that shows it (Class View, Mistakes, Groups, the assignment overview, Create, Create's review, the class's default groups, "Not in the Classroom") changes together.

## Acceptance

- [x] On every page with the link: dark purple background, white text, the arrow kept, one line (32 layout px tall), exactly one link, no horizontal scroll
- [x] Hover changes the background; a real click lands on `/teacher`
- [x] vitest 569, eslint, tsc, next build; `check:laptop` 30 route/size checks; click-through `back200.mjs` (56 checks)
