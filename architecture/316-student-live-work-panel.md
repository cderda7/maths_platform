# 316: Pressing a name on Where students are shows that student's work so far

## Files touched

| File | What it does |
| --- | --- |
| `lib/studentWork.ts` | New, no React. `workFromPlace(place, problems, lines, confidence)`: the questions moved past (before the question the place is on; every question once handed in; none before the questions) with their lines, and the question the student is on. `studentWorkAt(set, session, now, id, place)`: the same for one student on the live set, with Sam's lines and answer from his session and a classmate's from the part of their record the stream has reached (`classmatesAt`), their answer once past the check-in. |
| `lib/studentWork.test.ts` | New, 10 tests: every kind of place, Finn on Q4, every classmate at every 5 s of the stream, Tomas in the warm-up, Liam's hand-in, Sam from his session. |
| `lib/report.ts` | `NO_CONFIDENCE` ("—") and `confidenceTone(label)`, the Class view's colour for a confidence label, beside `confidenceLabel`. |
| `lib/whereStudents.ts` | `WherePill.place`: the place a pill stands for, which the panel reads. |
| `app/teacher/diagnosticFlyout.ts` | The overlay store gains `student`: `setStudentOpen(id | null)` and `useOpenStudent()`. One overlay at a time: opening a student closes the diagnostic and opening a diagnostic closes the student. |
| `app/teacher/diagnosticFlyout.test.ts` | The two stores' `toEqual`s carry `student`; one test for the one-overlay rule. |
| `app/teacher/StudentWorkPanel.tsx` | New. The panel: avatar, name, "Confidence" and the answer (`confidenceTone`), then each question moved past (`ProblemQuestion` and `WorkLines` at 125%), then the question on with `ProgressPill`, or "No questions yet". Its max height is measured to the scroll region's foot (a style write), and the questions scroll inside it. It closes on Escape (focus back on the pill) and on a press outside that is not a pill. |
| `app/teacher/ProgressPill.tsx` | New. The roster's "Q4 in progress" pill (purple dot), shared. |
| `app/teacher/TeacherLive.tsx` | The Class view's roster draws `ProgressPill` and colours confidence with `confidenceTone`. It looks the same as before. |
| `app/teacher/WhereStudentsAre.tsx` | `StudentPill` as a button: hover lift, focus ring, `aria-expanded`, and the accent ring while open. `PlaceTable` takes `open`. |
| `app/teacher/TeacherMistakes.tsx` | The split passes `onPress` (`setStudentOpen`, toggling on the open student) and `open` to `PlaceTable`. The overlay slot shows the diagnostic, or else the open student's `StudentWorkPanel`, not while the chain view has the page. The card's "expand" sits at the header's right on the split and shows on hover or keyboard focus within (`group-has-[:focus-visible]`). |

## How it connects

```
 lib/place.ts (314) classPlaces ──▶ lib/whereStudents.ts (315) whereRows ──▶ WherePill { id, name, initials, …, place ◄316 }
                                                                                 │
 app/teacher/TeacherMistakes.tsx  split                                          │
   useWhereRows ─▶ rows ─▶ PlaceTable { onPress, open } ─▶ StudentPill (button) ─┘ press
                                                                    │
                                                                    ▼
                          app/teacher/diagnosticFlyout.ts   { open: problem | null, student: id | null } ◄316
                            setStudentOpen(id) ── closes ──▶ open            setFlyoutOpen(p) ── closes ──▶ student
                            useOpenStudent() ─────┐                          useOpenFlyout() ─────┐
                                                  ▼                                               ▼
 StageSplit overlay slot (over the left, below the headers):  StudentWorkPanel ◄316   or   DiagnosticOverlay (315)
                                                  │
                  lib/studentWork.ts ◄316  studentWorkAt(set, session, now, id, pill.place)
                    ├ Sam:       sessionEvidence(session).lines · confidenceLabel(session.confidence)
                    ├ classmate: classmatesAt(set, session, now) record ─▶ classmateEvidence(record).lines · record.confidence
                    └ workFromPlace ─▶ { confidence, moved: [{ problem, lines }], on }
                                                  │
                                                  ▼
   head: Avatar · name · Confidence  confidenceTone (lib/report.ts, shared with TeacherLive's Confidence column)
   each moved:  ProblemQuestion · WorkLines (components/HierarchyDrill, the report's; red lines + MisconceptionChip)
   on:          ProblemQuestion · ProgressPill (app/teacher/ProgressPill, shared with TeacherLive's roster)
```
