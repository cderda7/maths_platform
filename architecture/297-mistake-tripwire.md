# 297: "Not now" keeps the practice offer armed

## Files touched

| File | What it does |
| --- | --- |
| `lib/escalation.ts` | The pure counter per taxonomy group. An offer no longer resets the count; new `practiceTaken` does, and `requestHelp` calls it (help is practice taken at once). |
| `lib/session.ts` | `prompt/accept` calls `practiceTaken` for the prompt's group; `prompt/decline` leaves the escalation untouched, so the offer stays armed. New `promptSentence`: "This is your second / third / … mistake on factorising." from the topic's count. |
| `app/student/screens/PracticePrompt.tsx` | `PromptModal` shows the sentence it is given instead of a fixed "second". |
| `app/student/screens/WorkingScreen.tsx` | Passes `promptSentence(session)` to the modal. |
| `lib/session.test.ts` | Four new reducer tests: re-offer after Not now (and its "third mistake" sentence), nothing on another topic, first mistake again after Yes, the first offer's "second mistake". |
| `lib/escalation.test.ts` | One new (a declined offer stays armed); three follow the rule (reset on practice taken). |

## How it connects

```
 WorkingScreen (pad burst) ──▶ line/reveal ──▶ evaluateLine ──wrong──▶ recordMistake(group, leaf)
                                                                          │
                                                        count ≥ 2 ◄297 (was: == 2, reset on offer)
                                                                          │ trigger
                                                                          ▼
                                             session.prompt { leaf: fundamentalLeaf(slipped) }
                                                                          │
                              PromptModal "2 minutes on …?" + promptSentence ◄297 (second, third… from the count)
                                                        │                                  │
                                                     Not now                              Yes
                                                        │                                  │
                                            prompt/decline                          prompt/accept
                                            escalation unchanged ◄297          practiceTaken(group) ◄297
                                            (next slip offers again)            count 0, slips []
                                                                                       │
                                                                                PracticeOverlay

 HelpPicker ──▶ help/request ──▶ requestHelp = trigger + practiceTaken ◄297

 escalation.entries / caution ──▶ lib/report.ts, lib/hierarchy.ts, TeacherLive (unchanged readers)
```
