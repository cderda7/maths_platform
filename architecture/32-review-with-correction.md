# 32 · Individual review with correction on one screen

Route: `/student?stage=feedback` (the individual review). `?stage=rework` no longer exists.

## Files touched

| File | What it does |
|---|---|
| `app/student/screens/FeedbackScreen.tsx` | The review screen with the correction built in: header row (label · expression · stem · star), "What you submitted" (branch-split lines) with the guard banner and "Restore my original" beneath, "Correct it here" (`PadSection` → `rework/stroke`, bursts → `nextLine(RECOGNITION_REWORK)` → `rework/reveal`, undo/clear → `rework/undo`/`rework/clear`), "Read as" over the rework lines; the list marks a broken problem with a red dot; "Hand in" → `rework/done`, disabled while any problem is tripped, with the "Restore … first" note |
| `app/student/screens/ReworkScreen.tsx` | Deleted |
| `data/types.ts`, `app/student/page.tsx`, `lib/session.ts`, `app/student/StudentApp.tsx` | The `rework` stage removed from `Stage`, the deep-link list, `ORDER`, the fixture (`reworkedSession` is a feedback-stage session) and the crumbs |
| `lib/feedback.test.ts`, `lib/guard.test.ts`, `lib/session.test.ts` | Tests that stood at the rework stage stand at the feedback stage |

## How it connects

```
 hand-in ──▶ stage feedback (individual review)
   left:  detective sentence · problem list (★ · ● broken) · "Hand in" ──▶ rework/done ──▶ nextStage(pathway, "reworked")   (refused while trippedProblems ≠ ∅)
   right: [Q1  x² − 5x + 6 = 0 · stem · ★]
          [What you submitted: session.lines (branchesOf → two boxes)] [Correct it here: pad → session.reworkInk] [Read as: session.rework]
          guardFor(session, q).tripped ──▶ banner + "Restore my original" ──▶ rework/clear
 versions.ts · groups.ts · report.ts · teacher compare: read session.rework as before
```

## Verified by

vitest (171 tests). CDP click-through on `/student?stage=feedback`: no "Rework" anywhere, "Hand in"
enabled; on Q4 (correct originally) two bursts read the divide-by-a slip → the guard banner, a
"Restore Q4 first" note, "Hand in" disabled, a red dot on Q4's row → "Restore my original" clears
all three → "Hand in" moves the session to the group stage with the post-rework notice;
`?stage=rework` is not a stage and continues the stored run. `tsc --noEmit`, `eslint`, `next build`.
