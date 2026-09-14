# 255: The program raises each lesson decision when it is due, with its evidence

**What to build:** During a lesson the teacher never has to remember which of the product's controls to use when. At each moment a decision is due, the live teacher view raises it with the evidence beside it and the teacher's choices; the teacher decides.

**Blocked by:** 250, 254.

**Status:** open

**Triage:** `needs-grilling` (the moments and rules below are agreed; where the prompt lives on the live view, how it looks, and whether it can be dismissed are not)

---

## Problem Statement

The CTO's feedback on the demo (2026-09-14): "I have to really think and hear your explanation to get the UI"; "the flows are very divergent, and there's a lot of permutations". The user's reading: "it's more about making it so that the teacher doesn't have to juggle these 20 competing things & it's more natural / program guides through it", while keeping teacher judgement as the product's strength, not moving decisions to defaults.

Proposed and accepted ("i love this"): the program raises each decision when it is due. The user's addition: deciding on class review as group review ends leaves no time to pick problems and examples, so that prompt comes halfway through the stage before it.

## The moments (agreed)

1. **Start of the lesson:** who is absent → mark them (ticket 250), groups adjust.
2. **Working:** a student is stuck → push a diagnostic, or not.
3. **Time nearly up:** hand in for everyone, or not.
4. **End of individual review:** go on to group review, or add class review? (ticket 254 makes the change possible)
5. **Halfway through the stage before class review** (half the present class has finished it): if class review is off, "add class review?"; if on, pick the problems and examples now, privately, while the class keeps working.

## Open for grilling

- Where the prompt sits on the live view (a rail, a card over the grid, the header) and whether several can be due at once.
- What "stuck" and "time nearly up" mean in the demo (no timer exists; the lesson is assumed 70 minutes).
- Whether a prompt the teacher ignores stays, fades, or comes back.

## Acceptance

Written after grilling.
