# 198: The chat opens on a hint two ways, each with its own line

**What to build:** The practice pad opens the help chat on a hint from two places, and the tutor's first line now depends on which one. From the stall notice (the student pressed "hint" for another before using the one showing): "Let's talk about hint 1 before another one. What is the hint asking you to do, in your own words?" From the "Talk it through" button on the hint card: only "What is the hint asking you to do, in your own words?"

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshot of the fractions warm-up with hint 1 and the chat open): "there's two distinct modes that are currently blended into one. so when a student already has a hint & they click on 'hint' to get another one, i want the chat to pop up with the message as shown. however, when a student has a hint pulled up & they click on talk it through, i want to ensure that the message doesn't say this -- only should say 'What is the hint asking you to do, in your own words?' also from the hint-hint pathway remove the 'here'".

Asked whether pressing "hint" should skip the stall notice and open the chat directly. The user chose to keep the notice: its "Talk it through" opens the chat with the hint line.

## Solution

- `lib/helpChat.ts`: `HINT_OPENER_START` is "Let's talk about hint "; `TALK_OPENER` is the question alone; `hintOpener(n)` is the start, the number, " before another one. " and `TALK_OPENER`. The tutor's brief explains both lines, and a new section lists the hint cards on the student's screen, numbered the way the pad numbers them. Before this, "hint 2" meant nothing to the tutor, and the card's line names no hint at all.
- `HelpChatRequest.hinted` (optional, checked field by field): the pad's hint cards in the order given. `app/api/help-chat/route.ts` passes it to `helpChatSystem`.
- `components/PracticePad.tsx`: `talkHint(text)` stores the given line once. The card's pill passes `TALK_OPENER` and the stall notice's pill passes `hintOpener(n)`. Both `HelpChat`s receive `hinted`.
- `components/HelpChat.tsx`: sends `hinted` with each turn.

## Acceptance

- [x] Hint 1 showing, "Talk it through" on the card: the chat's one tutor bubble reads "What is the hint asking you to do, in your own words?". A second press adds nothing.
- [x] Hint showing, "I need help" → "hint" → the notice → "Talk it through": the chat's latest bubble reads "Let's talk about hint n before another one. What is the hint asking you to do, in your own words?", with n the card's number.
- [x] A turn sends `hinted` with the cards' indices, and the opener as the first message.
- [x] vitest, eslint, tsc, next build; click-through `click199.mjs` on all 15 warm-ups (with ticket 203)
