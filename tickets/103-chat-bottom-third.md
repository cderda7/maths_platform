# 103: The chat under the read-as lines takes only the height it needs, capped at about the bottom third, and scrolls

**What to build:** With the chat open under "Read as", the read-as lines keep the column and the chat sits at the foot, only as tall as its bubbles and the box to write in need. Past a cap of 42% of the column (about the bottom third of the page, with the footer) the transcript scrolls, kept at its end, so what shows is the latest exchange: the student's last line and the tutor's reply. Beside the worked example, where the column is the chat, nothing changes.

**Blocked by:** 69 (the chat), 90 (the chat under the read-back).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the right column: "change chat from taking up all the space not taken up by read as to being minimal -- only takes up as much space as chat currently needs -- approx the bottom 1/3 of the page. have the chat scroll as it goes, so usually only see most recent message from chat & your most recent response to avoid chat growing huge."

Since ticket 90 the read-as list was capped at 45% while the chat was open and the chat took the rest (`flex-1`), so a chat with one bubble was a tall empty box with the opener floating at its foot.

## Solution

- `components/PracticePad.tsx`: the read-as list is `flex-1` whether or not the chat is open; the chat under it is `max-h-[42%] shrink-0` (its top border and margin as before). Beside the worked example the chat is passed `flex-1` explicitly.
- `components/HelpChat.tsx`: the outer box no longer grows on its own (`flex min-h-0 flex-col`; the caller says how it sits), and the empty `mt-auto` item that pushed the bubbles to the foot is gone: the box is content-sized until the cap, then the transcript (`min-h-0 flex-1 overflow-y-auto`) scrolls. The existing scroll-to-end effect keeps the latest bubble in view.

## Acceptance

- [x] Chat opened fresh: one bubble, the box to write in, the read-as list keeps the rest of the column (chat 24% of it)
- [x] After one exchange and after six: the chat is 42% of the column, the transcript scrolls to its end, the latest reply is in view, the box does not overflow the column
- [x] Reload and reopen: the same cap with the stored transcript
- [x] Beside the worked example: the chat is still the whole column
- [x] vitest (338), eslint, tsc, `next build`, headless click-through (`chat103.mjs`); architecture note, root docs, decision log, future features
