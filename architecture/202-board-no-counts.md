# 202: The board's class review shows no student counts

## Files touched

| File | What it does |
| --- | --- |
| `lib/examples.ts` | Example selection for class review; `boardExamples` now returns only each example's letter and lines. |
| `lib/examples.test.ts` | Asserts the board view model is exactly `letter` + `lines`. |
| `lib/board.test.ts` | Same assertion through `boardContent`. |
| `app/board/SmartBoard.tsx` | The projected slide; no count in the example corner. |
| `components/ExampleColumns.tsx` | Shared example columns (board and student); doc comment only. |
| `lib/frozen.ts` | The student's frozen view model; doc comments only. |
| `tickets/198-board-no-counts.md` | The ticket. |

## How it connects

```
                         lib/examples.ts
               candidatesFor(problem, session)
                 │                        │
                 ▼                        ▼
         optionsFor(cands)         boardExamples(refs)
         { name, count, ... }      { letter, lines }      ◄── no count, no name, no mark
                 │                        │
                 ▼                        ├──────────────────────────┐
   /teacher/whole-class               lib/board.ts               lib/frozen.ts
   WholeClassSetup ─► ExamplePicker   boardContent               frozenContent (+ "mine")
   "13" pill, "n students" menu,          │                          │
   "n/m struggled"   (laptop only)        ▼                          ▼
                                     /board SmartBoard        /student FrozenScreen
                                     ExampleColumns           ExampleColumns
                                     corner: none             corner: "your approach"
```
