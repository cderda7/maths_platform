# 189 · Problem Set 2's class works through the set live, one problem at a time

Routes: `/teacher` (the Classroom's live card), `/teacher/a/pset-2` (the landing), `/teacher/a/pset-2/class`,
`/teacher/a/pset-2/mistakes`; everything past individual working reads the full records as before.

## Files touched

| File | What it does |
|---|---|
| `data/stream.ts` (new) | The script: `STREAM_PACES` per classmate (warm-up, ms per difficulty unit, an optional rushed first problem, the hand-in time or `null` for never), `DIFFICULTY_WEIGHT`, `SUBMIT_AFTER_MS`, `WARM_UP_IDS` (Jordan, Tomas, Amelia, Mia, Oliver). |
| `lib/stream.ts` (new) | Pure stream: `scheduleFor` (warm-up end, one submission per answered problem in order, hand-in), `stateAt` / `finalState`, `streamEvents`, `streamEndMs`, `recordAt` (the part of a record answered so far), `streamOver` (Sam handed in), `classmatesAt(set, session, now)` (each classmate's visible record, progress, state and when each problem's work arrived; a fixed set's records unchanged). |
| `data/classmates.ts` | Jordan: "low: non-monic factorising", done 7 (Q4–Q6 right, Q7 the unchecked 1 × 8 pair like his Q2), notes and clarification cover Q7; Ethan, Lucas and Sofia "confident" (exactly the five read low). |
| `lib/assignments.ts` | `AssignmentBundle.startedAt` (`liveStartedAt` on the live set, null on a finished one); `rosterProgress` reads `classmatesAt`, so `submittedCount`, the landing and the Classroom card follow the stream; `assignmentStages` passes the bundle to `classStages`. |
| `lib/classStage.ts` | `stageDone` / `classStages` take a `StreamSet` (the fixture's by default): the working count is the classmates the stream has handed in. |
| `lib/mistakes.ts` | `mistakesByProblem(session, set, now)`: rows from the visible records, in the order the work arrived (`MistakeRow.arrivedAt`); `ProblemMistakes.pending` (still on the set and not at the problem: classmates, and Sam before he hands in). |
| `lib/classroomCards.ts` | Passes `now` to `mistakesByProblem`. |
| `lib/arrivals.ts` (new) | `ARRIVAL_FADE_MS`, `arriving`, `holdAbovePointer` (cards at or above the pointer keep their names, no card goes in above it, counts still tick; held names land glowing when released), `holdKey`. |
| `app/teacher/TeacherMistakes.tsx` | `usePointerGuard` (how many problem rows start at or above the pointer, from pointer moves and scrolls), the hold state, `ArrivingName` (the glow placed on the arrival time at first render), columns keyed on their first student, skipped = 20 − correct − wrong − still working (and the tooltip says so), nothing drawn before the first clock tick. |
| `app/teacher/TeacherLive.tsx` | Rows read each classmate's visible record (Set column answered so far, dots at hand-in); confidence blank only for a student who has not started; side fix: "handed in" under Sam's count stays on one line. |
| `app/globals.css` | `.arrive`: the faint light-blue glow (background and a 6 px ring) that holds and fades over 8 s. |
| `lib/stream.test.ts`, `lib/arrivals.test.ts` (new); `lib/assignments.test.ts`, `classroomCards.test.ts`, `mistakes.test.ts`, `examples.test.ts`, `group.test.ts`, `peers.test.ts`, `standings.test.ts` | The schedule, end state, reload continuity, arrivals and hold; Jordan's new record through group review (2, 3, 3, 3, 1, 1 thirteenths), examples and peers. |

## How it connects

```
 assignment/create ──► c.assignment.startedAt ──► liveStartedAt(c) ──► AssignmentBundle.startedAt
 (Create, ?pathway=, a skip: now − 1 h)                                        │
                                                                               ▼
 data/stream.ts STREAM_PACES ──► lib/stream.ts scheduleFor(classmate, problems)
 data/classmates.ts CLASSMATES ─┘        │ warm-up end · answeredAt[i] · submitAt
                                         ▼
                      classmatesAt(bundle, session, now)
                        ├─ streamOver(session)?  Sam past working ─► every starter handed in (full records)
                        ├─ stateAt(schedule, now − startedAt) ─► { started, warmingUp, answered, submitted }
                        ├─ recordAt ─► visible record (done = answered, wrong/attempts/notes so far)
                        └─ answeredAt by problem (unfinished work: the hand-in)
                                         │
       ┌─────────────────────────────────┼──────────────────────────────────┐
       ▼                                 ▼                                  ▼
 rosterProgress ─► progressTag     mistakesByProblem(session, b, now)   classStages(c, session, now, b)
   │  "warming up" / "Q8 in progress"   rows by arrival · right · pending     working: n/20 done
   ├─► submittedCount ─► landingTab (Mistakes until 20/20 or past working)
   ▼                                 │                                  │
 TeacherLive rows ◄── visible records│                                  ├─► Pathway card, Mistakes title
 Classroom card ◄── classroomCards ◄─┤ n/20 submitted · n mistakes so far
                                     ▼
                     TeacherMistakes ── holdAbovePointer(latest, shown, usePointerGuard(), order, now)
                                          │ cards above the pointer: names held, counts live
                                          ▼
                                     ArrivingName ── .arrive glow (8 s, keyed on arrivedAt)

 useNow() 1 s tick + useBatchedSession(3 s) ─► every screen re-reads the stream; a reload is the same pure function
 Reset demo ─► no assignment ─► no bundle, no stream
```
