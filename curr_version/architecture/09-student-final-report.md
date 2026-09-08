# 09 · Student final report and reflection

Route: `/student?stage=report` (scripted run, reworked, Q4 starred). "Finish group review" lands
here; "Send to Ms Okafor" marks the report sent.

## Files touched

| File | What it does |
|---|---|
| `lib/session.ts` | `reflection`, `reportSent`; actions `reflection/set`, `report/send` |
| `lib/session.test.ts` | Reflection kept, report marked sent, star carried through |
| `app/student/screens/ReportScreen.tsx` | Left: the six subskills with the same dot colours and words the teacher's table uses (`subskillStatuses`, `STATUS_WORD`), a one-line meaning per status, the legend; starred problems; "what happened" (slips, rework, practices). Right: the reflection textarea with a sentence count and an Optional label; send button → green "Sent" band, textarea locked |
| `app/student/StudentApp.tsx` | Report stage wired |
| `app/teacher/TeacherLive.tsx` | Stage word: "Writing their reflection" / "Report sent" |

## How it connects

```
 session ──▶ subskillStatuses(session) ──▶ ReportScreen (student)      ← same function, same colours →  TeacherLive row (05)
         ──▶ feedbackFor(session)      ──▶ "what happened" counts                                       TeacherReport (10)
         ──▶ stars · practices · rework ─▶ Starred / What happened cards
 textarea ──▶ reflection/set ──▶ session.reflection ──▶ report/send ──▶ session.reportSent ──▶ teacher report (10)
```

## Verified by

vitest (42 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP run on the deep
link: the six statuses read roots secure, algebra developing, fractions secure, factorising gap,
expansion and graphing not seen yet (matching the teacher-side derivation); typing a three-
sentence reflection shows "3 sentences"; Send shows the sent band. Screenshot fits the frame.
