# 318: Where students are during individual review

## Files touched

| File | What it does |
| --- | --- |
| `lib/reviewPlaces.ts` | New. `reviewPlaces` gives each student's place in individual review (not started, a problem, done, absent), with `entered`, `toFix` and `fixed`. It also exports `correctionRight`, `recordToFix`, `sessionToFix`, `reworkScript`, `reviewRows` (`ReviewRow` = `WhereRow` + count), `reviewDoneCount` and `stillToFix`. |
| `data/classmates-rework.ts` | New. The demo's rework pacing (reading, per problem, a correction that stays wrong, where it lands), apart from the product rule. |
| `lib/reviewPlaces.test.ts` | New. Right corrections, to-fix lists, the script's determinism and order, places before, during and after the gate, Sam's open problem, rows, counts that never climb, and done equal to the stage count. |
| `lib/session.ts`, `lib/store.ts` | `reworkOpenedAt`. `rework/goto` and `rework/stroke` carry `at`, stamped by the store. `reworkIndex` indexes the set's problems. |
| `app/student/screens/FeedbackScreen.tsx` | The open problem is `session.reworkIndex`, chosen with `rework/goto`. |
| `lib/classStage.ts` | `stageDone("individual")` = `reviewDoneCount(reviewPlaces(…))`. |
| `lib/demo.ts` | The "indiv review" skip and the presenter's done date the hand-in `now`; "class wait" dates it `REVIEW_SKIPPED_MS` earlier. |
| `lib/assignments.ts` | `landingFor`: individual review lands on Mistakes. |
| `app/teacher/WhereStudentsAre.tsx` | `ReviewTable`: label, count, pills. It fits by `data-fit` (whole → time → names → avatars); the `StudentPill` name, detail and time hide under `group/review`. |
| `app/teacher/TeacherMistakes.tsx` | The split also runs in individual review. The cards are filtered to those still to fix, a fixed card is a thin line, the header shows "n fixed · m still to fix", and there is no diagnostic chip. |
| `lib/studentWork.ts`, `app/teacher/StudentWorkPanel.tsx` | `reviewWorkAt` and `ReviewList`: each problem to fix, with its first submission and correction. |
| `data/assignment.ts`, `data/pairs.ts`, `data/homework.ts`, `data/draft-seed.ts` | Q10's stem ends "…what that means for its graph." (ticket 342 had removed the repeated equation). |
| `lib/mathInput.test.ts`, `lib/classStage.test.ts`, `lib/assignments.test.ts` | The parser test's own example, the done count (Priya done from the start), the landing. |

## How it connects

```
 Sam's iPad (FeedbackScreen)                     classmates' records
   rework/goto {index, at} ─┐                      done, wrong, review.second
   rework/stroke {at}  ─────┤                              │
   rework/done {at} ────────┤                              │  data/classmates-rework.ts (pacing)
                            ▼                              ▼
                 lib/session.ts                  reworkScript(m, index, problems)
                 reworkIndex, reworkOpenedAt,      read ─▶ open p1 ─▶ lands ─▶ open p2 …
                 rework, handedInAt, reworkedAt    right ⇔ correctionRight(second)
                            │                              │
                            └──────────────┬───────────────┘
   classroom.arrivals[sam] ─▶ gate: done at arrival + ARRIVAL_OFFSETS_MS (lib/readiness.ts)
                                           ▼
                 lib/reviewPlaces.ts  reviewPlaces(set, c, session, now)
                 ┌─────────────────────────────────────────────────────┐
                 │ id · place (not-started │ problem │ done │ absent)  │
                 │ entered · toFix · fixed                             │
                 └───────┬───────────────────┬────────────────┬────────┘
                         │                   │                │
          reviewRows ────┘      stillToFix ──┘   reviewDoneCount
                 │                   │                │
                 ▼                   ▼                ▼
 ReviewTable (WhereStudentsAre)   mistake cards      lib/classStage.ts stageDone("individual")
 ┌──────────────┬──────────────┬────────────────────────────────────┐
 │ Not started  │              │ (SO) Sam Okonkwo                   │
 │ Q7           │ 8 need to fix│ (AP) Aiden  fixed 0 of 1  3 min here│
 │ …            │              │                                    │
 │ Done reviewing│ 3 done      │ (PR) Priya  (LU) Lucas   Chloe absent│
 └──────────────┴──────────────┴────────────────────────────────────┘
   data-fit: whole ─▶ time ─▶ names ─▶ avatars (measured before paint)
                 │ press a pill
                 ▼
 StudentWorkPanel ◀── reviewWorkAt: each problem to fix
                      First submission (WorkLines) / Correction (WorkLines or "Nothing yet")

 Right column: Q1 card  "1 fixed · 3 still to fix"  names still to fix only
               Q6       "Q6  everyone fixed"   (thin line, data-problem-fixed)
```
