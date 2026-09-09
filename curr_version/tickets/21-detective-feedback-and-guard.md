# 21: Detective feedback and the guard

**What to build:** Individual review becomes detective work. The feedback screen is one conversational sentence: how many problems contain at least one mistake, and, whenever that is one or more, a hint naming up to three subskills to double-check ("2 of your problems contain a mistake. Double-check fraction addition."). No red marks, no per-problem counts, no per-problem clue, no blue standouts; the star stays. Rework opens every problem, correct ones included, with the first attempt shown unmarked beside the pad and no live count. The one per-problem exception in the whole product: if the student's rework makes an originally-correct problem wrong, a banner appears the moment the offending line is transcribed ("This isn't where your mistake was made. Your original work was correct.") with a "Restore my original" action. Rework hand-in is blocked while any such problem is broken, showing why. After rework hand-in the same sentence reports how many problems still contain a mistake, then the pathway continues.

**Blocked by:** 18 (Pathway model and routing), 20 (Persisted ink).

**Status:** ready-for-agent

- [ ] Pure feedback-summary module: count, ordered distinct subskills, rendered sentence; hint iff count ≥ 1, capped at three; tested for zero, one, two and many, over first and final versions
- [ ] Feedback screen renders the sentence, the star per problem and unmarked transcriptions; nothing verdict-derived is styled
- [ ] Rework index ranges over every problem; first attempt shown unmarked; no live count
- [ ] Pure guard module: tripped iff first version fully correct and current rework has a wrong line; tested for trip, clear on undo/clear/restore, and never firing on originally-wrong problems
- [ ] Live banner with restore action; restore clears that problem's rework lines and ink
- [ ] Rework hand-in disabled with reason while any problem is tripped
- [ ] Post-rework sentence over the final version; then routing by pathway
- [ ] Teacher views still show every slip unchanged
- [ ] Build, lint, type-check, vitest pass; headless: break a correct problem, see banner, get blocked, restore, hand in
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
