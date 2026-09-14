# 247: Escape closes whatever was opened last, everywhere

**What to build:** Every popup, flyout and expanded view in the app, student side and teacher side, closes on Escape exactly as its own close would. One press closes the layer opened last, and the next press closes the one under it. Focus goes back to the button that opened it. The teacher's quick check on the student's iPad holds Escape: nothing closes while it is open.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "let's add esc button functionality throughout. any time there's a pop up that i can collapse or a view that i can collapse, want same functionality with esc keyboard button." Only three things closed on Escape: the student report's side-column working, the help picker, and the help menu with its stall notice. Each had its own window listener, none knew what else was open, and Escape under the teacher's quick check closed a help card hidden behind it.

Grilled to a shared design the same day. Every recommendation was taken, with the refinements noted:

1. One layer per press: the latest opened closes first.
2. Escape closes even with the cursor in a text box. The one exception is Create's Fix box: the first press clears the typed fix, the second closes the editor.
3. Hover-only text (hover descriptions, tooltips) is not a layer.
4. Both sides: the student's iPad and the teacher's laptop.
5. After Escape, focus returns to the opener.
6. Escape does exactly what the thing's own close or "no / go back" does: no confirm, nothing extra.
7. Things with no close of their own:
   - "2 minutes on X?": Escape is **Not now**.
   - The practice overlay: **Back to Qn**.
   - The hand-in check: **Return to** the lowest-numbered blank problem.
   - The notice toast: **✕**.
   - "Where the class is stuck": **← Report**.
   - "Your working": **← Report**, after its compare panel closes first.
   - The teacher's quick check: nothing, and nothing under it closes.
8. Mistakes view: several problems open at once close most recent first; an open Live diagnostic flyout closes before its problem.
9. Class View: the history stacks, then history mode, then the expanded row or column view. In practice, the reverse of the order they were opened.
10. The review pages' own filters and views count too: the teacher report's idea filter, "Your working"'s compare panel, and reopened earlier hint cards. The confidence screen's sub-options (an answer), split-view panes, the review wizard's Back and the board routes are not layers.
11. Bug fixed in the same ticket: a press inside the teacher's quick check, or on the demo's Skip to / Reset controls, no longer closes the student report's working.

## Solution

- `lib/escape.ts`: `createEscapeStack()`, a plain stack of layers `{ close | null, returnFocus }`.
  - `escape()` closes the top layer and returns its focus.
  - It holds (closes nothing) while any wall (`close: null`) is open. A wall is a whole-screen modal, so a layer opened after it still sits under it on screen.
  - `isEscapePress` skips an Escape a control already used (`defaultPrevented`: the reorder drag's cancel, the Fix box's clear) and one ending an IME composition.
- `components/useEscape.ts`:
  - One stack per window, with one bubble-phase keydown listener.
  - `useEscape(active, onEscape | null, focusAfter?)` pushes a layer while `active`. The close is read through a ref, so a new callback identity never re-orders the stack.
  - It records the focused element when the layer opens and focuses it after the close renders, or `focusAfter()` where the opener is re-created.
  - `<EscapeLayer>` covers per-item layers in a list.
- Student side:
  - `Scrim` (help picker, help menu, stall notice) uses the stack in place of its own listener. `PromptModal` → Not now. `PracticeOverlay` → Back to Qn.
  - `PracticePad`'s help chat closes, with focus to "I need help". `HintCard`: a reopened earlier hint, with a ref following the collapsed/expanded button.
  - `HandInCheck` → `onReturn(lowest blank index)`. `StudentApp`'s notice → `notice/dismiss`. `DiagnosticModal` is a wall.
  - `PeerScreen` and `HistoryScreen` → back; `HistoryScreen`'s compare → "Final only".
  - `ReportScreen`: the working via the stack; `KEEPS_WORK` adds `[data-diagnostic], [data-skip-to], [data-reset]`.
- Teacher side:
  - `TeacherLive`: three layers (drill or column view, history mode, history stacks). `HierarchyDrill`: its own picked skill's work.
  - `TeacherMistakes`: an `<EscapeLayer>` per open problem, closed without arming "close all". `DiagnosticPush`: the flyout, with focus to the re-created chip.
  - `TeacherReport`: the working and the idea filter as two layers. `ExamplePicker`: the menu.
  - `QuestionTile`: the editor, left as a click away would leave it. Moving focus between the text and its Fix box no longer closes the editor. A mouse press into the Fix box closed it before, so a fix could only be typed from the keyboard.

## Acceptance

- [x] Unit (`lib/escape.test.ts`, 9): empty stack; latest first, one per press, with focus; removal from the middle keeps order; a wall holds Escape until it goes, including over a layer opened after it; `isEscapePress` leaves other keys, used Escapes and IME
- [x] Click-through `esc247.mjs` (194 checks at 1280×800 and 1440×900; the quick check pushed and ended from a second tab, as the laptop does), which checks for each case what closed, what stayed, where focus went, that nothing moved, and that nothing scrolls sideways:
  - Student:
    - working: nothing open; help picker; help picker under the quick check, still held once answered, free once the teacher ends the chain; the overlay's help menu, then Back to Qn; prompt → Not now recorded as declined; hand-in check → Q1; notice
    - practice: help menu; chat closed while typing, focus to I need help; reopened hint closes, the latest never
    - report: the working, focus to the tile; demo strip and quick-check presses keep the working; Escape under the quick check closes nothing
    - peers and history: back, compare first
  - Teacher:
    - Class View: skill work, then drill; column view; stacks → history → drill
    - Mistakes: three problems in reverse order, no "close all"; diagnostic flyout, focus to its chip, then its problem
    - teacher report: working, then filter, with focus
    - whole-class setup: the picker menu, with focus
    - Create: text Escape closes the editor; a press into Fix keeps it open; Fix Escape clears, then closes
- [x] vitest 801 (after rebasing onto tickets 241–248), eslint, tsc, next build, check:laptop 62, sweep:hint-boxes 132
