# 86: "Another hint" opens the chat on the current hint while the student has not acted on it

**What to build:** While the latest hint is still waiting to be used (the student's lines have not moved past the point that hint is written for: a hint after line 3 asks for a line 4, a blank-pad hint asks for a first line), the help menu's "another hint" row reads "Talk it through →" and opens the chat instead of giving the next hint. The tutor's first line is the pad's own: "Let's talk more about hint 2 before another one. What is it asking you to do here, in your own words?" That line is stored in the chat, so it is there on a reopen and after a reload, and the tutor's brief knows what it means: talk the hint through, send the student back to the pad when they have it, never say what the next hint would say until this one is used. Once a line is written past the hint's point, "another hint" gives the next hint as before. A general hint (no point named) never blocks.

**Blocked by:** 85 (a hint per point), 80 (hints by position), 69 (the help chat).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on ticket 85's note that a blank-pad student tapping "another hint" is walked through the whole method: "actually, instead, if the student hasn't progressed past what the hint is encouraging them to do, open the chat feature. the agent will start the chat -- 'let's talk more about hintX'. this will prevent just random clicking through & instead encourage the student to either apply the hint or do work to refine their understanding of the hint".

## Solution

- `lib/hint.ts`: `stalledHint(problem, lines, shown)`: the latest shown hint while `positionOf(lines) <= max(hint.at)`, else null; a hint with no `at` never stalls.
- `lib/session.ts`: `run/hint` gives nothing while a hint is stalled, so the rule holds whatever the screen does.
- `lib/helpChat.ts`: `hintOpener(n)` (the pad's line for the tutor, numbered as the card is), `HINT_OPENER_START`, `chatOpener(messages)` (the stored first tutor line, else the fixed opener); `helpChatSystem` takes the chat, names the actual opener, and carries a rule for a pad-said hint line; `helpChatMessages` folds two lines in a row from one side into one turn, so a pad line after a reply keeps the roles alternating.
- `app/api/help-chat/route.ts`: passes the transcript to the brief.
- `components/PracticePad.tsx`: `stalled`; the menu's hint row picks `onTalkHint`, which stores the pad's line once (not again if it is already the last line) and opens the chat.
- `components/HelpChat.tsx`: a stored tutor line first is the opener; otherwise the fixed one, unstored, as before.
- Tests: `stalledHint` on the factorising and fractions warm-ups and a general hint; the session's asks on a blank pad, after a placed line, after an unplaced line, and the fractions skip-ahead case now stall until the line is written; the brief's opener and rule; the folded turns.

## Acceptance

- [x] Blank pad, "hint", then "I need help": the row reads "another hint · Talk it through →"; tapping it opens the chat with one tutor bubble, "Let's talk more about hint 1 before another one…", and no "What's got you stuck?"
- [x] Close and repeat: still one tutor bubble. Send a message: the request carries the pad's line first, then the student's; the reply lands under them. Reload, "chat · Continue →": the same three bubbles
- [x] Write the first line: the row reads "another hint · Show →" and gives hint 2 ("your line 1"); the row then reads "Talk it through →" again
- [x] vitest, eslint, tsc, `next build`, headless browser check with a stubbed reply; architecture note, root docs, decision log, future features
