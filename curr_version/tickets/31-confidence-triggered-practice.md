# 31: Practice triggered by confidence, sent to the fundamental skill, in the student's words

**What to build:** Three rules on the mid-set practice prompt. (1) A student who said they are not confident, overall or in this category, is offered practice on their first mistake there, not their second. (2) When practice triggers after slips on more than one skill in a group (monic, then non-monic), it goes to the most fundamental of them. (3) The prompt reads in the student's words: "two minutes on factorising?" with a subtext that says why, and the student sees "factorising" where the system stores "monic factorising".

**Blocked by:** 29 (practice on the pad), 04 (escalation counter), 02 (confidence survey).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

The escalation counter takes a threshold (2 by default, 1 when the student said they are not confident here) and keeps the leaves slipped on since the last practice in that group. On a trigger the session practises the easiest of those leaves that has a practice. The prompt has two readings: "this is your second mistake on factorising. let's do a short problem to review." and "you've made a mistake with factorising. you told me you don't feel confident with this skill, so let's do a short problem to review." Student-facing surfaces name monic factorising as "factorising"; non-monic keeps its qualifier; the teacher's surfaces are unchanged. The demo fixtures (deep links, the scripted run) are a confident student, so the classic second-mistake moment and the teacher grid stay as they were; the confidence rule shows in a live run when the student answers "not confident".

## Acceptance

- [x] `recordMistake(state, group, leaf, threshold)` with `slips` per group; the trigger returns the slipped leaves and resets them
- [x] Session: `notConfidentIn(confidence, leaf)` sets the threshold; `fundamentalLeaf(slipped)` picks the practice; prompt reason `confidence` \| `detected`
- [x] Prompt copy lowercase, no eyebrow, two subtexts; `groupWord` for the sentence
- [x] `studentLeafName` (monic → "factorising"); `LeafChip student`; overview, chooser, peers, picker, overlay, tutor replies and detective feedback use it
- [x] Fixtures confident; tests for both confidence rules, the fundamental leaf, and the counter
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`
