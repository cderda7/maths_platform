# 31 · Practice sent to the fundamental skill, in the student's words; confidence recorded for the teacher

Route: `/student` (stage `working`, the practice prompt). Live path: overview → "start" →
"Not confident" or "Depends on the skill · Algebra" → Start Q1 → a slip on Q1.

## Files touched

| File | What it does |
|---|---|
| `lib/escalation.ts` | `recordMistake(state, group, leaf?)`: second instance triggers, for everyone; `slips` per group (leaves slipped on since the last practice, first first); a trigger returns `slipped` and resets the group's slips |
| `lib/session.ts` | `fundamentalLeaf(slipped)` (easiest by `EASE` that has a practice); `DEMO_CONFIDENCE` (the demo student: not confident in factorising, shown to the teacher, no effect on practice) for the scripted run and deep links; `hydrateSession` maps an old category answer to no skills named |
| `data/types.ts` | `Confidence` "low-when" carries `leaves: LeafId[]` (up to seven of the set's skills) instead of a category |
| `lib/hierarchy.ts` | `relevantSkills(problems, n = 7)`: the moves ranked by how many problems invoke them |
| `app/student/screens/ConfidenceScreen.tsx` | Three lowercase answers: "confident", "not confident with…" over the seven most relevant skills stacked as an always-visible tick list (any number; ticking one selects that answer), and "not confident" overall; student names, lowercase |
| `lib/report.ts`, `app/teacher/TeacherLive.tsx` | Confidence copy names the skills ("low: monic factorising, non-monic factorising") |
| `data/taxonomy.ts` | `studentLeafName` (monic → "Factorising" / "factorising"); `groupWord` (the plain word for a group in a sentence) |
| `components/Tag.tsx` | `LeafChip student` switches to the student-facing name; the teacher's chips are unchanged |
| `app/student/screens/PracticePrompt.tsx` | `PromptModal`: no eyebrow, "two minutes on {skill}?" lowercase, "this is your second mistake on {group}…"; picker and overlay chip use student names |
| Overview, WarmupPick, Peers, PracticeScreen, WorkingScreen, PracticeCard, PracticePad, ProblemCard, `lib/warmup.ts`, `lib/feedback.ts` | Student-facing names |
| `lib/escalation.test.ts`, `lib/session.test.ts`, `lib/report.test.ts`, `lib/feedback.test.ts` | The slipped leaves; the scripted run practises monic at Q2; every confidence answer leaves the first mistake unprompted; report and feedback copy |

## How it connects

```
 line/reveal (wrong) ──▶ slipped = tag.leaf ──▶ recordMistake(escalation, groupOf(slipped), slipped)
                            counts[g] += 1 · slips[g] += slipped
                            counts[g] ≥ 2 ──▶ trigger: entries[g] += 1 (2nd → caution) · returns slipped[g] · resets counts, slips
                     ──▶ prompt = { leaf: fundamentalLeaf(slipped) = easiest with a practice, reason: "detected" }

 PromptModal: "two minutes on {studentLeafName(leaf).short}?"
   "this is your second mistake on {groupWord(group)}. let's do a short problem to review."
   Yes ──▶ prompt/accept ──▶ PracticeOverlay (ticket 29)

 ConfidenceScreen ──▶ confidence/set { level, leaves? } ──▶ TeacherLive "low: …" · report "Confidence low when … comes up"   (never read by the counter)
```

## Demo consequence

The scripted student answers "not confident with factorising". The teacher's live view shows
"low: monic factorising" and the report "Confidence low when monic factorising comes up"; the
run itself is unchanged: Q1's slip passes, Q2's prompts practice on monic, no caution.

## Verified by

vitest (171 tests). CDP click-through: whatever the confidence answer, Q1's slip passes and Q2's
prompts "two minutes on factorising? this is your second mistake on factorising…" with the
overlay on the monic problem.
`tsc --noEmit`, `eslint`, `next build`.
