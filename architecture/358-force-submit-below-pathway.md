# 358: Force submit and the count move below the current stage

## Files touched

| File | What it does |
| --- | --- |
| `components/StagePill.tsx` | `PathwayPills` gains `below` in place of `above`: the visible stack is still `absolute`, centred on the pill, just hung off `top-full` instead of `bottom-full`; a new fixed-height, width-less `data-stage-below-spacer` sibling reserves the real vertical room the visible stack doesn't take itself. `<ol>` moves from `items-center` to `items-start` so a taller current-stage `<li>` never shifts the others' top edge. |
| `app/teacher/ForceSubmit.tsx` | Comments updated for the new position; no style changes (`STACK_PILL_SIZE`, `STACK_SLOT`, `STACK_PENDING` are unchanged — the button and its pending countdown were already height-matched by ticket 345, which is what makes a fixed-height spacer safe here). |
| `app/teacher/BackLine.tsx` | Builds `below` (`ForceSubmit`, then the count — reversed from ticket 345's `above`) and passes it to `PathwayPills`; `beside` is unchanged. |
| `tickets/358-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `README.md` | Docs. |

## How it connects

```
 app/teacher/BackLine.tsx
   builds two slots from the same `current` stage:
     below  = <ForceSubmit>  <n/total done>
     beside = <EndLesson>                       (only on a last stage that isn't class review)
        │                                   │
        ▼                                   ▼
 components/StagePill.tsx  PathwayPills({ below, beside, badge })
   for the current/finished stage's <li> (<ol> is items-start):
     ┌─────────────────────────┐
     │   <StagePill/> (badge on its bottom-right corner, unchanged since ticket 345) │← beside → <EndLesson/>
     ├─────────────────────────┤
     │  data-stage-below-spacer │ ← in flow, w-0, height: 42px — this is what actually
     │  (invisible, 42px tall)  │   grows the <li>, the strip, and the back line
     └─────────────────────────┘
        ↑ the *visible* stack (force submit, then the count) is absolutely positioned
          over this spacer's space, centred on the pill by left-1/2 -translate-x-1/2,
          top-full — so its own width (which changes when force submit's pending
          countdown is showing) never affects the <li>'s box width or its siblings'
          positions, only the spacer's fixed height does that.
```

`--backline-h` (ticket 356's `ResizeObserver` on `BackLine`) already recomputes off the row's
real rendered height, so Class View's `sticky top-0` roster head picks up the taller row for
free whenever the current stage has force submit and a count showing, and drops back down once
it doesn't (class review, lesson over, no live set) — nothing in the roster head or elsewhere
needed to change for this ticket.

The split between the *visible* stack (absolute, centred on the pill, width can vary) and the
*spacer* (in flow, fixed height, zero width) exists because the two states of force submit —
the plain button and the pending "handing in · 0:47 · Cancel" countdown — are different widths.
An earlier, simpler version put the real stack itself in flow; pressing force submit then widened
the current stage's `<li>` and shoved every pill after it sideways, since the `<li>`'s own width
participates in the `<ol>`'s flex-row sizing. Centring the visible stack on the pill by absolute
position removes it from that sizing calculation entirely, while the fixed-height spacer still
grows the row the way ticket 356's `--backline-h` mechanism expects.
