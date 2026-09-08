# 02 · Pre-assignment skill list, practice offer, confidence survey

Route: `/student` (stages `overview` → `practice` → `confidence` → `working`). Deep links:
`/student?stage=practice`, `/student?stage=confidence`, `/student?stage=working`.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | Adds `Confidence` (three spec'd answers), `Stage` (the nine screens of the loop), `PracticeProblem` |
| `data/assignment.ts` | Adds `PRACTICE`, the factorising warm-up with four labelled steps |
| `lib/session.ts` | `StudentSession` + `sessionReducer` (practice accept/decline/finish, confidence/set, goto, reset) and `sessionAt(stage)` for deep links |
| `lib/session.test.ts` | vitest: decline → confidence, accept → practice → confidence, confidence kept and starts the set, deep links fill earlier answers |
| `app/student/page.tsx` | Server page: parses `?stage=` and hands `initStage` to the client app |
| `app/student/StudentApp.tsx` | Client: `useReducer(sessionReducer)`, renders one screen per stage inside `IpadStage` + `StudentChrome` |
| `app/student/screens/OverviewScreen.tsx` | Ticket 01's overview, now with the warm-up offer card: "Warm up first" / "Start the set" |
| `app/student/screens/PracticeScreen.tsx` | The warm-up: problem, reveal-a-step-at-a-time worked solution, "Got it" / "Skip to the set" |
| `app/student/screens/ConfidenceScreen.tsx` | Three options; "low confidence when …" expands a subskill picker; submit disabled until complete |
| `app/student/screens/WorkingScreen.tsx` | Q1 header, the confidence echo, and an empty working area for ticket 03 |

## How it connects

```
 /student?stage=…  page.tsx (server) ──init──▶ StudentApp.tsx (client)
                                                  │ useReducer(sessionReducer, sessionAt(initStage))
                                                  │
                    ┌─────────────────────────────┼──────────────────────────────┐
                    ▼                             ▼                              ▼
          OverviewScreen               PracticeScreen               ConfidenceScreen ──▶ WorkingScreen
      "Warm up first" ──practice/accept──▶ "Got it" ──practice/finish──▶ submit ──confidence/set──▶ (03 fills)
      "Start the set" ──practice/decline───────────────────────────────▶

 lib/session.ts   StudentSession { stage, practice, confidence }   ← pure, unit-tested
 data/            PRACTICE (warm-up) · PREREQ_IDS (subskill picker) · ASSIGNMENT
```

## Verified by

vitest (4 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, headless-Chrome screenshots of
each deep-linked stage, and a CDP-driven click-through: warm up → reveal all four steps → got it →
"low confidence when" → Factorising → Start Q1, asserting the working screen echoes the choice.
