# 306: A missed homework's cell on Sam's Classroom has a dark red border

## Files touched

| File | What it does |
| --- | --- |
| `app/student/StudentClassroom.tsx` | `HomeworkColumn`: the missed cell's border is `border-wrong-deep` instead of `border-line`; still 1 px, so nothing moves. |

## How it connects

```
 app/globals.css  --color-wrong-deep #9e2f27  (existing token)
        │
        ▼
 lib/homeworks.ts  homeworkColumn(cards, homeworks) ─▶ placement { kind, status: completed | missed | open … }
        │
        ▼
 app/student/StudentClassroom.tsx  HomeworkColumn
        ├─ completed ─▶ border-secure-line, green fill      (unchanged)
        ├─ missed    ─▶ border-wrong-deep ◄306, paper fill, CautionTriangle + HW2 + missedNote (lib/homeworkList)
        └─ upcoming / open ─▶ border-line                   (unchanged)
```
