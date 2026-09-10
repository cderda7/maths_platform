# 64: Mistakes view: bigger red-filled slip pills, the question header opens and closes, and an expand / close / close-all button on hover

**What to build:** On `/teacher/mistakes` the slip pill's text is half as big again (17px) and the pill is filled light red. Clicking a question's header opens or closes its working, as a student tile does. Hovering a question shows an "expand" button beside the equation, the same button as the class view's row actions. Once a question is open the button reads "close" and stays put until pressed, even while the teacher opens other questions (several can be open at once). Pressing close collapses that question and the button reads "close all"; pressing that collapses every open question. "close all" goes back to the blank hover state when the pointer leaves the question's card.

**Blocked by:** 63

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the ticket-63 view: "make the mistake text (quadratic equations) 50 percent bigger. also, color in the pill with the light red. also, make it so that clicking in the question open/closes that view, as well. add an 'expand' button next to the question (same as in the teacher Class View page) when a teacher is hovering over that Q, & have it turn to close until teacher presses close — even when teacher opens another Q. after teacher presses close, collapse that Q & have the button turn to 'close all' — if the teacher clicks on it, all open Qs collapse. have 'close all' disappear (back to blank view) when the teacher's cursor leaves the Q box field."

## Solution

`SlipChip` (`components/Tag.tsx`) is now 17px on a `bg-wrong-soft` fill with slightly more padding. `TeacherMistakes` keeps the open questions as a list rather than a single id, plus an "armed" id: the question just closed by hand, whose button offers "close all" until the pointer leaves its card (`onMouseLeave` on the `Card`). The header `div` toggles its question on click; the tiles do the same. The action button sits after the equation in the header, styled like the class view's `STACK_IDLE` / `STACK_ACTIVE` buttons, and its click stops propagation so the header does not toggle a second time. Its word and visibility come from the state: open → "close", always visible; closed and armed with other questions still open → "close all", visible; otherwise "expand", visible only on the card's hover or focus-within. A mouse click blurs the button (keyboard activation keeps focus) so the focus-within rule does not hold "expand" on screen after the pointer leaves.

**Judgment call:** if the teacher closes the only open question, the button goes straight back to "expand" instead of a "close all" with nothing to close; "close all" appears only while at least one other question is still open.

## Acceptance

- [x] Slip pill text is 17px and the pill is filled light red with the dark red border kept
- [x] Clicking the question header (label or equation) opens the question's columns; clicking again closes them
- [x] Hovering a closed question shows "expand" beside the equation, styled like the class view's row buttons; it is hidden otherwise
- [x] An open question shows "close" at all times, including while other questions are opened; several questions can be open together
- [x] Pressing close collapses that question and leaves "close all" on it while the pointer stays; "close all" collapses every open question
- [x] Moving the pointer off the card returns its button to the hidden "expand"
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
