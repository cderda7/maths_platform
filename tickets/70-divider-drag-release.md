# 70: Split view: a divider drag lasts exactly as long as the button is held

**What to build:** On `/split` the arrowed handle between panes resizes the view only while the presenter is pressing on it. The moment the button is no longer held, whatever happened to the release, the view stops following the pointer, the resize cursor goes, and the size last shown is kept.

**Blocked by:** 35

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "the arrow to drag to expand a view is glitchy at times. i want the expansion / contraction to ONLY happen if i've clicked on that arrow & am starting to drag it. the second i'm not actively pressing my cursor, it should release & go back to standard cursor as arrow. rn it holds on for too long, & i'm done readjusting the view but it keeps readjusting it. idk happens like 50% of the time. ensure it never happens."

The handle listened only to itself: `pointerdown` took pointer capture, and `pointermove` / `pointerup` on the same element moved and ended the drag. Anything that kept the `pointerup` from reaching that one element left the drag armed with the resize cursor on, and from then on every pass of the pointer over the handle dragged it again (the handle then sits under the pointer, so it feels as if the view keeps readjusting). Reproduced three ways in headless Chrome: the button released where the page never hears it (over another window or app, so the next move arrives with no button held), the window losing focus mid-drag, and pointer capture lost with the release landing over an iframe.

## Solution

`lib/split.ts` gains `Drag` (the drag in progress, including the sizes last shown) and `dragStep(drag, pointer, shown)`, a pure step: another pointer is ignored; `pointerup` ends the drag at the release point; `pointercancel`, or **any move that arrives without the primary button held** (`buttons` bit 1 clear), ends it at the sizes last shown; otherwise it is a move to the sizes at the pointer.

`SplitView` now only starts the drag from the handle's `pointerdown`. From the press on it listens on the **window** (capture phase) for `pointermove`, `pointerup` and `pointercancel`, feeding each to `dragStep`, and ends the drag on the window's `blur` and on the tab going hidden. Pointer capture is still requested (it keeps the moves flowing over the iframes) but nothing depends on it. The listeners are removed the moment the drag ends, and on unmount. The handle no longer has move / up / cancel handlers.

## Acceptance

- [x] Nine ways of ending a drag (plain release, release over an iframe past the clamp, release outside the window, lost mouseup with later button-up moves, window blur, double-click, right button mid-drag, an instant far move and release, capture lost with the release over an iframe) all leave the view not dragging, the cursor `auto`, and further moves change nothing; the last three failed before the change
- [x] A column, row and side-by-side drag still follows live, stores on release, and the handle sits where it was dropped; a lost release keeps the size last shown; double-click still resets; a click lands in an iframe afterwards
- [x] `dragStep` unit tests (35 in `lib/split.test.ts`); eslint, tsc, vitest (305), `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
