# 95: "I need help" is gone, not greyed, while the worked example plays

**What to build:** On the practice pad, while the worked example is playing, the "I need help" button under the problem was shown disabled. Remove it from the screen for that view instead; it comes back wherever the pad is live again (the follow-up, the next skill).

**Blocked by:** 90 (the worked example beside the chat).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the fractions warm-up's worked example and a greyed "I need help" under the problem: "instead of disabling hint in worked example view, just make it go away entirely".

## Solution

- `components/PracticePad.tsx`: the button's block renders only while `run.example` is false; the `disabled` prop goes with it. The help is already on screen during the example (the steps on the left, the "Question about a step?" chat on the right), so a greyed button promised nothing.

## Acceptance

- [x] Pad: "I need help" enabled. Worked example playing: no "I need help" in the column, nor once it is complete. "Next skill →": the button is back on the next problem's pad
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs, future features
