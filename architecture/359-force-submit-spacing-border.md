# 359: The below-the-pill stack gets more air, force submit gets a purple border

## Files touched

| File | What it does |
| --- | --- |
| `components/StagePill.tsx` | `STACK_BELOW`'s gaps grow (`pt-1`→`pt-2`, `gap-[2px]`→`gap-1.5`); `BELOW_HEIGHT` grows from 42 to 50 to match, so the fixed-height spacer (ticket 358) still reserves exactly the stack's real rendered height. |
| `app/teacher/ForceSubmit.tsx` | `FORCE_PILL` (shared with `EndLesson`) drops its border colour, keeping only the structural `border`; the force submit button adds `border-accent` (`#5b4ae8`) directly. |
| `app/teacher/EndLesson.tsx` | Adds `border-standout-line` directly to its own button, so its look is unchanged now that `FORCE_PILL` no longer supplies a colour. |
| `tickets/359-…` | Docs. |

## How it connects

```
 app/teacher/ForceSubmit.tsx                    app/teacher/EndLesson.tsx
   FORCE_PILL (structural, no border colour) ──┬── + border-accent   (force submit's own button)
                                                └── + border-standout-line (end lesson's own button, unchanged look)
```

Splitting the border colour out of the shared `FORCE_PILL` constant, rather than overriding it with a
second class, avoids relying on Tailwind's generated CSS order to decide which of two `border-color`
utilities wins on the same element — `FORCE_PILL` now has no opinion on colour at all, so there is
nothing to be overridden.

`components/StagePill.tsx`'s stack (ticket 358: pill on top, force submit, then the count, `absolute`
and centred on the pill, with a fixed-height in-flow spacer doing the real layout work) is otherwise
unchanged — only the two gap values and the spacer's matching height moved.
