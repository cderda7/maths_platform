# 107: The concerns chat's closing bubble stays up for 2.8 seconds before the pad

**What to build:** After the closing turn's last bubble ("Thank you for those insights. Let's start with fractions.") the chat holds for 2.8 seconds before the pad replaces it, instead of 1.2. That is the length of a whole two-bubble tutor turn (beat, dots, beat, dots), the time the student just waited for the thanks to arrive.

**Blocked by:** 102 (the closing turn), 74 (the rhythm).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), after ticket 102: "let's actually make the very final message stay for 2.8 sec instead of 1.4 like when the thank you message comes up." The closing wait was 1.2 seconds (`CHAT_CLOSE_MS`), set in ticket 74 for a one-line "Thanks. Let's start with fractions."; the new closing pair is longer and the pad was cutting in before the thanks could be read.

## Solution

- `lib/warmup.ts`: `CHAT_CLOSE_MS = 2 * (CHAT_BEAT_MS + CHAT_DOTS_MS)` = 2800, with the reason in the doc comment. `WarmupChatScreen` already dispatches `warmup/begin` at the last step plus `CHAT_CLOSE_MS`, so nothing else changes.
- `lib/warmup.test.ts`: the constant is 2800 and equals a whole turn.
- `architecture/74-chat-rhythm.md`: its record of the constant notes the change.

## Acceptance

- [x] Three-skill chat: the thanks lands, the pad is not there 2.5s later, and is there 3.2s later
- [x] vitest (340), eslint, tsc, `next build`, headless click-through (`close.mjs`); architecture note, root docs, future features
