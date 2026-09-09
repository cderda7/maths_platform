# 17: Copy sweep to the rule

**What to build:** Every existing student and teacher screen is cut to the copy rule in `specs/spec2.md`: two-to-four-word headlines, no explanatory sentence that doesn't change what the user does next, labels over sentences, at most one line of helper text per screen, and no legends or "what this means" panels unless they are the content of the screen. No behaviour changes. The student clicks through the whole run and the teacher through every view, and nothing reads as a paragraph. Passages that explained a product decision worth keeping move to `DECISION_LOG.md` or `FUTURE_FEATURES.md` rather than being lost.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Every student screen (overview, practice, confidence, working, feedback, rework, group pass, group discuss, report, peers, history, diagnostic modal) meets the copy rule
- [ ] Every teacher view (live status, review groups, mistakes, compare, report, diagnostic push) meets the copy rule
- [ ] The report's subskill summary and the detective feedback sentence are kept as the two content exceptions
- [ ] No state, routing or logic changed; all existing vitest suites pass unchanged
- [ ] Removed explanatory passages that record a decision are moved to `DECISION_LOG.md` or `FUTURE_FEATURES.md`
- [ ] Build, lint, type-check pass; headless click-through of both sides
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
