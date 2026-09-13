# 199: The Mistakes tab's force submit a size larger

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/ForceSubmit.tsx` | The force submit control; its `inline` face (Mistakes tab) is now 13.5 px with wider padding. |
| `tickets/199-force-submit-larger.md` | The ticket. |

## How it connects

```
 ForceSubmit.tsx
   inline = false ──► TeacherLive (Class View, beside the Pathway pill)   12 px   px-2.5 py-1
   inline = true  ──► TeacherMistakes title row                           13.5 px px-3 py-1
                        [indiv working] 18/20 done [force submit] ─┐
                                                                   └─ right edge on the cards' (ticket 195)
```
