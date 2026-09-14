# 282: The report shows not attempted and covered in class review

## Files touched

| File | What it does |
| --- | --- |
| `lib/report.ts` | `Outcome` gains `covered` ("Covered in class review", after group review, before Incorrect). `ProblemReview` carries `finished` (the first submission has an answer on it; an unfinished one is never right first time) and `classReview` (the board's examples on a covered problem, lines only). `outcomeOf`: covered when the report's pathway has class review, the problem has examples, and the student's group closed it unsolved. `ClassReviewShown`, `recordedClassReview` (a finished set's record, names dropped), `liveClassReview` (the board, once class review is over), `reportPathway` (class review only once it happened). `columnsOf` puts each column's not-attempted problems in `notAttempted`; `notAttemptedNote` words it. `shownVersions` ends a covered problem with the `class` pane. `unsolvedOf` and `unsolvedInGroup` are gone. |
| `lib/setScore.ts` | `firstFinished` (the live student's first submission has an answer) and `recordFinished` (inside `done`), shared by the Set column's score and the report's Correct first try. |
| `lib/classroom.ts` | `WholeClassSession.reached`: the furthest slide the board showed (0 on project, raised by Next, never lowered by Back). `boardCovered`: the problems up to it, once class review ended; null before, or if it was never projected. |
| `lib/assignments.ts` | `setClassReview`: a finished set's recorded class review, or the live set's board. |
| `lib/demo.ts` | "activity completed" runs class review through: set up, projected, every slide, ended, so the report covers every projected problem. |
| `lib/examples.ts` | `EXAMPLE_LETTERS` exported: the board's letters, which the report's pane uses too. |
| `components/OutcomeTiles.tsx` | The grey `covered` tile (`--color-covered-soft`, `--color-covered-line` in `app/globals.css`); a not-attempted note per column (under the tiles, or the label's second line with `noteInLabel`); a column's floor never narrower than its tiles on one row. The not-solved note is gone. |
| `components/ClassReviewExamples.tsx` | Class review's examples, lettered A, B, C, unmarked (`WorkLines unmarked`), side by side or stacked. |
| `components/HierarchyDrill.tsx` | `WorkLines unmarked` (no red, blue, skill rule or chip); `ProblemHead` split out of `ProblemWork`. |
| `app/teacher/report/TeacherReport.tsx` | Reads `setClassReview` and `reportPathway`; the working's "· Not solved in group review" gone; the Class review pane shares the versions' row while it holds four columns at most, else takes its own row beneath; `teacherNoteFloor` for every column's note. |
| `app/teacher/TeacherChrome.tsx` | The presenter strip drawn at `TEACHER_ZOOM` on every page (it was 25% larger on the report); `fill` gives a page a 16 px bottom padding in place of 48. |
| `app/teacher/report/EarlierReport.tsx` | `fill`. |
| `app/student/screens/ReportScreen.tsx` | The same columns as the teacher's (`liveClassReview`, `reportPathway`); the side column's working shows the problem, then `shownVersions` one under another, the Class review pane stacked; no difficulty tags. |
| Tests | `lib/report.test.ts` (columns per pathway, covered vs Incorrect, notes per column, the old note gone, unfinished not first try, versions per outcome and the pane's picks anonymous, the live board before and after End), `lib/classroom.test.ts` (`boardCovered`, `reached`), `lib/demo.test.ts` (completed covers every projected problem), `lib/homework.test.ts`. |

## How it connects

```
 data/psetN/index.ts FinishedSet.classReview ─┐            lib/classroom.ts WholeClassSession
 (PS1, PS3: problem + picks' first submissions)│             problems · examples(refs) · reached ◄282
                                               │                     │  wc/project: reached 0
                                               │                     │  wc/next:    reached max
                                               ▼                     ▼
                     lib/report.ts recordedClassReview ◄282   lib/classroom.ts boardCovered ◄282
                     (names dropped)                          (ended ? problems[0..reached] : null)
                                               │                     │
                                               │              lib/report.ts liveClassReview ◄282
                                               │              (+ lib/examples.ts boardExamples: the board's lines)
                                               ▼                     ▼
                           lib/assignments.ts setClassReview(bundle, classroom, session) ◄282
                                               │  ClassReviewShown | null
                                               ▼
   lib/report.ts reportPathway(pathway, classReview) ◄282 ── whole-class only once it happened
                                               │
    Classmate.review ─┐                        │         StudentSession + GroupRun ─┐
    lib/setScore.ts   │                        │         lib/setScore.ts            │
    recordFinished ───┤                        │         firstFinished ─────────────┤
                      ▼                        ▼                                    ▼
             recordReviews(record, problems, over, classReview)      sessionReviews(session, run, problems, classReview)
                      └───────────────► ProblemReview {first, finished, second, group, classReview} ◄──────┘
                                               │
                         outcomeOf: first (finished + holds) │ individual │ group │ covered │ wrong
                                               │
                    ┌──────────────────────────┼─────────────────────────────┐
                    ▼                          ▼                             ▼
          columnsOf + notAttempted    shownVersions (+ class pane)     notAttemptedNote
                    │                          │
                    ▼                          ▼
     components/OutcomeTiles.tsx     app/teacher/report/TeacherReport.tsx Versions (row, or pane on its own row)
     (grey covered tiles, notes)     app/student/screens/ReportScreen.tsx side column (stacked)
                                               │
                                               ▼
                                   components/ClassReviewExamples.tsx (A, B, C; WorkLines unmarked)

 app/teacher/TeacherChrome.tsx: presenter strip at TEACHER_ZOOM, `fill` → pb-4 (the report fits 1280 x 800 again)
```

## Verification

- vitest, `npx tsc --noEmit`, `npx eslint .`, `npx next build`, `check:laptop`.
- `click282.mjs`: the teacher's report for all twenty students on all six sets at 1280×800 and 1440×900, and the live set before and after a class review run in the browser with Q7 alone projected (setup, Project, End on the board): columns, grey tiles, notes, every tile's versions and class examples, no names or marks in the pane, nothing past a pane's border, nothing to scroll; Sam's own report before and after with the same columns and versions in the side column.
