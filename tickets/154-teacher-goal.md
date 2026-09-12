# 154: The teacher's goal for the class, read before the check-in

**What to build:** Assignment creation asks the teacher for a goal-oriented message to the class. The student reads it once, after pressing the overview's button and before the confidence check-in: "Before you get started / Ms Okafor wants you to know…" above a speech bubble with the teacher's words and her avatar, then CONTINUE. The overview's button says CONTINUE rather than START (the goal and the check-in come first) and pulses an accent ring until pressed, so the tiles are never mistaken for the way in. The create screen opens with a suggested goal already written.

**Blocked by:** 119, 121.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with the student's overview on screen: "let's add a GOAL. so the teacher in assignment creation is prompted to write a goal to be broadcasted to the class. let's have this shown to the student after the student clicks the 'start' button. also change 'start' to continue, as the student isn't really 'starting' at this stage (they have the goal, then the confidence check in) & i don't want to mislead them with 'start'. so student screen should say 'Before you get started, Ms Okafor wants you to know...' above a bubble of text where the teacher's written goal is projected. then same deal with a continue button to move to the confidence stage. also a student might get confused by the tiles. have the start button emit like a pulse radius of the dark purple to demonstrate to the student that they need to click start. also for rn have the teacher goal preloaded in the assignment creation view. make a suggestion for Ms Okafor's goal / message for the class. this also means you'll be adding functionality to assignment creation, where the teacher is prompted 'Write a goal-oriented message for the class. This will be displayed on student screens before they start the assignment.'"

Settled in the interview: the goal is a sub-step of the start, not a pill on either pathway strip; a blank goal means no goal screen (the button still reads CONTINUE, the check-in still follows); plain text, line breaks kept, 280 characters with a counter; the goal screen uses the confidence screen's frame so the two read as one pre-flight; the confidence eyebrow becomes "Check in" so two consecutive screens do not both say "before you start"; the field sits under the title on the create screen, labelled "Goal for the class"; the fixture's unrendered `intro` becomes the goal; creation is the only teacher-side view of it for now.

## Solution

- `data/types.ts`: `Stage` gains `"goal"` between overview and confidence; `Assignment.intro` becomes `goal`; `BEFORE_HAND_IN_STAGES` is the one list of stages before hand-in, replacing five identical copies (`lib/session.ts`, `lib/classStage.ts`, `lib/hierarchy.ts`, `lib/examples.ts`, `app/teacher/TeacherLive.tsx`, `app/teacher/ForceSubmit.tsx`) that a new stage would each have had to learn about.
- `data/assignment.ts`: the fixture's goal, Ms Okafor's suggested message (239 characters). `data/draft-seed.ts`: `DEMO_DRAFT_GOAL` is the same text, so the create screen opens with it written.
- `lib/session.ts`: `SessionEnv` carries the goal in force; `overview/start` goes to `goal` when it is non-blank, else straight to `confidence`; `goal/continue` goes to `confidence`; `ORDER` and `sessionAt` know the stage (`/student?stage=goal`). `lib/store.ts` reads the goal from the active assignment into the env.
- `lib/classroom.ts`: `AssignmentDraft.goal`, `CreatedAssignment.goal`, `assignment/create` carries it, `GOAL_MAX = 280`. `lib/assignment.ts`: `ActiveAssignment.goal`: the fixture's when nothing is created or the stored assignment predates the field, the teacher's as written otherwise (blank stays blank).
- `app/student/screens/GoalScreen.tsx`: the screen. `OverviewScreen.tsx`: CONTINUE with `pulse-loop`. `ConfidenceScreen.tsx`: eyebrow "Check in". `StudentApp.tsx`, `app/student/page.tsx`: the stage mounted and deep-linkable.
- `app/globals.css`: `.pulse-loop::after`, the one-shot ring's keyframes made endless at 2 s; reduced motion holds a 6 px halo.
- `app/teacher/assignments/create/CreateAssignment.tsx`: the field under the title (label, the prompt copy, a three-row textarea capped at 280 with a counter), seeded from the stored draft or the fixture, saved to the draft on every change. `…/review/ReviewAssignment.tsx`: Create passes the goal.
- `lib/session.test.ts`, `lib/classroom.test.ts`: the new flow and the goal's travel.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] The overview's button reads CONTINUE, in the same corner, with an accent ring expanding from its edge every two seconds until pressed; under reduced motion a still 6 px halo
- [x] CONTINUE opens the goal screen: "Before you get started" / "Ms Okafor wants you to know…", the goal in a white bubble with a tail toward the teacher's MO avatar, line breaks kept, CONTINUE in the overview.s corner, where the check-in.s Submit sits (ticket 153.s frame); the header's pathway strip unchanged (indiv working current)
- [x] CONTINUE there opens the check-in, whose eyebrow reads "Check in"; a reload of plain `/student` stays put at either step; `/student?stage=goal` deep-links
- [x] The create screen shows "Goal for the class" and the prompt copy between the title and the tiles, preloaded with the fixture's goal (239 / 280); a paste over 280 is cut to 280; the draft carries the goal; Create writes it onto the assignment; the student then reads the teacher's own words
- [x] A blank goal: the created assignment's goal is "", the overview's button still reads CONTINUE, and pressing it opens the check-in directly
- [x] vitest (434), eslint, tsc, `next build`, headless run (`goal154.mjs`, 35 checks)
