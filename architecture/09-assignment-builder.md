# 09 · Assignment creation

Commit `a05e9ec`. Route `/teacher/assignments/new`.

## Files touched

| File | Role |
|---|---|
| `app/teacher/assignments/new/page.tsx` | Thin server wrapper. |
| `app/teacher/assignments/new/NewAssignment.tsx` | Client component. Pick problems from `PROBLEMS`, see the auto-generated subskill breakdown, and read why each problem received its QCE difficulty tag. |

## How it connects

```
┌──────────────────────────────┐   ┌────────────────────────────────────────┐
│ assignments/new/page.tsx     │──▶│ assignments/new/NewAssignment.tsx (client)│
└──────────────────────────────┘   │  state: selected problem ids           │
                                   └──┬──────────────────┬──────────────────┘
                                      │ data             │ components
                                      ▼                  ▼
                        problems.ts  PROBLEMS, PROBLEM_MAP   M · DifficultyTag · SubskillChip
                        subskills.ts SUBSKILL_MAP            Card Button Eyebrow H1

   selected ──▶ union of problem.subskill + problem.prereqs ──▶ breakdown chips
   problem.difficultyWhy ──▶ "why this tag" line · problem.stumble ──▶ "where students slip" line
```
