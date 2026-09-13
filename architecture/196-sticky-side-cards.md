# 196: Class View's Pathway and live cards stay near the top as the teacher scrolls

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | Class View. The side column's cards above the key are one `sticky top-12` group; the key's `sticky bottom-12` sits on a wrapper div; `useSideColumnPins` turns either pin off when the scroll region can't fit both. |
| `tickets/196-sticky-side-cards.md` | The ticket. |

## How it connects

```
 TeacherChrome
 └─ main [data-teacher-scroll]  (overflow-y-auto) ◄──────────── both pins' scroller
    └─ grid 1fr | 320px
       ├─ roster Card (table, sticky header row top-0)
       └─ side column  flex-col gap-6  (stretched to the roster's height)
          ├─ [data-side-top]  sticky top-12 z-10        live set only
          │    WholeClassCard? · Pathway · GroupProgress · WholeClassCard? · Diagnostic
          └─ flex-1 box, justify-end
             └─ key wrapper  sticky bottom-12  ─► Card ─► StatusKey

 useSideColumnPins(topRef, keyRef, finished)
   ResizeObserver(scroller, top group, key)
     fits both?  48 + top + 24 + key + 48 <= scroller.clientHeight   (layout px)
       yes ─► both sticky
       no  ─► top group static; key sticky if 48 + key <= clientHeight, else static
```
