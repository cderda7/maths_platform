# 329: Individual review: mistakes box first, skills on their own line

## Files touched

| File | What it does |
| --- | --- |
| `app/student/screens/FeedbackScreen.tsx` | The left column's two soft boxes swap: `[data-summary]` (the detective sentence) first at `mt-4`, `[data-incomplete]` after it at `mt-2`. The hint is a block: "Double-check" as its own `<p>`, the chips in `[data-hint-skills]`, a wrapping flex row below it. |
| `tickets/329-…`, `ARCHITECTURE.md`, `README.md` | Docs. |

## How it connects

```
 lib/feedback.ts feedbackSummary(session, "original", problems)
   { head, hint: subskill ids, incompleteHead }        (unchanged)
                         │
                         ▼
 app/student/screens/FeedbackScreen.tsx  left column
 ┌───────────────────────────────────────┐
 │ HANDED IN / How it held up            │
 │ ┌───────────────────────────────────┐ │
 │ │ 5 problems in your first          │ │ ◀─ head            [data-summary]
 │ │ submission contain a mistake.     │ │
 │ │ Double-check                      │ │ ◀─ its own line    [data-hint]
 │ │ (factorising)                     │ │ ◀─ LeafChip per    [data-hint-skills]
 │ │ (non-monic factorising)           │ │    hint id, wraps
 │ │ (null factor law)                 │ │
 │ └───────────────────────────────────┘ │
 │ ┌───────────────────────────────────┐ │
 │ │ 2 problems are incomplete.        │ │ ◀─ incompleteHead  [data-incomplete]
 │ └───────────────────────────────────┘ │
 │ Q1 3 lines / Q2 4 lines / …           │
 │ [ Hand in ]                           │
 └───────────────────────────────────────┘
```
