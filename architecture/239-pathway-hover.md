# 239: A new set's pathway starts on individual working, and each review stage says what it is on hover

## Files touched

| File | What it does |
| --- | --- |
| `lib/pathway.ts` | `NEW_SET_PATHWAY` (a new set's empty pathway, apart from the demo's `DEFAULT_PATHWAY`) and `STAGE_DESCRIPTION` (the hover line per stage). |
| `lib/review.ts` | `initialReview` / `reviewFor` start Create's review state on `NEW_SET_PATHWAY`. |
| `app/teacher/assignments/PathwayMap.tsx` | Hover/focus state per stage pill; `Description` draws the grey line beside the pill in the last column, or under it when the map has no room on the right. |
| `lib/pathway.test.ts`, `lib/review.test.ts` | Pin the descriptions and the two defaults. |
| `tickets/239-pathway-hover.md` | The ticket. |

## How it connects

```
 lib/pathway.ts ◄239
   DEFAULT_PATHWAY  = [individual, group] ──► lib/session.ts, lib/classroom.ts (demo, no set created; unchanged)
   NEW_SET_PATHWAY  = []  ─────────────────► lib/review.ts initialReview / reviewFor ◄239
   STAGE_DESCRIPTION ─────────┐                    │ review.pathway
                              │                    ▼
                              │   create/review/PathwayStep.tsx (unchanged)
                              │                    │ value / onChange
                              ▼                    ▼
 app/teacher/assignments/PathwayMap.tsx ◄239
   hover = { column, stage, room = map.offsetWidth − columnRight(column) − 16 }
   ┌──────────────────┐     ┌────────────────────┐
   │ individual       │──┬─►│ individual review  │
   │ working          │  ├─►│ group review       │
   └──────────────────┘  └─►│ class review  ◄hover│  grey line (last column only)
                            └────────────────────┘
     room ≥ 200 px:  [ pill ]  students find and fix…      (beside, centred, wraps in the map)
     room < 200 px:  [ pill ]                              (third column: under the pill, 8 px)
                     you lead the class through…
```
