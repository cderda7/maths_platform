# 174: The category pill carries its name; the header band goes; the reflection panel narrows

**What to build:** On the teacher's student report (`/teacher/report`) and the student's own report (`/student`, report stage) the row of category header chips above the columns is gone. Each category's pill is wider and carries the category's name in white uppercase on the status colour (grey in a hollow "not seen yet" pill); every pill in the row is the same width, the width the widest name needs. The flat category's pill reads NEW SKILLS and "UNIT 1" stays in grey caps to its right. On the student's report the reflection panel is narrower (320 px, was 440) so the report itself has the room.

**Blocked by:** 169.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with screenshots of Amelia's report on the teacher side and Sam's own report on the iPad: "change both of these views where instead of the category header as separate, take the category pill, make it wider, & put the category name there in white text. remove category headers. use the widest necessary pill to fit text to set the width for all pills"; then "also the reflection panel can be made narrower to make more room for the heart of the report"; then "for the unit pill, make 'new skills' the white text within the pill & Unit 1 still goes in grey text all caps to the right".

## Solution

- `components/SkillColumns.tsx`: the `[data-column-heads]` band is removed. `CategoryPill` draws the pill: `inline-grid`, rounded-md, a 1 px border, the name semibold uppercase with the chip's tracking, white on the status colour (`DOT_COLOR`), the half pill the colour on its left half and a 45 % tint on the right, the unseen pill hollow with `border-line-strong` and the name in `text-ink-muted`. Every column's name is stacked in the same grid cell of every pill, only the pill's own visible, so each pill is exactly as wide as the widest name with no measuring. The text size is fitted to the row: `fitPills` picks the largest of 11 · 10.5 · 10 · 9.5 · 9 px (side padding 10 · 8 · 6) at which the widest pill, measured on a canvas as set (uppercase, semibold, tracking, padding, border), fits its cell less 8 px; the teacher's report gets 11, the student's 9. The unit label sits `left-full ml-2` of the pill (was 20 px right of the column's centre). The measuring effect re-runs when the fitted size changes so the trees' column boxes come from the pills' final positions.
- `components/HierarchyDrill.tsx`: `textWidth` is exported and takes a weight.
- `app/student/screens/ReportScreen.tsx`: the report grid is `1fr 320px` (was `1fr 440px`).
- Docs: this ticket, `architecture/174-labelled-pills.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] No header band on either screen; six pills read ALGEBRA · FUNCTIONS · GRAPHING · COMMUNICATION · REASONING · NEW SKILLS, uppercase, the other five names stacked invisibly in each
- [x] Every pill in a row the same width, that width fitting the widest name with its padding; one text line tall
- [x] Coloured pills white on the status colour (half pills on a gradient); not-seen pills hollow with a grey name
- [x] No pill touches its neighbour: teacher's report 27 px gaps at 1400 and 1280 (text 11 px); student's report 13 px gaps (text fitted to 9 px)
- [x] UNIT 1 in grey caps right of the NEW SKILLS pill on its line
- [x] Every tree's first dot still starts on its pill's left edge beneath it; no tree in its neighbour's column; no sideways overflow
- [x] The teacher's report still the fixed full dot view with the Skills eyebrow above; the student's still the groups view
- [x] The reflection panel 320 px wide, "Two or three sentences" on one line, the textarea and send button in place
- [x] vitest (454), eslint, tsc, `next build`, `check:laptop` (16); click-through `pills174.mjs` (66 checks)
