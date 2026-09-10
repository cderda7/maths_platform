# 58: The student report says where each problem ended up as tiles in a column per review stage; Starred goes; the reflection is required

**What to build:** On the student's final report, replace the "What happened" text card (slip count, reworked list, practice line) with a card of columns, one tile per problem: correct first try / correct after individual review / correct after group review / incorrect. A column exists only when the assignment's pathway has that stage. Delete the Starred card. Move the reflection block down so it sits right above the send button, drop "Optional", and keep the button faded and unusable until something is written; there is no sending without a reflection.

**Blocked by:** 57 (same screen file)

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The "What happened" card was three sentences ("5 of 10 problems with a slip", "Reworked Q1, Q2, Q3, Q7, Q10", "Practice · monic factorising · Q2 · taken") that a student has to read to find out which problems are still wrong. The Starred card beside it took half the row for one line. The reflection sat at the top of the right pane with a wide gap to the button, was labelled "Optional", and the button read "Send without a reflection" until something was typed.

## Solution

`lib/report.ts` gains `problemOutcome` and `outcomeColumns`: a problem is "first" when its handed-in lines exist and none is wrong (the "every step held" rule), else "individual" when the pathway has individual review and the rework holds, else "group" when the pathway has group review and the group's run resolved it, else "wrong". Columns are built from the pathway, so a submit-only assignment shows two, individual-only three, and so on; an empty column stays and reads "None". `ReportScreen` reads the pathway and the group run from the classroom store and renders the columns as a CSS grid with `Q1`-style tiles tinted per column (green, blue, amber, red). The Starred card and its imports are removed (the data stays; the teacher's report still lists stars). The right pane's reflection block is pushed to the bottom with `mt-auto`; the sentence count keeps a fixed-height line; the button is `disabled` until the trimmed reflection is non-empty and always reads "Send to Ms Okafor". The reducer refuses `report/send` on an empty reflection, so a stale tab cannot send one either.

## Acceptance

- [x] `/student?stage=report&pathway=indiv,group`: four columns, Q4 Q5 Q6 Q8 Q9 first try, Q1 Q2 Q3 Q7 Q10 after individual review, "None" in the other two
- [x] `&pathway=none`: two columns; `&pathway=indiv`: three; `&run=strong`: all ten first try
- [x] No Starred card, no "Optional"; the button is faded (opacity 0.4) and a click does nothing until text is typed; after typing, one click shows "Sent to Ms Okafor"
- [x] vitest (280 tests, 8 new), eslint, tsc, `next build`, headless-Chrome screenshots of the four layouts and the sent state; architecture note and root docs
