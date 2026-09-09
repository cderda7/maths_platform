# 20: Persisted ink

**What to build:** The student's handwriting survives. Strokes are stored in the student session per problem for the first attempt and again for the rework, alongside the recognised lines. Undo and clear go through the reducer and change ink and transcription together, so the two can never drift, including across a reload and across tabs. The history screen renders the stored ink beside each version's transcription so the payoff is visible. Ink is never read by any teacher view.

**Blocked by:** 17 (Copy sweep to the rule).

**Status:** ready-for-agent

- [ ] Session shape carries strokes per problem per version; reveal, undo and clear actions update ink and lines together
- [ ] Working and rework screens read strokes from the session instead of component state; drawing feels unchanged
- [ ] Reload mid-problem shows the same ink and the same lines; a second tab shows them too
- [ ] History screen renders read-only ink for each version
- [ ] Session tests cover ink kept in step with lines under reveal, undo and clear for both versions
- [ ] Build, lint, type-check, vitest pass; headless: draw, reload, compare
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
