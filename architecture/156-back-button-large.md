# 156 · The overlay's "Back to Qn →" button is the large size

Route: `/student` (the isolated-practice overlay, reached from "I need help" on the working screen).

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/PracticePrompt.tsx` | `PracticeOverlay`'s `footer` button is `size="lg"`, the same as its `finished` button. |

## How it connects

```
 PracticeOverlay (app/student/screens/PracticePrompt.tsx)
   └─ PracticePad (components/PracticePad.tsx)
        ├─ left column: title, skill chip, "I need help" (lg)
        ├─ middle: the canvas
        └─ right column: "Read as" lines
             ├─ finished  = <Button size="lg">Back to Qn →</Button>   (after the worked example)
             └─ footer    = <Button size="lg">Back to Qn →</Button>   ← was md; now lg (15 px, px-6 py-3)
```

## Verified by

vitest (432), eslint, tsc, `next build`; `back156.mjs`: from the working stage, "I need help" → factorising; the footer button reads "Back to Q1 →" at 15 px with 24 px side and 12 px top padding, 46.5 px tall, 24 px from the right column's right and bottom edges; after the worked example every "Back to" button on the overlay measures the same; pressing it closes the overlay.
