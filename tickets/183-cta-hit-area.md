# 183: Every Continue, Submit and Send answers a press up to 12 px outside its pill

**What to build:** The primary action in a screen's bottom-right corner (CONTINUE on the overview and the goal screen, Submit on the check-in, Send on the diagnostic and the report, send on the warm-up chat and the help chat, Continue on the create screen) fires from a press or a finger tap that lands up to 12 px outside the visible pill on any side. Nothing on screen changes: the pill is the same size in the same place, the zone is invisible, and the click handler stays on the button itself, not on a child. Where a send sits 8 px from its textarea the zone stops at the gap, so the textarea's edge is still the textarea.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), from a review of the demo: "Fix the primary-CTA click reliability (Continue, Submit, Send) … If 'Continue' doesn't fire on a normal tap/click without landing dead-center, that's not a polish nit — it reads as the whole app being broken. Concretely: increase the hit target padding well beyond the visible pill (at least 8–12px on all sides), make sure the click handler is on the outer element not a child span/icon, and test with a fingertip-sized touch target (44×44pt minimum)"; then "let's implement this idea -- the extra padding around the button itself. 12px around each 'continue' or 'submit' or 'send' button -- the ones in the bottom right".

## Solution

- `components/ui.tsx`: `Button` takes `hit`. With it the button is `relative` and draws a `::before` (`absolute`, `-inset-3`, empty content): a transparent 12 px band around the pill on every side that belongs to the button for hit-testing, so a press there is a click on the button (its own `onClick`, its own `disabled`). Nothing is laid out differently: the pseudo-element is absolute, the pill's classes are untouched. `::after` stays the pulse ring's (`.pulse-loop`, `.pulse-once`).
- The eight buttons carry `hit`: `OverviewScreen` CONTINUE (the pulsing one; its own `relative` is now the prop's), `GoalScreen` CONTINUE, `ConfidenceScreen` Submit, `DiagnosticModal` Send (now `data-send`), `ReportScreen` "Send to …" (now `data-send`), `WarmupChatScreen` send and `HelpChat` send (both with `before:-left-2`: the textarea is 8 px to their left, so the zone stops at the gap), `CreateAssignment` Continue.
- Side fix seen on the way: the create screen's focused ghost tile clipped its placeholder ("…or drop a picture or" with "PDF" cut off). `QuestionTile`'s grow-wrap mirror now takes the placeholder while the text is empty, so the box is as tall as the placeholder's two lines.
- Docs: this ticket, `architecture/183-cta-hit-area.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] On each of the eight buttons the computed `::before` is `position: absolute` with `-12px` on every side (`-8px` on the left for the two chat sends), `content: ""`
- [x] `elementFromPoint` 11 px beyond every side and 8 px past the corners is the button; 13 px beyond (plus one screen pixel where the teacher's 0.72 zoom snaps the edge) is not
- [x] The pill has not moved: the overview's ends on its row's right edge, the goal's sits 40 × 20 px inside its frame, the report's is the textarea's width, the diagnostic's 32 px inside its card, the create bar's on the bar's right edge, each chat send 8 px right of its textarea; the pulse ring's `::after` is still there
- [x] A real press (`Input.dispatchMouseEvent`) 8 px right of / below / above the pill fires the action on every screen (overview → goal, goal → next, warm-up sends and clears the draft, report shows "Sent to", diagnostic closes, help chat clears the draft, create opens the review); a finger tap (`Input.dispatchTouchEvent`) 8 px past Submit's top-right corner submits; every target is at least 44 × 44 CSS px
- [x] The chat sends: 5 px left of the pill (in the gap) is the button, the textarea's right edge is still the textarea
- [x] The focused ghost tile's placeholder is not clipped (the textarea's scrollHeight fits its clientHeight)
- [x] vitest (512), eslint, tsc, `next build`, `check:laptop` (16); click-through `hit183.mjs` (57 checks)
