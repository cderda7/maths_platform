# 330: Class review: the teacher marks up the examples anywhere on the slide, and the students see it

## Files touched

| File | What it does |
| --- | --- |
| `lib/markup.ts` | New. `Markup` (`anchor` key + points in ems of the anchor's font size from its top left), `WholeClassInk = Stroke \| Markup`, `isMarkup`, `ANCHOR` keys (`label`, `tex`, `stem`, `A`, `A/0`…), `AnchorBox`, and the pure geometry: `nearestAnchor` (the anchor nearest the stroke's bounding-box middle, the smaller on a tie), `pinStroke` (layout px → mark), `placeMark` (mark → layout px, null without that anchor). |
| `lib/markup.test.ts` | New. A circle round a term on the board (21 px maths) lands round the same term on the iPad (16 px); round trip; nearest and tie; no anchor. |
| `lib/classroom.ts` | `WholeClassSession.ink` holds `WholeClassInk[]` in drawing order; `wc/stroke` takes either; `currentSlide` adds `markup` and `inkCount` beside `teacherInk` (pad strokes only), split once per ink array (`splitInk`, a WeakMap) so the same ink gives the same arrays. Undo / Clear unchanged: they already take the last / all of the list. |
| `lib/board.ts`, `lib/frozen.ts` | The board's `whole-class` content carries `markup` and `inkCount`; the frozen view carries `markup` (both modes). |
| `components/SlideInk.tsx` | New. Wraps a slide; an SVG over the children draws each mark at its anchor (`anchorBoxes` reads every `[data-ink-anchor]` in the wrapper's layout px, so the teacher side's zoom and the iPad's scale drop out), redrawn on marks, resize, scroll, the fit's font change and new maths (ResizeObserver, MutationObserver, rAF). With `onMark` it takes the pen anywhere except buttons, links, fields and the pads, and hands a finished stroke over pinned. A mark whose line is scrolled out of its column (`[data-ink-clip]`) is not drawn. |
| `components/ExampleColumns.tsx` | Each example letter and each line's maths carry `data-ink-anchor`; each column is `data-ink-clip`. The fit still measures the line's first child (the anchor span is the maths' width). |
| `components/ProblemQuestion.tsx` | `inkAnchors` puts the stem and expression anchors on the laptop's question card. |
| `components/PadSection.tsx` | `inkCount`: Undo / Clear are on while the problem has any ink, pad or slide. |
| `components/DrawPad.tsx` | Exports `INK` and `INK_WIDTH`, shared by the marks. |
| `app/board/SmartBoard.tsx` | `Slide` is wrapped in `SlideInk` with the pen; label, expression and stem are anchors; Undo and Clear beside the mode toggle. |
| `app/teacher/board/BoardControls.tsx` | The question card and a new row, the board's columns (`boardExamples` from the live session, marks in the marked view) beside the pad at 380, wrapped in `SlideInk` with the pen. |
| `app/student/screens/FrozenScreen.tsx` | The slide is wrapped in a read-only `SlideInk`, in screens frozen and write with me. |
| tests (`classroom`, `board`, `frozen`), ticket, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Shared undo order, per problem, both modes; docs. |

## How it connects

```
  BOARD /board (1440)                    LAPTOP /teacher/board (0.72 zoom)
 ┌ SlideInk pen ───────────────────┐    ┌ SlideInk pen ─────────────────────┐
 │ Q2 [tex]   Undo Clear [toggle]  │    │ [Q2 stem tex]                     │
 │ [stem]                          │    │ ┌A──┐┌B──┐┌C──┐ ┌pad──────┐       │
 │ ┌A──┐┌B──┐┌C──┐ ┌pad (own ink)┐ │    │ │A/0││B/0││C/0│ │         │       │
 │ │A/0││B/0◯│C/0│ │             │ │    │ └───┘└───┘└───┘ └─────────┘       │
 └─┴───┴┴───┴┴───┴─┴─────────────┴─┘    └───────────────────────────────────┘
        │ pointer up: pinStroke(stroke, anchorBoxes)       │
        │   → { anchor: "B/1", points in ems }              │
        ▼                                                   ▼
   dispatchClassroom({ type: "wc/stroke", problem, stroke: Markup | Stroke })
        │
        ▼
 lib/classroom.ts  wholeClass.ink[problem]: [pad, mark, mark, pad …]  (drawing order)
        │  wc/ink-undo → drop last of either      wc/ink-clear → []
        ▼
 currentSlide ─ splitInk ─▶ teacherInk (pads) · markup (slide) · inkCount (Undo/Clear on)
        │
        ├──▶ lib/board.ts boardContent ──▶ SmartBoard Slide
        ├──▶ BoardControls
        └──▶ lib/frozen.ts frozenView ──▶ FrozenScreen (iPad, scaled)
                                            ┌ SlideInk mirror ──────────────┐
                                            │ marks at placeMark(mark,       │
                                            │   this surface's anchorBoxes)  │
                                            │ frozen: pad mirrors teacherInk │
                                            │ write with me: pad is own      │
                                            └────────────────────────────────┘
```
