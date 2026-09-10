# 04 · Scripted evaluation, subskill escalation, isolated practice prompt, "I need help"

Route: `/student?stage=working`. The prompt, the practice overlay and the help picker all render
over the working screen inside the iPad frame.

## Files touched

| File | What it does |
|---|---|
| `data/evaluation.ts` | `EVALUATION[problemId][tex]` → `LineVerdict` (ok / wrong, subskill, label, `builtOn` for lines that are right given a wrong line above, `clue` and `note` for wrong lines). Covers the scripted run, the model solutions and the rework path |
| `data/practice.ts` | `PRACTICES`: one isolated practice problem per prerequisite subskill; `PRACTICE` is the pre-set warm-up (factorising). Moved out of `assignment.ts` |
| `lib/evaluate.ts` | `evaluateLine(problemId, tex)`; unknown lines are "unclear", never wrong |
| `lib/evaluate.test.ts` | Every recognisable line and every model step has a verdict; the scripted run's wrongs are exactly Q1 factorising, Q2 factorising, Q3 algebra |
| `lib/escalation.ts` | The subskill-instance counter: `recordMistake`, `requestHelp` (identical trigger path), `EscalationState { counts, entries, caution }` |
| `lib/escalation.test.ts` | 1st no-op; 2nd trigger + reset; repeat-2nd-after-reset cautions; caution raised once; help after a detected practice cautions; help alone doesn't; subskills independent |
| `lib/session.ts` | `line/reveal` now evaluates the line and feeds the counter (keyed by `problem#index` so undo + re-reveal counts once); `help/request`, `prompt/accept`, `prompt/decline`, `overlay/done`; `practices[]` log for the teacher side |
| `lib/session.test.ts` | Scripted run triggers on Q2 not Q1; undo doesn't double count; accept → overlay → done returns to the same problem; help after a detected practice raises caution |
| `components/PracticeCard.tsx` | The reveal-a-step practice card, shared by the warm-up, the prompt flow and help |
| `app/student/screens/PracticePrompt.tsx` | `PromptModal` (copy differs by reason: detected vs help), `PracticeOverlay` (the isolated practice, "Back to Qn"), `HelpPicker` (the problem's own prerequisites first) |
| `app/student/screens/WorkingScreen.tsx` | "I need help" button in the problem column; renders picker, prompt and overlay; "Finish the set" → feedback stage |
| `app/student/screens/PracticeScreen.tsx` | Now uses `PracticeCard` |
| `app/student/StudentApp.tsx` | Placeholder "Set handed in" screen for the feedback stage (ticket 06 replaces it) |

## How it connects

```
  pad burst ──▶ line/reveal ──▶ evaluateLine(problem, tex) ──▶ LineVerdict
                                     │ wrong & not yet counted
                                     ▼
                              recordMistake(escalation, subskill)
                                     │ 1st: count=1            2nd: trigger, count=0, entries+1
                                     │                          entries==2 → caution += subskill
                                     ▼
  "I need help" ─▶ HelpPicker ─▶ help/request ─▶ requestHelp() ─┘   (same trigger path)
                                     │
                                     ▼ session.prompt = { subskill, reason }
                               PromptModal ── Not now ──▶ prompt/decline (practices += declined)
                                     │ Yes, two minutes
                                     ▼ prompt/accept  (practices += accepted; overlay = subskill)
                               PracticeOverlay ▶ PracticeCard(PRACTICES[subskill]) ── Back to Qn ──▶ overlay/done
                                                                                    (problemIndex and lines untouched)
  session.escalation.caution ──▶ read by the teacher view in ticket 05
```

## Verified by

vitest (24 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP-driven run: two
bursts on Q1 (no prompt), two on Q2 (prompt: "Two minutes on factorising quadratics?"), Not now,
I need help → Factorising → prompt with the help framing → Yes → overlay → four steps revealed →
back to Q2 with both lines still in the column and no dialog left open.
