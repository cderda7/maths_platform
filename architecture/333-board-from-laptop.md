# 333: The board is launched from the teacher's laptop

## Files touched

| File | What it does |
| --- | --- |
| `lib/boardPresence.ts` | New, pure. `BOARD_CHANNEL`, `BEAT_MS` / `GONE_MS` / `SETTLE_MS`, `PULSES` / `PULSE_MS` / `CUE_MS`, `BOARD_WINDOW`; `boardOpen(seen, now)` (any heartbeat within 2.5 s); `boardMoments(classroom)` (`whole-class` while projecting, `group` while running, `diagnostic@<pushedAt>` per push); `cues(before, after, open)` (a moment new since the last look, no board, never on the first look); `projectorScreen(screens, current)` (another screen, the non-primary first) and `placement(screen)` (popup features sized to its available area); `FALLBACK_FEATURES`. |
| `lib/boardPresence.test.ts` | New. Open and closed by heartbeat age; moments for every stage, each push, withdrawn, done; when a cue fires and when it never does; screen choice with one, two and three screens; the features string. |
| `lib/boardPresence-store.ts` | New, client. Module state (survives client navigation): heartbeats seen, "press again", the live cue (cleared after `CUE_MS` or when a board opens), the last moments seen. `usePresence()` (`unknown` → `open` / `closed`), `presentBoard()` (a board up: `focus()` the window this page opened, else ask boards on the channel; Window Management granted or prompted: place on the projector, `again` if the open was blocked; otherwise the ordinary window), `useBoardBeat()` (the board's side). |
| `app/teacher/PresentBoard.tsx` | New. The header pill: closed ("Present board", screen icon, `.board-cue` while a cue lives, keyed by the cue so each restarts), open ("● Board open", `bg-secure` dot), unknown (the closed pill, invisible and disabled, so nothing moves). |
| `app/teacher/TeacherChrome.tsx` | The pill before the teacher's name in the right cluster, on every teacher page. |
| `app/globals.css` | `@keyframes board-cue`, `.board-cue` (800 ms × 3, accent ring on its own box-shadow; reduced motion a halo). |
| `app/board/FullscreenButton.tsx` | New. `useSyncExternalStore` over `fullscreenchange` and whether the page is framed; tries fullscreen on load outside a frame; the button only in a window of its own and not fullscreen. |
| `app/board/SmartBoard.tsx` | `useBoardBeat()`; the header is `justify-between` with the Fullscreen button at its right. |
| `app/page.tsx` | The board card: "The board", opened from the laptop with Present board, "Demo shortcut: open the board →". |
| `tickets/333-…`, `tickets/259-…`, `ASSUMPTIONS.md`, `specs/spec2.md` (story 60), `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `ARCHITECTURE.md`, `README.md` | Docs. |

## How it connects

```
  LAPTOP (every /teacher page)                              PROJECTOR (second display)
 ┌ TeacherChrome header ───────────────────────────┐       ┌ /board  SmartBoard ─────────────────┐
 │ Edexia · tabs          [▭ Present board] Ms O MO│       │ Edexia · 11 Methods   [⛶ Fullscreen]│
 └──────────────────────────────┬──────────────────┘       │ blank · race · slide · diagnostic   │
                 PresentBoard   │ usePresence()            └───────────────▲─────────┬───────────┘
                                ▼                                          │         │ useBoardBeat()
 ┌ lib/boardPresence-store.ts (module state, client) ─────────────┐        │         │ beat / 1 s,
 │ seen: Map<boardId, lastBeat>   again   cue {id, at}  moments   │◀───────┼─────────┘ gone on pagehide,
 │                                                                │  BroadcastChannel  answers "ask",
 │ presentBoard() ─┬─ board open ── opened.focus() / post "focus" │  edexia-maths-demo/board
 │                 ├─ getScreenDetails ─ projectorScreen ─ placement ──▶ window.open("/board",
 │                 │                    (blocked → again)         │        "edexia-board", sized)
 │                 └─ else ───────────────── FALLBACK_FEATURES ──────▶ window.open (drag it)
 │                                                                │
 │ subscribeClassroom ─▶ boardMoments(c) ─▶ cues(before, after,   │
 │                                               boardOpen(seen)) │
 └───────────────────────────────▲────────────────────────────────┘
                                 │ classroom store (localStorage + BroadcastChannel)
     wc/project (Project) · group/start (student tab) · diagnostic/push (Mistakes)
                                 │
                        lib/boardPresence.ts (pure: boardOpen, boardMoments, cues,
                                              projectorScreen, placement)

  /split: the board pane's iframe beats on the same channel, so the teacher pane reads ● Board open
          and nothing pulses; FullscreenButton hides itself inside a frame.
```
