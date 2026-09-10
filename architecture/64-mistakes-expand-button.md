# 64 · Mistakes view: bigger red-filled slip pills, the question header opens and closes, and an expand / close / close-all button on hover

Route: `/teacher/mistakes`. Builds on tickets 62 and 63.

## Files touched

| File | What it does |
|---|---|
| `components/Tag.tsx` | `SlipChip` is 17px (was 11.5px) on a light red `bg-wrong-soft` fill, dark red border and text kept |
| `app/teacher/mistakes/TeacherMistakes.tsx` | `open` is a list of problem ids; `armed` is the problem just closed by hand. The header toggles on click; an action button after the equation reads expand / close / close all from the state, styled like the class view's row actions; the `Card` clears `armed` on mouse leave |

## How it connects

```
   state: open: string[]          armed: string | null
          (problems showing       (the problem just closed by hand; its button says
           their working)          "close all" until the pointer leaves its card)

   per problem card  <Card class="group/q" onMouseLeave={armed===id && setArmed(null)}>
   ┌──────────────────────────────────────────────────────────────────────────────┐
   │ header <div onClick=toggle(id)>                                              │
   │   Q5   y = x² − 4x − 5   [action button]                     [DifficultyTag]  │
   │                            │ onClick: stopPropagation, blur on mouse, act()   │
   │                            ▼                                                 │
   │            open?           ─▶ "close"     (ACTION_ACTIVE, always visible)     │
   │            armed && others ─▶ "close all" (ACTION_ACTIVE, visible)            │
   │            else            ─▶ "expand"    (ACTION_IDLE, group-hover/q only)   │
   │ ──────────────────────────────────────────────────────────────────────────── │
   │ tiles   <button onClick=toggle(id)>  … one per student, as ticket 63         │
   │ pills   SlipChip 17px bg-wrong-soft, one per slip group                      │
   │ panels  only when open.includes(id)                                          │
   └──────────────────────────────────────────────────────────────────────────────┘

   toggle(id):  open.includes(id) ? hide(id) : show(id)
   show(id):    open += id
   hide(id):    open −= id ; armed = id
   "close all": open = [] ; armed = null

   Class view (app/teacher/TeacherLive.tsx) STACK_IDLE / STACK_ACTIVE ──same classes──▶ ACTION_IDLE / ACTION_ACTIVE
```

## Verified by

vitest (281 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on port 3143
seeded the demo at "indiv review", opened `/teacher/mistakes` at 1600px and drove it with real pointer
events: the Q4 pill computes to 17px on `rgb(251, 233, 231)` with the `rgb(158, 47, 39)` border. With
nothing hovered Q1's button is `visibility: hidden`; hovering the header shows "expand"; clicking the
header text opens Q1 and the button reads "close" on the accent fill, and stays visible with the pointer
moved off the card. Opening Q2 by its expand button leaves Q1 open ("close" on both, open = q1, q2).
Pressing Q2's close collapses Q2 and the button reads "close all"; moving the pointer off Q2's card hides
it and it reads "expand" again. Opening Q3 by a tile, closing Q1 by its header ("close all" on Q1),
then pressing it leaves nothing open. Closing the only open question (Q5, twice on the header) shows
"expand", not "close all". A focus check confirmed the button is not focused after a mouse click and
the card is not `:hover` once the pointer leaves. Screenshots of two questions open, the "close all"
state, and the closed page were checked by eye.
