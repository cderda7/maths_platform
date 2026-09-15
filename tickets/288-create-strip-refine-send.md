# 288: The Create strip reads Questions – Difficulty – Refine – Pathway – Send

**What to build:** the teacher's create pipeline strip renames ASSESSMENT to REFINE and gains a last label, SEND, which lights for about 600 ms when Create is pressed before the page moves on as today. The teacher's Classroom button "+ New assignment" becomes "+In-Class PSet", and the create screens' eyebrow no longer says NEW ASSIGNMENT.

**Blocked by:** none (can start immediately).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), on the Pathway step screenshot: "add '... pathway - send' ... also change 'assessment' to 'refine' -- otherwise, teacher might associate 'assessment' with a school assessment, instead of what's happening with the assignment". On Send: "just step happens upon clicking 'create' -- really just there for visual clarity of the pipeline of creating an assignment". On the button: "have '+In-Class PSet' & '+Homework'. also just omit the NEW ICW PSET & NEW HW from the eyebrow".

## Decisions

- SEND is **not a page**. It is always visible as the last label; pressing Create lights it (~600 ms) then proceeds exactly as today.
- Button label exactly `+In-Class PSet` (ticket 291 adds `+Homework` beside it).
- The eyebrow drops "NEW ASSIGNMENT" (keeps the class part, e.g. "11 METHODS").
- Only the label changes for Refine; internal step names may stay.

## Acceptance

- [ ] Strip reads QUESTIONS — DIFFICULTY — REFINE — PATHWAY — SEND on every create step
- [ ] Pressing Create lights SEND, then lands where Create lands today; Create's disabled state unchanged
- [ ] Teacher's Classroom shows `+In-Class PSet`; no "NEW ASSIGNMENT" in any create eyebrow
- [ ] Nothing else on the strip or the page moves (geometry before/after)
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
