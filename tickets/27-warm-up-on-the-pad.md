# 27: Warm-up on the pad, confidence first, multimodal help

**What to build:** Move the confidence survey ahead of the warm-up. Replace the warm-up's reveal-a-step card with the working screen's own layout (problem, pad, "Read as") so the student works the warm-up problem exactly as they will work the set. "I need help" on the warm-up opens a three-way choice: a hint, a worked example, or a video (a dead link for now). The worked example plays step by step in place of the pad for the current problem; once it is complete the student gets a fresh follow-up problem in a split pane with the finished example still in view.

**Blocked by:** 02 (practice offer and confidence), 03 (drawpad), 26 (leaf-tagged practices).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The warm-up today is a reading exercise: the student taps "Next step" and watches a solution unfold. It never asks them to write, so it does not rehearse the thing the set is about to demand (working on the pad, lines being read back), and it forces one kind of help on everyone, the full worked solution, whether they wanted a nudge or the whole thing. The confidence question also comes after the warm-up, so a student who is unsure has already been through the warm-up before anyone asks how they feel.

## Solution

Overview offers the warm-up as before. Whichever the student picks, the confidence survey comes next; its button then reads "Warm up" or "Start Q1" according to that earlier choice. The warm-up is the working screen with one problem: stem and expression on the left, the pad in the middle, "Read as" on the right, "On to the set" always available. Nothing on it is marked or counted.

"I need help" opens a menu of three: **A hint** (one sentence that stays under the problem), **A worked example** (the problem's solution revealed one step at a time where the pad was, then "Try one more"), **A video** (listed, not yet available). After the worked example the student gets a follow-up problem on the same skill. The finished example moves to the left pane and stays there while they work the new problem on a clean pad. Help is available again on the follow-up.

## User Stories

1. As a student, I want to be asked how confident I am before any warm-up, so that the question is about how I feel, not about how the warm-up went.
2. As a student, I want the warm-up to look and behave like the set (pad, lines read back), so that the first time I write on the pad is not on a marked problem.
3. As a student, I want "On to the set" available throughout the warm-up, so that I am never trapped in it.
4. As a student, I want "I need help" on the warm-up to offer a hint, a worked example or a video, so that I can pick the amount of help I want.
5. As a student, I want a hint to be one sentence that stays visible under the problem, so that I can keep writing with it in view.
6. As a student, I want the worked example to be for the problem I am on, revealed one step at a time, so that I can try to predict each step before I see it.
7. As a student, I want a fresh problem after the worked example, with the example still beside me, so that I can apply the pattern straight away without holding it in my head.
8. As a student, I want help available on the follow-up too, so that a second stumble is not a dead end.
9. As a student, I want nothing I write in the warm-up to be marked or to count toward the set, so that the warm-up stays a warm-up.
10. As a student, I want a reload or a teacher tab to show the warm-up where I left it, so that the warm-up behaves like every other stage.
11. As a teacher, I want the live view to keep treating the warm-up as "before hand-in", so that nothing about the grid changes.

## Acceptance

- [x] Overview → confidence → warm-up (if chosen) → working; the confidence button names what comes next
- [x] Warm-up uses the three-pane working layout with a simulated-recognition script for the warm-up problem and its follow-up
- [x] Warm-up lines and ink live in their own session slice, never in the marked `lines`/`ink`
- [x] Help menu: hint (persistent, under the problem), worked example (in place of the pad), video (dead link, labelled)
- [x] Worked example complete → follow-up problem in a split pane with the example on the left
- [x] Deep link `/student?stage=practice` lands on the warm-up with confidence filled in
- [x] vitest for the flow and the warm-up reducer; tsc, eslint, build clean; CDP click-through
- [x] Architecture note written and folded into `ARCHITECTURE.md`; deferred ideas in `FUTURE_FEATURES.md`
