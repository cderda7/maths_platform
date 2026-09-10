# 65: The Edexia bar stays put when the page scrolls, and the board gets one

**What to build:** The "Edexia · Maths" bar is a fixed header on the teacher's laptop and on the student's iPad: scrolling the page or a pane never moves it out of view. The smartboard, which had no brand bar at all, gets the same one across its top.

**Blocked by:** —

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with two screenshots of the mistakes view scrolled down and at the top: "have the Edexia maths tag be a header -- should persist even when i scroll down. ensure this is the default for BOTH the student & teacher view. also, add the Edexia header to the board view." On the teacher side the header was a normal block at the top of a page that scrolls the window, so it left with the first scroll. On the student side the bar already sits outside the screen's scrolling pane (the iPad frame does not scroll the window), so nothing moves it; that was checked, not assumed. The board's root had no brand bar.

## Solution

- **Teacher:** the header in `TeacherChrome` becomes `sticky top-0 z-30`. It already had the translucent paper background and blur, so content slides under it. Sticky works inside the wrapper's CSS `zoom: 0.8`.
- **Student:** no change. `StudentChrome` renders the status strip and the bar above a `flex-1 overflow-y-auto` pane; every stage's screen lives in that pane, so the bar is fixed by construction. Verified on all eleven stages.
- **Board:** `SmartBoard`'s root gains a `h-14 shrink-0` bar with the `Brand` wordmark, the same look as the laptop and iPad bars. The board's own per-stage headers (the class name and title in group review, the problem in whole-class review) stay beneath it, so nothing is repeated.

## Acceptance

- [x] `/teacher` and `/teacher/mistakes`: after scrolling the window, the header's top edge is still at 0 and the wordmark is under the pointer at its position
- [x] Every student stage (`?stage=start` … `history`): scrolling every scrollable pane and the window leaves the header where it was
- [x] `/board` shows the Edexia bar at the top in its default state
- [x] eslint, tsc, vitest, `next build` pass
- [x] Architecture note and `ARCHITECTURE.md` row
