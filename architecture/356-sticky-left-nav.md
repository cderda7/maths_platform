# 356: "← Edexia Classroom" and the pathway strip pin to the top, on every tab

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/BackLine.tsx` | The back button + pathway-strip row (Class View, Mistakes) now renders inside a `sticky top-0` wrapper bled over the frame's own top/side padding, mirroring `Classroom.tsx`'s pinned heading. A `ResizeObserver` publishes the wrapper's rendered height as `--backline-h` on `[data-teacher-root]`, corrected for the frame's zoom. |
| `app/teacher/TeacherLive.tsx` | The roster's `HEAD` (`<th>`, ticket 167's own `sticky top-0`) now sticks at `top-[var(--backline-h,0px)]` instead of `top-0`, so it stacks below the now-pinned `BackLine` instead of freezing over the same pixels. |
| `app/teacher/groups/TeacherGroups.tsx` | The bare `<BackToClassroom />` gets the same `sticky top-0` wrapper inline, no `ResizeObserver` needed (nothing else on that page is sticky). |
| `tickets/356-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 TeacherChrome (never scrolls: header outside main, ticket 68)
   ┌─ <header> Edexia · tabs · avatar ───────────────────────────────┐  always visible
   └───────────────────────────────────────────────────────────────┘
   <main data-teacher-scroll>                                           the ONE scroll region
     ┌─ BackLine (Class View / Mistakes) ──────────────────────────┐
     │  sticky top:0, bled over the frame's px-6/pt-12             │  ← this ticket: now pinned
     │  "← Edexia Classroom"        indiv working → … → class review│
     │  ResizeObserver ─────────────► --backline-h (on data-teacher-root)
     └───────────────────────────────────────────────────────────┘
     ┌─ Eyebrow / H1 / due line ────────────────────────────────────┐  scrolls normally, unchanged
     └───────────────────────────────────────────────────────────┘
     ┌─ roster <thead> (Class View only, ticket 167) ───────────────┐
     │  sticky top: var(--backline-h,0px)  ◄──── reads the var      │  ← this ticket: offset, not top:0
     │  (was top:0 — froze over BackLine once BackLine also pinned) │
     └───────────────────────────────────────────────────────────┘
     ┌─ roster rows / mistakes cards ───────────────────────────────┐  scroll under both
     └───────────────────────────────────────────────────────────┘

 TeacherGroups (no BackLine, no thead)
   <main data-teacher-scroll>
     ┌─ <BackToClassroom/> ── sticky top:0, same bleed, inline ─────┐  ← this ticket: now pinned
     └───────────────────────────────────────────────────────────┘
     ┌─ Eyebrow / H1 / SeatingBoard ─────────────────────────────────┐  scrolls normally
     └───────────────────────────────────────────────────────────┘
```

Two sticky elements sharing one scroll region and both wanting `top:0` collide — whichever has the
higher `z-index` paints over the other's pixels instead of stacking below it. The roster head
(`TeacherLive.tsx`) was already `sticky top-0` before this ticket (ticket 167); pinning `BackLine`
on top of it without coordinating the two reproduced exactly that collision on the very first pass
(caught by this ticket's own headless-Chrome screenshot: the roster's column labels rendered inside
`BackLine`'s own top padding, in the wrong stacking order). `--backline-h`, corrected for the
frame's `zoom` the same way any other on-screen measurement in this frame has to be (ticket 127),
is the fix: the roster head reads back what actually got pinned above it instead of assuming `0`.

Groups has no table under `BackToClassroom`, so it needed only the sticky wrapper — nothing else on
that page competes with it for the same pixels.
