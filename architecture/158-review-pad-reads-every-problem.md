# 158 · In individual review the pad reads a line for every problem, and finishing Q9 counts the incomplete box down

Route: `/student` (the individual review screen, "How it held up").

## Files touched

| File | What it does |
|---|---|
| `data/recognition.ts` | `RECOGNITION_REWORK.q9` is the one line the scripted run skipped (`h = -9 + 18 = 9`); `reworkScript(id)` returns a problem's scripted correction, or its first hand-in's script when it has none. |
| `app/student/screens/FeedbackScreen.tsx` | The burst handler feeds `nextLine` with `reworkScript(cur.id)` instead of `RECOGNITION_REWORK[cur.id] ?? []`. |
| `lib/session.ts` | `reworkedSession` unchanged; its comment says why Q9 (held, unfinished) is left alone in the deep-linked run. |
| `lib/feedback.test.ts` | +1: Q9's one-line correction finishes it and counts the box down; Q10 clears it; Q5/Q6/Q8 re-read without tripping the guard; the deep link still has Q9 unfinished. |

## How it connects

```
 pen up + 850 ms idle on the correction pad (components/DrawPad.tsx)
   │  onBurstEnd(strokeCount)
   ▼
 FeedbackScreen.onBurstEnd (app/student/screens/FeedbackScreen.tsx)
   │  nextLine(reworkScript(cur.id), session.rework[cur.id], strokeCount)   ← was RECOGNITION_REWORK[cur.id] ?? []
   │                │
   │                └─ data/recognition.ts
   │                     reworkScript(id) = RECOGNITION_REWORK[id]      q1 q2 q3 q4 q7 q10, and now q9 = ["h = -9 + 18 = 9"]
   │                                      ?? RECOGNITION[id]            q5 q6 q8: the hand-in's own lines again
   │                                      ?? []
   ▼
 dispatch rework/reveal ──► session.rework[q9] = [h = -9 + 18 = 9]
   │
   ├─ ReadAs (components/ReadAs.tsx)          the typeset line in the "Read as" column
   ├─ progressOf(session, q9) (lib/feedback.ts)   lines ∪ rework has an answer line ──► "finished"
   │     ├─ the Q9 row's label: "unfinished" ──► "3 lines"
   │     └─ feedbackSummary(...).incompleteHead: "2 problems are incomplete." ──► "1 problem is incomplete."
   └─ guardFor(session, q9) (lib/guard.ts)    the line is ok ──► no banner

 The mistakes box (feedbackSummary(..., "original")) reads the first hand-in only: unchanged by any of this.
 reworkedSession() (lib/session.ts, deep links past the rework) skips every problem whose hand-in held,
 so Q9 stays unfinished there and the later stages are exactly as before.
```

## Verified by

vitest (433), eslint, tsc, `next build`; `rework158.mjs` against the unmodified build first (Q9, Q5, Q6, Q8 read nothing; Q10 reads) and then the fix: on Q9 one burst reads `h = -9 + 18 = 9`, the row reads "3 lines", the box "1 problem is incomplete.", no guard; Undo reverts both and a redraw re-reads; the mistakes box still names the first submission; Q5, Q6 and Q8 each read the first line of their own working with no guard; Q10's three bursts finish it and the incomplete box is gone.
