# 349: The worked example never hides the student's own pad

**What to build:** on the Example step, the question moves out of the left column to the top of the middle column, above the worked-example steps. On Your turn (and its stage-3 sibling), "see the example again" no longer swaps the drawpad out from under the student — the worked example plays in the left column instead, sized to fit without a scroll, so the pair (example, own working) is on screen together. The worked-example card's own skill pill ("fractions") goes; it duplicates the left column's tags and crowds the box.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-16, on screenshots of the warm-up's "Example" and "Your turn" steps:

- "move the question out of the 'example' leftmost column & instead move it to the top of the middle column."
- "when a student on stage 2 your turn clicks on 'see worked example', have that go in the left column (fit to size — without need to scroll) & let them continue with drawpad. worked example - problem pair loses its effect if you can't actually see both at once."
- "remove the fractions tab from the worked example — unnecessary & takes up too much space."

Today (`app/student/screens/PracticeSteps.tsx`):
- `WorkedStep` (the Example step) puts the stem + expression in the 300px left `<aside>`, under the step head; the middle column is only the `WORKED EXAMPLE` card.
- `CompletionStep` (Your turn)'s "see the example again" (`HelpMenu` → `peek`) swaps the whole middle column for `ExamplePeek`, which hides the drawpad entirely until "Back to your turn" — the exact complaint: the student can't see their own attempt and the worked example at once.
- `PracticePad`'s stage-3 "On your own" offers the same "see the example again" (`exampleAgain`), with the same full-column swap and the same flaw.
- `PracticeCard` (the shared "worked example" box used by all three) puts a `LeafChip` (the skill pill, e.g. "fractions") at its top right, duplicating the sequence chips already in the left column on every step.

## Solution

- `WorkedStep`: left `<aside>` keeps only the step head (eyebrow, step line, title, sequence chips); the stem, expression and figure move to the top of the middle column, above the `Worked example` eyebrow and the `PracticeCard`.
- `ExamplePeek`: redesigned to fit a 300px column, `compact`, wrapped in `FitHeight` (ticket 277's existing no-scroll fit) so the full example plus its own stem/steps zooms to fit whatever height is left under the step head, no scrollbar. "Back to your turn" stays pinned below it, un-zoomed.
- `CompletionStep`: `peek` now swaps only the *left column's* lower content (question, hint cards, "I need help") for `ExamplePeek`; the head above it and the pad in the middle are unaffected by `peek`, so the drawpad and the working column keep going while the example is up.
- `PracticePad`'s `exampleAgain` peek gets the identical treatment for the same reason (it is the same shared `ExamplePeek`, and leaving stage 3 with the old hide-the-pad behaviour while stage 2 gets the fix would leave the two "see the example again" entries on the same warm-up contradicting each other) — moved to the left column, `PadSection` stays in the middle unconditionally when not `peek`.
- `PracticeCard`: drop the top-right `LeafChip` (and the row that held it) entirely; `question && <>stem, expression</>` renders alone at the top of the card.

This is the same shared component tree behind "help on a set question" (`HelpLadder.tsx`, ticket 312/313), so the fix lands there too with no extra work.

## Acceptance

- [x] Example step: left column shows only the step head and sequence chips; the stem + expression (+ figure, where the practice problem has one) sit at the top of the middle column, above the worked-example card; the chat column is unchanged.
- [x] Your turn: "I need help" → "see the example again" shows the worked example in the left column, fit to its height with no scroll at 1280×800 and 1440×900; the drawpad in the middle keeps drawing, the working column keeps marking lines, while the example is up; "Back to your turn" returns the left column to the question/hints/help button.
- [x] On your own (stage 3): the same "see the example again" fix, verified the same way.
- [x] Help-on-a-question overlay (`HelpLadder`) gets the same behaviour on its Example and Your turn steps (shared components; spot-checked on Q1 — `data-overlay` opens on the example step with the question over the card and no pill, and its completion step's peek renders in the left aside with the pad still up).
- [x] No `PracticeCard` anywhere shows a skill pill; every other place `LeafChip` is used stand-alone (`FeedbackScreen.tsx`, `HelpLadder.tsx`'s own head, `PracticePad.tsx`'s "second" stem, `ProblemCard.tsx`) is untouched (grepped, unchanged).
- [x] vitest 2269, eslint, tsc, next build, check:laptop 76/76
- [x] Click-through against a production build at 1280×800 and 1440×900: Example step's layout, Your turn's peek (drawpad visibly still usable, no scrollbar on the peeked example, back button works), stage 3's peek, the help-on-a-question overlay's Example/Your turn; no clipped or wrapped maths; screenshots checked
- [x] Ticket docs: `architecture/349-see-both-at-once.md`, ARCHITECTURE, DECISION_LOG (the stage-3 mirroring judgment call), README
