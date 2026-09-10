# 22 · Teacher force submit with one-minute grace

Routes: the "Class" card on `/teacher` (live view, right column); the countdown pill and the
forced hand-in on `/student`.

## Files touched

| File | What it does |
|---|---|
| `lib/classroom.ts` | `PendingAdvance { id, kind: force-submit | whole-class-start, deadline }` on the classroom state; actions `advance/start` (deadline = now + `GRACE_MS` = 60 s) and `advance/clear`; `isPending(c, now)` while counting down, `isDue(c, now)` once the deadline has passed and for `STALE_MS` after, so a tab that never saw the advance doesn't apply an old one |
| `lib/classroom-store.ts` | `advance/start` stamped with the wall clock |
| `lib/session.ts` | `notAttempted[]` and `appliedAdvances[]`; action `advance/apply { id, kind, at }`: ignored if the id was applied; for force-submit, a student at or before working is handed in as they stand (stage by pathway, `handedInAt`, unattempted problems recorded, any open prompt or overlay dismissed, notice "Your teacher handed in the class's work."); a student already past working only records the id |
| `app/teacher/ForceSubmit.tsx` | The card: "Force assignment submit" (renamed 2026-09-09 from "Hand in for everyone"; disabled once the live student is past working or while projecting) → confirmation "N still working · 1 minute to finish" → pending state "Handing in · 0:59" with Cancel |
| `app/teacher/TeacherLive.tsx` | Mounts the card at the top of the right column |
| `app/student/StudentApp.tsx` | Reads the classroom advance and the 1 s clock: while pending, the pill "Your teacher is moving the class on in 0:59"; once due and not yet applied, dispatches `advance/apply` (idempotent) |
| `lib/classroom.test.ts`, `lib/session.test.ts` | Deadline arithmetic, pending/due/stale windows, clear; forced hand-in by pathway with not-attempted recording and notice; idempotence by id; students past working left alone; open prompt dismissed |

## How it connects

```
 teacher /teacher · ForceSubmit
   [Hand in for everyone] → confirm "4 still working · 1 minute" → dispatchClassroom(advance/start {kind: force-submit})
                                                                          │
                                                                          ▼
                                   classroom-store: advance = { id, kind, deadline = now + 60 s }   (every tab, live)
                                        │                                              │
   teacher card: "Handing in · 0:42 · Cancel" (advance/clear)                          │ useClassroom() + useNow()
                                                                                       ▼
                                                        student tab: isPending → pill "…moving the class on in 0:42"
                                                                     isDue && !applied → dispatch(advance/apply {id, kind, at})
                                                                                       │
                                                                                       ▼
                                                        sessionReducer: stage ≤ working ? hand in as it stands
                                                          (nextStage(pathway, "handed-in") · notAttempted · notice) : record id only
 ticket 24 reuses the same advance with kind whole-class-start.
```

## Verified by

vitest (91 tests), `tsc --noEmit`, `eslint`, `next build`, and a two-tab CDP run in real time: the
student draws one burst on Q1 under the individual-only pathway; the teacher's button is enabled,
the confirmation reads "4 still working · 1 minute to finish", confirming shows "Handing in ·
0:59" on the teacher and the pill "…in 0:59" on the student; Cancel removes both; starting again
and waiting 62 s hands the student in to "How it held up" with the notice "Your teacher handed in
the class's work.", `notAttempted = [q2, q3, q4]`, one applied id; the teacher's card is no longer
pending and the button is disabled; a reload keeps the student on feedback with one applied id.
