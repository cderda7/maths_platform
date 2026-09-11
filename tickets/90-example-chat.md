# 90: The worked example is maths alone, one column, with a "Question about a step?" chat beside it

**What to build:** Every worked example (the one playing in place of the pad, and the compact one kept in view beside the follow-up) drops the caption to the left of each step. Each step is set at the problem's own size and centred under it, so the working reads as one column. While the example plays, the right column is the help chat headed "Question about a step?" in place of the read-as column, and the "Guess the next step before you show it" line goes.

**Blocked by:** 69 (the help chat), 79 (the example card's two-case step).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the fractions worked example: "just delete the text description on the left of each step in worked example entirely, for all worked examples. also ensure that each step is same font size & vertically aligned. to the right of the worked example, have a chat feature -- header being 'question about a step?' also once in worked example don't need read as column. so replace that with the option to chat. also delete the 'guess the next step...' text".

The captions ("Moved the 6 across, so the x terms are together") made each step a two-column row: the maths sat at the caption's right edge, inline-sized, so a step with fractions was smaller than the problem above it and the column did not line up. And while the example plays nothing is being written, so the read-as column was an empty box.

## Solution

- `components/PracticeCard.tsx`: a step is `M` in display mode at the problem's size (`math-lg`, or `text-[20px]` compact), centred, `data-step`; the caption span goes, `compact` no longer stacks anything. A two-case step keeps its two boxes, centred. The reveal button is centred with the column.
- `components/PracticePad.tsx`: the "Guess the next step before you show it" line goes; while `run.example` the right column is `HelpChat` with `exampleShown` (no close), else the chat or the read-as as before.
- `components/HelpChat.tsx`: `exampleShown?: number` and `onClose?`: beside the example the eyebrow is "Question about a step?", the opener is `EXAMPLE_OPENER`, there is no close, the box does not take focus (the next tap is "Next step"), and each turn posts `shown`.
- `lib/helpChat.ts`: `EXAMPLE_OPENER` ("Which step, and what about it?"), `chatOpener(messages, example)`, `shown?` on the request (a whole non-negative number), and `helpChatSystem(p, lines, messages, shown)`: with `shown` the brief says the student is watching the example, marks each step "(on screen)" or "(not yet shown)", frees the tutor to explain a step on screen in full and holds hints-only for the rest.
- `app/api/help-chat/route.ts`: passes `body.shown` to the brief.
- `lib/helpChat.test.ts`: the opener, the parser's `shown`, the example brief, and the pad brief unchanged.

## Acceptance

- [x] No worked example step has a caption; every step's KaTeX is the problem's size and centred on the problem's axis (fractions: six steps at 21.6px, centre x 690, problem 21.6px at 690; compact follow-up likewise)
- [x] "Guess the next step before you show it" is gone
- [x] While the example plays the right column is the chat headed "Question about a step?", opener "Which step, and what about it?", no close, no read-as; a sent turn posts `shown: 3` after three steps
- [x] The follow-up keeps the read-as column and the compact example has no captions
- [x] vitest (337), eslint, tsc, `next build`, headless browser click-through on the fractions and factorising warm-ups; architecture note, root docs, decision log, future features
