# 248: A press on the waiting Finalise set rings the unanswered recommendations, and Keep as is reads as a choice

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/assignments/create/review/RecommendationsStep.tsx` | Finalise `aria-disabled` at 40% while cards wait; a press scrolls the cards into view and bumps `nudge`; each unanswered `RecommendationCard` mounts a `.ring-once` span keyed on it. Keep as is is the ghost button with an inset ink ring and ink text. |
| `tickets/248-finalise-nudge.md` | The ticket. |

## How it connects

```
 lib/review.ts (unchanged)
   recommendationsFor(questions) ──► active cards
   allAnswered(active, answers)  ──► ready
        │
        ▼
 create/review/RecommendationsStep.tsx ◄248
   Finalise set: aria-disabled + 40 % while !ready
   press ─┬─ ready  → onFinalise() ──► PathwayStep (ticket 246)
          └─ !ready → cards.scrollIntoView, nudge++
        │ nudge
        ▼
   RecommendationCard ◄248
   ┌──────────────────────────┐   ┌──────────────────────────┐
   │ Change Q1                │   │ Remove Q9          ((○)) │ ◄ <span.ring-once key=nudge>
   │ Kept as is. Undo         │   │ …                        │   only while unanswered
   │ (answered: no ring)      │   │ [Accept] (Keep as is)    │ ◄ inset 1 px ink ring
   └──────────────────────────┘   └──────────────────────────┘
        │
 app/globals.css (unchanged): .ring-once = hint-ring keyframes once; reduced motion fades a still edge
```
