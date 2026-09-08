# 11: Teacher mistake view

**What to build:** A teacher screen listing mistakes organised first by problem, then by student under each problem. Clicking a student row expands their transcription inline, with the incorrect step highlighted red, so the teacher sees the exact working without leaving the list. With one demo student the interaction pattern is what's being sold, so pad each problem with a couple of mock roster names whose expanded transcriptions are fixture data.

**Blocked by:** 05 (Teacher live subskill status and caution flag), 06 (Feedback layers on submission).

**Status:** ready-for-agent

- [ ] Problems listed in set order; under each, the students who made a mistake on it, demo student included when applicable
- [ ] Click-to-expand inline transcription with red highlight on the wrong step; only one expanded at a time
- [ ] Demo student's rows are live from session; mock rows are fixture
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
