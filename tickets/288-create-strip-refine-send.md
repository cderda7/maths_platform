# 288: The Create strip reads Questions – Difficulty – Refine – Pathway – Send

**What to build:** the teacher's create pipeline strip renames ASSESSMENT to REFINE and gains a last label, SEND, which lights for about 600 ms when Create is pressed before the page moves on as today. The teacher's Classroom button "+ New assignment" becomes "+In-Class PSet", and the create screens' eyebrow no longer says NEW ASSIGNMENT.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), on the Pathway step screenshot: "add '... pathway - send' ... also change 'assessment' to 'refine' -- otherwise, teacher might associate 'assessment' with a school assessment, instead of what's happening with the assignment". On Send: "just step happens upon clicking 'create' -- really just there for visual clarity of the pipeline of creating an assignment". On the button: "have '+In-Class PSet' & '+Homework'. also just omit the NEW ICW PSET & NEW HW from the eyebrow".

## Decisions

- SEND is **not a page**. It is always visible as the last label; pressing Create lights it (~600 ms) then proceeds exactly as today.
- Button label exactly `+In-Class PSet` (ticket 291 adds `+Homework` beside it).
- The eyebrow drops "NEW ASSIGNMENT" (keeps the class part, e.g. "11 METHODS").
- Only the label changes for Refine; internal step names may stay.

## Solution

- `lib/createPipeline.ts`: the strip's steps as data per kind of set (`PIPELINES.pset`: Questions, Difficulty, Refine, Pathway, Send), `currentStep` and `SEND_LIGHT_MS` (600). Refine keeps the internal id `assessment`. Ticket 291 adds a `homework` entry without Pathway.
- `review/Steps.tsx`: renders the list it is given; Send is never tappable.
- `review/ReviewAssignment.tsx`: Create lights Send and locks the strip (Back, the strip's earlier steps and a second Create do nothing), then after 600 ms sends and lands on the set as before. The page keeps the sent draft on screen until the route changes, so the old one-frame "Untitled assignment · Nothing drafted yet" flash on the way out is gone. The eyebrow reads "11 METHODS".
- `app/teacher/Classroom.tsx`: the button reads "+In-Class PSet" (the + glyph as before); the not-created card's link (`AssignmentProvider`) reads the same.
- The strip shows on the review route's steps (Difficulty, Refine, Pathway), as before; the Questions page still has no strip.



- [x] Strip reads QUESTIONS — DIFFICULTY — REFINE — PATHWAY — SEND on every create step
- [x] Pressing Create lights SEND, then lands where Create lands today; Create's disabled state unchanged
- [x] Teacher's Classroom shows `+In-Class PSet`; no "NEW ASSIGNMENT" in any create eyebrow
- [x] Nothing else on the strip or the page moves (geometry before/after)
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
