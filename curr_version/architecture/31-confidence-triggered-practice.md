# 31 · Practice triggered by confidence, sent to the fundamental skill, in the student's words

Route: `/student` (stage `working`, the practice prompt). Live path: overview → "start" →
"Not confident" or "Depends on the skill · Algebra" → Start Q1 → a slip on Q1.

## Files touched

| File | What it does |
|---|---|
| `lib/escalation.ts` | `recordMistake(state, group, leaf?, threshold = 2)`; `slips` per group (leaves slipped on since the last practice, first first); a trigger returns `slipped` and resets the group's slips |
| `lib/session.ts` | `notConfidentIn(confidence, leaf)` (level "low", or "low-when" naming a skill in this leaf's group: "Factorising" covers non-monic too) → threshold 1; `fundamentalLeaf(slipped)` (easiest by `EASE` that has a practice); `PracticePrompt.reason` gains `confidence`; `DEMO_CONFIDENCE` (the demo student: not confident in factorising) for the scripted run and deep links; `hydrateSession` maps an old category answer to no skills named |
| `data/types.ts` | `Confidence` "low-when" carries `leaves: LeafId[]` (up to seven of the set's skills) instead of a category |
| `lib/hierarchy.ts` | `relevantSkills(problems, n = 7)`: the moves ranked by how many problems invoke them |
| `app/student/screens/ConfidenceScreen.tsx` | Three lowercase answers: "confident", "not confident with…" over the seven most relevant skills stacked as an always-visible tick list (any number; ticking one selects that answer), and "not confident" overall; student names, lowercase |
| `lib/report.ts`, `app/teacher/TeacherLive.tsx` | Confidence copy names the skills ("low: monic factorising, non-monic factorising") |
| `data/taxonomy.ts` | `studentLeafName` (monic → "Factorising" / "factorising"); `groupWord` (the plain word for a group in a sentence) |
| `components/Tag.tsx` | `LeafChip student` switches to the student-facing name; the teacher's chips are unchanged |
| `app/student/screens/PracticePrompt.tsx` | `PromptModal`: no eyebrow, "two minutes on {skill}?" lowercase, subtext by reason; picker and overlay chip use student names |
| Overview, WarmupPick, Peers, PracticeScreen, WorkingScreen, PracticeCard, PracticePad, ProblemCard, `lib/warmup.ts`, `lib/feedback.ts` | Student-facing names |
| `lib/escalation.test.ts`, `lib/session.test.ts`, `lib/report.test.ts`, `lib/feedback.test.ts` | Threshold 1 and the slipped leaves; the scripted run practises monic at Q2; low-when algebra prompts on Q1's slip but not Q3's; low overall prompts on Q3's; report and feedback copy |

## How it connects

```
 line/reveal (wrong) ──▶ slipped = tag.leaf · unsure = notConfidentIn(confidence, slipped)
                     ──▶ recordMistake(escalation, groupOf(slipped), slipped, unsure ? 1 : 2)
                            counts[g] += 1 · slips[g] += slipped
                            counts[g] ≥ threshold ──▶ trigger: entries[g] += 1 (2nd → caution) · returns slipped[g] · resets counts, slips
                     ──▶ prompt = { leaf: fundamentalLeaf(slipped) = easiest with a practice, reason: unsure ? "confidence" : "detected" }

 PromptModal: "two minutes on {studentLeafName(leaf).short}?"
   detected   → "this is your second mistake on {groupWord(group)}. let's do a short problem to review."
   confidence → "you've made a mistake with {groupWord(group)}. you told me you don't feel confident with this skill, so let's do a short problem to review."
   Yes ──▶ prompt/accept ──▶ PracticeOverlay (ticket 29)
```

## Demo consequence

The scripted student names factorising, which covers the whole group. Q1's monic slip prompts at once, Q2's
non-monic slip prompts again, and that second practice raises the teacher's caution on
"expanding & factorising", so the teacher grid shows Sam's Algebra as a gap (the caution rule
from ticket 05 forces the group's leaves to gap). The report lists two practices and reads
"Confidence low when monic factorising comes up".

## Verified by

vitest (168 tests). CDP click-through: a confident student's Q1 slip passes and Q2's prompts
"two minutes on factorising? this is your second mistake on factorising…" with the overlay on the
monic problem and "factorising" on Q1's chips; a "depends on the skill · Algebra" student's Q1
slip prompts "you've made a mistake with factorising. you told me you don't feel confident…".
`tsc --noEmit`, `eslint`, `next build`.
