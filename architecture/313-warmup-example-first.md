# 313: The warm-up starts each skill with a worked example

## Files touched

| File | What it does |
| --- | --- |
| `lib/ladder.ts` | `WarmupPhase` (`worked` → `completion` → `alone`), `PhaseTimes`, `phaseOf` (the furthest step reached), `nextPhase`, `warmupLadder(practice)` (the practice problem worked, its completion problem with ticket 310's blanks on the practice's own skill, its follow-up alone). `completionScript` takes any `{ id, steps }`, so Q** and the warm-up's completion problem script alike; `LADDER_SLIPS` gains Sam's sign slip on the monic completion problem. |
| `lib/session.ts` | `WarmupState.phases` (per skill, by its practice id: when each step began). `warmup/begin`, `warmup/skill-done`, `warmup/goto` carry `at` and open a skill on the step it was left on (`openSkill`, the worked example's start stamped once); `warmup/next` moves worked → completion (the example seen in full) → alone (every blank in). `runFirst(s, "warmup")` is the step's problem; `run/hint` on the completion problem reads the working on screen; `run/next` / `run/example` do nothing on the warm-up. `warmupPhase`, `warmupCompletion`; `warmupProblem` by step. |
| `lib/place.ts` | `sessionPlace` on the warm-up: step 1, 2 or 3 from `warmupPhase`, `since` the recorded start. |
| `lib/helpChat.ts` | `findPractice` finds the completion problems; `chatOn` → `"warmup-completion"`, whose brief says lines are given and marked, with no problem set question in it. |
| `lib/warmup.ts` | `offerLines`: "2 skills, 3 short steps each, then the set". |
| `app/student/screens/PracticeSteps.tsx` | New, moved out of `HelpLadder.tsx` and made route-free: `StepLine`, `StepTitle`, `WorkedStep` (question, worked example step by step, chat beside it, `next` once seen), `CompletionStep` (question, hints, help menu, pad, the Working column's `GivenRow` / `BlankRow` marked through `MARK_LOOK`), `ExamplePeek` ("see the example again" in the pad's place). The caller gives the head, the footer, the run key and what shows when a step is through. |
| `app/student/screens/HelpLadder.tsx` | Now a thin caller of `PracticeSteps`: its head ("Help with Qn", 1 Example › 2 Your turn › 3 Qn), "Back to Qn", "Your turn" → `ladder/next`. Unchanged on screen. |
| `app/student/screens/PracticeScreen.tsx` | The warm-up per step: `WorkedStep`, `CompletionStep`, then `PracticePad` on the follow-up with "see the example again"; the head is "Warm-up", 1 Example › 2 Your turn › 3 On your own, the step's title, the skill chips; "Skip to the set" and "Next skill →" / "On to the set" at every step. |
| `components/PracticePad.tsx` | `lead` (above the title) and `exampleAgain` (the menu's example becomes "see the example again", an `ExamplePeek`). The older isolated practice is unchanged. |
| `app/student/screens/WarmupChatScreen.tsx` | `warmup/begin` carries `at`. |
| `scripts/hint-box-sweep.mjs`, `scripts/warmup-leaves.json` | Each warm-up skill: its completion problem blank by blank (the slip included) and its follow-up line by line, reached through the screens; the JSON holds each step's line count. |
| `lib/warmupSteps.test.ts` | New: the bank's three steps, blanks, any skill the set uses, who is offered, the session's steps and times, marks, moving on, reload, the chat. `lib/session.test.ts`, `lib/place.test.ts`, `lib/ladder.test.ts`, `lib/hint.test.ts`, `lib/warmup.test.ts` updated. |

## How it connects

```
 data/practice.ts PRACTICES (worked · followUp)     data/pairs.ts COMPLETIONS (310)      lib/stepCheck.ts checkStep (311, 325)
            │                                                │                                      │
            └────────────────────┬───────────────────────────┘                                      ▼
                                 ▼                                              ┌── lib/ladder.ts ─────────────────────────────┐
         lib/pairs.ts warmupSteps · blankSteps (310) ──────────────────────────▶│ warmupLadder ◄313 · WarmupPhase · phaseOf    │
                                                                                │ markLine → MARK_RULES · completionState      │
                                                                                │ completionScript({id, steps}) ◄313 · SLIPS   │
                                                                                └───────────────┬──────────────────────────────┘
                                                                                                │
 ConfidenceScreen (not confident) ─▶ WarmupChatScreen ─ warmup/begin {at} ─┐                    ▼
                                                                          ▼
                                  lib/session.ts ◄313  warmup.phases { practiceId: { worked, completion, alone } }
                                     warmup/next {at} (seen → completion; done → alone) · skill-done / goto {at} → openSkill
                                     runFirst("warmup") = the step's problem · run/hint reads the completion's working
                                           │                                                   │
                     ┌─────────────────────┤                                                   ▼
                     ▼                     ▼                                     lib/place.ts sessionPlace ◄313
 app/student/screens/PracticeScreen ◄313   app/student/screens/HelpLadder (312, now a caller)   warm-up step 1·2·3 + since
   step 1 WorkedStep ─┐                      step 1 WorkedStep · step 2 CompletionStep                  │
   step 2 CompletionStep ─┤                                                                             ▼
   step 3 PracticePad (exampleAgain, lead) ◄313                                  lib/whereStudents.ts → WhereStudentsAre
                     │                                                             (Sam's warm-up pill, step bar, time)
                     ▼
 app/student/screens/PracticeSteps.tsx ◄313  StepLine · StepTitle · WorkedStep · CompletionStep · ExamplePeek · MARK_LOOK
   ─▶ components/HelpChat (/api/help-chat ─▶ lib/helpChat findPractice · chatOn "warmup-completion" ◄313)
   ─▶ components/HelpMenu (hint · see the example again · chat; no video) · components/HintCards · components/PadSection

 scripts/hint-box-sweep.mjs ◄313 ── each warm-up skill: completion blanks (slip included) · follow-up lines (warmup-leaves.json [worked, completion, alone])
```
