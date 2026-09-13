# 216: The Classroom pins its heading and the Live card; Past scrolls

**What to build:** On the Edexia Classroom, the eyebrow, the "Edexia Classroom" title, New assignment, the LIVE label and the live set's card stay exactly where they are now while the teacher scrolls; only the Past list scrolls, beneath them, newest set first. Before Create there is no live card and only the heading is pinned. All past sets are listed; scrolling to the oldest is fine.

**Blocked by:** 208.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "all 5 show under past, ordered most recent to oldest. if scroll is needed to see oldest PSet, that's fine. OH but treat Live as a header -- so even once teacher scrolls, PSet 6 live is visible as fixed 'header' -- like in the positon it is now", with a screenshot of today's Classroom (Live card under the title, Past below). The teacher chrome is zoomed; the laptop is 1280 wide.

## Solution

- `app/teacher/Classroom.tsx`: the eyebrow, the title row and the Live section sit in one `sticky top-0` region (`data-classroom-pinned`) inside the teacher chrome's scroll region; Past follows it in normal flow and scrolls under its bottom edge. The region pulls itself out over the chrome's padding (`-mt-12 pt-12`, `-mx-6 px-6`) so it sticks at the scroll region's top with an opaque cream ground across the strip above the eyebrow and beside the cards (a passing card's shadow never shows beside it); its bottom padding is the gap Past used to open with (`pb-10`), so every rect at scroll 0 is today's to the pixel (measured against the build before the change at 1280×800 and 1440×900, before and after Create). Sticky rather than a fixed top with an inner scroll box: the one scroll region keeps the wheel, trackpad, keyboard (Home/End/Page keys) and scrollbar working over the whole page, including over the pinned heading (DECISION_LOG).
- A past card focused by the keyboard scrolls clear of the pinned region: the region's height is written to `--classroom-pinned` by a `ResizeObserver` (no React state) and each card's link has `scroll-margin-top` of that height.
- Before Create (nothing live) there is no Live section at all, not even the dashed "Nothing live right now" note: only the heading is pinned, and Past opens where Live would sit (`pb-12`, the Live section's old top gap). Judgment call: the ticket's "only the heading is pinned … no empty Live gap" read as dropping the note too (a note left in would either be pinned, against "only the heading", or scroll away above Past).
- `lib/classroomCards.ts`: each section sorts newest due first (`dueOrder` reads "Mon 7 Sep" as a place in the year, `newestFirst` a stable sort, ties keep the registry's order), so sets added in any registry order (tickets 211–214) list newest to oldest.
- Proven with many past sets without touching the registry: the click-through clones the past card eight times in the DOM on a short viewport (1280×600, 1440×700).

## Acceptance

- [x] With a short viewport and many past sets, scrolling moves only Past; the heading and Live card's rects are unchanged before and after (click-through asserts geometry: wheel over Past and over the heading, End to the oldest, a focused card, Home; `click216.mjs`, 92 checks)
- [x] Before Create: heading pinned, Past scrolls, no empty Live gap
- [x] 1280 and 1440, no horizontal scroll, the Live card at its current position
- [x] vitest 611, eslint, tsc, next build, check:laptop 30
