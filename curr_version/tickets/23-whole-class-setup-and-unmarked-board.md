# 23: Whole-class setup and the unmarked board

**What to build:** The teacher side of whole-class review, demoable before the student side exists. When the pathway includes whole-class review, the live view offers "Start whole-class review", which opens a private setup view: every problem listed with its struggle count, the top three pre-checked, freely toggled. For each chosen problem, 2–3 suggested examples chosen by bucket (one fully correct, then one per distinct error subskill by bucket size), each shown with the owning student's name and correctness in setup only, swappable for any other student's work on that problem. The live demo student is a candidate when they attempted the problem. "Project" opens the board route: one slide per problem showing the statement and the examples side by side labelled A, B, C, each with "n/m students" where m is students who handed in that problem, in a name-free control strip with previous, next, "problem 2 of 3" and End. The unmarked view shows no names, avatars, ink or correctness marks anywhere. Classmate fixtures gain scripted transcriptions per problem so examples exist.

**Blocked by:** 22 (Teacher force submit with one-minute grace).

**Status:** ready-for-agent

- [ ] Scripted classmate transcriptions per problem, consistent with their existing wrong sets
- [ ] Pure examples module: bucket by correct or first wrong subskill, counts, suggestion order and cap, denominator, live student included; tested, including that the board view model carries no names or verdicts
- [ ] Classroom reducer: session setup (problems, example refs), project, navigate slide, end; tested
- [ ] Setup view with struggle counts, top three pre-checked, suggested examples with names and correctness, swap
- [ ] Board route: unmarked slides with A/B/C, counts, previous, next, indicator, End; tersest screen in the product
- [ ] Live view entry only when the pathway includes whole-class review
- [ ] Build, lint, type-check, vitest pass; headless: set up, project, navigate, end
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
