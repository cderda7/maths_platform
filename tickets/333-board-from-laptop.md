# 333: The board is launched from the teacher's laptop

**What to build:** the teacher opens the board once at the start of the lesson from a **Present board** pill in the teacher header, which puts `/board` on the projector (the laptop's second display). The header reads **● Board open** while a board is up, and pulses three times when the class reaches a moment the board is for with no board open. Built from ticket 259, which was skipped and grilled here.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 259 (planning, 2026-09-14): "we need to think through like how the board projection actually gets launched from the teacher side, bc rn i treat it like a separate 3rd device when that's not true — it would be launched from the laptop." Carson, 2026-09-15: "ticket 259 got skipped on accident. let's talk about implementing it."

Settled with Carson in the grilling the same day:

- **When:** opened once at the start of the lesson and left up (not on demand at Project).
- **What it shows:** unchanged. Dynamic only in group review, class review and a live diagnostic; otherwise today's blank board exactly as it is (the header, the class, the set's title).
- **How:** Chrome/Edge place the board on the second screen (Window Management API) after a one-time permission; other browsers, or the permission refused, get an ordinary window the teacher drags there.
- **One press, a title bar:** no browser lets a page open another window straight into fullscreen (fullscreen popups were abandoned; automatic fullscreen is enterprise-policy only), so Present opens the board sized to the projector with a thin title bar. The board tries fullscreen on load (works where a school's policy allows) and shows a small Fullscreen button while not fullscreen, never in `/split`'s pane.
- **Permission:** asked on the first press; if the prompt used up the press, the pill reads "Press again to present".
- **The pill:** right of the header, just before the teacher's name, on every teacher page. "Present board" (soft indigo, a screen icon) or "● Board open" (quiet, green dot; a press brings the board forward, never a second board). Known from a heartbeat every open `/board` sends, never stored.
- **The pulse:** three pulses, no prompt, when Project is pressed, group review starts or a diagnostic goes out, only while no board is open, only at that moment (never on a reload).
- **Deferred (FUTURE_FEATURES):** no projector found, a projector disconnecting mid-lesson; ASSUMPTIONS gains "the laptop and the board stay connected".
- **Demo:** the landing page keeps its board link, labelled a demo shortcut; `/split` is untouched (its board pane beats, so the teacher pane reads Board open).

## Solution

- `lib/boardPresence.ts` (pure): `boardOpen(seen, now)` over the heartbeats; `boardMoments(classroom)` (class review projecting, group review running, each diagnostic push) and `cues(before, after, open)` (a new moment, no board, never on the first look); `projectorScreen(screens, current)` and `placement(screen)` for Present.
- `lib/boardPresence-store.ts` (client): module state that survives client navigation. The laptop listens on `edexia-maths-demo/board`, asks at once, holds "unknown" for 300 ms, watches the classroom store for cues (each lives for the three pulses); `presentBoard()` brings a board forward, or places / opens one; `useBoardBeat()` is the board's side (beat each second, answer asks, `gone` on pagehide).
- `app/teacher/PresentBoard.tsx` in `TeacherChrome`'s right cluster; `.board-cue` in `app/globals.css` (800 ms × 3).
- `app/board/FullscreenButton.tsx` in the board header; `SmartBoard` beats.
- `app/page.tsx`: the board card reads as a demo shortcut.

## Acceptance

- [x] No board: "Present board" before the teacher's name, centred with it, header unchanged, no pulse on load; the first moments hold the pill's box invisible
- [x] A board opens: "● Board open"; it closes: back to "Present board", no pulse
- [x] Project with no board: the pill pulses three times on Board controls, then stops; the next problem, a reload mid class review and closing the board do not pulse; with a board open nothing pulses
- [x] A diagnostic going out and group review starting with no board: pulse; with a board open: none
- [x] Present with a projector: `/board` sized to it; one screen or permission refused: an ordinary window; placement blocked: "Press again to present"; pressing "Board open" brings that board forward and opens no second one; a real fallback window opens once and reads open
- [x] The board in its own window shows Fullscreen at the header's right; a press fills the screen and hides it; leaving brings it back; none in `/split`'s pane
- [x] `/split`'s teacher pane reads Board open; landing card labelled a demo shortcut
- [x] vitest 2113, eslint, tsc, next build, check:laptop 76; click-through click333.mjs 65/65 at 1280×800 and 1440×900 against a production build, screenshots checked
