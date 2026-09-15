# 317: The teacher's report marks a question answered after practice, and names the warm-up

## Files touched

| File | What it does |
| --- | --- |
| `lib/practiceMarks.ts` | New, pure. `PracticeMarks` (`questions`: per problem id the skills practised on it; `warmUp`: the warm-up's skills). `sessionPracticeMarks` (Sam: every accepted practice on its question, Q* reached or the older isolated practice; each warm-up skill whose steps began or that he moved past, once he took the warm-up), `classmatePracticeMarks` (a classmate: the warm-up and help segments of ticket 314's `classmateTimeline` reached by `elapsed`, or the whole story), `reportPracticeMarks` (none on a finished set; Sam from his session; a classmate on the stream's clock, the whole story before the set goes live and once the class has handed in, as `classPlaces` reads it), `afterPracticeText`, `warmUpText` (the report's short skill names, joined as the chat joins them). |
| `lib/practiceMarks.test.ts` | New. The four marked classmates and the five warm-ups from the story, nobody else; the stream's clock; finished sets; Sam's Q2, help left from Q*, declined, two skills on one question, the warm-up's skills; the words; practice never changes a score. |
| `lib/warmup.ts` | `joinSkills` exported (the chat's "a & b", "a, b, & c"); the chat's `amp` is it. |
| `lib/report.ts` | `reportFacts.practices` lists only offers declined; practice taken is a marker now. |
| `lib/report.test.ts` | The scripted run has no practice note; a declined offer is one. |
| `components/OutcomeTiles.tsx` | `marked` (per problem id, the marker's words): a marked tile carries `PRACTICE_DOT` over its top right corner (absolute, so the tile keeps its size) and the words in its name and tooltip. `PRACTICE_DOT` exported. The student's report passes nothing. |
| `app/teacher/report/TeacherReport.tsx` | Reads `reportPracticeMarks`; What happened's line gains the warm-up after the confidence answer and "● Q2 after practice"; the opened question's header shows the marker beside the result (`data-after-practice`, one line, the header's height unchanged). |
| ticket, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 Sam's iPad (unchanged)                           data/stream.ts (ticket 314)
 lib/session.ts                                   warmUpSkills · help
  practices[] { leaf, problem, accepted, steps }        │
  practice "taken" · warmup.phases · warmup.done        ▼
        │                                         lib/place.ts classmateTimeline
        │                                           warmup(leaf, step) · question(practice leaf)
        ▼                                                │  segments at ≤ streamElapsed (live set)
 ┌──────────────────────── lib/practiceMarks.ts (pure) ───┴──────────────────────┐
 │ sessionPracticeMarks        classmatePracticeMarks        reportPracticeMarks │
 │   → { questions: { q2: [non-monic] }, warmUp: [monic] }   (finished set: none)│
 │ afterPracticeText → "after practice on non-monic factorising"                 │
 │ warmUpText        → "Warmed up on fractions & non-monic factorising"          │
 └───────────────────────────────┬───────────────────────────────────────────────┘
                                 ▼
 app/teacher/report/TeacherReport.tsx   /teacher/a/pset-6/report?student=<id>
 ┌ What happened ── Confidence low when … · Warmed up on … · ● Q2 after practice ┐
 │ Correct first try      Correct after individual review          Incorrect    │
 │ [Q4][Q5]               [Q1][Q2•][Q3]      ◀── OutcomeTiles marked (dot only)  │
 └───────────────────────────────────────────────────────────────────────────────┘
 ┌ working (a tile pressed) ─────────────────────────────────────────────────────┐
 │ CORRECT AFTER INDIVIDUAL REVIEW  after practice on non-monic factorising      │
 │ Q2  Solve for x. 2x² + 7x − 4 = 0                                             │
 └───────────────────────────────────────────────────────────────────────────────┘

 lib/setScore.ts (unchanged): first submission only; practice never reaches it (test)
```
