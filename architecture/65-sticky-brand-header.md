# 65 · The Edexia bar stays put when the page scrolls, and the board gets one

Routes: every `/teacher/**` screen, every `/student` stage (unchanged, verified), `/board`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherChrome.tsx` | The header is now `sticky top-0 z-30`; its translucent paper background and blur were already there, so scrolled content slides under it |
| `app/board/SmartBoard.tsx` | Imports `Brand` and renders a `h-14 shrink-0` brand bar as the first child of the board's full-height flex column, above whichever stage view is showing |

## How it connects

```
   TEACHER (laptop, window scrolls)              STUDENT (iPad, window never scrolls)         BOARD (projector, h-screen)
   app/teacher/TeacherChrome.tsx                 app/student/StudentChrome.tsx                app/board/SmartBoard.tsx
   ┌─ div[data-teacher-root] zoom:0.8 ────┐      ┌─ IpadStage ▸ div.flex-col h-full ────┐     ┌─ div[data-board] flex-col h-screen ──┐
   │ ┌─ header sticky top-0 z-30 ───────┐ │      │  status strip (9:41 · signal · battery)│     │ ┌─ header h-14 shrink-0 [NEW] ──────┐ │
   │ │ <Brand/> Class Mistakes Groups   │ │      │ ┌─ header h-14 (not in the pane) ────┐ │     │ │ <Brand/>                          │ │
   │ │              New assignment  MO  │ │      │ │ <Brand/> · crumb        name  SO   │ │     │ └───────────────────────────────────┘ │
   │ └──────────────────────────────────┘ │      │ └────────────────────────────────────┘ │     │  Blank | Race | Slide  (as before,  │
   │  main …………………………………………………………… │      │ ┌─ div flex-1 min-h-0 overflow-y-auto ┐ │     │  their own per-stage headers below) │
   │  ↕ window.scrollY moves this,        │      │ │  the stage's screen scrolls here     │ │     │  Leaderboard / examples: flex-1     │
   │    the header pins to the viewport   │      │ │  ↕ pane.scrollTop; header untouched  │ │     │  min-h-0, so they give up 56px      │
   └──────────────────────────────────────┘      │ └──────────────────────────────────────┘ │     └──────────────────────────────────────┘
                                                 └────────────────────────────────────────┘
   components/Brand.tsx (unchanged)  ──▶  the one wordmark all three bars render
```

## Verified by

vitest (281 tests); eslint and tsc clean; `next build`. Headless Chrome on the built app (port 3142):
`/teacher/mistakes` and `/teacher` scrolled the window ~650px and the header's top edge stayed at 0
with the wordmark under the pointer (screenshot). All eleven student stages: every scrollable pane
(feedback and history have one) and the window were scrolled to the end; the header's top edge did not
move and `window.scrollY` stayed 0. `/board` in its default state renders the bar at the top, 56px tall,
with the leaderboard laid out beneath it (screenshot).
