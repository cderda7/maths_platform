# 250: An absent student is greyed out, leaves the counts and leaves their group for the day

## Files touched

| File | What it does |
| --- | --- |
| `data/absences.ts` (new) | `DEMO_ABSENCES`: simulation data, who is away before the teacher says otherwise (Chloe on Problem Set 6). |
| `lib/absence.ts` (new, + test) | The rules: `absentOf(c, set)` (the classroom's list, else the demo's), `liveAbsent`, `withAbsence` (idempotent), `canMarkAbsent` (every row but live Sam on the live set), `presentOf`, `presentCount`, `presentGroups` (seats kept, absent left out). |
| `lib/classroom.ts` | `ClassroomState.absences` by set id; `absence/set` (refuses live Sam on the live set); the chain reducer gets the live set's absent list. Reset drops the list, so the demo's returns. |
| `lib/assignments.ts` | `AssignmentBundle.absent`; `classSize(b)`; `submittedCount` leaves the absent out of both sides; a finished set's stage totals use `classSize`. |
| `lib/readiness.ts` | The gate counts and waits for the class in the room: absent classmates never arrive, `total` is the present count, the start is the last present arrival. |
| `lib/classStage.ts` | The Pathway card's done/total over the present: working skips absent submitters, group caps at the present count. |
| `lib/diagnosticChain.ts`, `lib/diagnostic.ts` | `closedAt`, `isRevealed`, `forceDeadline`, `chainReducer`, `tally`, `pickersAt` take `absent`: an absent student answers nothing, `n/19 answered`, the step closes on the last present answer. |
| `lib/mistakes.ts` | `MistakeSet.absent`: no rows for an absent student, out of `right` and `pending`, so right + wrong + skipped + pending = the class present. |
| `lib/examples.ts` | `candidatesFor`, `struggleCount`, `problemsByStruggle` take `absent`: class review's "n/m struggled" and its example picker skip the absent. |
| `lib/group.ts` | `reviewProblemsOf(session)` and `recordReviewProblems(record)`: a member's problems for the union are wrong ones and started-but-incomplete ones, never unattempted; `groupPlan(session, absent)` drops an absent groupmate. |
| `lib/standings.ts` | Group review runs on `presentGroups(set groups, liveAbsent)`; `wrongOf` reads the union rule above. |
| `lib/demo.ts`, `lib/board.ts` | Skips and the board pass the live set's absent list to `groupPlan`, `problemsByStruggle`, `candidatesFor`, `tally`. |
| `app/teacher/TeacherLive.tsx` | The roster: an absent row's contents at 40 % grayscale (nothing moves), an "absent" pill in the progress pill's place, a dash for no hand-in instead of the missing caution; "mark absent" / "mark present" under the name, a row button shown with the stack. |
| `app/teacher/TeacherMistakes.tsx` | `n/19 correct`, `n/19 skipped` over `classSize`. |
| `app/teacher/DiagnosticCard.tsx`, `DiagnosticPush.tsx`, `components/DiagnosticControl.tsx`, `app/student/screens/DiagnosticModal.tsx`, `app/student/StudentApp.tsx` | Pass `liveAbsent(classroom)` to the chain's tally, reveal and countdown; the student app to `groupPlan`. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | The set's absent list into the struggled counts and examples. |
| `app/teacher/groups/SeatingBoard.tsx`, `TeacherGroups.tsx` | A set's Groups tab: an absent chip greyed with "absent" in its seat, the count "3 · 1 absent"; the uneven flag stays about the seating. |
| `components/ui.tsx` | `Avatar` takes a `className` (the fade). |
| `data/story.ts`, `lib/classStory.ts`, `data/story.test.ts`, `specs/class-story.md` | A story cell can be `absent`; Chloe's PS6 cells are; the sheet has an Absent column and "absent" in handed in; the one-step rule skips absent. |
| `lib/*.test.ts` | Counts over nineteen on PS6; the fourteenths race (Sam's unfinished Q9); amber as three; the gate; the union rule. |

## How it connects

```
 data/absences.ts  DEMO_ABSENCES { pset-6: [chloe] }
        │ (no entry in the classroom)
        ▼
 lib/classroom.ts  ClassroomState.absences[set]  ◄── absence/set ◄── TeacherLive row toggle
        │                                                         "mark absent / mark present"
        ▼
 lib/absence.ts  absentOf(c, set) · liveAbsent(c) · presentCount · presentGroups
        │
        ├──► lib/assignments.ts  bundle.absent · classSize(b) · submittedCount
        │        ├──► TeacherLive roster (greyed row, "absent" pill)
        │        ├──► TeacherMistakes  n/19 correct · n/19 skipped  ◄── lib/mistakes (no rows, not right/pending)
        │        ├──► lib/classroomCards  Classroom card "19/19 submitted"
        │        ├──► WholeClassSetup  "n/m struggled"  ◄── lib/examples (candidatesFor, absent)
        │        └──► SeatingBoard (Groups tab)  "3 · 1 absent", chip greyed in its seat
        │
        ├──► lib/readiness.ts   gate: total 19, waits for the present only ──► classStage (indiv review n/19)
        ├──► lib/classStage.ts  Pathway card / Mistakes stage "n/19 done"
        ├──► lib/standings.ts   presentGroups ──► GroupProgressCard, board race: amber = Mia, Noah, Ethan
        ├──► lib/group.ts       groupPlan(session, absent) ──► group/begin (StudentApp, demo skips)
        │        └── union rule: wrong ∪ started-but-incomplete, never unattempted
        └──► lib/diagnosticChain + lib/diagnostic  closedAt / tally(absent)
                 ├──► DiagnosticCard, DiagnosticPush flyout  "18/19 answered"
                 ├──► DiagnosticControl (force submit / next step), DiagnosticModal (reveal)
                 └──► lib/board.ts  SmartBoard "n/19 answered"

 data/story.ts  chloe PS6 cells = absent ──► lib/classStory.ts ──► specs/class-story.md (Absent column)
```
