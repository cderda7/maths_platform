# 152 · The example picker's menu stays inside its slot

Route: `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/whole-class/ExamplePicker.tsx` | The menu spans the slot (`left-5 right-5`), names wrap, badges inline, count on the right. |

## How it connects

```
 Q2 card (overflow-hidden)
 ┌───────────────┬───────────────┬───────────────────────┐
 │ A             │ B             │ C  [sign lost … 1 ▾]  │
 │               │               │  ┌ menu: left-5 right-5 ┐   ← the slot's own width,
 │               │               │  │ ● correct        12  │     never past the card's edge
 │               │               │  │ ● guessed pair,   5  │
 │               │               │  │   not expanded back  │   ← long names wrap
 │               │               │  │ ● sign lost …     1  │
 │               │               │  └──────────────────────┘
 └───────────────┴───────────────┴───────────────────────┘
```

## Verified by

vitest (427), eslint, tsc, `next build`; `menuwidth.mjs`: from the report stage (so a badged option exists), at 1400 and 1280 px, every ticked problem's A, B and C menus opened in turn; each menu's rect inside its slot and its card, every count visible and unclipped, no option clipped, the badged option whole.
