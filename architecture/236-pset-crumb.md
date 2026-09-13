# 236: The student header reads PSET 6

## Files touched

| File | What it does |
| --- | --- |
| `lib/crumbTitle.ts` | `crumbTitle`: "PROBLEM SET N — …" → "PSET N — …" for the header crumb; other titles unchanged. |
| `lib/crumbTitle.test.ts` | Pins the live set, Set 1, mixed case and a non-matching title. |
| `app/student/StudentApp.tsx` | Passes `crumbTitle(title)` to `StudentChrome` as the crumb. |
| `tickets/236-pset-crumb.md` | The ticket. |

## How it connects

```
 classroom store  assignment.title  "PROBLEM SET 6 — ROOTS OF A QUADRATIC"
        │ useAssignment()
        ▼
 StudentApp.tsx ── crumbTitle(title) ◄236 ──►  "PSET 6 — ROOTS OF A QUADRATIC"
        │ crumb
        ▼
 StudentChrome.tsx  header
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ Edexia · 11 Methods   PSET 6 — ROOTS OF A QUADRATIC   [pathway]  Sam (SO) │
   │                       └ truncate kept as a fallback ┘                    │
   └──────────────────────────────────────────────────────────────────────────┘

 unchanged, still the full title:
   OverviewScreen h1 · HistoryScreen eyebrow · every /teacher screen
```
