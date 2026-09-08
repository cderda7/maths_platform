# 03 · Practice landing

Commit `4fb7e94`. Route `/student`.

## Files touched

| File | Role |
|---|---|
| `app/student/page.tsx` | Server component. Lists the assignment set in `ASSIGNMENT_ORDER`, tags each with difficulty, shows warm-ups mixed in, and a "4 of 10 done" completion count for the current student. |

## How it connects

```
┌──────────────────────┐
│ app/student/page.tsx │
└──┬──────────┬────────┘
   │          │
   │ data     │ components
   ▼          ▼
 problems.ts  ASSIGNMENT, ASSIGNMENT_ORDER, PROBLEM_MAP ──▶ M (Math.tsx)
 subskills.ts SUBSKILL_MAP ─────────────────────────────▶ SubskillChip
 students.ts  STUDENT_MAP ──────────────────────────────▶ StatusDot
                                                          DifficultyTag
                                                          Card Eyebrow H1
   links out ──▶ /student/work (04)
```
