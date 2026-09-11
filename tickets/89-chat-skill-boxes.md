# 89: The concerns chat's skill names sit in a light blue box, not bold

**What to build:** In the warm-up's concerns chat the skill each ask is about (factorising in "First, tell me…", fractions and null factor law in their "How about…?" bubbles) is no longer bold. It sits in a light blue box: the standout blue's soft fill and line, blue text, normal weight. The setup bubble that names all the skills stays plain.

**Blocked by:** 84 (the bold and the "How about…?" asks).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on seeing ticket 84's bold: "actualy unbold them. put each skill in a light blue box."

## Solution

- `lib/warmup.ts`: the `**…**` marker stays (a skill's name in a tutor line); `emphasis` is now `skillRuns`, returning `{ text, skill }` runs, since the mark no longer means bold.
- `app/student/screens/WarmupChatScreen.tsx`: a skill run renders as a rounded box, `bg-standout-soft` with a `border-standout-line` edge and `text-standout`, at the bubble's weight; `data-skill` on the box. Student lines are still never split.
- Tests renamed with the helper; the same three-, two- and one-skill scripts.

## Acceptance

- [x] "First, tell me a little bit about your concerns with [factorising]." / "How about with [fractions]?" / "How about the [null factor law]?", each bracket a light blue box at weight 400
- [x] No `<strong>` in the chat
- [x] vitest, eslint, `next build`, headless browser check; architecture note, root docs, decision log, future features
