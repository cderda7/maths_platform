# 126 · The category pill's corners follow the header chip

Routes: `/teacher`, `/teacher/report`, `/student?stage=report` (wherever a category pill is drawn).

## Files touched

| File | What it does |
|---|---|
| `components/Tag.tsx` | `PILL_SIZE` = `h-[13px] w-[28px] rounded`; `StatusDot` adds `rounded-full` only when the shape is a dot or the caller sized it in `px`. |
| `app/teacher/TeacherLive.tsx` | The category cell's button: `rounded-md` hover area and ring around the pill. |
| `components/SkillColumns.tsx` | The student row's wrapper: `rounded-md`. |

## How it connects

```
 header chip  rounded-md (6 px) on ~22 px ──┐  same proportion
                                            ▼
 StatusDot shape="pill" ──▶ PILL_SIZE: 28 × 13, rounded (4 px) ──▶ inside a rounded-md h-7 w-10 button / wrapper
 StatusDot shape="dot"  ──▶ rounded-full, as before (groups, skills, chips, key)
```

## Verified by

vitest (390), eslint, tsc, `next build`; `corners.mjs` (port 3161 / CDP 9461): the computed radii (chip 6 px on 21.7 px, pill 4 px on 13 × 28) and a 2× crop of the grid's top-left with a clicked category's ring.
