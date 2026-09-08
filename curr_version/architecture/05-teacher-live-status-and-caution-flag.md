# 05 · Teacher live subskill status and caution flag

Routes: `/teacher` (client view, batched every 3 s), `/student` (now on the shared store).
Open them in two tabs of the same browser; "Reset the demo" on either side restarts both.

## Files touched

| File | What it does |
|---|---|
| `lib/store.ts` | The shared demo session: in-memory per tab, mirrored to localStorage, announced over a BroadcastChannel. `dispatch`, `setSession`, `resetSession`; `useStudentSession(initStage, explicit)` for the iPad tab; `useBatchedSession(everyMs)` and `useNow()` for the teacher tab, both as external stores (no setState-in-effect) |
| `lib/status.ts` | `subskillStatuses(session)`: unseen / secure / developing / gap from how each recognised line held; a subskill under caution is a gap. `problemsStarted` |
| `lib/status.test.ts` | Fresh session all unseen; a clean Q1 makes algebra, factorising and roots secure; the scripted run makes factorising a gap and algebra developing; caution forces a gap |
| `data/classmates.ts` | Six static classmates (statuses, confidence, progress, wrong-problem sets, notes) so the live row sits in a class; three are the mock review group for ticket 08 |
| `app/student/StudentApp.tsx`, `app/student/page.tsx` | State moved from a local reducer to the store; an explicit `?stage=` starts a fresh run at that stage, plain `/student` continues the stored one |
| `app/teacher/page.tsx` → `TeacherLive.tsx` | "Where the class is": live row (name, live badge, caution pill, what they're doing now, a dot per subskill, confidence, progress), static classmates, legend with the refresh cadence; "Worth a look" card with the red caution; "so far" card listing practice offers and help requests as facts |
| `app/teacher/TeacherChrome.tsx` | Teacher top bar with Reset |
| `components/ResetDemo.tsx` | Reset control, also on the entry page |
| `DECISION_LOG.md` | Cross-tab session mechanism |

## How it connects

```
 tab A · /student (iPad)                       lib/store.ts                         tab B · /teacher
 ┌────────────────────────┐    dispatch(action)  ┌──────────────────────┐            ┌──────────────────────────┐
 │ StudentApp             │ ───────────────────▶ │ sessionReducer       │            │ TeacherLive              │
 │  useStudentSession()   │ ◀── useSyncExternal──│ current (in-memory)  │            │  useBatchedSession(3s)   │
 │  screens dispatch      │                      │  ├─ localStorage KEY │──storage──▶│   every 3 s: getSnapshot │
 └────────────────────────┘                      │  └─ BroadcastChannel │──message──▶│   └▶ subskillStatuses()  │
                                                 └──────────────────────┘            │      problemsStarted()   │
   ?stage=working (explicit) ─▶ setSession(sessionAt(stage))                         │      escalation.caution  │
   /student (plain)          ─▶ continue stored, or INITIAL_SESSION                  │      practices[] · stage │
   Reset (either tab)        ─▶ setSession(INITIAL_SESSION) → both tabs restart      └──────────────────────────┘
```

## Verified by

vitest (28 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a two-tab CDP run
(both tabs created in the same browser context): two bursts on Q1 → within one batch the teacher
row reads "On Q1 · low: factorising · 1/4" with algebra secure and factorising a gap; Q2 slip →
prompt declined → help → factorising → accepted → the teacher row shows the caution pill,
"Practising factorising", and the "Worth a look" card; Reset on the teacher tab returns the
student tab to the overview. Screenshots at 1440×1000.
