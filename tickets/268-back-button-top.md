# 268: Every back button in exactly the report's spot, level with its eyebrow

**What to build:** User 2026-09-14, on Class View and Priya's report side by side after ticket 267: "still not in exact same spot. vertical alignment seems off". Then: "actually i don't liek how both areso far left -- move the 'class view' so it's in line left justified with '11 methods'. THEN take Edexia Classroom & match that position. this will have the Edexia Classroom button overhanging left -- that's fine".

**Blocked by:** 267.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- **Vertical.** Ticket 266 matched the gap *under the bar*, but the report's bar is drawn at 0.9 zoom (58.6 px tall against Class View's 47.1), so its button sat 11.5 px lower in the window (93.1 vs 81.6), plus the report's larger top padding. The report's zoomed-back wrapper now rises 28 of the button's px (was 12), putting its top at 81.6 px from the window like every other page.
- **Horizontal.** `BACK_LEFT` targets the report's column instead of a fixed 21.6 px: `max(0, (100vw − 1476px) / 2) + 21.6px`, the report's `max-w-[1640px] px-6` at 0.9. On the report it cancels to 0, so "← Class view" is level with "11 METHODS" at every width; every "← Edexia Classroom" takes the same spot and overhangs its own page's narrower column.

## Acceptance

- [x] At 1000, 1280, 1440, 1512 and 1920 wide: the report's button left edge equals its eyebrow's (21.6, 21.6, 21.6, 39.6, 243.6 px)
- [x] On Class View, Mistakes, Groups, class groups, Create, Create review and a missing set: same left, same top in the window (81.6 px), same height
- [x] Every student's report on PS1–PS5 at 1280×800 fits without scrolling (Ethan on PS4 included)
- [x] vitest, eslint, tsc, next build, check:laptop 62
