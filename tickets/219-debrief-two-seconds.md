# 219: The group debrief's green view holds two seconds, not five

**What to build:** The unmarked comparison after a correct group check shows for two seconds before the marks open on their own (ticket 218 had five). Next, the reflect text and the ten-second hold are unchanged.

**Blocked by:** 218.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "reduce wait time between green & marks shown to 2 seconds."

## Solution

- `lib/debrief.ts`: `UNMARKED_MS` 5 000 → 2 000. `PEER_DEBRIEF_MS` 16 000 → 13 000, so a peer who holds the next pen still waits one debrief (2 s + 10 s) and a second to press Next, as ticket 52 set it.
- `lib/debrief.test.ts`, `app/student/screens/GroupDebrief.tsx`: the timing test and comments follow.

## Acceptance

- [x] Sam's Q1 and Zara's Q2: unmarked at 1.3 s, marks + disabled Next + reflect + ring at 3.8 s, the versions keep their height, Next on after 12 s from the check; reloads in both phases keep the clock (`review219.mjs`, 20 checks)
- [x] vitest 603, eslint, tsc, next build
