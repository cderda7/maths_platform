# 221: A second wrong check puts a hint on the group board

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupReview.ts` | The shared whiteboard's rules; adds `wrongChecks`, `HINT_AFTER_WRONG` and `boardHint` (the clue of the latest attempt's first wrong line). |
| `lib/groupReview.test.ts` | Q7's three-attempt turn; the hint's threshold, text and when it goes. |
| `app/student/screens/GroupBoardScreen.tsx` | The board and its Read-as column; renders the hint card under "Not yet". |
| `components/HintCard.tsx` | The practice pad's hint card, reused here without linked words (doc comment only). |
| `data/group-scripts.ts`, `data/classmates.ts` | Q7's scripted attempts: two-terms slip, lost third (now exported), model solution. |
| `tickets/221-…`, `222-…`, `223-…` | This ticket and the two after it. |

## How it connects

```
 data/group-scripts.ts ──► turnScript("q7") ──► StudentApp's peer loop ──► group/scripted (classroom store)
                                                                              │
                                                  attempts.q7: [wrong, wrong, correct]
                                                                              │
 data/evaluation.ts ─► evaluateLine ─► boardHint(run) ◄── wrongChecks ≥ HINT_AFTER_WRONG (2)
                                            │
 GroupBoardScreen                           ▼
  ┌──────────────── board (2fr) ──────────┬── Read-as column (1fr) ─┐
  │  Liam's working (synthetic ink)       │  NOT YET  (first cut)   │
  │                                       │  HINT     (clue)        │  ◄ HintCard, no linked words
  │                                       │  READ AS  (live lines)  │
  └───────────────────────────────────────┴─────────────────────────┘
```
