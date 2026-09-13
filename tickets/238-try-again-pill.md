# 238: "Try again" pops after a wrong check, and the hint rings once

**What to build:** On the group review whiteboard, a wrong check the board goes on from (a problem's first or second wrong check on its first visit) pops a "Try again" pill in the middle of the screen on every member's iPad: light blue, dark purple border and text, one pulse, then it fades by itself. After the second one fades, the hint that check brought in sends out one purple ring, to draw the student's eye to it.

**Blocked by:** 221, 222, 235.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), after ticket 235 wiped the board on a wrong check: "we need some sort of a prompt to 'try again' after that first incorrect submission in group review". Offered a prompt on the board, in Read as, on the Not yet card or a pop-up, they chose: "have it be a pop up that does a single pulse in the middle of the screen. have it be a light blue pill with dark purple border & dark purple text". Asked the rest: it says "Try again", fades out by itself, shows after the first and second wrong checks, and all four members see the same pill. Then: "after the second 'try again' disappears, then have the hint box pulse with purple emanating out one time -- draws student attention there".

## Solution

- `lib/groupReview.ts`: `TRY_AGAIN_MS` (1.6 s) and `HINT_RING_MS` (0.9 s); `tryAgainAt(run)` is the moment of a wrong check the board goes on from (first visit, fewer than `LEAVE_AFTER_WRONG` wrong checks, not closed), `tryAgainShowing(run, now)` holds it for `TRY_AGAIN_MS` so a reload later never replays it, and `hintRingAt(run)` is that moment plus `TRY_AGAIN_MS` when it was the check that brought the hint (`HINT_AFTER_WRONG`). No new stored state: the check's `at` is already on the attempt.
- `app/student/screens/GroupBoardScreen.tsx`: the screen is `relative` and sets `--try-again-ms` / `--hint-ring-ms` from the constants; the pill sits in a `pointer-events-none` layer centred over the whole screen, keyed by the check's moment so each check pops its own; the hint gets `ring-out` while its ring is due.
- `app/globals.css`: `.try-again` pops in (scale 0.8 → 1), pulses once to 1.12, holds and fades over `--try-again-ms`; `.ring-out::after` spreads one accent-purple ring 22 px out over `--hint-ring-ms`, delayed by `--try-again-ms`. Reduced motion: the pill only fades, no ring.

## Acceptance

- [x] Unit: the pill's moment after the first and second wrong checks, gone at `TRY_AGAIN_MS`, none on the third (leaving), on the return or on a correct check; the ring only after the second (`lib/groupReview.test.ts`)
- [x] Click-through `try238.mjs` (32 checks, sampled every animation frame) on Q7 with Sam's pen: the pill appears at once, says Try again, is centred on the screen to the pixel, light blue with a 2 px dark purple border and dark purple text, fully rounded, lets the pen through; grows once to 1.12 and settles, faded by 1.65 s and gone from the page soon after; the other member's iPad (1280×800) pops the same pill centred; no ring on the first check; on the second the hint's ring waits while the pill is up, then spreads and fades once by 2.6 s; a reload replays neither; the third check shows no pill or ring, leaving instead; no horizontal scroll
- [x] `notyet235.mjs` still passes on this build
- [x] vitest 755, eslint, tsc, next build
