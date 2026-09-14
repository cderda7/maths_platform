# 246: The review pathway is one line of stops the teacher switches on, and Create waits for the choice

## Files touched

| File | What it does |
| --- | --- |
| `lib/pathway.ts` | `togglePathway(p, stage)` switches one stop on or off in `REVIEW_ORDER`, `null` when the last goes off; `successors`, `mapColumns`, `pathwaySentence` and `NEW_SET_PATHWAY` removed with the branching map. |
| `lib/review.ts` | `ReviewState.pathway` is `Pathway \| null`: `null` undecided, `[]` No review. A new set starts on `null`; `reviewFor` keeps a stored choice across a new draft. |
| `app/teacher/assignments/PathwayMap.tsx` | Rewritten as the line: five equal columns of one-width pills on a track through their centres, an arrowhead in each gap, a toggle per review stop with its description under it, the No review chip under the line; `data-state` undecided / decided / none. |
| `app/teacher/assignments/create/review/PathwayStep.tsx` | The card's instruction line; Create `aria-disabled` at 40% with "Choose a review pathway first" while undecided, a press scrolling the card into view and remounting a `.ring-once` span. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | `create` refuses an undecided pathway. |
| `app/globals.css` | `.ring-once`: the hint ring's keyframes, once, at once; reduced motion fades a still accent edge. |
| `lib/pathway.test.ts`, `lib/review.test.ts` | `togglePathway`; undecided start; No review survives a new draft. |
| `tickets/246-pathway-line.md` | The ticket. |

## How it connects

```
 lib/pathway.ts ◄246
   REVIEW_ORDER = [individual, group, whole-class]
   togglePathway(p | null, stage) ──► Pathway | null   (last stop off → null)
   STAGE_WORD, STAGE_DESCRIPTION ──────────────┐
   DEFAULT_PATHWAY ──► lib/session.ts, lib/classroom.ts (demo, unchanged)
                                               │
 lib/review.ts ◄246                            │
   ReviewState.pathway: null (undecided) | [] (No review) | stages
        │ classroom store (reload keeps it)    │
        ▼                                      │
 create/review/ReviewAssignment.tsx ◄246       │
   create(): pathway null → return             │
        │ review, onChange, onCreate            │
        ▼                                      ▼
 create/review/PathwayStep.tsx ◄246 ──► app/teacher/assignments/PathwayMap.tsx ◄246
   waiting = pathway === null                   ┌────────────────────────── grid-cols-5 ──────────────────────────┐
   Create aria-disabled, 40 %                   │ (working)─>[✓ indiv review]─>┆group review┆─>[✓ class review]─>(done) │
   "Choose a review pathway first"              │             students find…   groups compare…  you lead the…     │
   press → card.scrollIntoView                  │ track: pale while undecided, ink once decided                   │
         → <span.ring-once key=nudge>           └─────────────────────────────────────────────────────────────────┘
   group on → Confirm groups (unchanged)          ( ✓ No review, working only )  → onChange([] | null)
        │
        ▼ assignment/create { pathway } ──► lib/classroom.ts (unchanged)
```
