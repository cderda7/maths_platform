# 99: "Talk it through" is a pill on the hint itself; the help menu is four bare pills

**What to build:** The latest hint card on the practice pad carries a "Talk it through" pill that opens the help chat on that hint (the tutor's "Let's talk more about hint 1 before another one. What is it asking you to do here, in your own words?"). The "I'd like a…" menu shows only "another hint", "worked example", "video", "chat": no side notes ("Show →", "Continue →", "Not available yet", "Talk it through →"), deep purple borders, pills the width of the widest one, the popup narrower.

**Blocked by:** 86 (the stalled hint and the chat opener), 95.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with the help menu open beside hint 1: "the talk it through option is dumb. it's hidden away in the i need help screen. add a pill button to the light purple hint 1 box that says 'talk it through'. that then opens the chat feature & the prompt of Let's talk more about hint 1 before another one…" and, of the menu: "take away the 'show', 'continue' text etc -- ONLY 'another hint', 'worked example', 'video', 'chat'. also, change the light grey border around the button to the deep purple color also make the pills narrower (lot of blank space) & the whole pop up in general narrower".

Ticket 86 had put the chat-on-a-hint behind the menu's hint row, relabelled "Talk it through →" while the hint was stalled. The student had to open "I need help" to find it, and the menu rows carried a second column of notes that made every row as wide as the popup.

## Solution

- `components/HintCard.tsx`: an `onTalk` prop; when given, a "Talk it through" pill (deep purple outline, paper fill, accent-soft on hover) under the hint text, `data-talk-hint`.
- `components/PracticePad.tsx`: `talkHint` (formerly the menu's `onTalkHint`) says the tutor's opener once and opens the chat; passed as `onTalk` to the latest hint card only, and not while the worked example plays (the chat is already on screen there). `HelpMenu` loses `onTalkHint`, `chatted` and every note: four pills in a fit-width grid (each the width of the widest, "worked example"), `border-accent-deep`, `rounded-full`, the popup `w-fit min-w-[248px] p-7` instead of `w-[480px] p-8`. While the latest hint is stalled the "another hint" pill is greyed (the reducer refuses `run/hint` then anyway); the way on is the pill on the hint.

## Acceptance

- [x] Fresh pad: no pill before any hint; "I need help" shows hint / worked example / video / chat, one word each, all pills 168px wide with a `#4535c8` border, the popup 248px wide
- [x] After the hint: "Talk it through" under the hint text inside the card; pressing it opens the chat with the opener as the tutor's first bubble, stored once (a second press adds nothing); the pill is there after a reload of `/student`
- [x] With hint 1 stalled: the menu reads "another hint" greyed, worked example and chat live, video greyed, no notes
- [x] vitest (337), eslint, tsc, `next build`, headless click-through (`talk.mjs`); architecture note, root docs, decision log, future features
