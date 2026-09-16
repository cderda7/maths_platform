# 350: The decision card confirms one stage, not the whole pathway

**What to build:** the teacher's decision card (ticket 335/337) shows only the next stage, not every stage with its description; moving questions out of group review gets a second, forward-looking confirm step before it commits; two pathway shapes that skip a review stage say so plainly.

**Blocked by:** 335, 336, 337.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-16, looking at ticket 335's card: "this needs to be fixed. so overwhelming. just want teacher to confirm the NEXT stage — not the whole thing. if they need to see the sequence of stages, they have the reference in the top right corner. let's talk about what they actually need to see with this pop up. also, make the pop up larger. also, don't need to say anything about the current stage — that's already a fixed decision, nothing they can do to change it. also need to surface thoughts about 'only 5/19 got QX right. move out of group review & save for class review'? it's VERY important we get this right — huge implications on teacher control & al that."

Worked through with `/grill-me` before any code changed (a full round of Q&A settling scope, wording and the two new pathway shapes). One correction mid-session: a draft confirm heading read "Added Q7, Q10 to class review" — Carson caught it as "deciding for the teacher, instead of aiding in deciding," which reshaped the confirm step from a frozen sentence into a still-live, forward-looking one.

Settled:

- **The passive card shows one line — the next stage's name and description — not the eyebrow + full `<ol>` of every stage.** The current stage is already decided; the full sequence lives in the top-right pathway strip.
- **Change (ticket 336) is untouched.** Full power, all not-yet-reached stages toggleable — the "show less" goal is about the default display only.
- **A pathway that skips a review stage says so as fact.** "Skip indiv review. Move straight to group review" / "Skip indiv review and group review. Move straight to class review" — never silent about a consequence of an earlier choice.
- **Card widens 400px → 480px**, sized for the split rows (the tightest content it ever holds).
- **Moving questions to class review gets a second stage: Back / Confirm move**, narrowed from Later/Change/Move, the tick list still live and interactive underneath a forward-looking heading. Nothing is decided until Confirm move is pressed.
- **The `emptyAfter` (every group ends up empty) variant keeps its pre-tick** but states the stage-skip as a mechanical fact while keeping the question selection open — never "added."
- **Two pathway shapes reuse ticket 337's existing evidence rather than new trigger code:** skip-individual-review (still carries the interactive split ask, off first-submission tallies) and skip-group-review (a non-binding pointer only, no tick UI at all).

Known gap, not fixed by this ticket (see `FUTURE_FEATURES.md`): the skip-group-review pointer only ever shows during the early "close to finishing working" moment; on a pathway where individual review runs and only group review is off, it is never re-raised once individual review is underway, so its counts can go stale. Building a true second trigger axis for that case was judged out of scope here.

## Acceptance

- [x] The close-to-finishing card's passive view shows exactly one line naming the next stage and its description; nothing about the current stage
- [x] Change still opens the full multi-stage toggle editor, unchanged
- [x] The card is 480px wide
- [x] A pathway without individual review states "Skip indiv review. Move straight to group review" and still carries the interactive split ask, sourced from first-submission tallies
- [x] A pathway without individual or group review states "Skip indiv review and group review. Move straight to class review" and carries only the non-binding pointer, no tick UI
- [x] Pressing "Move to class review"/"Skip to class review" opens a confirm step (Back / Confirm move only, Later and Change hidden) with the same tick list still live underneath a forward-looking heading naming every consequence (including adding class review to the pathway, when applicable)
- [x] Back returns to the ticked-rows view with ticks unchanged; Confirm move commits exactly as the old immediate press did
- [x] The `emptyAfter` heading never states the move as already done
- [x] `nextStageOnCard` (`lib/pathway.ts`) and `moveConfirmSentence` (`lib/splitReview.ts`) are pure and unit-tested
- [x] vitest, eslint, tsc, next build, check:laptop; a real production build driven headlessly across all three pathway shapes (normal, skip-individual, skip-both), screenshotted
- [x] Ticket docs: `architecture/350-next-stage-confirm.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

- **`lib/pathway.ts`.** `nextStageOnCard(pathway)` — pure: the stage after working, and whether individual review, or both individual and group review, are skipped to reach it.
- **`lib/splitReview.ts`.** `listWords` (moved here from the component) and `moveConfirmSentence(labels, emptyAfter, addsClassReview)` — the confirm heading's exact wording, pure and tested for all four combinations.
- **`app/teacher/DecisionCard.tsx`.** The passive pathway `<ol>` replaced by the next-stage line; `confirming` state (separate from `changing`) drives the Back/Confirm-move sub-state, gated to only hold while something is still ticked (`showConfirm = confirming && ticked.length > 0`); `SplitRows` takes `confirming`/`emptyAfter`/`addsClassReview` and swaps its heading via `moveConfirmSentence` while keeping the same tick rows; the `toClassReview` note reworded to the short non-binding pointer form.
