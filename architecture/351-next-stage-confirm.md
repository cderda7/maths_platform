# 351: The decision card confirms one stage, not the whole pathway

Ticket 335's card showed every stage of the pathway, each with its own description, including the current one — a
fixed decision the teacher has no lever on. Carson: "so overwhelming. just want teacher to confirm the NEXT stage."
The card now shows one line for the next stage; the full sequence stays where it already lived, the top-right pathway
strip. Ticket 337's move-to-class-review press used to commit immediately; it now opens a second, narrower confirm
step first, with the same tick list still live underneath a heading that never states the move as already decided.
Two pathway shapes that skip a review stage (individual review off; both individual and group review off) now say so
in words, reusing evidence ticket 337 already computed rather than adding a new trigger.

```
lib/pathway.ts                          lib/splitReview.ts
┌───────────────────────────┐           ┌──────────────────────────────────────────┐
│ nextStageOnCard(pathway)   │           │ splitOnCard(c) / toClassReview(c)         │  ← ticket 337, unchanged
│  → { stage,                │           │   (which pathway shape is this)           │
│      skipIndividual,       │           │ splitEvidence(c, set, session, now)       │  ← ticket 337, unchanged
│      skipBoth }            │           │   talliesSoFar / talliesAfterCorrections  │
│  pure · lib/pathway.test.ts│           │                                            │
└──────────────┬─────────────┘           │ listWords(labels)                         │
               │                         │ moveConfirmSentence(labels, emptyAfter,   │
               │                         │                     addsClassReview)      │
               │                         │  pure · lib/splitReview.test.ts           │
               │                         └──────────────────┬─────────────────────────┘
               │                                             │
               ▼                                             ▼
                    app/teacher/DecisionCard.tsx
                    ┌────────────────────────────────────────────────────────────────┐
                    │ next = nextStageOnCard(shown)                                    │
                    │  not changing:                                                   │
                    │   next.skipBoth?       "Skip indiv review and group review..."   │
                    │   next.skipIndividual? "Skip indiv review. Move straight to..."  │
                    │   else                 "Next: <stage> — <description>."          │
                    │                                                                   │
                    │  [confirming] state (separate from [changing]):                  │
                    │   showConfirm = confirming && ticked.length > 0                  │
                    │   "Move to class review" press → setConfirming(true), no commit  │
                    │   showConfirm: Later + Change hidden, row → Back / Confirm move  │
                    │     Back  → setConfirming(false), ticks untouched                │
                    │     Confirm move → answer(shown, ticked)   (the old immediate    │
                    │                                             commit, deferred)    │
                    │                                                                   │
                    │  <SplitRows confirming ticked emptyAfter addsClassReview>         │
                    │    heading: confirming ? moveConfirmSentence(...)                 │
                    │                        : the original pre-tick ask sentence       │
                    │    rows: unchanged, still onToggle-live in both states            │
                    └────────────────────────────────────────────────────────────────┘
```

Files:

- `lib/pathway.ts` — `nextStageOnCard(pathway)`: the stage after working and whether the pathway skips over
  individual review, or both individual and group review, to reach it. Pure, so the skip/no-skip wording is a unit
  test rather than a screenshot; this repo has no component-test harness (`vitest.config.ts` includes only
  `**/*.test.ts`), so every piece of consequential wording had to be pulled into a pure function to be testable at all.
- `lib/splitReview.ts` — `listWords` (moved here from the card component, since the confirm sentence needed it too)
  and `moveConfirmSentence(labels, emptyAfter, addsClassReview)`: the exact confirm-heading text for all four
  combinations (normal / emptyAfter × does / doesn't add class review). Nothing here changed about *when* a move is
  due or what it does — `splitOnCard`, `toClassReview`, `splitEvidence`, `everyGroupEmpty`, `moveAnswer` are all
  ticket 337's, untouched.
- `app/teacher/DecisionCard.tsx` — the passive `<Eyebrow>Your pathway</Eyebrow>` + full `<ol>` replaced by the single
  next-stage line; a new `confirming` boolean (independent of `changing`) drives the Back/Confirm-move sub-state;
  `SplitRows` gained `confirming`/`emptyAfter`/`addsClassReview` props so the same rows render under either heading;
  the `toClassReview` note reworded from a fraction-laden sentence to the short "worth covering in class review"
  pointer, and now only renders when there is something to point at. Card width `w-[400px]` → `w-[480px]`. `Change`
  (ticket 336) and the `split-review` card kind's own condensed one-line pathway summary are untouched.

Not built, recorded in `FUTURE_FEATURES.md`: a genuinely later trigger for skip-group-review (right when individual
review ends, rather than the early "close to finishing working" moment it currently rides on) — the close-to-finishing
card lapses the instant the class leaves "working," so on a pathway with individual review on and group review off,
the pointer is only ever shown early and can go stale by the time individual review is actually wrapping up.
