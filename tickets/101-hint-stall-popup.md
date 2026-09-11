# 101: The help menu's row always reads "hint"; pressed while the previous hint is unacted on, a notice leads into the chat

**What to build:** The "I'd like a…" menu's first pill reads "hint" whether or not one is showing. While the latest hint is stalled (the student's lines have not moved past what it asks for) the pill stays live; pressing it shows a popup, "Let's talk through the previous hint before giving you another." with one "Talk it through" pill that opens the same chat the hint card's pill opens (the pad's stored opener). Escape or the scrim closes the notice with nothing said.

**Blocked by:** 99 (the hint card's pill and the bare menu), 86 (the stall).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on ticket 99: "instead of 'another hint', always have it say 'hint'. if the student clicks on hint in the setting currently analogous to 'you can't have one -- need to talk it through to get to where the prev hint is encouraging you to get', a pop up says 'let's talk through the previous hint before giving you another'. then that opens the same thing that 'talk it through' would."

Ticket 99 had greyed the stalled row with no word about why.

## Solution

- `components/PracticePad.tsx`: the help overlay is one state, `help: "closed" | "menu" | "stall"`. `HelpMenu`'s hint pill reads "hint" always and is live when a hint is `next` or the latest is `stalled`; its `onHint` in the pad shows the notice (`setHelp("stall")`) when stalled and gives the hint otherwise. `StallNotice`: a 300px card on the scrim, the sentence in the display face, a "Talk it through" pill wired to the same `talkHint` as the hint card, `data-stall-notice` / `data-stall-talk`; dismissable.
- `lib/hint.ts`: the doc comment on `stalledHint` names the new path.

## Acceptance

- [x] Fresh pad: the menu reads hint / worked example / video / chat, "hint" live
- [x] After hint 1 with no line written: the menu still reads "hint", live; pressing it gives no second hint and replaces the menu with the notice ("Let's talk through the previous hint before giving you another." + "Talk it through")
- [x] Escape closes the notice, nothing stored; "Talk it through" on the notice closes every overlay and opens the chat with the opener as the first bubble, stored once; the hint card's pill on the same stall adds nothing
- [x] vitest (338), eslint, tsc, `next build`, headless click-through (`talk2.mjs`); architecture note, root docs, decision log, future features
