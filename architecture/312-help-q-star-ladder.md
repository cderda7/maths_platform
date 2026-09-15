# 312: I need help on a question runs Q* worked, Q** finished, then back to Q

## Files touched

| File | What it does |
| --- | --- |
| `lib/ladder.ts` | New, pure. `ladderFor(problem, leaf)` (Q*, Q**, the blanks), `asPractice` (a question as the pad's helpers read one), `questionPractice` (Q with its own hints). `markLine` (the one place a `checkStep` result becomes a mark), `MARK_RULES` (what a mark does), `TRIES_BEFORE_FILL`. `completionState(steps, blanks, lines)`: each blank's lines marked, the blank being written, how much of the working is on screen. `completionWorking` (what the hint picker reads). `LADDER_SLIPS` + `completionScript` (the demo pad's lines, through ticket 311's `padScript`). |
| `lib/session.ts` | `ladder: { problem, step }` beside `overlay`, `questionRun` (hints and chat on the set question), `PracticeEntry.steps` (when each step began). Actions `ladder/next`, `ladder/again`, `question/hint`; `at` on `help/request`, `prompt/accept`, `overlay/done`. `runFirst` reads Q*, Q** or Q; `ladderEntry`, `ladderCompletion`. The offer on a question with Q* and Q** is on the slip's skill. |
| `lib/place.ts` | `sessionPlace`: Q* step 1, Q** step 2, back on the question step 3, each `since` the recorded time; the example opened again stays step 3. |
| `data/questionHelp.ts` | New. `QUESTION_HELP`: every Problem Set 6 question's hints (one per point) and ways in, for back on the question. |
| `app/student/screens/HelpLadder.tsx` | New. The overlay for Q* (`WorkedStep`: question, worked example, chat) and Q** (`CompletionStep`: question, hints, help menu, pad, the Working column with `BlankRow` marks from `MARK_LOOK`), the three-step line, "Back to Qn". |
| `app/student/screens/WorkingScreen.tsx` | Back on a question after practice: "see the example again", hint and chat pills, hint cards lighting the question and read lines, the chat under the read lines; draws `HelpLadder` (or the older `PracticeOverlay`); passes `at`. |
| `app/student/screens/PracticePrompt.tsx` | The offer says what Yes opens; the older overlay and picker notes. |
| `components/HelpMenu.tsx` | New. The "I'd like a…" menu (options passed in, no video), `StallNotice`, `CardClose`, moved out of `PracticePad`. |
| `components/HintCards.tsx` | New. `useHints` (shown hints, anchors, lit word, reopened) and `HintCards`, for Q** and the set question. |
| `components/PracticePad.tsx` | The warm-up's (and older practice's) menu through `HelpMenu`: hint, worked example, chat. |
| `components/PracticeCard.tsx` | `question={false}`: no stem or expression, the chip at the top right, no rule above the first line; used for Q*, the example again and the warm-up's worked example. |
| `components/HelpChat.tsx`, `lib/helpChat.ts`, `app/api/help-chat/route.ts` | The request carries the skill; `findPractice(id, leaf)` finds Q*, Q** and Q; `chatOn(id)` words the brief for each. |
| `components/HintCard.tsx` | Comment: where a hint card shows. |
| `lib/hint.ts` | A comma after a fragment is flush: that side of the lit box is tight. |
| `scripts/hint-box-sweep.mjs`, `scripts/question-working.json` | The sweep covers every Q** for every picker skill and every question back on itself; `HINT_SWEEP_ONLY`. |
| `lib/ladder.test.ts` | New, the model, the session's steps and the chat. `lib/place.test.ts`, `lib/session.test.ts`, `lib/report.test.ts`, `lib/pairs.test.ts` (Q hints under every hint test). |

## How it connects

```
 data/pairs.ts (310)                 data/questionHelp.ts ◄312            lib/stepCheck.ts (311) checkStep
 Q* worked · Q** + hints             Q's hints + ways in                          │
      │                                    │                                      ▼
      ▼                                    ▼                         ┌─ lib/ladder.ts ◄312 ─────────────────────────────┐
 lib/pairs.ts (310) blankSteps ──────────────────────────────────────▶│ ladderFor · asPractice · questionPractice         │
 lib/warmup.ts (311) padScript ──────────────────────────────────────▶│ markLine ─▶ MARK_RULES   (one place per result)   │
                                                                     │ completionState(steps, blanks, lines)             │
                                                                     │ completionWorking · LADDER_SLIPS · completionScript│
                                                                     └───────────────┬──────────────────────────────────┘
                                                                                     │
 WorkingScreen "I need help" ─▶ HelpPicker ─▶ help/request {leaf, problem, at}       │
 line/reveal (2nd slip) ─▶ PromptModal ─▶ prompt/accept {problem, at}                ▼
                                            lib/session.ts ◄312  overlay: leaf · ladder: {problem, step} · overlayRun · questionRun
                                               practices[].steps { worked, completion, back }  (times)
                                               ladder/next ─▶ completion   overlay/done ─▶ back   ladder/again ─▶ again
                                               run/hint on Q** reads completionWorking; question/hint reads the set's lines
                                                     │                                   │
               ┌─────────────────────────────────────┤                                   ▼
               ▼                                     ▼                        lib/place.ts sessionPlace ◄312
 app/student/screens/HelpLadder.tsx ◄312   WorkingScreen back on Q ◄312       practice step 1 · 2 · 3 + since
  step 1 WorkedStep: Q* · PracticeCard ·    see the example again · hint ·            │
         HelpChat (example)                  chat pills; HintCards; HelpChat           ▼
  step 2 CompletionStep: Q** · HintCards ·   (runKey "question")              ticket 315 Where students are
         HelpMenu · PadSection · Working                                       (lib/whereStudents.ts, teacher laptop)
         column (BlankRow, MARK_LOOK)
               │
               ▼
 components/HelpMenu.tsx ◄312 (hint · example · chat, no video) ◄── components/PracticePad.tsx (warm-up)
 components/HintCards.tsx ◄312 ── components/HintCard.tsx ── lib/hint.ts termTex (comma flush ◄312)
 components/HelpChat.tsx ─▶ /api/help-chat {problem, leaf} ─▶ lib/helpChat.ts findPractice(id, leaf) · chatOn(id) ◄312

 scripts/hint-box-sweep.mjs ◄312 ── warm-ups (warmup-leaves.json) · every Q** × picker skill · every Q back on itself (question-working.json)
```
