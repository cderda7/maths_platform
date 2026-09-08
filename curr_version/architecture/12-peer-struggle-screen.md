# 12 · Peer-struggle screen for a mastery-level student (Tier 2)

Routes: `/student?stage=report&run=strong` (a run where every step held) shows the entry card;
"Show me →" opens the `peers` stage. The weak run's report shows no entry.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Stage` gains `peers` |
| `lib/session.ts` | `strongSession()` (the model solution for every problem, confident); `sessionAt(stage, run)` takes `run = "weak" | "strong"`; actions `peers/open`, `peers/close` |
| `lib/store.ts` | `useStudentSession(initStage, explicit, run)` |
| `app/student/page.tsx` | Parses `&run=strong` |
| `lib/peers.ts` | `peerStruggles()`: per subskill how many classmates are developing or a gap; the two most-missed problems with a pattern-level clue; counts only. `isMastery(session)`: at least one secure subskill and none developing or a gap |
| `lib/peers.test.ts` | Counts (Q3 3, Q2 2; roots 4, factorising 2), no names or lines in the output, mastery on the strong run only |
| `app/student/screens/PeerScreen.tsx` | Skills with bars ("n of 6"), the two commonly-missed problems with "what tends to go wrong", back to the report |
| `app/student/screens/ReportScreen.tsx` | Mastery entry card when `isMastery`; rows tightened so the strong run fits the frame |
| `app/student/StudentApp.tsx`, `app/teacher/TeacherLive.tsx` | Stage wired; teacher stage word "Reading class patterns" |
| `components/ui.tsx` | `Card` now forwards extra props (data attributes) |

## How it connects

```
 /student?stage=report&run=strong ─▶ sessionAt("report","strong") = strongSession()
        │
        ▼
 ReportScreen ── isMastery(session) ──▶ entry card ── peers/open ──▶ PeerScreen ── peers/close ──▶ report
                                                                       │
                                     CLASSMATES (statuses, wrong) ──▶ peerStruggles() ──▶ counts + EVALUATION clue
                                     (no attempts, no names cross this line)
```

## Verified by

vitest (48 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP run: the weak
run's report has no entry card; the strong run's does, with all seen subskills secure and zero
overflow in the report column; "Show me" lists five skills and two problems; back returns to the
report with the card still there.
