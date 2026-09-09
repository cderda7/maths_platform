# 29 · Mid-set isolated practice on the pad

Route: `/student` (stage `working`, the practice overlay). Deep link: `/student?stage=working`,
then "I need help" → a skill → Yes.

## Files touched

| File | What it does |
|---|---|
| `lib/session.ts` | `PracticeRun` (problem first/second, example, exampleShown, hinted, exampled, lines, ink) as the shared run shape; `WarmupState extends PracticeRun` (+ selected, messages, step); `overlayRun: PracticeRun` on the session, reset to `INITIAL_RUN` when a prompt is accepted; `RunKey` = warmup \| overlay; actions `run/reveal · stroke · undo · clear · hint · example · example-step · next` each carrying `run`, handled by one `runReducer` (returns the same object when nothing changes); `runOf`, `runFirst` (the warm-up's current step, or the overlay leaf's practice), `runProblem`; `practiceLeaf` goes through `practiceFor`, so a whole-task leaf never prompts; `hydrateSession` fills `overlayRun` too |
| `data/practice.ts` | `NOT_ISOLATED` (quadratic equations: the whole task, not a move) and `isolatable(leaf)`; the quadratic-equations practice removed. Rule: practice is offered on moves only, never at the whole-task level |
| `lib/warmup.ts` | `practiceFor(leaf)` exported (own practice, else a group sibling's, never for a non-isolatable leaf); `focusLeaves` filters by `isolatable`; quadratic equations dropped from `EASE` |
| `components/PracticePad.tsx` | The three-pane practice extracted from the warm-up screen: problem · pad · Read as, the hint card, the help menu ("I'd like a…"), the worked example in place of the pad, the follow-up split pane. Props: `run`, `runKey`, `first`, `title`, `header` (above the problem), `footer` (right column buttons), `finished` (the button after a worked example with no follow-up left) |
| `app/student/screens/PracticeScreen.tsx` | The warm-up as `PracticePad` with the sequence strip as header and "Skip to the set" / "Next skill →" / "On to the set" |
| `app/student/screens/PracticePrompt.tsx` | `PracticeOverlay` is `PracticePad` over the working screen: title "On its own", the skill as a dark-blue chip, "Back to Qn →" as footer and finished button. `HelpPicker` lists only the current problem's own moves that have a practice, all in the light-purple row style, and closes on a tap outside |
| `app/student/screens/WorkingScreen.tsx` | Hands `session` and `dispatch` to the overlay |
| `lib/session.test.ts`, `lib/warmup.test.ts`, `lib/hierarchy.test.ts` | `run/*` actions; the overlay run's lifecycle (fresh on accept, own lines and help, follow-up, cleared on done, fresh again); `practiceFor` never returns a whole-task leaf; the coverage test asserts a wrong verdict on quadratic equations prompts nothing |

## How it connects

```
 WorkingScreen ── "I need help" ──▶ HelpPicker(problemLeaves(p) ∩ practiceFor ≠ null) ── pick ──▶ help/request ──▶ prompt
               ── wrong line ──▶ recordMistake(group) ── 2nd ──▶ prompt { leaf: practiceLeaf(tag) }   (null for a whole-task leaf: no prompt)
 PromptModal ── Yes ──▶ prompt/accept ──▶ overlay = leaf · overlayRun = INITIAL_RUN
                                              │
                                              ▼
 PracticeOverlay ──▶ PracticePad(run = session.overlayRun, runKey "overlay", first = PRACTICES[leaf])
 PracticeScreen  ──▶ PracticePad(run = session.warmup,     runKey "warmup",  first = warmupStep(session))
                        │  strokes / bursts / undo / clear / hint / example / next ──▶ run/* { run } ──▶ runReducer(runOf(s, run), a, runFirst(s, run))
                        └─ footer: overlay "Back to Qn →" ──▶ overlay/done · warm-up "Next skill →" ──▶ warmup/skill-done
```

## Verified by

vitest (146 tests): the overlay run (fresh on accept, lines and hint in `overlayRun` only, the
follow-up after the worked example, cleared on done, fresh on the next accept; `run/hint` with
no overlay is a no-op); `practiceFor` on a whole-task leaf and on communication is null;
`practiceLeaf` of the Q4 formula slip (tagged quadratic equations) is null while every move with
a wrong verdict has a practice; the warm-up's run tests unchanged under the `run/*` names.
`tsc --noEmit`, `eslint`, `next build`. CDP click-through on `/student?stage=working`: the
picker lists only Q1's monic factorising and null factor law (quadratic equations gone) → Yes →
the overlay is the pad titled "On its own" with a dark-blue skill chip and no steps shown → a
burst reads a line → hint → worked example → "Try one more" → the follow-up beside the example
with "Back to Q1 →" → reload keeps the overlay on the follow-up → back on Q1 with the overlay
gone, Q1's marked lines untouched, the practice logged as help-taken. The warm-up sequence
click-through still passes on the shared pad.
