# 298: Student profiles describe behaviour, never traits

**What to build:** every Holistic Assessment summary, pattern wording and tile tag says what the student's work shows. No character judgement, no state of mind, no self-reported confidence. Sam's summary names the one sign pattern his seven patterns share.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), from an outside review: Sam's profile lists seven patterns across five topics and five weeks (signs in the wrong brackets, a sign lost multiplying out a surd bracket, a factor pair's signs swapped, a turning point read with the sign flipped, negative a read as concave up, the conjugate's sign copied from the denominator, half of b with the wrong sign). All seven are the same error: a minus sign belongs to the term that follows it. Yet the profile's summary called him "careless", which gets the fix wrong and blames the child for something the platform's own evidence shows is systematic. "Change this. Agree, the careless label is wack and judgemental. Go through all student holistic reports and ensure that patterns are addressed in neutral language."

Follow-up (same day): "Careless." "Low in confidence." "Slow." "Usually out of reach." These are character judgements, inferred partly from a chat box. Put one of those sentences in front of a parent. Ban trait words. Describe the behaviour and cite the line (the pattern list already cites it).

## Acceptance

- [x] Sam's summary names the cross-topic sign pattern and has no trait word
- [x] All 20 summaries (`STORY[id].arc`) describe behaviour only: no careless, confident / low in confidence, slow, rushes, guesses, unsure, "out of reach"
- [x] Pattern wordings and tile tags do the same ("in a rush", "guessed", "jumped straight to it", "astray", "unsure" rewritten as what the work shows), in the story sheet and every set's records that must equal it; the students' own reflections keep their words
- [x] A test bans trait words from every summary, pattern, tag and review reason in the sheet
- [x] vitest, eslint, tsc, next build, check:laptop; click-through of all 20 holistic pages and the tiles at 1280×800 and 1440×900

## Solution

Two scripts rewrote the text. Exact-string pattern replacements ran across `data/` and the generated sheet `specs/class-story.md`. A second pass rewrote the summaries in `data/story.ts`. `data/story.test.ts` gains a guard for trait words. Lucas's tag "unsure what the result means in context", which the first pass missed, was caught by that guard and now reads "the result not tied back to the context". The per-set Mistakes tab's short labels ("guessed pair, not expanded back") and hint copy are outside the holistic reports and are left for a follow-up (FUTURE_FEATURES).

Verification: vitest 993; eslint, tsc, next build; check:laptop 74; `click298.mjs` 284/284 (every student's page at both sizes: summary and patterns column free of trait words, nothing wider than its box, the patterns column not spilling, no page scroll; Sam's summary names the sign pattern; all 20 tiles free of trait words, no tile or tag overflowing).
