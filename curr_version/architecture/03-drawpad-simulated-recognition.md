# 03 · Drawpad with simulated line-by-line recognition

Route: `/student?stage=working`. Three columns on the iPad: problem · drawpad · "Read as".

## Files touched

| File | What it does |
|---|---|
| `components/DrawPad.tsx` | Canvas handwriting pad. Pointer events → smooth quadratic ink; coordinates mapped through the canvas bounding rect so the scaled iPad stage needs no special casing. Owns the strokes; reports pen-down and burst-end (pen-up + 850 ms idle) with the stroke count |
| `data/recognition.ts` | `RECOGNITION[problemId]`: the ordered TeX lines the pad will "read", one per burst. Encodes the scripted run: factorising slips in Q1 and Q2, null-factor-law slip in Q3, Q4 correct |
| `lib/recognition.ts` | Pure bookkeeping: `nextLine(script, revealed, strokeCount)` and `afterUndo(revealed, strokeCount)`. Each revealed line remembers the stroke count at reveal; undo below that count withdraws it |
| `lib/recognition.test.ts` | vitest: script order, no reveal without new ink, exhaustion, undo withdraws and the line returns on the next burst |
| `lib/session.ts` | Session gains `problemIndex` and `lines[problemId]`; actions `problem/goto`, `line/reveal`, `lines/undo`, `lines/clear` |
| `lib/session.test.ts` | Added: lines kept per problem, undo and clear |
| `app/student/screens/WorkingScreen.tsx` | The screen: problem + confidence echo + set stepper (left), pad with Undo/Clear (middle), transcription column with shimmer while recognising and prev/next (right). Strokes are kept per problem in component state; lines go to the session |
| `app/student/StudentApp.tsx` | Passes `dispatch` to the working screen |
| `app/globals.css` | `.shimmer` placeholder animation |

## How it connects

```
                 WorkingScreen (client)
                 ┌───────────────────────────────────────────────────────────────┐
  pen down ─────▶│ setRecognising(true)            strokesByProblem[p.id] (local) │
  DrawPad        │                                                               │
  pen up + idle ▶│ onBurstEnd(strokeCount)                                       │
                 │   └▶ nextLine(RECOGNITION[p.id], session.lines[p.id], count)  │
                 │        └▶ dispatch line/reveal ──▶ session.lines[p.id] ──▶ "Read as" column (KaTeX)
  Undo ─────────▶│ strokes.pop(); dispatch lines/undo(count) ──▶ afterUndo(...)  │
  Clear ────────▶│ strokes=[]; dispatch lines/clear                              │
  Q1..Q4 / Next ▶│ dispatch problem/goto(i)  (ink and lines per problem survive) │
                 └───────────────────────────────────────────────────────────────┘

  lib/recognition.ts (pure, vitest)  ◀── the rules      DrawPad.tsx ◀── the timing
```

## Verified by

vitest (9 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP-driven session: three
bursts of mouse strokes on Q1 reveal three typeset lines in order; Undo withdraws the third; one
more stroke brings it back; Next → Q2 shows an empty column, a burst reveals Q2's first line;
← Q1 shows Q1's three lines and ink again. Screenshots of the shimmer state and both problems.
