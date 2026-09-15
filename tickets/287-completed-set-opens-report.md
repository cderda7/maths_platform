# 287: A Completed set opens its student report

**What to build:** on Sam's Edexia Classroom (the iPad's landing), pressing a Completed card anywhere opens his own student report for that set, read-only, in the look he gets at the end of in-class work. Today Completed cards open nothing and any set other than the live one redirects back to the Classroom.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "student can't click into completed psets at all. change functionality so that clicking on an assignment brings them to their student report page, that they currently get in the ICW workflow."

Sam handed in all ten problems on Problem Sets 1–5 (`STORY.sam.done`), so all five are Completed; the Class View already shows his PS1–PS5 results from the story records. Only Problem Set 6 can be Missing (the lesson ends without his hand-in).

## Decisions (grilling session 2026-09-15)

- **Whole card pressable** (hover and press state), no OPEN button: the homework cells that tickets 290–292 add sit *outside* the card, to its right.
- **Read-only student report**: the ICW report screen's layout (outcome columns, Q tiles that open his marked working in the side column, skill dots, key). No Send. His **sent reflection** is shown as text where the reflection box was.
- **PS1–PS5** are built from the same story records the teacher's report and Class View read (outcomes, working versions, class review covered problems where the set had one). Write a short, plausible reflection for Sam on each of PS1–PS5 as separate named story data (in his voice, matching his arc: confident, scales part of an expression and leaves the rest).
- **PS6** once his report is sent opens the same read-only report (not the homework folder screen, which plays once right after sending).
- **Missing cards** stay unpressable (nothing handed in).
- A **back** control returns to the Classroom.
- No difficulty tags anywhere (student side).

## Acceptance

- [x] Pressing any Completed card (PS1–PS5, and PS6 after his report is sent) opens that set's read-only report; a deep link to it survives reload
- [x] The report's columns and tiles match the teacher's report of Sam on the same set (same problems in the same columns)
- [x] His reflection shows as sent text; no Send, nothing editable
- [x] Back returns to the Classroom; Missing cards and To do behaviour unchanged
- [x] Fits the iPad without horizontal scroll; no maths wide or split; no difficulty tags
- [x] vitest, eslint, tsc, next build, check:laptop; a click-through opening every Completed card
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features

## Solution

- `lib/studentReport.ts` (`studentReport`): the report's data for a set that is Completed for Sam, null otherwise. PS1–PS5 from his handed-in record (`AssignmentBundle.sam`), every review stage over, the recorded class review; PS6 from his session once the report is sent. The same functions the teacher's report calls (`recordReviews` / `sessionReviews`, `columnsOf`, `setClassReview`, `hierarchyFor`), so the columns match by construction; `lib/studentReport.test.ts` checks them against the teacher's computation on every set.
- `lib/studentClassroom.ts`: each card carries `href`, `studentReportHref(id)` (`/student/a/<id>/report`) on a Completed card, null on To do and Missing.
- `app/student/StudentClassroom.tsx`: a Completed card is one `button` filling the card (hover lifts it, press settles it, focus ring); To do and Missing cards unchanged. The lesson's pull to the live set moved into `app/student/useLessonPull.ts`, shared with the report.
- `app/student/screens/ReportLayout.tsx`: the report's layout split out of `ReportScreen` (skills, What happened, the side column's working and its closing rules); `ReportScreen` keeps the box, Send and its nudge.
- `app/student/a/[id]/report/page.tsx` + `app/student/CompletedReport.tsx`: the read-only report. "Your reflection" as text where the box was, "Sent to Ms Okafor" at the foot, "← Classroom" (and Escape) back, the set's crumb in the header, no pathway strip, no difficulty tags. Not Completed (stale link, Reset demo elsewhere): the Classroom.
- Sam's reflection is his record's `clarification`, the words the teacher reads under "In their words" (PS2–PS5 already had one; PS1 gains one in `data/pset1/classmates.ts`).
- `components/OutcomeTiles.tsx`, `lib/reportWork.ts` (`outcomeTemplate`): a column keeps its tiles on one row only while the card has room; PS1's ten right-first-time tiles beside four more columns had pushed Incorrect 21 px out of the card.

## Verification

- vitest 992, eslint, tsc, next build, check:laptop 74.
- Click-through `click287.mjs` 856/856 at 1280×800 and 1440×900 against a production build: the five Completed cards are whole-card buttons with no OPEN, hover changes the card; pressing each opens its report; no box, no Send, nothing editable, the reflection text and Sent; no difficulty tags; nothing to scroll either way; no maths split or past its pane; every tile's working opens in the side column (versions, maths inside, no tag); a press elsewhere and Escape close it; the deep link survives reload; the columns and tiles equal the teacher's report of Sam and the teacher reads the same reflection; ← Classroom and Escape return; unknown and not-Completed report links land on the Classroom; To do keeps CONTINUE and opens the set; a Missing PS6 has nothing to press; PS6 after Send is first under Completed and opens the same report (not the homework folder, which still plays at `/student/a/pset-6`), columns matching the teacher's.
- `rows287.mjs` 200/200: every teacher report (20 students × PS1–PS5, both sizes) keeps each column's tiles on one row with nothing past the card after the What happened change.
