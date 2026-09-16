# 345: Force submit and the count stand above the current stage

## Files touched

| File | What it does |
| --- | --- |
| `components/StagePill.tsx` | `PathwayPills` gains `above`: a stack laid over the current (or finished) pill, centred on it, taking no layout room (`STACK_ABOVE`, `absolute bottom-full`). `beside` now carries only end lesson. `badge` (the decision dot) moves from the pill's top-right corner to its bottom-right, clear of the new stack. |
| `app/teacher/ForceSubmit.tsx` | New narrower pill size and pending-line styles (`STACK_PILL_SIZE`, `STACK_SLOT`, `STACK_PENDING`) sized to stack over a stage pill instead of sitting beside it; `FORCE_PILL_SIZE` (15 px) stays for end lesson, which still sits beside the pill. |
| `app/teacher/BackLine.tsx` | Builds `above` (the count, then `ForceSubmit`) and passes it to `PathwayPills`; `beside` now holds only `EndLesson`, shown only when `endsLesson` is true for the current stage. |
| `tickets/345-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `README.md` | Docs. |

## How it connects

```
 app/teacher/BackLine.tsx
   builds two slots from the same `current` stage:
     above  = <n/total done>  <ForceSubmit>
     beside = <EndLesson>                       (only on a last stage that isn't class review)
        │                                   │
        ▼                                   ▼
 components/StagePill.tsx  PathwayPills({ above, beside, badge })
   for the current/finished stage's <li>:
     ┌─────────────────────────┐
     │        above (absolute, │ ← no layout room; bottom rests
     │     bottom-full, centred)│   3 px above the pill's top
     ├─────────────────────────┤
     │   <StagePill/> (badge on its bottom-right corner, ticket 335's dot) │← beside → <EndLesson/>
     └─────────────────────────┘
```

`above` is `position: absolute; bottom: 100%`, inside a `relative` wrapper around the pill — it draws
upward from the pill's own top edge and is taken out of flow, so the `<li>`'s box is exactly the pill's
box, unchanged from before this ticket. It lands in the 48 px of padding `TeacherChrome`'s `pt-12` puts
above the back line; that padding is the whole budget (`main` is the scroll region, so anything drawn
above the padding is clipped by it), and the stack measures 42 px, 6 px clear of the top bar.

The decision dot (ticket 335) used to sit on the pill's top-right corner; standing force submit there
too made the dot's ring cut into the button's rounded end, so the dot moved to the bottom-right corner,
which the new stack never reaches.
