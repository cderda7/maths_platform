# 233: The student's report fits one screen, and working opens in its side column

**What to build:** The student's "Your report" fits the iPad screen with nothing to scroll. A Q tile under What happened, or a skill row, shows that problem's or skill's marked working in the right-hand column in place of the key and the reflection. Another tile or skill switches it; a press anywhere else closes it. Send stays at the foot of the column, faded until there is a reflection: with the working open it closes it, and with no reflection it points the student at the box.

**Blocked by:** 227 (the full fixed skills and the key's column).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), on a screenshot of the report: "finally, i have to scroll to see the bottom of the page. reorient so that's not the case. ALSO add functionality where student can click on Q4 at bottom & see marked transcription. OOOH ok as rule, to show problem working, have this take over the key & reflection right bar to make more room. also add functionality where clicking somewhere on screen besides the marked transcription collapses the marked transcription view -- unless student clicks on another Q tile or dot skill, in which case open up that new marked transcription. as you move marked transcription to take up that right column, keep the faded 'send to ms okafor' button - student clicking there also collapses the marked transcription & signals to student that they need to fill out the reflection"

The report overflowed its column by 54 px on the default run and 172 px on the every-step-held run.

## Solution

- `app/student/screens/ReportScreen.tsx`:
  - **One screen:** the set-name eyebrow is gone (the bar above already names the set); "What Ms Okafor sees" sits beside the title; "Every step held · Where the class is stuck →" moved from its own card into the title row; What happened sizes each column by its tiles (`outcomeTemplate`, per-outcome floors) so a run of tiles stays on one line.
  - **Tiles are buttons** (`data-work-tile`); the open one has an ink ring.
  - **Side column:** `work` state (`ReportWork`); the working (`ProblemWork` for a tile, `WorkPanel` for a skill, both `narrow`) replaces key + reflection and scrolls inside the column. A capturing document click closes it unless the press lands in the working itself, a tile, a skill row, or Send; Escape closes it.
  - **Send** is always pressable, faded (`opacity-40`, `aria-disabled`) with no reflection: it closes the working; with nothing written it remounts the box with the accent ring (`pulse-once`), an accent border, "Write your reflection before sending", and the cursor in the box; with a reflection and the working open it only closes the working.
- `lib/reportWork.ts` (+ test): `ReportWork`, `sameWork`, `pressWork` (same closes, other switches), `outcomeTemplate`.
- `components/HierarchyDrill.tsx`: `ProblemWork` (one problem's marked lines) extracted from `WorkPanel`; `narrow` fits the problem and each line to the column with `FitText`; the ⚠ chip uses student names on the student side. `RowDrill` takes `pickedLeaf` / `onPickLeaf` so a caller can hold the picked skill and show its work elsewhere.
- `components/SkillColumns.tsx`: passes `pickedLeaf` / `onPickLeaf` through.
- `components/Tag.tsx`: `DifficultyTag` renders `data-difficulty`, so the "no difficulty tag on a student screen" checks can fail.

## Acceptance

- [x] At 1440 × 900 and 1280 × 800, on the default run, the strong run and the report jump (Q7 unsolved): nothing to scroll, every column's tiles on one row, the title row clean, Q7's note (`click233.mjs`)
- [x] Q4 opens in the side column, key and reflection gone, Send in the same place and faded, still nothing to scroll, lines fit; Q7 switches in place with its red line and note; a press inside keeps it; the ⚠ chip opens that skill; a skill row opens its working, nothing beneath the skills, no difficulty tag; the same skill or tile again closes; presses on blank space, the title, a group row, a pill, a label and the column's blank space close it; Escape closes it
- [x] Send with the working open and no reflection closes it, focuses the box, rings it and says to write first, moving nothing; again with it closed; with a reflection it closes the working without sending and keeps the text, then sends; after sending, tiles still open and pressing Sent closes (80 checks)
- [x] The teacher's report still opens a skill's work beneath its columns, three across, with difficulty tags (`teacher233.mjs`)
- [x] check:laptop 30, vitest 682, eslint, tsc, next build
