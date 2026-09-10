# 31: Practice sent to the fundamental skill, in the student's words; confidence recorded for the teacher

**What to build:** Two rules on the mid-set practice prompt, and a confidence answer for the teacher. (1) When practice triggers after slips on more than one skill in a group (monic, then non-monic), it goes to the most fundamental of them. (2) The prompt reads in the student's words: "two minutes on factorising?" with "this is your second mistake on factorising. let's do a short problem to review.", and the student sees "factorising" where the system stores "monic factorising". (3) The confidence survey lists the set's seven most relevant skills; the answer is shown to the teacher (live view and report) and never changes when practice is offered: two mistakes on a group, for everyone. (A first-mistake trigger for low-confidence students was built and reverted the same day at the user's request.)

**Blocked by:** 29 (practice on the pad), 04 (escalation counter), 02 (confidence survey).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

The escalation counter keeps the leaves slipped on since the last practice in that group. On a trigger the session practises the easiest of those leaves that has a practice. Student-facing surfaces name monic factorising as "factorising"; non-monic keeps its qualifier; the teacher's surfaces are unchanged. The demo student answers "not confident with factorising", which the teacher sees; the run itself is the classic one: Q1's slip passes, Q2's prompts.

## Acceptance

- [x] `recordMistake(state, group, leaf)` with `slips` per group; the trigger returns the slipped leaves and resets them
- [x] Session: `fundamentalLeaf(slipped)` picks the practice
- [x] Prompt copy lowercase, no eyebrow; `groupWord` for the sentence
- [x] Confidence: seven relevant skills, stacked multi-select; shown in the teacher's live view and report; no effect on practice
- [x] `studentLeafName` (monic → "factorising"); `LeafChip student`; overview, chooser, peers, picker, overlay, tutor replies and detective feedback use it
- [x] Tests: confidence never changes the threshold, the fundamental leaf, the counter
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`
