# 247: Escape closes whatever was opened last, everywhere

## Files touched

| File | What it does |
| --- | --- |
| `lib/escape.ts` | `createEscapeStack()`: layers `{ close \| null, returnFocus }` in open order. `escape()` closes the top one and returns its focus, and holds while a wall (`close: null`) is open. `isEscapePress` skips used Escapes (`defaultPrevented`) and IME composition. |
| `lib/escape.test.ts` | Order, one per press, removal from the middle, walls, key filtering. |
| `components/useEscape.ts` | The page's one stack and its window keydown listener (bubble phase). `useEscape(active, onEscape \| null, focusAfter?)` pushes a layer while active, reads the close through a ref, records the opener, and focuses it after the close renders. `<EscapeLayer>` is the same thing per list item. |
| `app/student/screens/PracticePrompt.tsx` | `Scrim` uses the stack (help picker, help menu, stall notice). `PromptModal` → Not now. `PracticeOverlay` → Back to Qn. |
| `components/PracticePad.tsx` | The help chat, with focus to "I need help". |
| `components/HintCard.tsx` | A reopened earlier hint; a ref follows its two buttons for focus. |
| `app/student/screens/HandInCheck.tsx` | → Return to the lowest-numbered blank problem. |
| `app/student/StudentApp.tsx` | The notice toast (`<EscapeLayer>`) → dismiss. |
| `app/student/screens/DiagnosticModal.tsx` | The teacher's quick check: a wall. |
| `app/student/screens/PeerScreen.tsx`, `HistoryScreen.tsx` | → ← Report; the compare panel → "Final only" first. |
| `app/student/screens/ReportScreen.tsx` | The side-column working via the stack; `KEEPS_WORK` also spares the quick check and the demo controls. |
| `app/teacher/TeacherLive.tsx` | Three layers: the drill or column view, history mode, and the history stacks. |
| `components/HierarchyDrill.tsx` | The drill's own picked skill's work. |
| `app/teacher/TeacherMistakes.tsx` | An `<EscapeLayer>` per open problem; closes without arming "close all". |
| `app/teacher/DiagnosticPush.tsx` | The flyout, with focus to the re-created chip. |
| `app/teacher/report/TeacherReport.tsx` | The working and the idea filter as two layers (its own keydown listener removed). |
| `app/teacher/whole-class/ExamplePicker.tsx` | The example menu. |
| `app/teacher/assignments/create/QuestionTile.tsx` | The tile editor; `leave(next)` keeps it open between the text and its Fix box. The Fix box's Escape clears first, then passes the key on. |
| `tickets/247-escape-closes.md` | The ticket. |

## How it connects

```
 keydown (window, bubble)
    │  skipped if defaultPrevented (useReorder's drag cancel, the Fix box clearing) or isComposing
    ▼
 components/useEscape.ts ◄247 ─── one stack per window ───► lib/escape.ts ◄247
    useEscape(active, onEscape|null, focusAfter?)             createEscapeStack()
      active ↑  push { close, returnFocus } (opener = activeElement)   escape():
      active ↓  pop (wherever it is)                                   any wall open → hold
    <EscapeLayer active onEscape/>  (list items)                       else top.close(); top.returnFocus()
    │                                                                      └ rAF: focusAfter() ?? opener
    │
    ├── student iPad ─────────────────────────────────────────────────────────────────────────────
    │     Scrim(onDismiss) ─ HelpPicker · HelpMenu · StallNotice        PromptModal ─► prompt/decline
    │     PracticeOverlay ─► overlay/done       PracticePad chat ─► close   HintCard reopened ─► toggle
    │     HandInCheck ─► hand-in/return(min blank)      StudentApp notice ─► notice/dismiss
    │     PeerScreen ─► peers/close      HistoryScreen ─► history/close, compare ─► "none"
    │     ReportScreen work ─► null   (KEEPS_WORK += quick check, Skip to, Reset)
    │     DiagnosticModal ═══ WALL (close: null) ═══  nothing closes while it is open
    │
    └── teacher laptop ───────────────────────────────────────────────────────────────────────────
          TeacherLive: [drill | column] ◄ [history mode] ◄ [history stacks]   (opened later = closed first)
             └ HierarchyDrill own skill work
          TeacherMistakes: <EscapeLayer> per open problem ◄ DiagnosticPush flyout (focus → new chip)
          TeacherReport: idea filter, working          ExamplePicker: menu
          QuestionTile: editor ─► blur / leave(null)
              textarea ⇄ [data-fix] focus moves keep the editor open (leave(next))
```
