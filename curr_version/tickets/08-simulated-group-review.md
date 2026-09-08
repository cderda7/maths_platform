# 08: Simulated group review, two phases

**What to build:** The student is walked through a group review with three hardcoded mock groupmates, each with a pre-set wrong-problem set. Phase one is a quick pass over the problems everyone in the group got right (the intersection of correct sets). Phase two is the union-of-wrongs discussion: every problem any member got wrong, shown with no correctness markers at all, only a shared count such as "you've each gotten 2 of these wrong". The set logic is a pure function with unit tests, including a test that the discussion-phase view model carries no per-student correctness data.

**Blocked by:** 07 (Independent rework stage).

**Status:** ready-for-agent

- [ ] Mock groupmate fixture: three names and their wrong-problem sets, chosen so intersection and union are both non-empty and distinct
- [ ] Pure group-phase computation with vitest: intersection (quick pass), union (discussion), shared count
- [ ] Test asserting the discussion view model exposes no correctness markers or per-student wrong flags
- [ ] Phase one screen: quick pass with a brief per-problem acknowledgement
- [ ] Phase two screen: union list, no markers, shared count, discussion prompts, "finish group review"
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
