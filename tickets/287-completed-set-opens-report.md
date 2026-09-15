# 287: A Completed set opens its student report

**What to build:** on Sam's Edexia Classroom (the iPad's landing), pressing a Completed card anywhere opens his own student report for that set, read-only, in the look he gets at the end of in-class work. Today Completed cards open nothing and any set other than the live one redirects back to the Classroom.

**Blocked by:** none (can start immediately).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "student can't click into completed psets at all. change functionality so that clicking on an assignment brings them to their student report page, that they currently get in the ICW workflow."

Sam handed in all ten problems on Problem Sets 1–5 (`STORY.sam.done`), so all five are Completed; the Class View already shows his PS1–PS5 results from the story records. Only Problem Set 6 can be Missing (the lesson ends without his hand-in).

## Decisions (grilling session 2026-09-15)

- **Whole card pressable** (hover and press state), no OPEN button: the homework cells that tickets 290–292 add sit *outside* the card, to its right.
- **Read-only student report**: the ICW report screen's layout (outcome columns, Q tiles that open his marked working in the side column, skill dots, key). No Send. His **sent reflection** is shown as text where the reflection box was.
- **PS1–PS5** are built from the same story records the teacher's report and Class View read (outcomes, working versions, class review covered problems where the set had one). Write a short, plausible reflection for Sam on each of PS1–PS5 as separate named story data (in his voice, matching his arc: confident, scales part of an expression and leaves the rest).
- **PS6** once his report is sent opens the same read-only report (not the homework folder screen, which plays once right after sending).
- **Missing cards** stay unpressable (nothing handed in).
- A **back** control returns to the Classroom.
- No difficulty tags anywhere (student side).

## Acceptance

- [ ] Pressing any Completed card (PS1–PS5, and PS6 after his report is sent) opens that set's read-only report; a deep link to it survives reload
- [ ] The report's columns and tiles match the teacher's report of Sam on the same set (same problems in the same columns)
- [ ] His reflection shows as sent text; no Send, nothing editable
- [ ] Back returns to the Classroom; Missing cards and To do behaviour unchanged
- [ ] Fits the iPad without horizontal scroll; no maths wide or split; no difficulty tags
- [ ] vitest, eslint, tsc, next build, check:laptop; a click-through opening every Completed card
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
