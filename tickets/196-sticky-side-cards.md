# 196: Class View's Pathway and live cards stay near the top as the teacher scrolls

**What to build:** On a live assignment's Class View, the cards above the Key (class review when in use, Pathway, group progress, Live diagnostic) start where they are today, level with the table. As the teacher scrolls, they rise with the page until they're 48 layout px under the top bar, then stay there while the roster scrolls under them. The Key keeps riding the bottom (ticket 192). A finished set's column holds only the Key, unchanged.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshots of Problem Set 2's Class View at the top and scrolled, after ticket 192): "so i like where the pathway & live diagnostic are in the first image. want it so that it scroll as well -- stays in that position as scroll happens, similar to how key stays in its position."

Asked where the cards should stay once scrolled, the user chose "rise, then stay near the top" (the cards scroll up until they're a small gap below the bar, the same gap the Key keeps from the bottom) over "never move from where the page opens", which on a 1280 × 800 laptop would put the Live diagnostic card over the Key.

## Solution

- `app/teacher/TeacherLive.tsx`: the cards above the key are one `sticky top-12 z-10` group (`data-side-top`), rendered only on a live set.
- `useSideColumnPins` keeps the two pinned groups from overlapping on a short window. A ResizeObserver watches the scroll region and both groups. When the region is too short for both, the top group stops sticking (pinned, it would ride down onto the key at the end of the roster), and the key stays pinned if it fits on its own. It sets `position` and `data-pinned` on the nodes directly, not through state.
- The Key's sticky offset moved to a wrapper div so the hook can hold a ref (`Card` takes no ref).

## Acceptance

- [x] pset-2 at 1280×800, 1400×1000, 1440×900 and 1512×860: at the top the Pathway card is level with the table and the Key near the bottom; at mid-scroll and at the end the Pathway card is 48 layout px under the bar and the Key unmoved (on the table's bottom at the end)
- [x] At every scroll step (0 to 100%) the top group never reaches the Key, and a pinned group is inside the scroll region
- [x] 1280×720 and 640: both pinned; 1280×520: the top cards scroll, the Key pinned
- [x] With class review on the pathway (its card joins the group, 565 layout px): both pinned at 1280×800 and 1440×900, top cards scroll at 1280×640
- [x] An open drill row keeps the pins; pset-1 has no top group and the Key still rides the bottom
- [x] vitest 569, eslint, tsc, next build, check:laptop 30; click-through `side196.mjs` (37 checks)
