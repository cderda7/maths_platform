# 293: The homework screen

## Files touched

| File | What it does |
| --- | --- |
| `lib/homeworkList.ts` | The list, pure: `ownSets` (the homework's frozen sets, newest first), `everWrongOn` (Sam's ever-wrong problems on a set: a finished set's handed-in record, Problem Set 6's session), `ownProblems` (each with its similar problem), `groupBySet` (empty sets left out, numbered), `homeworkList` (null unless open for Sam; own groups, then Everyone from the sent homework's questions, numbered on). |
| `data/homework-similar-ps5.ts` | `PS5_SIMILAR_PROBLEMS`: Problem Set 5's Q4, Q6 and Q9 (Sam's ever-wrong) as similar problems in the original's TeX shape, stem, skills and a named type. Apart from `data/story.ts`. |
| `lib/homework.ts` | `similarFor` reads Problem Set 6's and Problem Set 5's similar problems. |
| `components/ProblemQuestion.tsx` | `QuestionLike` (stem, nullable tex, figure or uploaded `figureUrl`); a stem's `$…$` pieces set as unbroken KaTeX holding their punctuation. A stem without `$` renders exactly as before on the teacher screens. |
| `app/student/HomeworkScreen.tsx` | The screen: heading, ← Classroom (Escape), FROM YOUR MISTAKES with a card per set under its name, EVERYONE with the teacher's ten; each row a number and `ProblemQuestion` (figure a 72 px thumbnail). Redirects to the Classroom when the list is null. |
| `lib/homeworkList.test.ts` | Contents and order for Sam's demo, the folder animation's Problem Set 6 problems, empty groups omitted, Everyone as sent, the figure, only open homeworks; Problem Set 5's similar problems' shapes, skills, maths and uniqueness. |

## How it connects

```
 teacher tab                                    Sam's iPad
 ───────────                                    ──────────
 +Homework Create ── homework/send ──┐          ReportScreen Send ── report/send ──► folder animation
   SentHomework.questions (the ten)  │            (app/student/screens/HomeworkScreen, homeworkProblems(session))
 lesson over ── openHomeworks ───────┤                                   │ same rule, same session
   openedAt + frozen setIds  ◄292    │                                   ▼
                                     ▼          lib/homeworkList.ts ◄293
                        classroom store ──────► homeworkList(id, classroom, session)
                                                  │ openHomeworksFor(c) has it? else null ─► redirect /student
                                                  │
                                                  │ ownSets(id)          frozen setIds, newest first    ◄ 294: + missed HW's sets
                                                  │   │
                                                  │ ownProblems(sets)    per set: everWrongOn(set)
                                                  │   │                    pset-6: sessionReviews(session)
                                                  │   │                    pset-5: recordReviews(bundle.sam)
                                                  │   │                  + similarFor(id) ── data/homework.ts (PS6)
                                                  │   │                                  └─ data/homework-similar-ps5.ts ◄293
                                                  │   │                                                  ◄ 294: dedupe by skill here
                                                  │ groupBySet           empty sets omitted, n = 1..k
                                                  │ everyone             SentHomework.questions, n = k+1..
                                                  ▼
 /student/homework/hw-3  app/student/HomeworkScreen.tsx
 ┌────────────────────────────────────────────────────────────────────┐
 │ Homework 3 · due Mon 14 Sep                          [← Classroom] │
 │ FROM YOUR MISTAKES                                                 │
 │ Problem Set 6                                                      │
 │ ┌────────────────────────────────────────────────────────────────┐ │
 │ │ 1  Solve for x. x² − 8x + 7 = 0                                │ │  components/ProblemQuestion
 │ │ …  The graph of the following is shown. … y = x² − 6x + 5 [▱]  │ │  (stem, unbroken maths,
 │ └────────────────────────────────────────────────────────────────┘ │   figure thumbnail)
 │ Problem Set 5                                                      │
 │ ┌ 6  Find the x-intercepts of the graph of y = 2x² − 11x − 6 ────┐ │
 │ EVERYONE                                                           │
 │ ┌ 9  Find the x-intercepts of the graph of y = x² − 2x − 15 ─────┐ │
 │ │ 17 A parabola crosses the x-axis at $x = −2$ … y = a(x+2)(x−4) │ │  inline $…$ set as KaTeX
 └────────────────────────────────────────────────────────────────────┘
```

Reached from To do's Homework card (OPEN) and the open HW3 cell (ticket 292). Ticket 294 adds a missed homework's
own problems as more `ownSets` and a skill dedupe between `ownProblems` and `groupBySet`; the screen does not change.
