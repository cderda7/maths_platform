# 144 · The diagnostic flyout collapses on pointer leave, draft kept

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/DiagnosticPush.tsx` | `onMouseLeave={() => open && setOpen(false)}` on the wrapper that holds both the chip's footprint and the flyout; the draft state is unchanged and survives because the component never unmounts. |
| `README.md` | The mistake view paragraph says the panel collapses on leave and keeps a draft. |

## How it connects

```
 DiagnosticPush (state: open, tab, stem, tex, options, correct)        ← the draft lives here, not in the flyout
   │
   └─ wrapper div (relative; onMouseLeave → open = false)              ← one handler for chip and panel
        ├─ chip footprint (in flow, holds the row)
        └─ open && flyout (absolute, a DOM descendant)                  ← mouseleave is by DOM containment,
              └─ Card: chip · tabs · question / own inputs · send        so moving chip → panel never fires it

 pointer:  click chip ─► open ─► move inside: stays ─► move out (any side, or up off the chip): collapse
 click chip again ─► open with the same tab, stem, options, correct
```

## Verified by

vitest, eslint, tsc, `next build`; headless click-through `collapse144.mjs` with real mouse events over CDP: open by a click on the chip; moving to the panel's middle, its bottom right corner and onto the stem input after typing keeps it open; leaving to the left, below, to the right and straight up off the chip each collapse it; the chip returns to its place and the row measures the same; reopening shows the own tab with the stem, option B and B marked correct; Q2's flyout opens and collapses independently.
