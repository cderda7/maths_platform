# 183 · Every Continue, Submit and Send answers a press up to 12 px outside its pill

Routes: `/student` (overview, goal, check-in, warm-up chat, practice help chat, diagnostic, report), `/teacher/assignments/create`.

## Files touched

| File | What it does |
|---|---|
| `components/ui.tsx` | `Button` takes `hit`: the button becomes `relative` and draws a `::before` (`absolute`, `-inset-3`, empty content), a transparent 12 px band around the pill that is part of the button for hit-testing. Nothing about the pill's own classes changes. |
| `app/student/screens/OverviewScreen.tsx` | CONTINUE (pulsing) carries `hit`; its own `relative` is now the prop's. |
| `app/student/screens/GoalScreen.tsx` | CONTINUE carries `hit`. |
| `app/student/screens/ConfidenceScreen.tsx` | Submit carries `hit` (the invisible placeholder in the offer state does not need one). |
| `app/student/screens/DiagnosticModal.tsx` | Send carries `hit` and `data-send`. |
| `app/student/screens/ReportScreen.tsx` | "Send to …" carries `hit` and `data-send`. |
| `app/student/screens/WarmupChatScreen.tsx` | send carries `hit` and `before:-left-2`: the textarea is 8 px to its left, so the zone stops at the gap. |
| `components/HelpChat.tsx` | send carries `hit` and `before:-left-2`, the same reason. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | The fixed bar's Continue carries `hit`. |
| `app/teacher/assignments/create/QuestionTile.tsx` | Side fix: the grow-wrap mirror takes the placeholder while the text is empty, so the focused ghost's two-line placeholder is not clipped. |

## How it connects

```
 Button({ hit })                                              components/ui.tsx
   hit → "relative before:absolute before:-inset-3 before:content-['']"
   (::after is still the pulse ring's: .pulse-loop / .pulse-once)

              ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ::before, transparent, 12 px beyond
              ╷        ╭───────────────────╮        ╷  the pill on every side; part of the
         12 → ╷   12 → │     CONTINUE      │ ← 12   ╷  button for hit-testing, so a press
              ╷        ╰───────────────────╯        ╷  here is button.onClick (and honours
              └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  disabled). Absolute: the pill's box,
                                ↑ 12                    place and neighbours are unchanged.

 Beside a textarea (warm-up chat, help chat): gap-2 = 8 px, so before:-left-2
   ┌──────────────────────────────┐   ┌ ─ ─ ─ ─ ─ ─ ┐
   │ textarea                     │←8→╷ ╭─────────╮ ╷   5 px left of the pill: the button
   │                              │   ╷ │  send   │ ╷   the textarea's right edge: the textarea
   └──────────────────────────────┘   ╷ ╰─────────╯ ╷
                                      └ ─ ─ ─ ─ ─ ─ ┘

 Where it is on
   /student  overview CONTINUE · goal CONTINUE · check-in Submit · diagnostic Send · report Send to …
             warm-up chat send · practice "I need help" → chat → send
   /teacher/assignments/create  the fixed bar's Continue (zoom 0.72: the band is 8.64 screen px,
             the edge snapped one pixel wider on the left and top)
```

## Verified by

vitest (512), eslint, tsc, `next build`, `check:laptop` against this build (16); `hit183.mjs` (session `8d38275a-…`'s scratchpad, app on 3401 / CDP 9701, 57 checks): on each of the eight buttons the computed `::before` (absolute, `-12px` a side, `-8px` left for the chat sends, empty content); `elementFromPoint` 11 px beyond every side and 8 px past two corners the button, 13 px beyond (plus a pixel of zoom snapping) not; the pill unmoved against its row, frame, card, bar or textarea; the pulse ring's `::after` still there; a real mouse press 8 px outside the pill firing every action (overview → goal, goal on, the warm-up draft sent, the report sent, the diagnostic answered, the help message sent, the review opened), a finger tap 8 px past Submit's top-right corner submitting; each target ≥ 44 × 44 CSS px; the chat gap the button, the textarea's edge the textarea; the focused ghost's placeholder unclipped. Screenshots (check-in, warm-up, diagnostic, help chat, overview, create, the focused ghost) read by eye.
