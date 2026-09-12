# 161 · In class review the student sees the board, with "your initial response" where the board counts

Routes: `/board` (whole-class slide), `/student` in whole-class review.

## Files touched

| File | What it does |
|---|---|
| `components/ExampleColumns.tsx` (new) | The examples of whole-class review for both surfaces: 2–3 columns, letter top left, a `corner` node top right, the working one line per box, marks when given. `size` is `board` (21 px lines) or `student` (16 px). Lines never wrap: at the size's maximum every line is measured against its box and, in a narrower window, every column's lines shrink together by the one ratio that fits the widest. |
| `app/board/SmartBoard.tsx` | `Slide` renders `ExampleColumns` with "n/m students" as each corner; the pad is 380 px wide, the grid gap 16. |
| `lib/frozen.ts` | `FrozenView.examples`: the board's `boardExamples` for the slide (marks in the marked view only), each with `mine` when its exact mistake is the student's first hand-in's (`mistakeOf(session.lines)`); `versions`/`attempted` removed. |
| `app/student/screens/FrozenScreen.tsx` | Banner · label, equation, stem · `ExampleColumns` (student size) with the light blue "your initial response" tag as the tagged example's corner · a 310 px pad (mirror or own, as before). |
| `lib/frozen.test.ts` | Examples equal the board's; exactly one tag, on Sam's first hand-in's mistake, not his correct rework; marks follow the board; an unattempted problem shows the examples with no tag; the pad's mode and ink. |

## How it connects

```
 classroom store: wholeClass.examples[problem] (refs)  ·  slide.view  ·  slide.mode  ·  ink
        │                                                    │
        ├── boardContent() ──► examples: BoardExample[] {letter, lines, count, denominator}
        │                                │
        │      ┌─────────────────────────┴──────────────────────────┐
        │      │ /board  Slide                                       │
        │      │  Q2 2x²+7x−4=0            [screens frozen | write…] │
        │      │  Solve for x.                                       │
        │      │  ExampleColumns size=board          ┌────────────┐  │
        │      │  ┌ A 13/19 ┐┌ B 5/19 ┐┌ C 1/19 ┐    │ MS OKAFOR'S│  │
        │      │  │ line    ││ line   ││ line   │    │ WORKING    │  │
        │      │  │ line    ││ line   ││ line   │    │ Undo Clear │  │
        │      │  └─────────┘└────────┘└────────┘    └── 380 px ──┘  │
        │      └─────────────────────────────────────────────────────┘
        │
        └── frozenView(session, classroom) ──► examples: FrozenExample[] {letter, lines+marks, mine}
                                                 mine = mistakeOf(session.lines[q]) === mistakeOf(example.lines)
               ┌────────────────────────────────────────────────────────┐
               │ /student  FrozenScreen                                 │
               │  ● Ms Okafor is reviewing this with the class [frozen] │
               │  Q2 2x²+7x−4=0 · Solve for x.                          │
               │  ExampleColumns size=student           ┌────────────┐  │
               │  ┌ A ─────┐┌ B [your initial response]┐│ MS OKAFOR'S│  │
               │  │ line   ││ line                     ││ WORKING    │  │
               │  │ line   ││ line                     ││ (mirror)   │  │
               │  └────────┘└──────────────────────────┘└── 310 px ──┘  │
               └────────────────────────────────────────────────────────┘

 ExampleColumns fit: grid.fontSize = max → ratio = min(box inner / maths width) over every line
                     → grid.fontSize = max × min(1, ratio); re-run on resize
```

## Verified by

vitest (452), eslint, tsc, `next build`; `review161.mjs`: board 1440 × 810 with three counted columns, no line wrapping or spilling (widest 240 of 253 px at 21 px), no column scrolling, the pad title on one line; 1396, 1280 and 1100 wide all unwrapped at one size per width (20.9, 17.5, 12.2 px) and 21 px again at 1440; the student's screen with the same lines in the same columns, no count, one light blue tag on B, first boxes level, nothing off screen; marks, Next (Q7, tag on B) and write with me follow the board.
