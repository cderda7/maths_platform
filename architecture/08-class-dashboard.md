# 08 · Class dashboard

Commit `cf7f5f2`. Route `/teacher`.

## Files touched

| File | Role |
|---|---|
| `app/teacher/page.tsx` | Server component. Roster grid of `STUDENTS` × `PREREQ_IDS` showing `GapStatus` per prerequisite subskill, plus `CLASS_PATTERNS` (e.g. "5 of 12 guessed a factor pair without expanding back"). Each row links to student detail. |

## How it connects

```
┌──────────────────────┐
│ app/teacher/page.tsx │
└──┬──────────┬────────┘
   │ data     │ components
   ▼          ▼
 students.ts  STUDENTS ──────────────┐   Avatar StatusDot SubskillChip
 subskills.ts PREREQ_IDS, SUBSKILL_MAP│   Card Eyebrow H1
 problems.ts  ASSIGNMENT              │
 teacher.ts   CLASS_PATTERNS          │
 types.ts     GapStatus               │
                                      ▼
            grid: student.subskills[prereqId] ──▶ StatusDot(secure|developing|gap|unseen)
   links out ──▶ /teacher/students/[id] (10) · /teacher/assignments/new (09)
```
