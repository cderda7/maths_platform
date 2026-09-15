# 300: The named kind of factorising is practised, and every practice skill has one follow-up

## Files touched

| File | What it does |
| --- | --- |
| `lib/warmup.ts` | `NONMONIC_SAID` (non-monic without the word) in `SKILL_WORDS`; `focusLeaves` leaves out the factorising kind the answers didn't name when both were ticked. |
| `lib/warmup.test.ts` | The wordings, the narrowing (both ways, and when it must not narrow), and the bank's one-follow-up-each rule. |
| `data/practice.ts` | Fourteen new `followUp`s (monic already had one); the sketch's closing step shortened to fit its column. |
| `scripts/warmup-leaves.json` | Each leaf's line counts as `[first, followUp]`. |
| `scripts/hint-box-sweep.mjs` | After walking a warm-up, opens its worked example and "Try one more", then walks the follow-up the same way (`openFollowUp`). |
| `lib/hint.test.ts` | Holds the sweep's list to both counts. |

## How it connects

```
 ConfidenceScreen ── ticks ──▶ session.confidence.leaves ──┐
                                                           ▼
 WarmupChatScreen ── answers ──▶ session.warmup.messages ─▶ focusLeaves ◄300 (lib/warmup.ts)
                                                              │  interpret ─ SKILL_WORDS + NONMONIC_SAID ◄300
                                                              │  both kinds ticked, one named ▶ drop the other
                                                              ▼
                                           warmupSequence (easiest first) ─▶ PracticeScreen strip + pad

 WorkingScreen ─ I need help ─▶ HelpPicker ─▶ help/request ─▶ PracticeOverlay (unchanged routing)
 WorkingScreen ─ 2nd slip ────▶ PromptModal ─▶ prompt/accept ─▶ PracticeOverlay  (fundamentalLeaf, unchanged)

 PracticeScreen / PracticeOverlay
        └─▶ PracticePad  first = PRACTICES[leaf]  (data/practice.ts)
               I need help ▶ worked example ▶ "Try one more →" (run/next)
               └─▶ first.followUp ◄300 (every leaf now) ▶ its worked example ▶ screen's own button

 data/practice.ts ──▶ scripts/warmup-leaves.json [first, followUp] ◄300 ──▶ hint-box-sweep.mjs walks both ◄300
        ▲                           ▲
        └── lib/warmup.test.ts ◄300 └── lib/hint.test.ts ◄300   (bank rules, sweep list)
```
