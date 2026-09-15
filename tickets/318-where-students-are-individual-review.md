# 318: Where students are during individual review

**What to build:** while the class is on individual review, the set's Mistakes tab keeps ticket 315's split. On the left, **Where students are**: Not started, a row per question and Done reviewing, each student once, in the row of the problem they have open, with how many still need to fix each question beside its label. On the right, **Where students went wrong**: the mistake cards thinned to the students still to fix, a fully fixed card shrinking to one line.

**Blocked by:** none (316 is done).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Designed with Carson on 2026-09-15 in a grilling session. The agreed mockup is https://claude.ai/artifact/UX9eWozokBpAt3PUXn945x, version 3, individual review frame. Carson's words and answers, in order:

- "the way we've split Mistakes tab into two vertical panels in indiv working, want analogous functionality for indiv review & group review … indiv review very analogous."
- **Rows.** Questions (Q1–Q10), each student in the row of the problem they have open. A student between problems stays in the row of the last one; a Not started row for students who have opened nothing; Done reviewing at the foot, with Chloe absent there.
- **Only where students are now.** "the teacher will already know the problematic problems bc they'll see mistakes view in the other window. so all the avatars are overwhelming. change to what you currently have in the mock up as the black border ones as the only thing that stays. then, add another column to the table. say 7 need to fix, 3 need to fix, etc."
- **Pills.** Plain (no outline; the purple ring still means "you opened their panel"), "fixed n of m" and the time open, as ticket 327/328 draw it. No red "still wrong" dot. Pills in Done reviewing carry no words.
- **Counts.** Blank at zero. Unfinished and not attempted count as well as wrong.
- **Fit.** Pills wrap inside their row. If the column still does not fit, the pills shrink; rows never fold.
- **Right.** Only mistakes somebody still has to fix; the header reads "n fixed · m still to fix"; a card everyone has fixed shrinks in place to a thin "Q6 · everyone fixed" line. Whole questions, never truncated.
- **Landing.** The teacher lands on Mistakes during individual review.
- **After the stage.** Once individual review is finished but still current, the split stays in its final state with no extra text.
- **Pressing a pill.** Opens that student's work in 316's panel.
- **Simulation.** The classmates' simulated individual-review activity is built here, as separate named demo data.
- **Q10 (added to this ticket by Carson).** Q10 showed its equation twice, once in the stem's words and once as KaTeX. Carson asked for it to end "…and say what that means for its graph.", with every other stem that repeats its expression fixed the same way. Ticket 342 landed the removal across every stem, with a guard, while this ticket was in flight, ending Q10 "…for the graph."; this ticket sets Carson's wording.

## Acceptance

- [x] On `/teacher/a/pset-6/mistakes` during individual review, the split from ticket 315: the eyebrow line with the stage pill ("indiv review", its done count, force submit), then **Where students are** and **Where students went wrong**, level
- [x] Opening the set during individual review lands on Mistakes; the working and the later stages land as before
- [x] Left: rows Not started, Q1 … Q10, Done reviewing, never reordered or folded. Each row is a label cell, a count cell and the pills
  - A question's count: "12 need to fix" (the number in the display face, the words muted). It counts every student in the room who got the question wrong, left it unfinished or never reached it, less those whose correction is in and right. Blank at none, and it never climbs
  - Done reviewing's count: "3 done", equal to its pills and to the stage's done count
- [x] Each of the nineteen present students is in exactly one row
  - Not started until they open a problem
  - then on the problem they have open: "fixed n of m" and "N here", the time dark purple from three minutes
  - then Done reviewing, with no words
  - Priya, with nothing to fix, is done from the start. Chloe is named absent under Done reviewing
- [x] Sam's pill follows his iPad: choosing a problem, or writing on the one showing, opens it; his hand-in puts him in Done reviewing. The classmates follow the demo's rework pacing, derived from their records and second submissions, and are done when they reach the gate
- [x] A column that would not fit the scroll region drops the pills' "fixed n of m", then their time, then their names. The choice is measured before paint, with no state
- [x] Pressing a pill opens the student's panel over the left column
  - every problem they have to fix in set order, each with the first submission and the correction so far
  - the open one "in progress"
  - Priya reads "Nothing to fix"
  - Escape and a press outside close it
