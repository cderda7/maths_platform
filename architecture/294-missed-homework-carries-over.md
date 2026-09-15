# 294: A missed homework's leftovers carry, without duplicates

## Files touched

| File | What it does |
| --- | --- |
| `lib/homeworkList.ts` | Adds `missedBefore` (the homework just before, if Sam missed it), `leftovers` (its own ever-wrong problems with their similar problems, newest set first; none if finished late; never its teacher's ten), `carryOver` (drops a leftover whose skill this homework's own problems or a newer leftover already hold), and `missedNote` (moved from `lib/homeworks.ts`, now reading the session: "current HW" only when something carried, null otherwise). `OwnProblem` carries its `skill`. `homeworkList` groups own sets then the missed homework's. |
| `lib/problemSkill.ts` | `primarySkill(problemId)`: Problem Sets 1–4 from the story outline's first leaf, Problem Sets 5–6 from `data/problem-skills.ts`. |
| `data/problem-skills.ts` | One skill per Problem Set 5 and 6 problem, chosen by the outline's conventions. |
| `data/homework-similar-ps4.ts`, `data/homework-similar-ps3.ts` | Similar problems for every Sam leftover: PS4 Q1, Q2, Q7, Q8, Q10 and PS3 Q8. |
| `lib/homework.ts` | `similarFor` reads Problem Sets 6, 5, 4 and 3. |
| `lib/homeworks.ts` | `missedNote` removed (moved); the note strings stay. |
| `app/student/StudentClassroom.tsx` | HW2's cell passes the session to `missedNote` and renders no note line when it is null. |
| `data/pset4/classmates.ts`, `data/pset4/evaluation.ts`, `data/story.ts`, `specs/class-story.md` | Sam's Problem Set 4 Q10: the right split, `(2w + 7)(w − 5) = 0`, widths and sentence built on it; his algebra pattern Q1, Q2, Q10; group review solves it at sky; Jordan's and Liam's review lines; his reflection. Sheet regenerated. |
| `lib/homeworkList.test.ts`, `lib/homeworkGate.test.ts`, `lib/homeworkSkips.test.ts`, `data/pset4/pset4.test.ts` | Carry-over, dedupe, all-dropped note, one skill per problem, the new similar problems' shapes and maths; Sam's PS4 record. |

## How it connects

```
 data/homeworks.ts  HW1 done, HW2 missed (SAM_HOMEWORK_STORY)        data/story.ts outline ──┐
 classroom store    HW3 sent + opened, frozen setIds [pset-5, pset-6]  data/problem-skills.ts ─┤
                                     │                                                        ▼
                                     ▼                                            lib/problemSkill.ts
 lib/homeworkList.ts  homeworkList(hw-3, classroom, session)                      primarySkill(id)
   │                                                                                      │
   ├─ ownSets(hw-3) ─► ownProblems ─────────────────────── mine  (PS6 Q1 Q2 Q3 Q7 Q10, PS5 Q4 Q6 Q9)
   │                     everWrongOn + similarFor + skill ◄─────────────────────────────────┘
   │
   ├─ missedBefore(hw-3) = hw-2 ─► leftovers ───────────── left  (PS4 Q1 Q2 Q7 Q8 Q10, PS3 Q8)
   │                                 ownSets(hw-2) → ownProblems         similarFor ◄ data/homework-similar-ps4.ts
   │                                                                                ◄ data/homework-similar-ps3.ts
   ├─ carryOver(left, mine) ───────────────────────────── carried (PS4 Q10: worded problems)
   │     skill held by mine, or by a newer leftover  → dropped
   │
   ├─ groupBySet([...own sets, ...hw-2 sets], [...mine, ...carried])  PS6, PS5, PS4 (PS3 empty, omitted)
   └─ everyone  SentHomework.questions (never compared, never carried)
                                     │
             ┌───────────────────────┴──────────────────────────┐
             ▼                                                  ▼
 app/student/HomeworkScreen.tsx (unchanged)          app/student/StudentClassroom.tsx
 FROM YOUR MISTAKES                                   HW2 cell: missedNote(hw-2, classroom, session)
   Problem Set 6   1–5                                  ┌──────────────────────┐
   Problem Set 5   6–8                                  │ ⚠ HW2                │  "problems added to current HW"
   Problem Set 4   9  rectangle, area 36                │ problems added to    │   only when carryOver kept one;
 EVERYONE          10–19                                │ current HW           │  no note line at all when none
                                                        └──────────────────────┘
```
