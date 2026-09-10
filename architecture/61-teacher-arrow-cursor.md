# 61 · Teacher side: the arrow cursor everywhere, never the hand

Routes: every `/teacher/**` screen.

## Files touched

| File | What it does |
|---|---|
| `app/globals.css` | New unlayered rule: everything under `[data-teacher-root]` computes to `cursor: default`; text inputs and textareas go back to `cursor: text`. Sits outside Tailwind's layers so it beats every `cursor-*` utility and the browser's pointer on `<a href>` |
| `app/teacher/TeacherLive.tsx` | Class-view row loses its `cursor-pointer` |
| `app/teacher/DiagnosticPush.tsx` | The "recorded" toggle label loses its `cursor-pointer` |
| `app/teacher/groups/TeacherGroups.tsx` | Group cards lose `cursor-grab` / `active:cursor-grabbing`; the move menu loses `cursor-pointer` |
| `app/teacher/assignments/new/PathwayMap.tsx` | The dead `cursor-default` toggle on an unclickable node is gone (the rule covers it) |

## How it connects

```
   app/teacher/TeacherChrome.tsx                       app/globals.css (unlayered, after @import "tailwindcss")
   ┌───────────────────────────────────────┐          ┌──────────────────────────────────────────────────┐
   │ <div data-teacher-root [zoom:0.8]>     │ ───────▶ │ [data-teacher-root], [data-teacher-root] *        │
   │   header: Brand · tabs (<a>) · New (<a>)│          │   { cursor: default }        ◀── wins over        │
   │   <main>{screen}</main>                │          │ [data-teacher-root] :is(input:not(check/radio/…),│
   │   ResetDemo                            │          │                         textarea, [contenteditable])│
   └───────────────────────────────────────┘          │   { cursor: text }                                │
          │ wraps every teacher screen                └──────────────────────────────────────────────────┘
          ▼                                                       ▲ loses to it
   TeacherLive · TeacherMistakes · TeacherGroups · TeacherReport   │
   NewAssignment · WholeClassSetup · TeacherCompare · BoardControls│
          │ render shared pieces                                  │
          ▼                                                       │
   components/ui.tsx Button (disabled:cursor-not-allowed) ────────┤  @layer utilities
   components/HierarchyDrill.tsx chips, HintCard (cursor-help) ───┤  (Tailwind cursor-* classes)
   UA stylesheet: a[href] { cursor: pointer } ────────────────────┘  (lower cascade origin)

   Student (/student), board (/board) and split (/split) screens have no data-teacher-root: unchanged.
```

## Verified by

vitest (280 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on port
3141 visited the nine teacher routes (with the class view's full breakdown opened) and read the computed
cursor of every element under `[data-teacher-root]`: 5,236 elements, all `default` except the two text
inputs on `/teacher/assignments/new` (`text`). Real mouse moves over a tab link, a student's row, "see dot
skills" and "New assignment" put `default` under the pointer. A negative control that injected a
`cursor: pointer !important` rule for links made the same audit report 24 offenders, so it does detect them.
