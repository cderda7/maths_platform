# 335: "Most students are close to finishing": the decision card, wherever the teacher is

## Files touched

| File | What it does |
| --- | --- |
| `lib/decisionState.ts` | New, no app imports. The stored side of a lesson decision: `LessonDecision` (`kind`, `stage` it came due in, `dueAt`, `status` open / tucked / answered, `answer`, `answeredAt`), `DecisionDue` (what every action carries, so a press on a decision no tab has stored yet stores it), `DecisionAction` (`decision/raise`, `decision/tuck`, `decision/reopen`, `decision/answer`) and `decisionsReducer` (one per kind, answered is final, the same value back when nothing changes). |
| `lib/decision.ts` | New, pure. `closeQuestionNumber` (70%, rounded up), `moreThanHalf`, `sessionSubmitted` (Sam wrote on the question and moved off it, or handed in with work on it), `closeEvidence` (submitted / present, the absent out), `dueDecision` (close to finishing while the class is on individual working), `lessonDecision` (the view: stored or derived, `lapsed` once the class leaves the stage, `shown` card / dot / nothing, `due`, `evidence`), `decisionScreen` (Classroom, the live set's Class View and Mistakes). |
| `lib/decision.test.ts` | New. The trigger at Q5 / Q7 / Q9 of 6 / 10 / 12 just under and just over half; absences; Sam's rule; due only on the working; the demo's stream reaching it (10 of 19 at 3:34) before the first classmate hands in; raise once; tuck and reopen; stored by a press; Keep final; a reload (JSON round trip); lapsing open or tucked on Sam's hand-in and on the presenter's "students done" with the pathway unchanged; a new lesson clears it; the screens. |
| `lib/classroom.ts` | `ClassroomState.decisions`, one of the lesson's own keys (a new set starts without them); `DecisionAction` in `ClassroomAction`, delegated to `decisionsReducer`. |
| `app/teacher/DecisionCard.tsx` | New. `useLessonDecision(session, ready)` (null until Sam's session batch and the clock arrive), `DecisionDot` (accent dot on a paper ring, 8 px press margin), `DecisionHost` (raises the decision when due, renders the card while open) and the card: headline, evidence, the pathway as `StagePill`s with what each stage does, Later, the Change slot, Keep. Slides in once per lesson per tab (`decision-in`). |
| `app/teacher/TeacherChrome.tsx` | The scroll region sits in a positioned box of its own size (`data-teacher-body`); `DecisionHost` is mounted there once, on the screens `decisionScreen` names, laid 16 px in from the region's bottom-right corner. |
| `app/teacher/BackLine.tsx` | The strip's `badge` is the tucked decision's dot unless the page passes one; its press reopens the card. |
| `app/teacher/Classroom.tsx` | The live set's card carries the dot over its top-right corner (a sibling of the card's link); its press reopens the card and opens the set's Mistakes tab. |
| `app/teacher/DiagnosticPush.tsx`, `app/teacher/StudentWorkPanel.tsx` | A press on the decision card or its dot no longer closes the split's diagnostic flyout or student panel. |
| `app/teacher/WholeClassCard.tsx` | Once the lesson is over the Class review card reads "Over · went through Q2 and Q7" instead of offering "Set up →". |
| `app/globals.css` | `decision-in` (transform and opacity only), a fade under reduced motion. |
| ticket, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 lib/stream.ts classmatesAt ──┐   Sam's session (3 s batch) ──┐   lib/absence.ts (absent out)
                              ▼                               ▼          │
 ┌ lib/decision.ts ─────────────────────────────────────────────────────┴───────────┐
 │ closeEvidence(c, set, session, now) ─▶ { question "Q7", submitted, present }        │
 │ dueDecision   ─▶ close-to-finishing while currentClassStage === "working"          │
 │ lessonDecision ─▶ DecisionView { status, lapsed, shown: card | dot | null, due }   │
 └───────────────▲────────────────────────────────────────────┬───────────────────────┘
                 │ c.decisions                                 │
 ┌ lib/decisionState.ts ──────────────┐                        │
 │ LessonDecision { kind, stage,      │                        ▼
 │   dueAt, status, answer }          │         ┌ app/teacher/DecisionCard.tsx ─────────────┐
 │ decisionsReducer(raise / tuck /    │         │ useLessonDecision(session, ready)          │
 │   reopen / answer)                 │         │ DecisionHost: raise when due; card if open │
 └───────────────▲────────────────────┘         │ DecisionDot                                │
                 │ delegated                     └──┬──────────────┬───────────────┬──────────┘
 ┌ lib/classroom.ts ─────────────────┐              │ card         │ dot (tucked)  │ dot (tucked)
 │ ClassroomState.decisions          │              ▼              ▼               ▼
 │ classroomReducer ─ decision/*     │   TeacherChrome.tsx   BackLine.tsx     Classroom.tsx
 │ LESSON_KEYS: a new set clears it  │   data-teacher-body   strip's current  live set's card
 └───────────────▲───────────────────┘   bottom-right        pill (badge)     corner ─▶ Mistakes
                 │                        corner, z-40
      dispatchClassroom ◀── Later / Keep / dot press ── every tab and a reload read the same store
```

## Layout

```
 ┌ teacher frame (zoom 0.72) ───────────────────────────────────────────────────────────────┐
 │ header                                                                                     │
 ├ data-teacher-body (relative) ─────────────────────────────────────────────────────────────┤
 │ main[data-teacher-scroll]                                                                  │
 │  [← Edexia Classroom]                     (indiv working)● → indiv review → ...  ◀ strip   │
 │  split: Where students are │ Where students went wrong                                     │
 │   (diagnostic flyout /     │                                ┌ decision card, 400 px ┐    │
 │    student panel: left)    │                                │ Most students are ... │    │
 │                            │                                │ 15 of 19 ... Q7       │    │
 │                            │                                │ pills + what happens  │    │
 │                            │                                │     [Later] [ ] [Keep]│    │
 │                            │                                └───────────────────────┘ 16 │
 ├ presenter strip ───────────────────────────────────────────────────────── Reset demo ─────┤
```
