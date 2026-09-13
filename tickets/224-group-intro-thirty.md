# 224: The group intro holds 30 seconds

**What to build:** The read before the group whiteboard (ticket 220) holds for 30 s instead of 39 s, then the board opens on its own as before.

**Blocked by:** 220.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "change to 30 seconds, please".

## Solution

- `lib/groupIntro.ts`: `GROUP_INTRO_MS` is a fixed 30 000. The words-based read time (`READING_WPM`, `LOOK_MS`, `wordCount`, `readMs`) is removed, since nothing else used it and a derived number would override the user's choice on the next edit of the message.
- `lib/groupIntro.test.ts`: the timing test is 30 s; `app/globals.css`: the keyframe default follows (the duration is set inline).

## Acceptance

- [x] Jump, reload, class gate and forced routes all open the board 30 s after the class went in; the timer never reads over 0:30; the notice waits for the board (`intro224.mjs`, 26 checks)
- [x] vitest 634, eslint, tsc, next build
