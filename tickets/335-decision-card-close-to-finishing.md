# 335: "Most students are close to finishing": the teacher is asked what's next, wherever they are

**What to build:** when more than half the present class has submitted the question 70% of the way through the set, the teacher gets a card wherever they are (Class View, Mistakes or Edexia Classroom): "Most students are close to finishing. Let's discuss what's next." It shows the planned pathway, with Keep and Later. Later tucks the card into a dot on the pathway strip's current pill, or on the live set's card on the Classroom. Pressing the dot reopens the card. Nothing blocks the screen, and ignoring the card keeps the plan.

**Blocked by:** 334 (the strip the card tucks into).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Review-control grilling with Carson, 2026-09-15. It replaces ticket 254 and the parts of ticket 255 below, now deleted.

- **Why.** The CTO's feedback on the demo (2026-09-14): "I have to really think and hear your explanation to get the UI"; "the flows are very divergent, and there's a lot of permutations". Carson's reading: the program guides the teacher through each decision when it is due, and the teacher still decides (the teacher-judgement rule).
- **Carson:** "i want a set up where they get a pop up no matter where they are telling them like '1/2 of students have finished the current stage. what would you like the class to do next?' & like confirm they want to keep their pathway, or change it."

Agreed:

- **The task.** The card confirms or adjusts the plan while students keep working. Moving the class on stays a separate, deliberate action: force submit on the strip (ticket 334).
- **The trigger.** More than half of the present students (Sam included, absent students out) have submitted the question 70% of the way through the set, rounded up: Q7 of 10, Q5 of 6. One threshold for now.
- **The words.** "Most students are close to finishing. Let's discuss what's next."
- **How loud.** The card slides in once from a corner, never covers the strip, an open diagnostic flyout or the teacher's current overlay, and never blocks a press elsewhere. Later tucks it away as a dot on the strip's current pill; on the Classroom, the dot sits on the live set's card, and pressing it opens that set's Mistakes tab with the card open. The decision is never lost and never raised twice.
- **Keep.** Records the decision; the card and dot go away.
- **Ignored.** If the stage ends while the card is unanswered (force submit, everyone handing in), the plan runs as it was; force submit never asks again.
- **One card at a time, always about the next decision.** Ticket 337's card replaces this one when it comes due, carrying any unanswered pathway choice.
- Change (switching stages the class hasn't reached) is ticket 336. Until it lands, the card offers Keep and Later only.

## Solution

- **A lesson decision in classroom state.** Which decision is due, when it came due, whether it is open, tucked or answered. It is derived from the class's progress and the teacher's answers, so every teacher screen and a reload agree.
- **One card component, mounted once in the teacher chrome** so it follows the teacher across Class View, Mistakes and the Classroom. It shows:
  - the headline
  - the evidence ("n of m here have submitted Q7")
  - the pathway through ticket 334's pills, with what happens after each stage
  - Keep and Later
- **The dot.** On the strip's current pill and on the live set's Classroom card while a decision is tucked. Pressing it reopens the card.
- **Demo timing.** Verify the demo's stream reaches the trigger before Sam's own hand-in ends the stream on the normal presenter path, and that SKIP TO targets land with the right card state.

## Acceptance

- [x] Unit: the trigger at the 70% question for sets of 6, 10 and 12, over the present class, just under and just over half; the decision's open / tucked / answered states; a reload keeps them; a stage ending with the card open leaves the pathway unchanged
- [x] Click-through against a production build at 1280×800 and 1440×900 with Sam's iPad and the teacher tab:
  - **Where it appears:** the card slides in once on Class View, on Mistakes (the split, with a diagnostic flyout open too) and on the Classroom, and covers neither the strip nor the flyout
  - **Nothing blocked:** presses elsewhere still work
  - **Later:** tucks it into the dot on the strip, and on the Classroom's live card
  - **The dot:** reopens it, and from the Classroom lands on Mistakes with it open
  - **Keep:** clears it
  - **Unanswered at the end of the stage:** force submit runs without another question
  - **Nothing moves:** no card or row moves when the card appears or goes
  - **Layout:** no sideways scroll; screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop
- [x] Ticket docs: `architecture/335-decision-card.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
