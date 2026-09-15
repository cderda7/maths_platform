# 307: Homework cells on Sam's Classroom show their due and submitted dates, not a note

## Files touched

| File | What it does |
| --- | --- |
| `lib/homeworks.ts` | `HomeworkColumnPiece.submitted`: the record's finishing day, null while undone. The two note strings removed. |
| `lib/homeworkList.ts` | `missedNote` removed; the carry-over pipeline is unchanged. |
| `app/student/StudentClassroom.tsx` | `HomeworkColumn`: "HW2 missing" / "HW1 completed", then "due …" and "submitted …" when handed in; the session no longer passed down. Bottom padding `pb-20`, as the homework screen. |
| `lib/homeworks.test.ts` | `submitted` on the demo column; a late hand-in stays missed with its date. |
| `lib/homeworkGate.test.ts`, `lib/homeworkSkips.test.ts`, `lib/homeworkList.test.ts` | Note assertions removed, the rest kept. |

## How it connects

```
 data/homeworks.ts  SAM_HOMEWORK_STORY { hw-1: finishedOn "Mon 31 Aug", hw-2: null }
        │
        ▼
 lib/homeworks.ts  homeworkColumn(cards, homeworks, records, today)
        │            piece { status, due, submitted ◄307, row, span … }
        │
        ├──────────────────────────────────────────────┐
        ▼                                              ▼
 app/student/StudentClassroom.tsx  HomeworkColumn   lib/classroomCards.ts teacherHomeworkColumn (305)
   missed    ─▶ ⚠ HW2 missing / due Mon 7 Sep ◄307     reads status/row/span only, class counts
   completed ─▶ ✓ HW1 completed / due … / submitted … ◄307
   open      ─▶ HW3 · due … (unchanged)

 lib/homeworkList.ts  missedBefore ─▶ leftovers ─▶ carryOver ─▶ homeworkList   (unchanged; missedNote removed ◄307)
```
