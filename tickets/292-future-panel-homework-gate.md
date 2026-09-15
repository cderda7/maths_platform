# 292: Future panel and the gate to To do

**What to build:** once the teacher sends Homework 3, Sam's Classroom shows it greyed in a Future panel at the top right, not pressable. When the Problem Set 6 lesson ends, Homework 3 opens: it moves to the top of To do as a pressable Homework card, its HW column cell becomes pressable, and its contents freeze.

**Blocked by:** 291.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "we'll need to add a gate to when student can access HW -- eg with HW3, it'll show up in a FUTURE tab that isn't clickable -- after PSet6, then moved to TODO & clickable", and on the layout: "have future like off in the top right & greyed out to signal to the student it's like not in their responsibility list, want visual separation".

## Decisions

- **Future panel**: grey, dashed border, no shadow, top right of the Classroom column, level with the eyebrow and "Edexia Classroom" title. Card inside: "Homework 3", "due Mon 14 Sep", "opens after Problem Set 6". Not pressable. **Hidden entirely** when nothing is scheduled.
- **Opening**: a homework opens when the last lesson among its covered sets ends (the teacher ends the lesson, or every stage is over) — not on Sam's report. If all its sets' lessons have already ended at Send, it opens at once.
- **Freeze at opening**: its contents (which sets, which problems) are fixed then; a set created later goes to the next homework.
- **To do**: the open homework's card sits first: "Homework 3", "due Mon 14 Sep", an OPEN action (no count; ticket 274 removed counts). It is the only way in besides its cell.
- **HW3 cell** beside PS5 (and PS6 once Completed, spanning both): muted "HW3 · due Mon 14 Sep", not pressable while in Future; pressable once open (same destination as the To do card; the destination is ticket 293, until then it may open a placeholder).
- **HW2's note** changes from "problems added to next HW" to "problems added to current HW" once Homework 3 is open.
- A homework past its due date with undone problems becomes missed (ticket 290's rule); no Homework card between a missed homework and the next one opening.

## Acceptance

- [ ] Before Send: no Future panel. After Send: panel top right, greyed, not pressable, nothing below it moves
- [ ] The HW3 cell reads "HW3 · due Mon 14 Sep", not pressable, spanning PS5 (and PS6 once Completed)
- [ ] Ending the PS6 lesson (from any tab, and the one-minute end-lesson grace) moves HW3 to the top of To do, the panel disappears, the cell and card become pressable, HW2's note reads "current HW"; live, no reload
- [ ] Unit tests: open trigger, freeze, set-created-after-open goes to the next homework
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through on the iPad and a teacher tab
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
