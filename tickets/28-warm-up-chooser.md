# 28: Warm-up chooser — pick problems, say it in words, warm up one skill at a time

**What to build:** The overview's warm-up card becomes two lowercase buttons, "warm up" and "start". "warm up" opens a chooser: the ten problems on the left (no difficulty tags, there or on the overview) over the assignment's skills grouped by category only; on the right, a short chat that asks the student to select the problems they are not confident in and then say in their own words what they want to warm up on. Selection and chat combine into a set of skills highlighted light blue. The warm-up then walks those skills one at a time, easiest first, one short problem each on the pad from ticket 27, with a chip strip that turns each skill from light blue to dark blue as it is finished. (A first cut served one composite problem covering the whole focus; it was harder than the set, and was replaced the same day.)

**Blocked by:** 27 (warm-up on the pad), 26 (leaf-tagged problems and practices).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The warm-up is always monic factorising, whoever the student is and whatever they are worried about. The student has no say, and the overview announces the skill before they have looked at the set. A warm-up that is about the student's own uncertainty has to start by asking them, in two ways that reinforce each other: point at the problems that look hard, and say it in words.

## Solution

Overview: the problems grid without difficulty tags, and a footer with just "warm up" and "start". The chooser splits the screen. Left, top two-thirds: the same problem cards, selectable, no difficulty tags. Left, bottom third: every skill this set leans on, grouped by category in canonical order (Algebra, Functions, Graphing, Reasoning, Unit Focus; no group level). Right: a chat. The first message asks the student to select the problems they don't feel confident in; once they have, a second asks them to say in their own words what they want to warm up on. The student's message is read for skill words ("factoring", "fractions", "discriminant") and problem references ("Q2 & Q4"). The union of the selected problems' skills and the words' skills is the focus: those chips turn light blue in the skills list and on the cards, and the tutor names them. "warm up on these →" serves the warm-up problem from a small bank, the one covering the most focus skills, on the pad with the ticket 27 help menu. The recognition script for any warm-up problem is its own model steps.

## User Stories

1. As a student, I want the overview footer to offer only "warm up" and "start", so that the warm-up is not pre-labelled before I have chosen anything.
2. As a student, I want no difficulty tags on the overview or the chooser, so that I judge a problem by looking at it, not by a label.
3. As a student, I want to select the problems I am not confident in, so that I can point rather than describe.
4. As a student, I want the set's skills listed by category under the problems, so that I can see the vocabulary the set uses.
5. As a student, I want to say in my own words what I want to warm up on, so that I can name things the problems don't show, like "fractions in general".
6. As a student, I want the chat to understand skill words and question numbers, so that "Q2 & Q4 and fractions" does what I mean.
7. As a student, I want the skills I've chosen highlighted light blue, so that I can see what the warm-up will be about before I commit.
8. As a student, I want one warm-up problem that touches as many of those skills as possible, so that the warm-up is short.
9. As a student, I want the tutor to tell me which skills the problem covers, so that a partly-covered choice is not a surprise.
10. As a student, I want the chooser to survive a reload, so that it behaves like every other stage.
11. As a student, I want the same help menu, worked example and follow-up on whichever warm-up problem I get.

## Acceptance

- [x] Overview footer: "warm up" / "start", lowercase, no title or skill caption; no difficulty tags on overview cards
- [x] New stage `warmup-pick` between confidence and practice when the warm-up was chosen
- [x] Chooser: selectable problem cards (no difficulty tags) over skills by category; chat on the right with the two prompts
- [x] `lib/warmup.ts`: interpretation of a message (skill keywords, Q references), focus = union, bank choice by coverage, tutor reply naming covered skills, script = model steps
- [x] Focus chips light blue in the list and on the cards; "warm up on these →" serves the chosen problem on the pad
- [x] One practice per leaf the set leans on (zero-finding, sketch, evaluate, worded, binomial added); `EASE` ordering; sequence chips light → dark blue; "Next skill →" / "Skip to the set" / "On to the set"
- [x] Skill chip groups centre-aligned on the overview, the cards, the working screen and the pad
- [x] vitest for interpretation, focus, choice and the session; tsc, eslint, build clean; CDP click-through
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md` (problem bank sourcing, atomising the warm-up, content tree)
