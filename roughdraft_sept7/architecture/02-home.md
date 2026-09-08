# 02 · Home / role picker

Commit `d6b7841`. Route `/`.

## Files touched

| File | Role |
|---|---|
| `app/page.tsx` | Server component. Two `Link` cards (student / teacher), brief framing of the topic, sample difficulty tags. |

## How it connects

```
┌────────────────┐   Link /student   ┌──────────────────┐
│ app/page.tsx   │──────────────────▶│ app/student/     │  (03)
│  role picker   │   Link /teacher   ├──────────────────┤
│                │──────────────────▶│ app/teacher/     │  (08)
└───────┬────────┘                   └──────────────────┘
        │ uses
        ▼
  ui.tsx Card Eyebrow · Tag.tsx DifficultyTag
```
No data imports. Pure navigation surface.
