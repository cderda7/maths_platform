# 06 · Confidence check-in

Commit `a2f4d1a`. Route `/student/check-in`. Standalone version of the check-in that also lives
inside the working flow (04).

## Files touched

| File | Role |
|---|---|
| `app/student/check-in/page.tsx` | Thin server wrapper. |
| `app/student/check-in/CheckInScreen.tsx` | Client component. Before-problem confidence + reason chips, after-problem easier/about/harder, then a calibration sentence built from `JORDAN_CHECKINS`. |

## How it connects

```
┌──────────────────────────┐   ┌────────────────────────────────────┐
│ check-in/page.tsx        │──▶│ check-in/CheckInScreen.tsx (client)│
└──────────────────────────┘   └──┬──────────────────┬──────────────┘
                                  │ data             │ components
                                  ▼                  ▼
                      problems.ts PROBLEM_MAP   ConfidenceCheck  ◀── shared with WorkFlow (04)
                      teacher.ts  JORDAN_CHECKINS   M · DifficultyTag · StatusDot
                      types.ts    Confidence        Card Button Eyebrow H2

   JORDAN_CHECKINS also feeds ──▶ StudentDetail (10)
```
