# 43: The individual view, and a tidy of the teacher's screens

**What to build:** Six changes the teacher asked for on 2026-09-10, from screenshots. (1) The groups page loses the colour dot and the colour name in each column header; the coloured top edge is the group's whole identity. The suggested-by-mistakes section is hidden, code kept. (2) The Report tab goes. (3) An individual view per student, opened from the name on the class view: the platform's commentary as a few ideas in a light-blue bubble, and beneath it what the student wrote back in a white box with a purple border. (4) The hover bubble of notes under a name on the class view (the previous commit) is undone; commentary lives on the individual view only. (5) Group and skill names read lowercase everywhere the drill shows them. (6) Hovering a category header shows an "expand" button the size and shape of the chip, white with a light-blue border and purple text, doing what the double-click did; and "force assignment submit" moves to the Class View title line, right edge flush with the table's, without the Class card's header.

**Blocked by:** 42.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The class view was carrying commentary in a hover bubble that covered the row below, and the only per-student page was the demo student's report behind a tab. The teacher wants one place per student for the commentary and the student's reply, and the class view kept to dots, names and the two right-hand columns.

## Solution

A pure `commentaryFor(student, session)` gives any student the same two things: ideas (a classmate's fixture notes; the demo student's teacher-facing notes on the steps that didn't hold, one per distinct note) and a clarification (a classmate's scripted line; the demo student's reflection once sent). The report page takes `?student=` through the server page and shows that student, falling back to the demo student. The class view links each name there. The rest is layout.

## Acceptance

- [x] Groups page: no dot, no colour name; count only; suggested groups hidden behind `SHOW_SUGGESTED`
- [x] No Report tab; `/teacher/report` still resolves, and `/teacher/report?student=<id>` for a classmate
- [x] Individual view: commentary ideas in a light-blue bubble, clarification in a white purple-bordered box; an idea lights only its skills
- [x] No notes bubble or notes under names on the class view; the name is the link
- [x] Groups and skills lowercase in the drill; categories keep their case
- [x] Hover "expand" button over each category chip, same size, white / light-blue border / purple text; expand → skills → close
- [x] Force submit inline on the title line, right edge on the table's; confirm and countdown inline too; the Class card holds only the group-review gate and hides when there is nothing to say
- [x] Unit tests for the commentary; browser check of every changed screen; architecture note and root docs
