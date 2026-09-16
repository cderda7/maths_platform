# 337: "Only 5/19 students got Q7 correct": the teacher moves questions from group review to class review

## Files touched

| File | What it does |
| --- | --- |
| `lib/splitReview.ts` | New, pure. The split's whole model. `QuestionTally` (a question, how many of the room have it right, over how many are in the room) and `belowHalf`; `talliesAfterCorrections` (Where students are' own rule: a student has a question right when it was not theirs to fix, or their correction is in and right) and `talliesSoFar` (first submissions, on a pathway without individual review); `splitSuggestion` (the two fewest have right, ties on the later question of the set; then every other question below half; then the rest); `splitEvidence` (which counts this pathway allows, how many have handed their corrections in, the suggestion); `halfOrMore` and `dueSplit` (the trigger: the class is in individual review, group review is next, half or more of the room have handed in corrections, and something is below half); `splitOnCard` / `toClassReview` (the pathway variants); `groupsWithout` and `everyGroupEmpty` (what the ticked questions would leave the groups); `moveAnswer` (the answer a press writes, resolved against ticket 336's locks, always ending with class review on the pathway); `movedInSetOrder`. |
| `lib/decisionState.ts` | `DecisionKind` gains `split-review`. `DecisionAnswer` gains `{ kind: "move"; moved; pathway? }` and `moved?` on `change`; `answerMoved`; `LessonDecision.dismissed` and the `decision/dismiss` action (Close on the card an answer leaves up). **`movedToClassReview(c)`: the one accessor for the questions moved out of group review** — the group lists, class review's setup, the 319 grid and the reports all read it. |
| `lib/decision.ts` | `lessonDecision` picks between the two kinds: the split's card while it is not lapsed, else the close-to-finishing one. `splitView` (stored or derived; lapses when the class leaves individual review or group review is switched off; `carriesPathway` when the close-to-finishing card went unanswered before it came due), `closeView` (carrying the split itself on a pathway without individual review, and the "these go to class review" counts on one without group review). `DecisionView` gains `split`, `toClassReview`, `carriesPathway`, `dismissed`; an answered decision that moved questions still shows its card until Close. The evidence is read at the moment the decision came due, so nothing under the teacher's cursor moves. |
| `lib/classroom.ts` | `decision/dismiss` beside the other decision actions; an answer that moves questions is refused once a board has opened (`c.group`), so the groups' questions are never changed under a running board. |
| `lib/standings.ts` | `wrongOf` / `wrongSetsOf` / `simulatedBoardOf` take the moved questions; `groupsAt` and `sittingOut` default them to `movedToClassReview(c)` (and take an override, which the card uses to ask what a tick would leave). Every count of groups follows: the race, the leaderboard, the teacher's progress card, the stage's done count and ticket 319's grid. |
| `lib/group.ts` | `groupPlan(…, moved)` drops the moved questions from every member's set, so Sam's board and the gate read them too; `liveGroupPlan` passes `movedToClassReview(c)`. |
| `lib/report.ts` | `recordReviews` / `sessionReviews` take the moved questions: a moved question has no group version (no group worked it) and carries `movedToClass`, which `outcomeOf` reads, so class review's examples alone make it "Covered in class review". |
| `lib/classStage.ts` | The pre-existing strip fix: `atGateWithoutReview` (no individual review, the live student at the gate, the gate not open) keeps the working the current stage there, with the gate's count (`stageDone`) and `forceKind` naming the advance that opens the gate; `canForce` takes the clock. |
| `app/teacher/DecisionCard.tsx` | The split card: the same headline, "10 of 19 here have handed in their corrections", the pathway as one line with "· change" (Change opens ticket 336's line in place and Done returns to the card), the ask ("Only 5/19 students got Q7 correct and 8/19 got Q10. Remove from group review & save for class review?"), the rows (`SplitRows` / `SplitRow`: a tick, the label, the whole question through `ProblemQuestion`, "5/19 correct"; the suggestion, then "Also often wrong", then "all questions", scrolling inside the card), the note ("Every group works the rest." / "Adds class review after group review." / "No group would have anything left to review."), Later and one press: **Move to class review**, **Skip to class review** or **Keep**. Answered, the card stays with "Saved for class review.", what leaves group review, and **Close** and **Set up class review →**. |
| `app/teacher/ForceSubmit.tsx` | Reads `forceKind`, so at the gate without individual review the press opens the gate instead of being greyed out. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | A moved question is ticked and cannot be unticked, marked "from group review" in the place of its struggled count, beside the usual top-3 pre-ticks. |
| `app/teacher/TeacherMistakes.tsx` | Passes the moved questions to `gridAt` (ticket 319), which greys their row across every group. |
| `app/student/screens/ReportScreen.tsx`, `app/teacher/report/TeacherReport.tsx`, `lib/studentReport.ts` | The live set's reports read the moved questions. |
| `lib/splitReview.test.ts`, `lib/classStage.test.ts` | The suggestion, the trigger, the card, the answer, the groups after a move, the report, the strip at the gate. |
| ticket, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 lib/reviewPlaces.ts reviewPlaces ─┐            lib/stream.ts classmatesAt ─┐  (no individual review: first submissions)
   (toFix / fixed per student)     ▼                                        ▼
 ┌ lib/splitReview.ts ──────────────────────────────────────────────────────────────────────┐
 │ talliesAfterCorrections | talliesSoFar ─▶ QuestionTally { problem, correct, present }     │
 │ splitSuggestion ─▶ { suggested (2 fewest), often (< half), rest }                         │
 │ dueSplit (individual review + group next + half the room's corrections in + one below half)│
 │ everyGroupEmpty(ticks)      moveAnswer(planned, requested, ticks, locks)                  │
 └───────────▲────────────────────────────────┬─────────────────────────────────────────────┘
             │ lib/pathwayChange.ts liveLocks │
 ┌ lib/decision.ts ──────────────────────────┐│        ┌ app/teacher/DecisionCard.tsx ───────────────┐
 │ lessonDecision: split-review while it is  ││        │ headline · corrections in · pathway · change │
 │ not lapsed, else close-to-finishing       │└───────▶│ ask + rows (whole question, n/19 correct)   │
 │ view.split (read at dueAt), carriesPathway│         │ [Later] [Move to class review | Keep]        │
 │ answered + moved ─▶ the card stays        │         │ answered ─▶ [Close] [Set up class review →]  │
 └───────────▲───────────────────────────────┘         └───────────────┬─────────────────────────────┘
             │ c.decisions                                             │ decision/answer { move, moved, pathway? }
 ┌ lib/decisionState.ts ─────────────────────┐                         ▼  decision/dismiss
 │ DecisionAnswer move | change | keep        │◀──── lib/classroom.ts classroomReducer
 │ answerMoved   answerPathway                │      (writes assignment.pathway in the same step;
 │ movedToClassReview(c)  ◀── the accessor    │       refuses a move once c.group exists)
 └───────┬───────────┬───────────┬────────────┘
         │           │           │
         ▼           ▼           ▼
 lib/standings.ts  lib/group.ts        lib/report.ts            app/teacher/whole-class/WholeClassSetup.tsx
 wrongOf(moved)    groupPlan(…, moved) recordReviews(…, moved)  ticked, locked, "from group review"
 groupsAt          liveGroupPlan       movedToClass ─▶ covered           │
 sittingOut            │                                                 ▼
    │                  ▼                                          wc/setup ─▶ the board
    │      app/student/StudentShell.tsx (the gate, Sam's board)
    ▼
 lib/classStage.ts stageDone("group")   lib/groupGrid.ts gridAt(…, moved) ─▶ grey "class review" row (ticket 319)
 app/teacher/GroupProgressCard.tsx      app/board Leaderboard, GroupBar
```

## The card

```
 ┌ decision card, 400 layout px, bottom-right of the scroll region ───────────────┐
 │ Most students are close to finishing.                                          │
 │ Let's discuss what's next.                                                     │
 │ 10 of 19 here have handed in their corrections                                 │
 │ Your pathway indiv working → indiv review → group review → class review ·change │
 │ Only 5/19 students got Q7 correct and 8/19 got Q10. Remove from group review    │
 │ & save for class review?                                                       │
 │ [✓] Q7  Factorise fully. ⅓x² + 2x + 8/3                        5/19 correct    │
 │ [✓] Q10 Show that the following has no real solutions, …       8/19 correct    │
 │ all questions                                                                  │
 │ Every group works the rest.                                                    │
 │                                                  [Later] [Move to class review]│
 └────────────────────────────────────────────────────────────────────────────────┘
```

## The demo

At 1280 × 800, Problem Set 6 with the demo's pathway: the card comes about thirty seconds after Sam hands his corrections in
(ten of the nineteen in the room are done with theirs), and the gate into group review opens on its own about thirty seconds
later. The two questions it pre-ticks are **Q7 (5/19 correct)** and **Q10 (8/19 correct)**; nothing else is below half
(Q9 is 10/19), so "also often wrong" is empty and the other eight sit behind "all questions". Accepting leaves the unions
coral Q4 Q5 Q8 Q9, amber Q2 Q9, mint Q3 Q5 Q6 Q8 Q9, sky Q1 Q2 Q3 Q5 Q6 Q8 Q9, violet Q1 Q2 Q4 Q8 Q9 — no group sits out.

## For ticket 319 and class review

- **The moved questions:** `movedToClassReview(c)` (`lib/decisionState.ts`), or `movedInSetOrder(c, problems)` for them in
  set order. `gridAt(c, session, now, problems, moved)` already greys their row.
- **Class review's setup** reads the same list: locked, ticked, "from group review".
