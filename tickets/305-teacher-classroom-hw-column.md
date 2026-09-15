# 305: Homework as a column beside the teacher's Past

**What to build:** the teacher's Classroom drops the homework cards from Past. The set cards narrow and a homework column sits to their right: one cell per homework, spanning exactly the rows of the Past sets it covers, reading the homework's name, due date and the class's count ("14/20 done"), or "sent · opens after Problem Set 6" while it waits.

**Blocked by:** none

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), with a screenshot of the teacher's Classroom after ticket 291: "you didn't accomplish the 'homeworks as column' idea, representing what psets it covered."

Ticket 290 built the column on Sam's iPad; ticket 291 put homework on the teacher's Classroom as separate cards interleaved in Past ("Sam missed it", "Sam completed it on time"), which does not show which sets a homework covers.

## Decisions (agreed with the user, 2026-09-15)

- The homework cards leave Past. Set cards narrow by about 230 px, keeping their arrow and due date inside the card; a homework column sits to their right, one cell per homework spanning its covered sets' rows (top of the first card to bottom of the last): HW1 beside PS1–PS2, HW2 beside PS3–PS4, HW3 beside PS5.
- The column exists only beside Past (Sam's side's rule): while PS6 is Live, HW3 spans PS5 alone; once PS6 moves to Past, PS5+PS6. A Past set no homework covers gets an empty space the column's width.
- Cell: "Homework 2", "due Mon 7 Sep", and a class count only ("14/20 done"): no caution triangle, no missed count, no Sam-specific status. A sent homework not yet open reads "sent · opens after Problem Set 6" (ticket 292's open state). An open homework before its due date shows its count so far.
- Cells are not pressable (a teacher homework results view is already in FUTURE_FEATURES).
- "Done" = completed by the due date. The other nineteen students' Homework 1 and 2 records are authored as named demo data following each student's arc; Sam's stays as is. Homework 3 before its due date: 0/20.
- FUTURE_FEATURES: counting late finishers in the teacher's count.
- Laptop fit: 1280×800 and 1440×900 with no horizontal scroll; long titles (PS4) must not overflow.

## Solution

- **Class data** (`data/homeworks.ts`): `CLASS_HOMEWORK_STORY`, every student's Homework 1 and 2 finishing day, Sam's record his `SAM_HOMEWORK_STORY`. Liam (hands in about half) misses both; Grace (starts late) and Tomas (work ends early) finish late or not at all; Jordan finishes Homework 2 a day late; Oliver (drops on the factorising sets) misses Homework 2; everyone who hands in every set is on time. Homework 1: 17/20; Homework 2: 14/20.
- **Count** (`lib/homeworks.ts`): `homeworkDoneCount(hw, records, today)` counts a student who finished by the due date and by today; late never counts.
- **Column** (`lib/classroomCards.ts`): `teacherHomeworkColumn(past, c)` runs ticket 290's `homeworkColumn` over the Past cards and `classHomeworks(c)`, and reads each homework's state (`sent` / `open` / `over`), `opensAfter` from `futureHomeworks`, and the count. It replaces `homeworkCards`, `pastWithHomework`, `coveredSetsPhrase` and `samHomeworkStatus`.
- **Screen** (`app/teacher/Classroom.tsx`): Live and Past are one grid template, cards `minmax(0,1fr)` and a 214 px column with a 16 px gap, so every card is one width and the arrows line up; the column fills Past's second column. A cell is a plain div: the name in the display face, the due date, then "14/20 done" (the cards' count style), or, sent, a dashed border, muted name and "sent · opens after Problem Set 6" over two lines. The cell's type and padding fit one card's height, so a one-set cell never grows its row.

## Acceptance

- [x] Unit tests: class records for all twenty following the arcs, counts (late does not count, so far before the due date), column spans on the teacher side (fresh, HW3 sent, PS6 Live, PS6 in Past with HW3 open, PS6 in Past with no homework), the sent state, no student status on a cell
- [x] No homework cards left in Past; the column beside Past only
- [x] Cell top/bottom equal to the covered cards' rects; HW3 beside PS5, then PS6+PS5 after activity completed
- [x] "sent · opens after Problem Set 6" while HW3 waits; counts 17/20, 14/20, 0/20
- [x] Card arrows still open their sets; cells ignore presses and take no focus
- [x] 1280×800 and 1440×900: no horizontal scroll, titles clear of the due dates, status lines on one row, cells' words inside, every card one width and height
- [x] Sam's iPad column (ticket 290) unchanged
- [x] vitest, eslint, tsc, next build, check:laptop; click-through against a production build
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features, README
