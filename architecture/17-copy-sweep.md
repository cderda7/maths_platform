# 17 · Copy sweep to the rule

Routes: every student stage on `/student` and every teacher view under `/teacher`. No new routes,
no state or routing change. Spec: `specs/spec2.md`, "Copy rule".

## Files touched

| File | What changed |
|---|---|
| `app/student/screens/OverviewScreen.tsx` | Intro paragraph and prerequisite descriptions gone; "About" / "Leans on" / "Problems"; warm-up card is a question plus a `skill · not marked` label |
| `app/student/screens/PracticeScreen.tsx`, `PracticePrompt.tsx` | Headlines to "Quick warm-up", "One move", "Which skill?"; explanatory paragraphs cut to one line or removed; "Not marked" footers removed; help picker lists skill names only |
| `app/student/screens/ConfidenceScreen.tsx` | Three options are titles only ("Confident", "Depends on the skill", "Not confident"); intro paragraph removed |
| `app/student/screens/WorkingScreen.tsx` | Confidence reminder box removed; "Problems" strip; "Hand in"; shorter empty-state line in the transcription column |
| `app/student/screens/FeedbackScreen.tsx` | Summary is a count label; legend, "then a short group review", per-line "right move" note and the clue's explanation removed; star button carries its own hint |
| `app/student/screens/ReworkScreen.tsx` | "First attempt"; helper sentences removed; "Done" |
| `app/student/screens/GroupScreens.tsx` | Headlines "Quick pass" / "Discussion"; counts as labels; discussion prompts kept as the content |
| `app/student/screens/ReportScreen.tsx` | Per-status explanation lines and legend removed; facts as labels; reflection intro removed; sent state is one line |
| `app/student/screens/PeerScreen.tsx`, `HistoryScreen.tsx`, `DiagnosticModal.tsx` | Headlines shortened; explanatory paragraphs removed |
| `components/ReadAs.tsx`, `PracticeCard.tsx`, `ResetDemo.tsx` | "line by line" tag gone; "First step" / "Next step"; "Reset" |
| `app/teacher/TeacherLive.tsx` | Intro paragraph is a `title · due` label; dot legend and refresh sentence reduced to `every 3s · updated Ns ago`; caution and history cards use labels |
| `app/teacher/DiagnosticPush.tsx` | "why" line removed; "Push"; response is `Sam · B · right · recorded` |
| `app/teacher/groups/TeacherGroups.tsx`, `mistakes/TeacherMistakes.tsx`, `compare/TeacherCompare.tsx`, `report/TeacherReport.tsx` | Intro paragraphs removed; headlines two to four words; status explanation lines removed; empty states are two words |
| `lib/groups.ts`, `lib/report.ts` | The group note is `Q2, Q3 · factorising and algebra`; report facts are labels (`Practice · factorising · Q2 · taken`, `Confident before starting`) |
| `lib/groups.test.ts`, `lib/report.test.ts` | String assertions updated to the new copy; logic assertions unchanged |

## How it connects

```
 spec2.md "Copy rule"
   │  headlines 2–4 words · no sentence that doesn't change what the user does · labels over sentences
   │  ≤ 1 helper line per screen · no legends / "what this means"
   ▼
 every screen under app/student/screens and app/teacher  ──renders──▶  the same session, lib and data as before
   (text-producing lib functions groups.noteFor · report.confidenceSentence · report.practices trimmed to labels)

 Kept as content, by rule: the detective clue (student feedback and rework), the report's subskill
 summary, peer-struggle patterns, classmate notes on the live table, the three discussion prompts.
```

## Verified by

vitest (57 tests), `tsc --noEmit`, `eslint`, `next build`, and a CDP walk over all eleven student
stages (weak and strong runs) and the five teacher views: every `h1`/`h2` is two to four words
and the only remaining text over 70 characters is the content kept by rule above. Screenshots of
each screen were inspected for layout regressions after the cuts.
