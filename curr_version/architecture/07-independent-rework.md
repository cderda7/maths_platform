# 07 · Independent rework stage

Route: `/student?stage=rework` (the scripted run with its feedback, ready to rework). "Rework on
your own" on the feedback screen lands here; "Done reworking" hands off to the group stage.

## Files touched

| File | What it does |
|---|---|
| `data/recognition.ts` | `RECOGNITION_REWORK[problemId]`: the corrected path the pad reads during the rework, for Q1–Q3 (Q4 held) |
| `lib/session.ts` | `rework[problemId]` (a second version; `lines` is the preserved original), `reworkIndex`; actions `rework/goto`, `rework/reveal`, `rework/undo`, `rework/clear`, `rework/done` (→ `group-pass`). Rework lines don't feed the escalation counter. `reworkedSession()` = scripted run + corrected rework + Q4 starred, used by deep links from `group-pass` on |
| `lib/session.test.ts` | Original untouched while the rework builds; undo withdraws rework lines only; done → group-pass; deep links past the rework carry both versions |
| `components/PadSection.tsx` | The pad with Undo/Clear, extracted from the working screen |
| `components/ReadAs.tsx` | The transcription column, extracted from the working screen |
| `app/student/screens/ReworkScreen.tsx` | Left: problem, the detective-work clue, the first attempt with no marks, the "to rework" stepper (held problems shown dashed). Middle: pad titled "Reworked". Right: reworked lines, prev/next, "Done reworking" |
| `app/student/screens/WorkingScreen.tsx` | Now composes `PadSection` + `ReadAs` |
| `app/student/StudentApp.tsx` | Rework stage wired; placeholder for the group stage (ticket 08) |
| `app/teacher/TeacherLive.tsx` | Stage words for rework, group review, report |

## How it connects

```
 feedbackFor(session) ──filter slips──▶ todo[]  (Q1, Q2, Q3)      held[] (Q4, dashed)
                                          │
        ReworkScreen ─────────────────────┤ clue + first attempt (session.lines, unmarked)
             │                            │
   PadSection (strokes local) ── burst ──▶ nextLine(RECOGNITION_REWORK[p], session.rework[p]) ──▶ rework/reveal
             │                                                                                     │
   ReadAs(session.rework[p]) ◀──────────────────────────────────────────────────────────────────────┘
             │
   Done reworking ──▶ rework/done ──▶ stage = group-pass

 Versions:  session.lines  = original (frozen at hand-in)      session.rework = second version
            both kept for submission history (13) and the teacher's before/after (15)
```

## Verified by

vitest (36 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP run on the deep
link: no red or blue classes anywhere on the rework screen; two bursts on Q1 read as the
corrected factorisation and roots while the three original lines stay listed unmarked; Next
through Q2 and Q3; "Done reworking" lands on the group stage.
