# 252: Holistic Assessment in Edexia Classroom: every student as a tile

**What to build:** A Holistic Assessment entry in Edexia Classroom opens a page of twenty student tiles. Each tile shows the student's name, avatar, one-line summary, and their recurring habits as tags grouped by category. A tile opens that student's page (ticket 251) at `/teacher/students/[id]`.

**Blocked by:** 251.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "let's add a Holistic Assessment thing to Edexia Classroom, & clicking on that takes teacher to a view where each student is a tile, with brief summary / mistakes & strength tags, & then clicking into THAT takes teacher into between-assignment holistic assessment of student." Asked whether tags are categories or habits: "i like the habits; organize by categories."

## Solution

- Classroom: a Holistic Assessment entry on the title row beside "+ New assignment" (it must not push the Live cards out of line).
- `/teacher/students`: twenty tiles in a grid that fits the 1280 laptop without scrolling sideways. A tile: avatar, name, summary line, then habit tags under small category labels, the categories secure on every set shown as strength tags. A habit seen on several sets reads once with its set count ("signs in the wrong brackets · 2 sets").
- Tag text comes from the habits in `data/story.ts`; where a habit's wording differs by set, the view model picks one label per habit (a short label field in the data if needed; never grep-count or guess).
- A tile press opens `/teacher/students/[id]`; Back there returns here with the scroll kept.

## Acceptance

- [x] Unit: tile view model for all twenty (Priya: strengths only; Liam: few seen sets); a repeated habit collapses with its set count
- [x] Click-through at 1280×800 and 1440×900: entry visible on Classroom with Live cards unmoved; twenty tiles, none clipping its text, equal heights per row; each opens the right student; Back keeps scroll; no sideways scroll
- [x] vitest, eslint, tsc, next build, check:laptop
