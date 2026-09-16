# 337: "Only 5/19 students got Q10 correct": the teacher moves questions from group review to class review

**What to build:** as individual review is about to end, the decision card suggests the two questions the fewest present students have right, one press to accept: "Only n/19 students got Qx correct. Remove from group review & save for class review?" The teacher can tick other questions instead. Accepting removes those questions from every group's list and puts them in class review, locked in on the setup page, and adds class review to the pathway if it wasn't planned. The card then offers "Set up class review →".

**Blocked by:** 332 (the group lists this changes), 335 (the card), 336 (adding class review to the pathway).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Review-control grilling with Carson, 2026-09-15: "teacher may only want to have select questions be a part of [group review]. say for instance only 5 students got to Q10. teacher may want to set group review to Q1-Q9 … & save Q10 for class review … also we'd then need to make sure it's automatic that Q10 gets added to class review, don't want to have them make that decision twice … WE need to make the suggestion." The demo's numbers need not match the example: "just signal the 2 questions that the least amt of students got correct."

Agreed:

- **Trigger.** During individual review, once half or more of the present students have handed in their corrections. Same headline as ticket 335: "Most students are close to finishing. Let's discuss what's next."
- **Count.** "Correct" counts corrections (a question right after individual review is right).
- **Suggestion.** The 2 questions with the fewest present students right are pre-ticked, so accepting is one press.
- **Also offered.** Every other question with fewer than half the present students right, listed unticked under "also often wrong". The rest sit behind "all questions". Every row shows the whole question (stem and expression, figure as a thumbnail; the whole-question rule) and "n/19 correct".
- **Every question is in exactly one of group review and class review.** A question moved out of group review is never dropped.
- **Accepting:**
  - the moved questions leave every group's list (after ticket 332's rule), so a group can end up with nothing and sit out
  - if every group ends up empty, the card says group review would have nothing to do and offers to skip to class review
  - if class review isn't on the pathway, accepting adds it, and the card says so plainly ("adds class review after group review")
- **Class review setup.** A moved question is pre-ticked and cannot be unticked, marked "from group review", beside the usual top-3 pre-ticks. The card ends with an optional "Set up class review →" that opens the setup page. The setup itself (examples) stays on that page.
- **Pathway variants:**
  - no individual review: this split joins ticket 335's card, with counts worded "so far"
  - no group review: this card doesn't come; ticket 335's card says plainly that these questions go to class review
- **One card at a time.** This card replaces ticket 335's if that one is still unanswered, carrying "your pathway: … · change" inside it.
- **Ignored.** Group review runs on every question, as planned. The gate into group review never waits on the card (ticket 332 stretches the demo's arrivals so the card has about a minute).

## Solution

- A pure function for the suggestion (correct after individual review per question over the present class, the two lowest, the "also often wrong" list) and a decision value holding the questions moved to class review.
- The group lists, standings, race and progress card read the moved questions through ticket 332's union rule, so nothing counts a moved question.
- Class review setup reads the moved questions as locked pre-ticks.
- The 318/319 grid shows a moved question as a grey "class review" row (that session's design); expose the moved questions for it.

## Acceptance

- [x] Unit: the suggestion on the demo's data and on made-up classes (ties, fewer than two questions below half, everyone right); the union without moved questions; a group left empty sits out; every group empty; class review added to a pathway without it; locked pre-ticks; the pathway variants; this card replacing ticket 335's
- [x] Click-through against a production build at 1280×800 and 1440×900 with Sam's iPad and the teacher tab:
  - the card comes when half the class has handed in corrections, with two questions pre-ticked and their whole questions and counts
  - accept in one press, then Sam's group board skips the moved questions and the progress card's fractions follow
  - "Set up class review →" shows them ticked and locked
  - the same on a pathway without class review, which gets added on both strips
  - tick a different question instead
  - Later and the dot
  - ignore it and group review runs as planned
  - no row moves, no sideways scroll, KaTeX on one line, no difficulty tag; screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop
- [x] Ticket docs: `architecture/337.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
