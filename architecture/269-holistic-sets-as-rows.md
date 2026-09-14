# 269: Holistic grid, sets down and categories across

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/students/HolisticPage.tsx` | `Grid` draws a row per set (`SetHead` as the row head, the report link) and a column per category headed by `CategoryChip`; `SET_COL` 400 layout px; cells pad 12 px a side so each is one width, centred under its chip. |
| `components/Tag.tsx` | `CategoryChip`: a category's short name, uppercase on the light blue chip (accent when open), type set on itself at the roster head's computed values. |
| `app/teacher/TeacherLive.tsx` | The roster's category heads render `CategoryChip` (same look to the pixel; hover still hides it under the see-skills buttons). |
| `lib/holistic.ts` | `HolisticView.sets` / `categories` (`HolisticSet`, `HolisticCategory`), renamed from `columns` / `rows`. |
| `lib/holisticTiles.ts`, `lib/holistic.test.ts`, `lib/holisticTiles.test.ts` | Follow the rename. |
| `tickets/269-holistic-sets-as-rows.md` | The ticket. |

## How it connects

```
 data/story.ts ──► lib/holistic.ts holisticView(student, now)
                     │  sets:       [PS1 … PS6]                 ◄269 was columns
                     │  categories: [{category, cells[per set]}] ◄269 was rows
                     │  habits
                     ├──────────────► lib/holisticTiles.ts (strengths, habit tags)
                     ▼
 app/teacher/students/HolisticPage.tsx
   Grid ◄269
   ┌──────────────────┬──────────────┬──────────────┬─────┐
   │ SET              │ [ALGEBRA]    │ [FUNCTIONS]  │ …   │ ◄─ CategoryChip (components/Tag.tsx)
   ├──────────────────┼──────────────┼──────────────┼─────┤        ▲
   │ PS1 Tue 25 Aug   │   secure     │     —        │     │        │ same component
   │ Surds  ──────────┼──► /teacher/a/pset-1/report?student=…      │
   │ PS2 …            │   solid      │     —        │     │   app/teacher/TeacherLive.tsx
   └──────────────────┴──────────────┴──────────────┴─────┘   (Class View roster head)
   Habits (unchanged)
```
