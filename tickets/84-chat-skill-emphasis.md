# 84: The concerns chat names the skill in bold, and asks the later ones "How about…?"

**What to build:** In the warm-up's concerns chat the first two bubbles stay as they are in wording ("Let's do a warm up on factorising, fractions, & null factor law." / "First, tell me a little bit about your concerns with factorising."). Each later skill's question changes from "Next, tell me about your concerns with fractions." to "How about with fractions?" and "How about the null factor law?". In every bubble that is about one skill, that skill's name is bold: factorising in the "First…" bubble, fractions and null factor law in theirs. The setup bubble that names all three stays plain.

**Blocked by:** 48 (the concerns chat), 74 (the chat's rhythm).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the chat: "keep the first two the same. for a 2nd / 3rd skill, change from 'next, tell me...' to 'How about with fractions?' & 'How about the null factor law?' -- also, bold skill. so factorising, fractions, & null factor law bolded. not in the first message (let's do...), but in the indiv message. this will signal to the student clearly the skill being discussed at that stage".

## Solution

- `lib/warmup.ts`: `concernTurns` wraps the skill's name in `**…**` in the "First, tell me…" bubble (and the one-skill "Tell me…" bubble), and each later turn is `howAbout(word)`. `howAbout` asks a named rule as a thing, "How about the **null factor law**?" (a word ending in law/laws/rule/identity/formula/distribution, or one that already starts with "the", which is dropped), and a topic or an activity as a place, "How about with **fractions**?". `emphasis(text)` splits a tutor line into plain and bold runs.
- `app/student/screens/WarmupChatScreen.tsx`: a tutor bubble renders `emphasis(text)`, the bold runs as `<strong>` at semibold; a student bubble is rendered as typed, never split.
- Tests: the three-skill script, the two-skill and one-skill openings, `howAbout` over rules and topics, `emphasis` on lines with none, one and two bold runs.

## Acceptance

- [x] Three skills: "Let's do a warm up on factorising, fractions, & null factor law." (plain) / "First, tell me a little bit about your concerns with **factorising**." / answer / "How about with **fractions**?" / answer / "How about the **null factor law**?"
- [x] One skill: "Let's do a warm up on factorising." / "Tell me a little bit about your concerns with **factorising**."
- [x] A student's own "**x**" is shown as typed
- [x] vitest, eslint, `next build`, headless browser check; architecture note, root docs, decision log, future features
