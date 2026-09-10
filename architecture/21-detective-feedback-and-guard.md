# 21 · Detective feedback and the guard

Routes: `/student?stage=feedback` (the sentence), the rework stage (every problem open, the guard),
and the notice over whichever screen follows rework hand-in.

## Files touched

| File | What it does |
|---|---|
| `lib/feedback.ts` | `feedbackSummary(session, version, problems)` → `{ count, total, subskills, sentence }`; `summarySentence(count, subskills, version)`: hint whenever count ≥ 1, distinct subskills in first-occurrence order, capped at `HINT_CAP = 3`; the `final` version reads the rework where there is one and says "still" |
| `lib/guard.ts` | `guardFor(session, problem)` → `{ originalCorrect, tripped }`; `trippedProblems(session)`; `GUARD_TEXT`. Trips only when a first attempt with no wrong line gains a wrong rework line |
| `lib/session.ts` | `notice` on the session with `notice/dismiss`; `rework/done` is refused while any problem is tripped unless `force` (ticket 22's teacher advance) and sets the post-rework sentence as the notice; the synthetic reworked run leaves originally-correct problems alone |
| `data/recognition.ts` | A rework script for Q4 that "reads" the classic slip of dividing by a instead of 2a, so reworking the correct problem trips the guard in the demo |
| `app/student/screens/FeedbackScreen.tsx` | Rewritten: the sentence in a soft card, every problem listed with its line count, unmarked transcription, star as "☆ Not sure about this one". No red, no blue, no per-problem clue |
| `app/student/screens/ReworkScreen.tsx` | Rewritten: every problem in the strip, first attempt unmarked beside the pad, guard banner with "Restore my original" (clears that problem's rework lines and ink), a red dot on any tripped problem in the strip, "Hand in" disabled with "Restore Q4 first" while tripped |
| `app/student/StudentApp.tsx` | The notice pill at the bottom of the iPad screen with a dismiss ✕, over whatever stage is showing |
| `lib/feedback.test.ts`, `lib/guard.test.ts`, `lib/session.test.ts` | Sentence for 0 / 1 / 3 / capped subskills; original vs final; guard trips, never fires on originally-wrong problems, clears on undo/clear; rework hand-in refused, allowed after restore, forced through with the notice |

## How it connects

```
 hand-in ──▶ FeedbackScreen ── feedbackSummary(session, "original") ──▶ "3 of your problems contain a mistake. Double-check factorising and algebra."
                 │ (no marks; star only)
                 ▼ Rework →
 ReworkScreen (every problem)
   pad ──▶ rework/stroke · rework/reveal ──▶ session.rework[p] ──▶ guardFor(session, p)
                                                                      │ originalCorrect && rework has a wrong line
                                                                      ▼
                                              banner GUARD_TEXT + Restore my original (rework/clear) · red dot in strip
   Hand in ──▶ rework/done ──▶ trippedProblems(s).length > 0 && !force ? refused : stage = nextStage(pathway, "reworked")
                                                                                   notice = feedbackSummary(s, "final").sentence
                                                                                            │
 next screen (group pass · waiting · report) ◀── StudentApp shows the notice pill until notice/dismiss ◀──┘
```

Teacher views are untouched: mistakes, compare and report still show every slip.

## Verified by

vitest (87 tests), `tsc --noEmit`, `eslint`, `next build`, and a CDP run: the scripted feedback
screen reads the sentence above with zero red or blue styled elements, lists Q1–Q4 with line
counts, and the star toggles. Rework opens all four problems; two bursts on Q4 (originally
correct) reveal a wrong line, the banner appears with its fixed text, "Hand in" is disabled with
"Restore Q4 first", the red dot stays on Q4 while viewing Q1; Restore clears the banner, the
rework ink and re-enables hand-in; hand-in lands on the quick pass with the notice "3 of your
problems still contain a mistake…", dismissed with ✕. The strong run reads "Every problem held.",
opens rework without crashing, and hands in to "Every problem holds now.".
