# 142: The mistake view's header: right box outside the card, tag by the maths, no live pill, a gap before the flyout, send at the bottom right, and the teacher chrome at 0.72

**What to build:** Seven changes from one round of feedback on the mistake view. The "15/20 right" box moves out of the problem card to its left, level with the header row. The live pill comes off students' names. The teacher chrome's zoom goes from 0.8 to 0.72, so the 100% view is what the user's browser showed at 90%. The open diagnostic flyout sits a little clear of the card instead of touching it. The difficulty tag moves from the header's far right to just after the maths. "complex unfamiliar" is light amber instead of ink on white, in line with its cream, blue and purple siblings. "send to class" sits at the flyout's bottom right.

**Blocked by:** 140, 137.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with five crops: "i want it out of the Q1 box -- to the left, same height as the Q1 row. also remove the live tag from students in the mistake view. also this is the current view at 100%. i want the 100% default view changed to this, currently the 90% view. also want a little gap in between the question box & the live diagnostic box when it pops up. also move question tag next to the Q. -- so not far right, but next to Q. also change complex unfamiliar color to a color more in line with the others -- the others are light purple, light blue, cream -- the black with white text is jarring in comparison. move send to class to bottom right of the diagnostic box."

## Solution

- `app/teacher/mistakes/TeacherMistakes.tsx`: the right box is the row's first flex child, in a wrapper as tall as the card's border plus its header (`PROBLEM_HEADER + 2`, items centred) so it sits level with the header row; the header's left group is label, maths, `DifficultyTag`, then the hover button (the right-hand slot and its `justify-between` gone); the `r.live` pill removed from the name chip (the compare footer under the live student's column stays); the diagnostic gets `ml-5` on top of the row's `gap-4`, so the flyout, laid 25 px left of the chip, ends up 11 px clear of the card.
- `app/teacher/DiagnosticPush.tsx`: `PROBLEM_HEADER = 69` exported (the header row in layout px), `CHIP_TOP` derived from it; the action row is `flex justify-end`, so the send button sits at the panel's bottom right (the waiting band still spans the row).
- `app/teacher/TeacherChrome.tsx`: `[zoom:0.72]`; `lib/split.ts` comment follows (a 1280 laptop lays out at 1778 px).
- `components/Tag.tsx`: "complex unfamiliar" is `bg-developing-soft text-developing border-developing-line`.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] On every problem the box sits left of the card, one `gap-4` off it, its centre within 1 px of the header row's; the header row is 69 layout px
- [x] No name on the mistake view carries a live pill, with or without Sam's session; the compare footer still appears once under Sam's column
- [x] The teacher root's computed zoom is 0.72; the laptop guard passes on all eight routes at 1440 and 1280
- [x] Q1's open flyout starts 6–10 window px right of the card; its chip lands exactly where the closed chip was; the card and row measure the same open and closed
- [x] The difficulty tag starts one gap after the maths and lies in the card's left half; Q6's "complex unfamiliar" is amber on light amber
- [x] "send to class" ends at the panel's inner right edge and is its last thing
- [x] vitest, eslint, tsc, `next build`, headless click-through (`mistakes142.mjs`) with crops, `laptop-check.mjs`
