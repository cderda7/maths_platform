# 291: +Homework creates and sends Homework 3

## Files touched

| File | What it does |
| --- | --- |
| `lib/createPipeline.ts` | `CreateKind` is `"pset" \| "homework"`; `PIPELINES.homework` = Questions, Difficulty, Refine, Send; `CREATE_ROUTES` (each kind's Questions and review routes); `hasPathway(kind)`; `assessMsFrom` (the review routes' `?assess=`). |
| `lib/dueDate.ts` | `DUE_DEFAULT.homework` = Mon 14 Sep 2026. |
| `data/homeworks.ts` | `HomeworkDef.day` (the due date with its year), which the next homework's earliest day counts from. |
| `data/homework-draft-seed.ts` | New. Homework 3's ten typed lines (features of a parabola, roots of a quadratic; none a copy of Problem Set 5's or 6's), Q8 and Q9 flawed on purpose; `homeworkTitle(n)`. |
| `data/review.ts` | Labels for the ten; `HOMEWORK_RECOMMENDATIONS`: change Q8 (no x-intercepts), remove Q9 (Q3 again), add a rule-from-features problem (three options). |
| `lib/review.ts` | `SCRIPTED_RECOMMENDATIONS` per kind; `recommendationsFor` and `applyReview` take the kind (an in-class set's by default). |
| `lib/classroom.ts` | `SentHomework` (`id`, `n`, `name`, `due`, the ten `questions`, `sentAt`, `openedAt` for ticket 292); state `homeworkDraft`, `homeworkReview`, `homeworks`; `draft/set` and `review/set` take `kind`; `homework/send` (idempotent by id, touches nothing else); `draftFor`, `reviewStateFor`. |
| `lib/homeworks.ts` | `classHomeworks(c)` (fixtures + sent, oldest first: the one list every rule reads), `homeworkOpened`, `nextHomework(c)` (number, earliest day = the day after the previous due date and never before today, default a week after it), `psetDueNote(due, c)` ("Mistakes from this set go into Homework N" for a date inside an opened homework), `samHomeworkStatus`. |
| `lib/draft.ts` | `isGenerated(c, kind)`, `generatedHomeworkDraft(c, at)` ("Homework 3", ten, due Mon 14 Sep, no goal), `generatedDraftFor`, `dueRange(kind, c)`. |
| `lib/create.ts` | `homeworkSendAction(c, at)` (null until every recommendation is answered; a stored day before the earliest reads as the default), `clearDraft(kind)`, `homeworkSent`. |
| `lib/classroomCards.ts` | `HomeworkCard` (`state` sent / open / over, covered set names, Sam's status), `homeworkCards(c)`, `pastWithHomework` (newest due first, a set above a homework due the same day), `coveredSetsPhrase`. |
| `app/teacher/Classroom.tsx` | `+Homework` beside `+In-Class PSet` (one `CreateButton`); Past lists `HomeworkCardItem`s among the set cards: chip "homework", "covers Problem Sets 3 and 4", then "sent" / "open" / Sam's check or caution triangle; a plain div, no link, hover or arrow (the arrow's room kept). |
| `app/teacher/homework/create/page.tsx`, `…/review/page.tsx` | New routes: the same components with `kind="homework"`. |
| `app/teacher/assignments/create/page.tsx`, `…/review/page.tsx` | Pass `kind="pset"`. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | Takes `kind`: the kind's draft, Generate and routes; homework has no goal box and its picker's `min` is `nextHomework`'s; an in-class set's picker gets `psetDueNote`. **Bug fix:** the editor no longer focuses the ghost tile on mount, which scrolled the page 512 px down on a reload at 1280×800. |
| `app/teacher/assignments/create/BlankStart.tsx` | Takes `kind` and `due`: no goal box for homework, "Untitled homework". |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | Takes `kind`: the kind's draft, review, strip and routes; homework's Refine button is Create, which lights Send, dispatches `homework/send` and the draft clear, and lands on the Classroom (no session reset, no lesson). |
| `app/teacher/assignments/create/review/RecommendationsStep.tsx` | Takes `kind`: the kind's recommendations; the button reads "Create" when there is no pathway. |
| `app/teacher/assignments/create/review/Steps.tsx`, `DifficultyStep.tsx` | Questions and Back link to the kind's Questions page. |
| `components/DuePicker.tsx` | The note sits under the field's right edge out of the flow, so it moves nothing. |
| `scripts/laptop-check.mjs` | Measures `/teacher/homework/create` too (76 checks). |
| `lib/homeworkCreate.test.ts`, `lib/homeworks.test.ts` | New tests (20); the homework helper takes a day. |

## How it connects

```
 app/teacher/Classroom.tsx
 [ Holistic Assessment ] [ + In-Class PSet ] [ + Homework ]
                               │                   │
          CREATE_ROUTES.pset ◄─┘                   └─► CREATE_ROUTES.homework
      /teacher/assignments/create                     /teacher/homework/create      (page.tsx: kind="homework")
                               \                   /
                                ▼                 ▼
                 CreateAssignment({ kind }) ── BlankStart / Editor
                   │ Generate: lib/draft generatedDraftFor(kind)
                   │   homework ─► data/homework-draft-seed (Homework 3, ten, Q8 + Q9 flawed)
                   │ DuePicker min/fallback ◄─ lib/draft dueRange ◄─ lib/homeworks nextHomework
                   │ DuePicker note (pset) ◄─ lib/homeworks psetDueNote ◄─ classHomeworks + openedAt
                   │ dispatch draft/set { kind } ─► classroom.draft | classroom.homeworkDraft
                   ▼ Continue
                 ReviewAssignment({ kind })
                   Steps(PIPELINES[kind])   pset:     QUESTIONS — DIFFICULTY — REFINE — PATHWAY — SEND
                                            homework: QUESTIONS — DIFFICULTY — REFINE — SEND
                   DifficultyStep ─► AssessingStep ─► RecommendationsStep({ kind })
                                                       lib/review recommendationsFor(q, kind)
                                                       ◄─ SCRIPTED_RECOMMENDATIONS (data/review)
                          pset: Finalise set ─► PathwayStep ─► Create ─► createAction ─► assignment/create
                      homework: Create ─────────────────────────────────► homeworkSendAction (lib/create)
                                  │ Send lit SEND_LIGHT_MS, strip locked
                                  ▼
                 dispatch homework/send ─► classroom.homeworks [ SentHomework hw-3, due 2026-09-14, ten ]
                          clearDraft("homework")                 localStorage + BroadcastChannel (reload, every tab)
                          router.push(/teacher)                  no lesson, no session reset
                                  │
                                  ▼
                 lib/homeworks classHomeworks(c) = HOMEWORKS (hw-1, hw-2) + sent (hw-3)
                        │                                   │
                        ▼                                   ▼
    lib/classroomCards homeworkCards ─► pastWithHomework     tickets 292–295: Future panel, opening
    Past: HW3 · PS5 · HW2 · PS4 · PS3 · HW1 · PS2 · PS1        (openedAt), the homework screen, carry-over
    (HomeworkCardItem: opens nothing)                         read the same list
```

Sam's Classroom still reads the fixtures' homeworks (`homeworkColumn`'s default); ticket 292 passes `classHomeworks(c)` when
it builds the Future panel and the HW3 cell.
