# 74: The concerns chat's rhythm: one bubble at a time, and a box that says whose turn it is

**What to build:** The tutor's opening arrives as two bubbles ("Let's do a warm up on factorising & zero-finding." then, after a second of typing dots, "First, tell me a little bit about your concerns with factorising."), not one. After each answer the student's bubble lands at once, a beat later the dots appear, and a second after that the next question. While the tutor is "writing" the box is plainly off: cream, no caret, "the tutor is writing…", send greyed. When the turn's last bubble has landed the box turns paper white, takes focus and gives one accent ring pulse (the same cue as the offer callout): your move. After the last answer a closing bubble, "Thanks. Let's start with factorising.", then the pad about a second later.

**Blocked by:** 48 (the chat), 72 (the pulse cue).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The opening was one long bubble, everything appeared at once, and the box was always open, so nothing told the student when to read and when to write.

## Solution

`concernTurns` replaces `concernPrompts`: each turn is a list of bubbles (the opening two, later questions one). `turnSteps(bubbles, opening)` is the pure playback: the steps of (bubbles shown, dots on) at their offsets, with the opening's first bubble at 0 and its dots straight after, and a beat before the dots otherwise. `closingLine(first)` names the skill the warm-up opens on. The screen plays the turn after the last answer with timers, shows answered turns in full at once, and derives "your turn" from the step reached. The reducer no longer jumps to the pad on the last answer: `warmup/say` is ignored once every question has its answer, and `warmup/begin` (sent by the screen after the closing bubble) opens the pad. The ring pulse moves to its own class, `pulse-once`, shared by the callout and the box.

## Acceptance

- [x] Opening: first bubble at once with the dots; second bubble one second later; the box off until then
- [x] One skill: "Let's do a warm up on factorising." / "Tell me a little bit about your concerns with factorising."; none: "Let's do a warm up." / "Tell me a little bit about what you'd like to warm up on."; later questions one bubble each
- [x] After send: student bubble at once, dots after a 400 ms beat, the next question a second later
- [x] Box off: cream fill, faint border, "the tutor is writing…", disabled, send greyed. Box on: paper, strong border, focus with the caret, "in your own words…", one accent ring pulse
- [x] After the last answer: dots, "Thanks. Let's start with {first skill}.", the pad 1.2 s later; the box stays off; a further answer is ignored
- [x] A reload replays only the current turn; answered turns show in full at once
- [x] vitest, eslint, tsc, `next build`, a timed headless-Chrome click-through; architecture note and root docs
