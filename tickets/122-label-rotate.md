# 122: A tap on a difficulty pill rotates it

**What to build:** On the review step's difficulty grid (ticket 120), tapping a question's difficulty pill moves it to the next label in the fixed order, simple familiar → simple unfamiliar → complex familiar → complex unfamiliar, and round again, instead of opening the four in a popover.

**Blocked by:** 120.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "actually change to tap to rotate for changing teh label -- simple familiar to simple unfamiliar to complex familiar to complex unf".

Ticket 120 had chosen a popover (a teacher wanting the fourth label from the first would otherwise click three times through two wrong states). The user prefers the single-tap rotation.

## Solution

- `lib/review.ts`: `nextDifficulty(d)`, the label after `d` in `DIFFICULTIES`, wrapping.
- `app/teacher/assignments/create/review/QuestionGrid.tsx`: the pill is a button whose click hands `onLabel` the next label; the listbox, the outside-press and Escape listeners are gone. The aria-label says "Tap for the next."
- `app/teacher/assignments/create/review/DifficultyStep.tsx`: the comment; the helper line "Tap a label to change it." still reads true.
- Tests: `lib/review.test.ts` (+1). Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] Four taps on Q2's pill read simple unfamiliar, complex familiar, complex unfamiliar, simple familiar; the counts strip follows; no menu opens
- [x] A tapped pill keeps its right edge and its line (only its width changes with the word); the arrival animation does not replay on a tap
- [x] The rest of the ticket 120 run unchanged (relabel kept across a reload, the assessment, the recommendations, the pathway, Create)
- [x] vitest (390), eslint, tsc, `next build`, headless run (`review.mjs`) with screenshots
