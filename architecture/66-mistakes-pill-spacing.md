# 66 · Mistakes view: more room between the student's name and the slip pill

Route: `/teacher/mistakes`. Builds on ticket 64.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/mistakes/TeacherMistakes.tsx` | The student tile's bottom padding is `pb-3.5` (was `pb-1.5`), so the slip pill row starts 14px below the name |

## How it connects

```
   app/teacher/mistakes/TeacherMistakes.tsx   grid row 1 / row 2 (unchanged structure from ticket 63)
   ┌──────────────────────────────────────────────┐
   │ row 1  tile  <button px-5 pt-4 pb-3.5>       │   ◀── was pb-1.5
   │              Avatar  Name  LIVE              │
   │              ────── 14px ──────              │
   │ row 2  pill  <div pr-5 pb-4 pl-16>           │   unchanged
   │              ( slip name ────────────── )    │
   └──────────────────────────────────────────────┘
```

## Verified by

vitest (281 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on port 3143
measured Q4 on `/teacher/mistakes` at 1600px: the name's bottom edge at 780px and the pill's top at 795px,
a 14px gap (6px before). The screenshot was checked by eye.
