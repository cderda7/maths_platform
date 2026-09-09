# 31 · Practice triggered by confidence, sent to the fundamental skill, in the student's words

Route: `/student` (stage `working`, the practice prompt). Live path: overview → "start" →
"Not confident" or "Depends on the skill · Algebra" → Start Q1 → a slip on Q1.

## Files touched

| File | What it does |
|---|---|
| `lib/escalation.ts` | `recordMistake(state, group, leaf?, threshold = 2)`; `slips` per group (leaves slipped on since the last practice, first first); a trigger returns `slipped` and resets the group's slips |
| `lib/session.ts` | `notConfidentIn(confidence, leaf)` (level "low", or "low-when" in the leaf's category) → threshold 1; `fundamentalLeaf(slipped)` (easiest by `EASE` that has a practice); `PracticePrompt.reason` gains `confidence`; the scripted run and deep-link fills are a confident student |
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

## Verified by

vitest (164 tests). CDP click-through: a confident student's Q1 slip passes and Q2's prompts
"two minutes on factorising? this is your second mistake on factorising…" with the overlay on the
monic problem and "factorising" on Q1's chips; a "depends on the skill · Algebra" student's Q1
slip prompts "you've made a mistake with factorising. you told me you don't feel confident…".
`tsc --noEmit`, `eslint`, `next build`.
