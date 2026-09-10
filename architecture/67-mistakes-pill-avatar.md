# 67 · Mistakes view: the slip pill starts under the avatar, not the name

Route: `/teacher/mistakes`. Builds on ticket 66.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/mistakes/TeacherMistakes.tsx` | The slip-group cell's left padding is `pl-5` (was `pl-16`), matching the tile's `px-5`, so the pill's left edge sits on the avatar's |

## How it connects

```
   app/teacher/mistakes/TeacherMistakes.tsx   grid row 1 / row 2 (structure from ticket 63)
   ┌──────────────────────────────────────────────┐
   │ row 1  tile  <button px-5 …>                 │
   │              (AC) Amelia Chen                │
   │               ▲ avatar left edge             │
   │ row 2  pill  <div pl-5 pr-5 pb-4>            │   ◀── was pl-16 (pill began under the name)
   │              ( discriminant ───────────── )  │
   │               ▲ same x                       │
   └──────────────────────────────────────────────┘
```

## Verified by

vitest (281 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on port 3147
measured Q4, Q5 and Q10 at 1600px: in each of the four slip groups the pill's left edge equals the first
student's avatar left edge (180px, 180px, 499px, 180px) and the right edges are unchanged. The first
attempt on port 3143 read an old build because another process held that port; the rerun on a free port
is the one recorded here. The screenshot was checked by eye.
