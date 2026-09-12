# 148: Class review examples are chosen by mistake, not by name

**What to build:** On the class review setup, each ticked problem's A / B / C examples are chosen by mistake. The suggestion is the correct working, then the problem's most common exact mistakes, each shown through the working most of those students wrote. The slot's header names the mistake in five words or fewer with how many made it (green for correct, red for a mistake); a click opens a menu of the problem's mistakes with their counts, and choosing one swaps the working in. Names sit small under the working, in setup only. A mistake on the assignment's Unit Focus skill is badged "unit focus"; one the demo student's group already worked through and got right is badged "fixed in group review", sinks to the bottom of the menu and is never suggested while there is something else to show. The board's "n/20 students" counts the students with that exact mistake (or all who got it right). The problem list, the pre-check, the screens choice and Project are untouched.

**Blocked by:** 138 (mistake identity and identical-work columns), 136 (the twenty).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "let's talk through a better way of setting up the class review. so now we have all this taxonomy for error identification. i'm wondering how we can leverage that in the selection of problems for class review instead of having the teacher aimlessly choosing random students." Then, on the design: "i DONT need you to touch the problems rows -- just want to fix example selection", yes to: one entry per mistake in the picker, the correct working then the most common mistakes, counts by exact mistake, a badge for unit focus, and mistakes fixed in group review sinking.

The setup suggested one student per skill leaf and let the teacher swap by a dropdown of names; the board counted by skill, so two different Q7 mistakes both read "12/20".

## Solution

- `data/evaluation.ts`: every wrong line carries a `name` (five words or fewer, the teacher's word for the mistake: "scaled two of three terms", "null factor law without zero", "guessed pair, not expanded back"…), the fifth argument of `wrong(...)`.
- `lib/examples.ts`: a candidate's `mistake` is its wrong lines' TeX (`mistakeOf`, `CORRECT` when none). `optionsFor(cands, ctx)` groups candidates by exact mistake into `ExampleOption`s (name, leaf, count, identical-work `columns` largest first, `unitFocus`, `fixedInGroup`), correct first, then by count, fixed ones last. `exampleOf(option)` is the first student of the largest column. `suggestExamples` takes options in that order (fixed ones only to reach two). `boardExamples` counts by exact mistake. `PickerContext` carries the unit in force and the group run.
- `app/teacher/whole-class/ExamplePicker.tsx`: the slot (letter, the header button with name and count, the skill chip and badges, the working, the names line) and its flyout menu (`data-pick-menu`), a fixed backdrop to close.
- `app/teacher/whole-class/WholeClassSetup.tsx`: uses the picker with `ctx` from the assignment's unit and the classroom's group; swap takes an `ExampleRef`.
- Tests: `lib/examples.test.ts` (mistake keys, suggestions by exact mistake, the options' order and columns, the live student first in his column, unit focus, fixed in group review and its sinking), `lib/evaluate.test.ts` (every wrong line named in five words or fewer).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] The problem list is as before: ten rows, Q7 first, the top three ticked, "n/20 struggled"
- [x] Q7: three slots and no dropdown; A "correct · 2" green, B "scaled two of three terms · 7" red with the fractions chip, C "tripled, third never restored · 4"; first names under each working with "+n"
- [x] Q3: "null factor law without zero" suggested with the unit focus badge; no badge on the correct working
- [x] Opening B's menu moves nothing on the card; it lists correct then the three Q7 mistakes by count (7 / 4 / 2), the current one checked, inside the window
- [x] Choosing "pair adds to nine" swaps B's header, working and names; C and the card's width unchanged
- [x] Project: the board's first slide is Q2 with each example's count equal to its mistake's count in the setup, no names
- [x] From the report stage the demo group's run has resolved Q2: "guessed pair, not expanded back" is badged fixed in group review, listed last, not suggested
- [x] vitest (426), eslint, tsc, `next build`, headless run (`picker.mjs`, 25 checks)
