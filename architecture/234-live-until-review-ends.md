# 234: Problem Set 6 stays in Live until class review ends

## Files touched

| File | What it does |
| --- | --- |
| `lib/classroomCards.ts` | `assignmentCard`: section `live` while a stage is current, `past` once class review has ended; status `live` / `in review` / `done` from the current stage. |
| `lib/classroomCards.test.ts` | Every review skip stays live and in review; ended class review is past and done. |
| `app/teacher/Classroom.tsx` | The card's line follows its status; the two chips overhang the line so every card is one height. |

## How it connects

```
 classroom + Sam's session + now
            │
            ▼
 assignmentStages ─► currentStageOf ─► current stage
                                            │
            ┌───────────────────────────────┼──────────────────────────┐
            ▼                               ▼                          ▼
      "working"                    indiv / group / class        null (class review ended)
  section live, status live      section live, status in review   section past, status done
            │                               │                          │
            ▼                               ▼                          ▼
   Classroom: pinned Live            pinned Live card              Past list
   "● live · n/20 · mistakes"     "in review · n/20 · top gap"   "done · n/20 · top gap"
            └──────────── every card 135 layout px (chips -my-0.5) ───────┘
```
