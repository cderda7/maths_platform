# 356: "← Edexia Classroom" and the pathway strip pin to the top, on every tab

**What to build:** Carson, looking at the Mistakes tab scrolled down: "make it so that the whole left side doesn't jump around AT ALL. want to be able to see ← Edexia Classroom in all views. yeah just make it stay" — then, asked to confirm scope: "same idea for other review modes, as well." The back button and the pathway strip beside it (`BackLine`) pin to the top of the teacher frame's scroll region on Class View and Mistakes, and the bare back button pins the same way on Groups, so "← Edexia Classroom" and the current stage are always on screen, at every pathway stage (indiv working, indiv review, group review, class review), on every one of the three tabs.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Screenshotted the Mistakes tab at scroll 0 and scrolled down: the top nav bar (Edexia · tabs · avatar) stayed on screen (it already lives outside the scroll region, ticket 68), but the row below it — "← Edexia Classroom" and the indiv working → indiv review → group review → class review strip (`BackLine.tsx`) — scrolled away with the rest of the page, same as the eyebrow and every table row under it. A teacher scrolled down into a long mistakes list or roster loses both the way back and the pathway reference at the same time.

Scope, settled from "same idea for other review modes, as well": every tab that shows this row (Class View and Mistakes, both via `BackLine`) and the one that doesn't (Groups, a bare `BackToClassroom`) gets pinned the same way. Left out, and logged in `FUTURE_FEATURES.md`: `WholeClassSetup` (class review's own setup screen) and `TeacherCompare` (before/after) currently render no back control at all, and `AssignmentProvider`'s "not created yet" fallback still renders a bare, unpinned `BackToClassroom` — none of those were the screen asked about, and none are a tab a teacher scrolls a long list on.

## Acceptance

- [x] `BackLine` (Class View, Mistakes) is pinned to the top of `[data-teacher-scroll]`, same mechanism as `Classroom.tsx`'s own pinned heading (`sticky top-0`, bled over the frame's top/side padding and repainted so nothing shows through)
- [x] Groups' bare `BackToClassroom` is pinned the same way
- [x] Scroll 0 is pixel-identical to before this ticket on all three tabs
- [x] Scrolled to the bottom of a long roster or mistakes list, "← Edexia Classroom" and (where shown) the pathway strip stay on screen, at every stage
- [x] Class View's roster header row (its own `sticky top-0`, ticket 167) stacks below `BackLine` instead of freezing over the same pixels — `BackLine` publishes its own rendered height as `--backline-h` (a `ResizeObserver`, corrected for the frame's zoom), the roster head's `top` reads it back
- [x] vitest, eslint, `next build`; a real production build driven headlessly (seeded classroom state, all three tabs, scrolled deep) and screenshotted before/after
- [x] Ticket docs: `architecture/356-sticky-left-nav.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

- **`app/teacher/BackLine.tsx`.** The returned row now sits inside a `sticky top-0 z-10 -mx-6 -mt-12 bg-cream px-6 pt-12` wrapper — Classroom's own pinned-heading pattern (`Classroom.tsx`), reused rather than reinvented. A `ResizeObserver` on that wrapper writes its rendered height, divided by the frame's zoom (`getComputedStyle(scope).zoom`, since `offsetHeight` already comes back scaled), to `--backline-h` on the nearest `[data-teacher-root]`.
- **`app/teacher/TeacherLive.tsx`.** The roster's `HEAD` (every `<th>`, ticket 167's own `sticky top-0`) reads `top-[var(--backline-h,0px)]` instead of `top-0`, so it stacks below `BackLine` once both are stuck rather than freezing over the same pixels (the bug the first pass of this ticket shipped and caught on its own screenshot).
- **`app/teacher/groups/TeacherGroups.tsx`.** The bare `<BackToClassroom />` gets the identical sticky wrapper inline (no shared `BackLine` pathway strip to carry, so no `ResizeObserver` needed here — nothing downstream competes with it for the same pixels).
