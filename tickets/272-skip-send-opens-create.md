# 272: Teacher skip to "send assignment" opens Create ready to send; jumps open the set on Sam's iPad

**What to build:** The teacher's presenter skip "send assignment" (ticket 263) no longer sends the set silently and leaves the teacher where they were. It opens Create on its final step with Problem Set 6 and the demo pathway already filled in, not yet sent, so the presenter presses Create and demos the moment of sending. Separately, when "students done with current stage" or "activity completed" moves the lesson while Sam's iPad is on his Classroom, the iPad opens the set.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "skip to teacher mode doesn't seem to actually work. at least not the send assignment — doesn't take me to send assignment." Reproduced on the dev server at 1280×800 in a fresh profile (`scratchpad/repro-send.mjs`): pressing it on `/teacher` does send PS6 (the Live card appears, Sam's To do shows PS6) but the teacher stays on Edexia Classroom, so nothing reads as "skip to send assignment". Asked where it should land, the user chose Create's last step, ready to send.

On ticket 263's open question "should a jump open the set on Sam's iPad when he is on his Classroom?": "yep".

## Solution

- `lib/demo.ts` `teacherSkip("send", …)`: produces a Create draft on its final (review) step holding PS6's problems, goal, new skills and the demo pathway (`DEMO_PATHWAY`), with no assignment sent and Sam at his Classroom; the teacher navigates to that step's route. Seating and absences are kept. Pressing Create there sends as a real Create does (ticket 263 made Create start a fresh lesson).
- "students done" stays disabled until a set is sent; "activity completed" before anything is sent sends and completes as today.
- Sam's iPad: a jump that moves the lesson while `/student` shows his Classroom opens `/student/a/pset-6` at the jumped stage (done, completed). "send assignment" leaves him on his Classroom (nothing is sent yet).

## Acceptance

- [x] Unit: the send skip's draft (step, problems, pathway, nothing sent) from fresh, mid-lesson and completed; done and completed unchanged otherwise
- [x] Click-through, teacher + board + Sam's iPad at 1280×800 and 1440×900: from Classroom, Class View and Mistakes, "send assignment" lands on Create's final step filled in with Create enabled and no Live card anywhere; pressing Create sends (Live card, Sam's To do); "students done" and "activity completed" from Sam's Classroom open the set on the iPad at the right stage; reproduce script passes
- [x] vitest, eslint, tsc, next build, check:laptop

## Added 2026-09-14

The presenter now always lands on Create's last step, so two things seen on it are fixed here.

1. **The set in the students' order.** Accepting "Add a problem" appended the worded problem, so the filled-in set listed the ball problem last while students have it as Q9. An accepted addition now takes the slot of a question the teacher removed (first addition, first freed slot) and comes last only when nothing was removed (`applyReview` in `lib/review.ts`); its card reads "added as Q9". A normal Create gets the same rule.
2. **The floating Back and Create clear the content.** At 1280×800 the pair floated over the Confirm groups card. Every Create step now leaves the bar's whole height under its content (`CREATE_BAR`, `CREATE_BAR_CLEARANCE` in `app/teacher/assignments/create/createBar.ts`), so the last row scrolls clear of it.

- [x] Unit: the addition fills the removed slot, wherever the draft has it; last with no removal; a removal alone closes up; the skip's step lists PS6 in bank order
- [x] Click-through at 1280×800 and 1440×900: one Back from the landing step shows Q1–Q10 in the students' order with the ball problem at Q9 marked added and "added as Q9"; at the bottom of the scroll the bar covers nothing on the Pathway and Assessment steps
- [x] vitest, eslint, tsc, next build, check:laptop, click272.mjs, skip263.mjs, classroom264.mjs
