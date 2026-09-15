# 290: HW column beside Completed (HW1 and HW2)

## Files touched

| File | What it does |
| --- | --- |
| `data/homeworks.ts` | `HomeworkDef` (`kind: "homework"`, id, n, name, due), `HOMEWORKS` (Homework 1 due Tue 1 Sep, Homework 2 due Mon 7 Sep), `HomeworkRecord` (`finishedOn`), `SAM_HOMEWORK_STORY` (Sam's simulation data: HW1 finished Mon 31 Aug, HW2 nothing). |
| `lib/homeworks.ts` | The homework model, pure: `homeworkForDue(due)` (the date rule: due on or after the previous homework's due date, before its own), `coveredSetIds`, `homeworkStatus(hw, record, today)` (completed / missed, final / open), `MISSED_NOTE`, `homeworkColumn(completedCards)` (cells with row and span, empty spaces for uncovered sets). |
| `lib/homeworks.test.ts` | Coverage by date (HW1 = PS1–2, HW2 = PS3–4, a Homework 3 = PS5–6, a set due on a homework's date is the next one's), Sam's statuses, missed is final, the column before and after PS6 is Completed, a homework with no Completed set has no cell. |
| `components/CautionTriangle.tsx` | The caution triangle drawing, extracted from the Class View's Missing mark. |
| `app/teacher/TeacherLive.tsx` | `Missing()` draws `CautionTriangle` (pixel-identical). |
| `app/student/StudentClassroom.tsx` | Content column 860 → 1066 px (cards keep 780); each section's cards in a two-column grid (cards, 190 px); Completed fills the second column with `HomeworkColumn`: completed cell (green check, "HW1 completed"), missed cell (triangle, "HW2", grey balanced note), open cell (muted "HWn · due …", unused until ticket 292), empty spaces. Cells are plain divs: no button, link, focus or hover. |
| `ASSUMPTIONS.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `ARCHITECTURE.md`, `tickets/290-…` | Docs. |

## How it connects

```
 data/story.ts STORY_SETS ──(due dates)──┐        data/homeworks.ts
 lib/assignments.ts bundles (b.due)      │        ┌────────────────────────────────┐
            │                            │        │ HOMEWORKS  hw-1 Tue 1 Sep       │
            ▼                            │        │            hw-2 Mon 7 Sep       │
 lib/studentClassroom.ts                 │        │ SAM_HOMEWORK_STORY (demo data)  │
   studentClassroom() ─▶ { todo, missing, completed: cards newest first }        │
            │                            │        │ lib/dueDate DEMO_TODAY (289)    │
            │                            ▼        └───────────────┬────────────────┘
            │                 lib/homeworks.ts ◄290               │
            │                   homeworkForDue(due)  [prev due, own due)
            │                   homeworkStatus(hw, record, today) ◀┘
            │                   homeworkColumn(completed) ─▶ pieces {row, span}
            ▼                            │
 app/student/StudentClassroom.tsx        ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Completed   grid: [ cards minmax(0,1fr) | 190 px ]  gap 16 × 8          │
 │  PS5 card (button ─▶ report, 287)  │ empty space                         │
 │  PS4 card                          │┌ HW2 ─ CautionTriangle ◄290 ────┐  │
 │  PS3 card                          │└ "problems added to next HW" ───┘  │
 │  PS2 card                          │┌ ✓ HW1 completed ───────────────┐  │
 │  PS1 card                          │└────────────────────────────────┘  │
 └──────────────────────────────────────────────────────────────────────────┘
                                         ▲
 components/CautionTriangle.tsx ◄290 ────┴──── app/teacher/TeacherLive.tsx Missing()
```

Tickets 291–294 build on this: 291 adds Homework 3 (created and sent, due date from the picker) to the homework list, so
`homeworkForDue` puts PS5 and PS6 under it; 292 opens it after the PS6 lesson (the open cell, the note's "current HW") and
freezes its contents; 293 lists a homework's own problems (ever wrong on `coveredSetIds`) and the teacher's 10; 294 carries a
missed homework's own problems into the next (`homeworkStatus` "missed").
