# 06: Feedback layers on submission

**What to build:** After the student finishes the set they submit and see their work with two feedback layers. Every incorrect step is highlighted red. A curated set of correct steps is highlighted blue: for a strong run these are genuinely novel steps, for a weaker run the harder steps they still got right. Which steps are blue is scripted per demo outcome, not derived. A "detective work" clue gives a pattern-level hint ("something goes wrong when a coefficient sits in front of x²") rather than a location. On any problem they got right but weren't sure about, the student can star it, and the star is stored in session for the teacher side.

**Blocked by:** 04 (Scripted evaluation, subskill escalation, isolated practice prompt, "I need help").

**Status:** ready-for-agent

- [ ] Submit action ends the assignment and opens the feedback view inside the frame
- [ ] Red highlight on every incorrect step; blue highlight on the scripted standout-correct set
- [ ] Standout set differs between a strong and a weak scripted run, and the copy explains why a step is blue
- [ ] Detective-work clue per problem with a wrong step; never names the line
- [ ] Star control on correct problems; starred set held in session
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
