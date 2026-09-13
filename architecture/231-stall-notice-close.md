# 231: The stall notice has a close × too

## Files touched

| File | What it does |
| --- | --- |
| `components/PracticePad.tsx` | The practice pad; `CardClose` is the corner ×, drawn by `HelpMenu` and `StallNotice`. |
| `tickets/231-stall-notice-close.md` | The ticket. |

## How it connects

```
 /student  stage "practice"  →  PracticePad.tsx
   "I need help" ──► HelpMenu ──────────────┐
        │             ┌ I'd like a… ──── × ┐ │
        │             └────────────────────┘ │
        │  "hint" while the last hint stalls  │
        └──────────► StallNotice ────────────┤
                      ┌ Let's talk… ──── × ┐ │  ◄ 231
                      │ ( Talk it through )│ │
                      └────────────────────┘ │
                                             ▼
                       CardClose (one ×) ──► the card's onClose
                       Scrim click, Escape ─► the same onClose
```
