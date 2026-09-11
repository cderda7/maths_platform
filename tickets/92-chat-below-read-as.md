# 92: The chat sits under the read-as lines, bubbles gathered above the box to write in; the student's work stays in view

**What to build:** On the practice pad the help chat took the whole right column, replacing the read-as lines while it was open. Now the read-as column stays where it is, capped at under half the column when there are many lines (it scrolls), and the chat sits below it under its own "Chat · close" strip. The bubbles gather at the foot of the chat, just above the "in your own words…" box, and grow upwards; a long chat scrolls. Hovering a hint word while the chat is open still lights the piece in the student's line.

**Blocked by:** 86 (the chat opened on a hint), 69 (the help chat).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the chat opened on hint 1 over a pad with one line read, the right column showing only the chat: "have the chat be lower (right above 'in your own words') & preserve the existing work. rn you erase the student's transcribed work to display chat -- no good".

## Solution

- `components/PracticePad.tsx`: the read-as column is always rendered; while the chat is open it is `max-h-[45%] shrink-0` (its own list scrolls) instead of `flex-1`, and `HelpChat` follows it with a top border.
- `components/HelpChat.tsx`: a `className` prop for the outer box; the bubble list is a flex column with an empty `mt-auto` first item, so the bubbles sit at the bottom of whatever room the chat has and the list scrolls once they overflow.

## Acceptance

- [x] One line read, the chat opened on a hint: the read-as line stays at the top of the column, "Chat · close" under it, the one bubble sits directly above the message box
- [x] Five lines read, chat open: the read-as list is capped and scrolls, the chat keeps its room below
- [x] Hovering a hint word with the chat open lights the piece in the read-as line and tints the line
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log, future features
