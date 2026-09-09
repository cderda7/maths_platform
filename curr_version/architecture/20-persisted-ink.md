# 20 · Persisted ink

Routes: `/student?stage=working` and the rework stage (the pads), `/student` history (read-only ink
per version). No new routes.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Point` and `Stroke` move here from the pad so `lib/` can store them without importing a component |
| `lib/session.ts` | `ink` and `reworkInk` per problem beside `lines` and `rework`; actions `ink/stroke`, `rework/stroke`; `lines/undo` and `rework/undo` now pop the last stroke themselves and withdraw the lines revealed after the survivors (`strokeCount` still accepted to force a count); `lines/clear` and `rework/clear` empty ink and lines together; strokes stored to a tenth of a pad pixel |
| `lib/store.ts` | Snapshots written before this ticket load with missing fields filled from the initial session |
| `lib/versions.ts` | Each `Version` carries `ink`; the final version takes the rework's ink where a problem was reworked, the original's otherwise |
| `components/DrawPad.tsx` | Re-exports the moved types; unchanged behaviour |
| `components/InkView.tsx` | Read-only SVG rendering of stored strokes, cropped to their bounding box and fitted to the caller's box, same quadratic smoothing as the pad |
| `app/student/screens/WorkingScreen.tsx`, `ReworkScreen.tsx` | The pad reads strokes from the session and reports each finished stroke as an action; Undo and Clear are single dispatches |
| `app/student/screens/HistoryScreen.tsx` | A fixed-height ink box above each problem's transcription in both columns, so rows still align when comparing |
| `lib/session.test.ts`, `lib/versions.test.ts` | Ink kept in step with lines under reveal, undo and clear for both versions; rounding; final-version ink selection |

## How it connects

```
 DrawPad (canvas) ── pointer up ──▶ onStrokesChange(next) ──▶ dispatch(ink/stroke | rework/stroke)
      ▲                                                                   │
      │ strokes = session.ink[problem]                                    ▼
      │                                          lib/session.ts   ink[problem] += roundStroke(stroke)
      │                                                            lines[problem] (revealed on burst end, as before)
      │      Undo ──▶ lines/undo  ──▶ ink.pop() · lines = afterUndo(lines, ink.length)
      │      Clear ─▶ lines/clear ─▶ ink = [] · lines = []
      │                                                  │
      └──────── store snapshot (localStorage + channel) ◀─┘  → reload and second tab redraw the same ink
                                                         │
 lib/versions.ts  versionsOf → { lines, ink } × { original, final }
                                                         ▼
 HistoryScreen  Column ▶ InkView(version.ink[problem]) above the aligned rows (fixed 120 px box)
```

## Verified by

vitest (75 tests), `tsc --noEmit`, `eslint`, `next build`, and a CDP run driving real pointer
strokes: two bursts on Q1 store 5 then 11 strokes and reveal two lines; a reload shows the same
ink and both lines; one Undo drops to 10 strokes and withdraws the second line, five more return
to 5 strokes and one line; redrawing re-reveals; a second tab reads 11 strokes from the store.
Handing in, drawing a rework burst (4 strokes, 1 line), finishing, and opening "Your working"
shows one ink block, and comparing with the handed-in version shows one block per column at the
same height with rows still aligned.
