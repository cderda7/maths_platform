# 232: The group intro's bar and time left move in step

**What to build:** On the group intro, the draining bar and the time left beside it agree at every moment: when the corner reads 0:15 the bar is at half, and a reload lands in step at once. The read stays 30 s.

**Blocked by:** 224.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the bar at 45% beside "0:15": "30 seconds is fine -- but it's not linear, it's well below half at 15 s. make that change, please."

The bar was a linear CSS animation, but the label was `Math.ceil` of the time left on `useNow`'s one-second tick, so "0:15" showed for real times between about 13 and 15 s left (bar 43–50%), and the bar's start was set from that lagging clock.

## Solution

- `lib/store.ts`: `useFrameNow(active)`, an animation-frame clock (0 on the server and when inactive).
- `app/student/screens/GroupBoardScreen.tsx`: during the intro, passes `max(useNow, useFrameNow)` to the intro.
- `app/student/screens/GroupIntro.tsx`: the bar's width is the fraction left (`1 − introProgress`) and the label is `introSecondsLeft`, both from that one `now`; the CSS animation and its mount-time delay are gone.
- `lib/groupIntro.ts`: `introSecondsLeft` rounds to the nearest second, clamped to 0–30, so "0:15" only shows while the bar is within a sixtieth of half. `app/globals.css`: the `intro-drain` keyframes removed.

## Acceptance

- [x] Sampled every ~140 ms through the read: the bar tracks the real time left to 0.02 s, label and bar never differ by more than half a second, every "0:15" shows a bar at 48.4–51.4%, the bar only drains, no CSS animation; after a reload in step at once (`bar232.mjs`, 7 checks)
- [x] `intro224.mjs` 26/26, `entry226.mjs` 17/17; vitest 675, eslint, tsc, next build
