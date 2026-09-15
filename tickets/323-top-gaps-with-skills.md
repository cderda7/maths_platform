# 323: Classroom cards name their top three gaps, each under its skill tag

**What to build:** every card on the teacher's Classroom reads "top gaps:" (a live card "top gaps so far:") and the set's three most common misconceptions as red pills, each under a blue skill tag like the Class View's column heads. Gaps sharing a skill sit side by side under one tag spanning both. A tag never reads "New skills": a skill new on the set is named itself. The live card loses "n mistakes so far". "applied to some terms only" gets a precise name.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), on the teacher's Classroom: "add the topic skill tag, as well. the blue topic tag as in here [the Class View's ALGEBRA … NEW SKILLS heads]. never have it say 'new skills' -- have it specify the skill. also, don't say 47 mistakes so far -- that info is useless. say 'top gaps so far' & list the top 3, along with the same idea of category tag (in blue) & the 3 top gaps. also yeah change all to have 3 top gaps & say "top gaps:" instead of top gap. have category in blue above the misconception gap. also idk what 'applied to some terms only' means -- edit taxonomy.ts to be more precise. also if 2 misconceptions are under same category skill, make the category pill wide to cover both -- serves as like a header for both of them to show grouping of the misconceptions"

## Solution

- `lib/classroomCards.ts`: `topGap` (the biggest exact cluster) becomes `topGaps(problems, newSkills, n = 3)`: every misconception ranked by different students, ties by first seen. A gap's `skill` is the label most of its own wrong lines' tags carry: the home category's short name, or the leaf's short name when the set lists it as new. `gapGroups` puts a shared skill's gaps together, groups ordered by their best gap. `AssignmentCard.topGaps` replaces `topGap`.
- `app/teacher/Classroom.tsx`: the status line is a two-row grid (22 px tags over the 28 px line). `TopGaps` draws the label, the red pills and a `CategoryChip` per group spanning its pills' columns. The tag row is kept when empty, so a live card is one height before and after its first mistake. `LiveLine` drops the mistakes count.
- `components/Tag.tsx`: `CategoryChip` passes extra props through (style, data attributes).
- `data/misconceptions.ts`: `partial-distribution` is named "not multiplied into every term" (the id is unchanged), with its `about` listing the forms it covers.
- `data/story.ts`: `topGap` becomes `topGaps`, three names per set; the sheet is regenerated.

## Verification

- vitest 1144, eslint, next build, `check:laptop` 76/76.
- Click-through `click323.mjs` 904/904 at 1280x800 and 1440x900. The runs cover a fresh Classroom (PS1–PS5), PS6 sent and live (no gaps and no label at first, then "top gaps so far:" as the stream arrives, sampled at 20, 40 and 60 s), and activity completed. Every card is checked for its groups and pills (e.g. PS3: ALGEBRA over "brackets don't expand back" and "minus not carried through", BINOMIAL IDENTITY over "square and difference mixed"). Each tag spans its pills edge to edge, sits 6 px above them and below the title, and is upper-cased. Words and pills are centred on one row, every pill is one line, and the line clears the due date. Every card is one height and the Live card never changes height. Nowhere reads "New skills", "mistakes so far" or "top gap:", and nothing scrolls sideways. Screenshots checked.
