# 48: Warm-up concerns chat, and the pad's skill buttons

**What to build:** The warm-up chooser page (problems to tick, skills by category, "warm up on these →") goes. The skills the student ticks under "not confident with…" on the confidence screen are what the warm-up is about. Between that answer and the pad there is only a chat: "Let's do a warm up on {1}, {2}, & {3}. First, tell me a little bit about your concerns with {1}." The student answers; "Next, tell me about your concerns with {2}."; and so on. After the last skill's answer the warm-up starts. On the pad, the strip above the problem is one button per skill in the warm-up; a skill's button goes dark blue as the student is on it and stays dark once they have worked through it; a tap opens that skill.

**Blocked by:** 28 (the chooser this replaces), 27 (the pad).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The student answered "not confident with…" and ticked skills, then met a second page asking them to pick problems and say it in words all over again. The confidence answer already says what to warm up on. What the second page had that is worth keeping is the chat: the student saying, in their own words, what worries them about each skill.

## Solution

One stage, `warmup-chat`, replaces `warmup-pick`. Its questions are derived from the ticked skills, one each in the order ticked; only the student's answers are stored. The last answer moves the session to `practice`. An answer that names a skill or a question ("Q2") adds that to the warm-up, as before. A student who answered "confident" or "not confident" overall and still chose to warm up gets one open question; what they name is the warm-up, and nothing named is the default problem.

On the pad the sequence chips become buttons. `warmup.done` records the problems worked through; "Next skill →" marks the current one done and opens the nearest not yet done (wrapping round to any skipped over), or reads "On to the set" when it is the last one left. A tap on any chip opens that skill.

## Acceptance

- [x] After "Warm up" on the confidence screen, the next screen is the chat; no problem picker anywhere
- [x] Three skills ticked → "Let's do a warm up on a, b, & c. First, tell me a little bit about your concerns with a."; each answer is followed by "Next, tell me about your concerns with …"; the third answer opens the pad
- [x] One skill ticked → "Let's do a warm up on a. Tell me a little bit about your concerns with a."; the answer opens the pad
- [x] An overall answer → one open question; "fractions and Q2" warms up on fractions, non-monic factorising and the null factor law; nothing named → the default warm-up
- [x] The pad's strip: one button per skill, easiest first; current and done dark blue (`standout`) with white text, the rest light; the current one ringed
- [x] "Next skill →" marks the skill done and moves to the nearest not done; "On to the set" on the last; a tap on a chip opens that skill without marking anything
- [x] "Skip to the set" still on the pad while any other skill remains
- [x] The demo strip's "warm-up" lands on the chat with three skills ticked; `/student?stage=practice` has the three answers behind it
- [x] Teacher lists of before-hand-in stages, the URL stage list and the split view know the renamed stage
- [x] vitest, eslint, tsc, `next build`, a headless-Chrome click-through; architecture note and root docs
