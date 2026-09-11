# 91: The skill box's text is ink, so the line reads in one colour

**What to build:** In the concerns chat the light blue skill box (ticket 89) keeps its fill and edge but its text is the bubble's ink, not blue, so the sentence reads straight through the box.

**Blocked by:** 89 (the box).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on seeing ticket 89's blue text: "cool. but have the actual text be black to make reading the line more seamless".

## Solution

- `app/student/screens/WarmupChatScreen.tsx`: the box's `text-standout` becomes `text-ink`. Nothing else changes.

## Acceptance

- [x] The three boxes ("factorising", "fractions", "null factor law") render with the bubble's ink colour on the standout-soft fill
- [x] vitest, eslint, `next build`, headless browser check; architecture note, root docs, decision log, future features
