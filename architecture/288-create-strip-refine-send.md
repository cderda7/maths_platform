# 288: The Create strip reads Questions – Difficulty – Refine – Pathway – Send

## Files touched

| File | What it does |
| --- | --- |
| `lib/createPipeline.ts` | New. The create strip's steps as data per kind of set: `PIPELINES.pset` = Questions, Difficulty, Refine (internal id `assessment`), Pathway, Send. `currentStep({ step, assessing, sending })` picks the lit step; `SEND_LIGHT_MS` = 600. `CreateKind` is `"pset"` today; ticket 291 adds `"homework"` (no Pathway). |
| `lib/createPipeline.test.ts` | New. The pipeline's labels and ids, `currentStep` on every stage, and the strip rendered to markup: every label on every step, Send last and never a link or button, everything plain text while Send is lit. |
| `app/teacher/assignments/create/review/Steps.tsx` | Renders the `steps` it is given (was a fixed four-label list). Send is never tappable. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | Create lights Send: `sending` state, the strip locked, Back and a second Create ignored; after `SEND_LIGHT_MS` it re-reads the classroom, freezes the sent draft on screen (`sent`, set with `flushSync`), dispatches the create and the draft clear, resets Sam's session and pushes to the set, as before. The eyebrow drops "new assignment". |
| `app/teacher/Classroom.tsx` | The title-row button reads "+In-Class PSet" (the + glyph kept). |
| `app/teacher/AssignmentProvider.tsx` | A not-created set's link reads "+In-Class PSet". |
| `app/teacher/assignments/create/CreateAssignment.tsx`, `lib/create.ts`, `lib/draft.ts` | Comments name the new button. |

`PathwayStep.tsx` is unchanged: its Create still answers an undecided pathway by pointing at the card and calls `onCreate` otherwise.

## How it connects

```
 app/teacher/Classroom.tsx
 [ Holistic Assessment ] [ + In-Class PSet ] ──► /teacher/assignments/create  (Questions: no strip)
                                                        │ Continue
                                                        ▼
 /teacher/assignments/create/review ── ReviewAssignment.tsx
      │
      │  lib/createPipeline.ts                          classroom.review.step
      │  PIPELINES.pset ─────────────┐                  assessing, sending (local)
      │                              ▼                         │
      │                        currentStep(...) ◄──────────────┘
      │                              │
      ▼                              ▼
  Steps.tsx   QUESTIONS — DIFFICULTY — REFINE — PATHWAY — SEND
                                                   ▲          ▲
                                     PathwayStep   │          │ lit while sending
                                     [Back][Create]┘          │ (strip locked)
                                              │               │
        press ─► createAction(getClassroom()) ? ─► sending ───┘
                                              │
                                   SEND_LIGHT_MS (600 ms)
                                              │
                                              ▼
                         flushSync(sent = draft + review on screen)
                         dispatch assignment/create, CLEAR_DRAFT
                         setSession(INITIAL_SESSION)
                         router.push(/teacher/a/pset-6) ─► its Mistakes
```

Ticket 291 adds `PIPELINES.homework` (QUESTIONS — DIFFICULTY — REFINE — SEND) and passes the kind's list to `Steps`; nothing in `Steps` changes.
