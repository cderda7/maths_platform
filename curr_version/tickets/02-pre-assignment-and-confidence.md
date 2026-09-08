# 02: Pre-assignment skill list, practice offer, confidence survey

**What to build:** Before starting the assignment the student sees which skills and subskills it exercises and is offered a short optional practice. They can accept it (a one-problem practice screen, then back) or decline. They then rate their confidence with exactly three options: "confident", "low confidence when [subskill] involved" (with a subskill picker), or "low confidence". The choice is stored in the demo session and shown later on the teacher side.

**Blocked by:** 01 (Scaffold, iPad stage, demo assignment fixture).

**Status:** ready-for-agent

- [ ] Skill/subskill list screen with a clear "Practice first" / "Start the assignment" choice
- [ ] Accepting practice shows one fixture practice problem and returns to the flow; declining goes straight on
- [ ] Confidence survey with the three spec'd options; the middle option requires picking a subskill
- [ ] Confidence choice is held in session state and readable by later screens
- [ ] Copy is non-punitive: practice is framed as an offer, never remediation
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
