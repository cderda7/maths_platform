# 220: A read before group review: why the group works together, then the board opens on its own

**What to build:** Before the shared whiteboard opens, every student reads a short screen: "Group review", two paragraphs on working as a team (every problem ahead had a mistake from at least one of you; discuss approaches; explain graciously; advocate for yourself before the group submits), and the group's problems as the start screen's tiles. Nothing on it says who got what wrong, not even the student's own mistakes. There is no button: a bar drains over a read time worked out from the words, and the board opens by itself for every group at once, so the race stays fair. It shows on every route into group review, including the teacher ending individual review.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "we need to add a screen before going into group review to explain the motivation. the union of mistakes idea." Agreed in conversation:

- No per-member rows and no drawn union: showing which problems each student got wrong would let students work out which ones they had right and copy instead of discussing. No "9 mistakes between you" count either.
- The message is the user's, word for word, with "&" written as "and". Heading "Group review". A tile per problem on the group's list.
- A forced read: work out how long the message takes to read and move on automatically, else the gamification (the race) is messed up.
- After the teacher's forced end of individual review, still show the intro.

## Solution

- `lib/groupIntro.ts`: the paragraphs; `readMs` (words at 130 wpm plus a 4 s look, to the next second) gives `GROUP_INTRO_MS` = 39 s for the 75 words; `boardOpensAt` / `boardOpensFor` (counted from when the class went in, never later than now); `introShowing`, `introProgress`; `tileColumns` (one row up to five, then two even rows).
- The run's `startedAt` is the board's opening, not the begin: `StudentApp` begins the run with `at: boardOpensFor(readiness.startedAt, now)`. Every clock that already ran from `startedAt` / `turnStartedAt` (peers' scripted turns, the standings race) waits for the read with no change of its own.
- `lib/readiness.ts`: `startedAt`, the moment the class went in (the last hand-in, or the end of the teacher's grace, whichever first).
- `app/student/screens/GroupIntro.tsx`: the screen; `GroupBoardScreen` shows it while `introShowing`. The bar is a CSS animation with a negative delay set once on mount (after the clock's first tick), so a reload lands where the clock is; the corner reads the time left.
- `StudentApp`: the forced hand-in's "N of your problems still contain a mistake" notice waits for the board, as it would name the student's own mistakes on the intro and sat over the timer.
- `lib/demo.ts`: the "group review" jump lands on the intro.

## Acceptance

- [x] Jump: heading, both paragraphs word for word with "and", six tiles in two rows of three, no clipping, no button, no marks, names or race bar, timer clear of the skip strip and never over 0:39 (`intro220.mjs`)
- [x] 12 s in nothing is written on the board; the bar has drained; a reload keeps the clock and the bar; at 39 s the board opens on Q1 with Sam's pen
- [x] Through the class gate: the board opens 39 s after the last classmate hands in
- [x] Teacher ends individual review: intro shows, opens 39 s after the grace ends, no mistake notice during the read, the notice once the board opens; teacher page renders (26 checks)
- [x] vitest 616 (`groupIntro.test.ts`, readiness, standings, demo), eslint, tsc, next build
