# 144: The live diagnostic flyout collapses when the pointer leaves it, keeping the teacher's draft

**What to build:** On the mistake view, an open live diagnostic flyout collapses the moment the pointer moves out of it (the panel or the chip's own footprint). Anything the teacher had been doing in it (the tab they were on, a question of their own with its options and the right answer marked) is still there when the chip is clicked again.

**Blocked by:** 132, 137.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "make it so that once i move out of the live diagnostic being opened bubble, it collapses. if the teacher's been updating information, that info gets saved -- but still collapse."

## Solution

- `app/teacher/DiagnosticPush.tsx`: `onMouseLeave` on the component's wrapper sets `open` to false. The flyout is rendered inside that wrapper (absolutely positioned, but a DOM descendant), so one handler covers the chip's footprint and the whole panel, and moving from the chip into the panel never fires it. The draft (`tab`, `stem`, `tex`, `options`, `correct`) already lives in the component's state rather than the flyout's, and the component stays mounted when the flyout closes, so nothing else was needed for it to survive: closing and reopening shows the same tab and text.
- `README.md` follows.

## Acceptance

- [x] A real pointer click on Q1's chip opens the flyout; moving within the panel (middle, bottom right corner, onto an input after typing) keeps it open
- [x] Moving out to the left, below, to the right, or straight up off the chip collapses it; the chip is back in its place and the row measures the same
- [x] Reopening shows the "make your own" tab with the typed stem, option B's text and B marked correct
- [x] Q2's flyout opens and collapses on its own
- [x] vitest, eslint, tsc, `next build`, headless click-through (`collapse144.mjs`) with real mouse events
