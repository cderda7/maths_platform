# 246: The review pathway is one line of stops the teacher switches on, and Create waits for the choice

**What to build:** On Create's pathway step, the branching review-pathway map becomes one line: individual working → individual review → group review → class review → done, five equal columns, each review stop switched on or off in place with its description always under it. A "No review, working only" choice sits under the line. Nothing starts chosen, and Create waits until the teacher switches a stop on or picks No review; a press on the waiting Create scrolls to the pathway card and rings it once.

**Blocked by:** 239.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), with a screenshot of the map after ticket 239: "sth's off about the pathway page. like the default is 'indiv working' -> teacher choose next step, but it's not clear that the teacher needs to like select a pathway. & then it's not clear it's a sequence & not a branching idea." The map offered the three stages as three branches out of individual working, so it read as "pick one", and an unpicked map looked exactly like a finished one while Create stood on.

Grilled to a shared design the same day (every recommendation taken):

1. The order stays fixed (individual → group → class); the teacher only switches stages on or off.
2. The control is one line of stops, every stage always in its place.
3. Nothing starts chosen; Create waits until the teacher switches a stop on or picks "No review, working only" ("FANTASTIC").
4. "continue tomorrow (soon)" leaves this screen (future features).
5. Each stop's description shows under it all the time (greyed when off), not on hover.
6. "No review" is its own worded choice under the line: picking it lights the straight line; switching any stop on clears it; pressing it again un-picks it.
7. Three looks: undecided (stops plainly outlined, pale line, done grey); decided (on = accent fill with ✓, off = dashed and faded, the ink line runs on past it to done); no review (all three dashed, ink line working → done).
8. An on stop looks like a switched-on New skills chip (accent, ✓), so the step's two toggle controls read the same.
9. The waiting Create looks off but takes the press: a grey line beside it says "Choose a review pathway first", and a press scrolls to the pathway card and sends one ring out from it.
10. The "individual working → done" sentence under the map goes.
11. Five equal columns; a description wraps within its column.
12. The choice (undecided, no review, or the stages) lives in the review state, so Back and a reload keep it. The demo with no created set keeps individual → group; `/student?pathway=` is untouched.

## Solution

- `lib/pathway.ts`: drop `successors`, `mapColumns`, `pathwaySentence` and `NEW_SET_PATHWAY` (the map was their only user). Add `togglePathway(p, stage)`: the stage switched on or off, the result kept in `REVIEW_ORDER`; switching the last stop off returns `null` (undecided), since No review is only ever picked by its own button.
- `lib/review.ts`: `ReviewState.pathway` becomes `Pathway | null`, `null` meaning undecided; a new set starts on `null`, and `reviewFor` keeps a stored choice (including `[]`) across a new draft.
- `app/teacher/assignments/PathwayMap.tsx`: rewritten as the line. A five-column grid; a line track behind the pills through their centres, pale while undecided and ink once decided; working and done are fixed ends in ink (done grey while undecided); each stop a toggle (`aria-pressed`) with its description under it; the No review toggle under the line.
- `PathwayStep.tsx`: the card gets a one-line instruction like New skills' card; while the pathway is `null` Create is `aria-disabled` at 40% opacity with "Choose a review pathway first" beside Back, and a press scrolls the card into view and replays a one-shot ring (`.ring-once`, the hint ring's keyframes, no delay). Confirm groups still follows group review.
- `ReviewAssignment.tsx`: `create` refuses a `null` pathway.

## Acceptance

- [x] Unit: `togglePathway` keeps the order, toggles each stage, and returns `null` when the last stop goes off (`lib/pathway.test.ts`); a new set's review starts undecided and a stored choice (`[]` included) survives a new draft (`lib/review.test.ts`)
- [x] Click-through `click246.mjs` (142 checks) at 1280×800 and 1440×900: the step opens undecided (three plain stops, pale line, done grey, no ✓, Create at 40% with the grey line, no Confirm groups); each stop's description under it, inside its column, clear of its neighbours; a press on the waiting Create scrolls the card into view and rings it once, and creates nothing; switching stops on and off gives the accent ✓ / dashed looks, the ink line, Create on; switching the last one off goes back to undecided; No review lights the line with every stop dashed, a stop press clears it, a second press un-picks it; group review on shows Confirm groups; Back and forward keep the choice, and so does a reload; Create with individual → class makes a set on that pathway; nothing on the map moves or resizes between states; no sideways scroll
- [x] vitest 768 (after rebasing onto ticket 240), eslint, tsc, next build, check:laptop 62
