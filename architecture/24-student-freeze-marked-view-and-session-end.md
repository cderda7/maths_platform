# 24 · Student freeze, marked view and session end

Routes: `/student` (the frozen stage over whatever the student was doing), `/teacher/board`
(Show marks), `/teacher` (the "Students frozen · End session" escape hatch and the assignment
status).

## Files touched

| File | What it does |
|---|---|
| `lib/classroom.ts` | `wc/project` now activates the session **and** starts the `whole-class-start` grace in one action, so no tab can see one without the other (the first run froze students instantly in the gap between two messages) |
| `lib/classroom-store.ts` | Stamps `wc/project` with the wall clock |
| `lib/session.ts` | Stage `frozen`; actions `freeze` (any stage → frozen, prompts dismissed, idempotent) and `release` (frozen → report); `advance/apply` of kind `whole-class-start` freezes |
| `lib/examples.ts` | `lineMarks(problemId, lines)` → `wrong | standout | null` per line, the same two layers as the old feedback screen, run kind derived from the example itself |
| `lib/frozen.ts` | `frozenView(session, classroom)`: the board's current problem, `Handed in` then `Reworked` blocks with ink and lines, marks only while the board's view is `marked`, `attempted` |
| `app/student/screens/FrozenScreen.tsx` | The frozen screen: one-line banner, problem, versions side by side with `InkView` and lines (red / blue only when marked), "You haven't attempted this one yet"; no interactive element |
| `app/student/StudentApp.tsx`, `StudentChrome.tsx` | Freeze once the session is projecting and the grace is over (a late-opened tab freezes on arrival), release when it ends; notice and diagnostics not rendered while frozen; the header's brand link is inert while frozen |
| `app/teacher/board/Board.tsx` | "Show marks / Hide marks" toggle; marked view colours each example's lines by `lineMarks`, marks only, no text |
| `app/teacher/WholeClassCard.tsx` | "Starting · 0:42" during the grace, then "Students frozen · problem 2 of 3 · Board → · End session"; End works with the board tab closed |
| `app/teacher/ForceSubmit.tsx` | Its pending state is only for force-submit; the button is disabled while projecting |
| `app/teacher/TeacherLive.tsx`, `lib/groups.ts` | "· in whole-class review" / "· complete" after the title; stage words for frozen |
| `lib/frozen.test.ts`, `lib/examples.test.ts`, `lib/session.test.ts`, `lib/classroom.test.ts` | Frozen view follows the slide and stacks versions, marks only while marked, unattempted case; line marks; freeze/release and freeze via advance; project + grace in one state |

## How it connects

```
 setup · Project ──▶ wc/project {at} ──▶ classroom: wholeClass.status = active · advance = { whole-class-start, deadline = at + 60 s }
                                                        │
        ┌───────────────────────────────────────────────┼──────────────────────────────────────────────┐
        ▼                                               ▼                                              ▼
 /teacher/board                               student tab (StudentApp)                          live view · WholeClassCard
   currentSlide → problem · view                isPending → pill "…moving the class on in 0:59"     "Starting · 0:59"
   Show marks → wc/marks                        isDue → advance/apply(whole-class-start) → freeze     then "Students frozen · problem n of m"
   Next / Previous → wc/next · wc/prev          projecting && !counting && !frozen → freeze (late tab)  End session → wc/end
   End → wc/end                                 stage frozen → FrozenScreen(frozenView(session, classroom))
                                                   problem = board's slide · versions [Handed in, Reworked] · ink + lines
                                                   marks = board.view === marked ? lineMarks(...) : none
                                                !projecting && frozen → release → report
```

## Verified by

vitest (106 tests), `tsc --noEmit`, `eslint`, `next build`, and a three-tab CDP run in real time:
the student breaks Q4 in rework (guard tripped); the teacher projects; during the grace the
student is not frozen, still sees the guard banner and the pill "…in 1:00", and restores the
original; after 62 s the student is frozen with zero interactive elements, shows the board's
problem with "Handed in" (and, on a reworked problem, "Reworked" with its ink); Show marks on the
board colours both the board's examples and the student's own lines (`wrong`, `standout`) and
Hide marks removes them; Next from marked opens the next problem unmarked on both; the live view
reads "· in whole-class review" and "Students frozen · problem 1 of 3"; closing the board tab
leaves the student frozen; End session from the live view lands the student on the report and
the live view reads "· complete"; a reload keeps the student on the report.
