# 204: "Talk it through" puts the cursor in the chat

**What to build:** Every press of "Talk it through" (the hint card's pill and the stall notice's pill) lands the student in the chat's box, ready to type, whether or not the chat was already open. The help menu's "chat" does the same.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the practice pad with the chat already open under the read-back: "when a student clicks on 'talk it through', have it immediately jump them to the chat. without having to click into it".

Reproduced with real mouse presses on a production build: with the chat closed, the pill opened it and the box took the cursor (its mount effect). With the chat already open, the pill added the tutor's line but left focus on the pill (card) or on the page body (stall notice, whose scrim unmounts), so the student had to click into the box.

## Solution

- `components/PracticePad.tsx`: `chatAsks` counts every ask for the chat; `openChat()` opens it and bumps the count. `talkHint` (both pills) and the menu's "chat" call it; the count goes to `HelpChat` as `asked`.
- `components/HelpChat.tsx`: the focus effect runs on `[example, asked]`, so each ask puts the cursor in the box, open already or not. The worked example's chat still leaves the cursor alone (its next tap is "Next step"). The in-flight abort moved to its own unmount-only effect, so a refocus never aborts a streaming reply.

## Acceptance

- [x] Every warm-up (15): the card's pill with the chat closed puts the cursor in the box and typing lands there
- [x] The card's pill with the chat open and the cursor elsewhere puts it back in the box
- [x] The stall notice's pill, chat closed and chat open: cursor in the box
- [x] The menu's "chat" with the chat open: cursor in the box
- [x] The worked example's chat does not take the cursor
- [x] vitest, eslint, tsc, next build; click-through `focus204.mjs` (135 checks, real `Input.dispatchMouseEvent` presses)