- [x] Right: each card names only the students still to fix it, with "n fixed · m still to fix" in its header and no Live diagnostic. A card everyone has fixed is a thin "Q6 · everyone fixed" line in its place. Whole questions, maths on one line, no difficulty tag
- [x] No duplicated equation in any stem (ticket 342's guard, `lib/stemMaths.test.ts`); Q10, Q10\*, Q10\*\*, homework Q10 and the draft seed end "…and say what that means for its graph."
- [x] Nothing scrolls sideways at 1280×800 or 1440×900
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280×800 and 1440×900 with Sam's iPad and the teacher tab against a production build
- [x] Ticket docs: `architecture/318-where-students-individual-review.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README

## Solution

- **Model (`lib/reviewPlaces.ts`).** `reviewPlaces(set, classroom, session, now)` gives every student's `ReviewPlace` (not started, a problem, done, absent), the moment they came into it, their `toFix` and what they have `fixed` by now.
  - **Sam** reads his session. `sessionToFix` is his first submission: a wrong line, or not finished. `reworkIndex` and `reworkOpenedAt` say what is open. `correctionRight` on his rework: lines, none wrong, an answer.
  - **A classmate** runs `reworkScript` from Sam's hand-in (`handedInAt`): a reading time, then each of `recordToFix`'s problems in turn (set order, or wrong ones first for an odd roster position), paced by `data/classmates-rework.ts`. A correction lands right exactly when their second submission holds.
  - **Done.** A classmate is done at their gate arrival (`ARRIVAL_OFFSETS_MS` after Sam's), or at once with nothing to fix. From then every right correction has landed.
  - **Rows.** `reviewRows` turns this into `ReviewRow`s (a `WhereRow` with a count), with `StudentPill`s reading "fixed n of m" and the "here" time.
- **Session (`lib/session.ts`, `lib/store.ts`).** `reworkOpenedAt` is new. `rework/goto` takes `at` and sets the open problem. The first `rework/stroke` stamps it too. The store stamps both actions. `FeedbackScreen` reads its selection from `reworkIndex`, so a reload keeps it.
- **Stage count (`lib/classStage.ts`).** `stageDone("individual")` is `reviewDoneCount(reviewPlaces(…))`, so the pill's "n/19 done" and the Done reviewing row always agree.
- **Demo skips (`lib/demo.ts`).** The "indiv review" skip and the presenter's done date the hand-in `now`. The "class wait" skip dates it `REVIEW_SKIPPED_MS` (6 min) before its arrival.
- **Landing (`lib/assignments.ts`).** `landingFor` sends individual review to Mistakes.
- **Screen.** `TeacherMistakes` splits on working or individual review.
  - In review the left is `ReviewTable` (`app/teacher/WhereStudentsAre.tsx`): label 164 px, count 128 px, pills. The fit steps are `data-fit` whole → time → names → avatars, read by `group-data-[fit=…]/review` classes on the pill's name, detail and time.
  - The cards' rows are filtered with `stillToFix`. A problem with none left draws `data-problem-fixed`. The header shows `data-review-counts`, and the Live diagnostic chip is hidden.
  - `StudentWorkPanel` draws `ReviewList` from `reviewWorkAt` (`lib/studentWork.ts`).
- **Stems.** Ticket 342 removed every stem's text copy of its expression (and a scan of every data stem against its own TeX here found nothing more). `data/assignment.ts` Q10, `data/pairs.ts` Q10\* and Q10\*\*, `data/homework.ts` Q10 and `data/draft-seed.ts` line 10 now end "…and say what that means for its graph." as Carson worded it. `lib/mathInput.test.ts`'s inline-maths parser test no longer quotes the old stem.
