# 261: Sam's Classroom is his landing page: To do, Missing, Completed

**What to build:** `/student` opens on Sam's own Classroom on the iPad: his assignments in three sections, **To do**, **Missing** and **Completed**. PS1–PS5 are Completed. PS6 appears in To do only once the teacher has sent it (Create, or the teacher's skip to "send assignment", ticket 260); pressing it opens PS6 at its start. Only Sam gets a Classroom.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

Outside review (2026-09-14): "/student opens on the final report… that's his first impression of the whole product." The user: "also need to set up student indiv Classroom. we'll only do this for Sam — but this should be his landing page. his say 'completed', 'missing', & 'to do' — with PSet6 showing up in 'to do' at landing after teacher has pushed assignment."

Agreed default: on a fresh demo PS6 has not been sent. Sam's To do is empty and the teacher's Edexia Classroom has no live PS6 card until Create or skip to "send assignment".

## Solution

- Sections in order To do, Missing, Completed, each a list of cards in the student side's style (name, due date; To do cards the one action). Empty sections say so in a few words (Sam is never missing a set).
- Source of truth: the classroom state's sent assignments and the story data (`data/story.ts`) for PS1–PS5; PS6 moves To do → Completed when Sam finishes it (report and reflection in), and to Missing if the lesson is completed without his hand-in.
- Routing: `/student` renders the Classroom; PS6 opens the existing student app at start. The iPad header's Edexia mark returns to the Classroom. The student SKIP TO still jumps straight into PS6's stages.
- Default demo: PS6 not sent. Every existing screen, deep link and test that assumed a live PS6 without Create is updated to send it first (the presenter skips already create it). Reset returns to not sent.
- Teacher Classroom agrees: no live PS6 card until sent.

## Acceptance

- [ ] Unit: section of each set for Sam before sending, after sending, mid-lesson, after completion, and completed without hand-in
- [ ] Click-through, teacher + Sam's iPad at 1280×800 and 1440×900: fresh demo shows PS1–PS5 Completed and an empty To do; teacher Create sends PS6 and it appears in To do without a reload; pressing it opens start; the header mark returns; finishing PS6 moves it to Completed; reset returns to not sent; nothing clips inside the iPad frame
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes
