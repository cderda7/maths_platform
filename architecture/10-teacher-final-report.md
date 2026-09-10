# 10 · Teacher final report

Route: `/teacher/report`. Reached from the Report tab or the "Open report →" link on the live row
once the student has sent their reflection.

## Files touched

| File | What it does |
|---|---|
| `lib/report.ts` | `reportFacts(session)`: slipped/total, reworked problems, practice and help entries as sentences, caution list, confidence sentence, starred labels. `confidenceSentence`. Shared by both sides so the text is identical |
| `lib/report.test.ts` | The scripted reworked run's facts |
| `app/student/screens/ReportScreen.tsx` | "What happened" now reads from `reportFacts` |
| `app/teacher/TeacherChrome.tsx` | Now a client component with tabs (Class, Report) highlighted by pathname |
| `app/teacher/report/page.tsx` → `TeacherReport.tsx` | Two columns: the six subskills with the same dots, words and one-line meanings as the student's report; "What happened" (confidence, slips, rework, practices, caution as a fact); "Starred by Sam"; right, the reflection as a large serif quote, or a dashed "hasn't sent yet" card. Reads the shared session in 2 s batches |
| `app/teacher/TeacherLive.tsx` | "Open report →" on the live row once sent; Set column reads "handed in" for every stage after working |

## How it connects

```
 session (shared store) ──▶ subskillStatuses ──▶ TeacherReport left column   ═══ same function ═══ ReportScreen (09)
                        ──▶ reportFacts      ──▶ "What happened" / "Starred"  ═══ same function ═══ ReportScreen (09)
                        ──▶ reflection · reportSent ──▶ "In their words" quote (or pending card)
 TeacherLive row ── reportSent ──▶ "Open report →" ──▶ /teacher/report
 TeacherChrome tabs: Class (/teacher) · Report (/teacher/report)   (Mistakes arrives in 11)
```

## Verified by

vitest (43 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a two-tab CDP run: the
teacher report shows the pending card; the student types a three-sentence reflection and sends;
within a batch the teacher report shows the quote and the six statuses (secure, developing,
secure, gap, not seen yet ×2), matching the student's; the class view row reads "Report sent ·
Open report →". Screenshot at 1440×1000.
