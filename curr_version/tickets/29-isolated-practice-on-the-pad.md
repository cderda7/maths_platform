# 29: Mid-set isolated practice on the pad

**What to build:** The mid-set isolated practice (the "Two minutes on monic?" overlay that the escalation counter or "I need help" opens) works exactly like the warm-up: the student works the problem on the pad with lines read back, "I need help" offers hint / worked example / video, the worked example plays where the pad was, and a follow-up opens beside the finished example. The default is working through the problem, not being shown the solution.

**Blocked by:** 27 (warm-up on the pad), 28 (skill sequence and help menu), 04 (escalation and the practice prompt).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Mid-set practice today is the old warm-up: a card whose steps are revealed with "Next step". The student reads; they never write. It is the one place in the set where a stuck student is handed the solution rather than asked to try with a hint in reach.

## Solution

One `PracticePad` component renders the three-pane practice (problem · pad · Read as, with the help menu and the worked-example pane) for either run: the warm-up sequence or the mid-set overlay. Each run has its own `PracticeRun` slice in the session (lines, ink, hint and example state, follow-up), so a reload or the teacher tab sees the practice where it is, and nothing written in it is marked. The overlay's header names the skill; its button returns to the problem the student was on.

## User Stories

1. As a student, I want the mid-set practice to be a pad, so that I try the move myself before anyone shows me.
2. As a student, I want the same "I need help" choices there as in the warm-up, so that help feels the same everywhere.
3. As a student, I want the worked example to be for the practice problem I am on, one step at a time, and a fresh one to try afterwards with the example in view.
4. As a student, I want "Back to Q2" available throughout, so that the practice never traps me.
5. As a student, I want nothing I write in the practice to be marked, so that it stays practice.

## Acceptance

- [x] `PracticeRun` slice; the warm-up's run state and a new `overlayRun`; `run/*` actions keyed by run
- [x] `components/PracticePad.tsx` shared by the warm-up and the overlay; the help menu lives there
- [x] The overlay is the pad with the skill as its header and "Back to Qn" as its button; the worked example's closing button is the same
- [x] Accepting a prompt starts a fresh overlay run; finishing clears the overlay
- [x] vitest for the run slice and the overlay; tsc, eslint, build clean; CDP click-through
- [x] Architecture note, `ARCHITECTURE.md`
