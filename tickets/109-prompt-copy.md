# 109: The practice prompt reads "2 minutes on factorising?" with its two sentences on two lines

**What to build:** The isolated-practice prompt's card: the heading is "2 minutes on factorising?" (a numeral, was "two minutes"), and the body is two sentences in sentence case, one per line: "This is your second mistake on factorising." then "Let's do a short problem to review." (was one lowercase run that wrapped mid-sentence).

**Blocked by:** 31 (the prompt's wording in the student's words).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the card: "split this into two lines at the period. also i want to change message from 'two min...' to '2 minutes on factorising?' & the sentences to 'This is your second mistake on factorising. Let's do a short problem to review.' with /n on the ." Ticket 31 had set the copy lowercase ("two minutes on factorising?", "this is your second mistake on factorising. let's do a short problem to review.") in one paragraph, which wrapped after "to" at the card's width so "review." sat alone on the second line.

## Solution

- `app/student/screens/PracticePrompt.tsx`: `PromptModal`'s heading is `2 minutes on {short}?`; the body paragraph is `This is your second mistake on {word}.`, a `<br />`, then `Let's do a short problem to review.` Nothing else on the card moved.
- `data/taxonomy.ts`: the `groupWord` doc comment quotes the sentence as it now reads.

## Acceptance

- [x] `/student` with a detected prompt: heading "2 minutes on factorising?", body on two lines breaking after "factorising.", sentence case
- [x] vitest (340), eslint, tsc, `next build`, headless screenshot of the card (`prompt-shot.mjs`); architecture note, root docs, future features
