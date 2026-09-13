# 203: Every warm-up has a hint for every line of its working

**What to build:** Hints and "Talk it through" work on all 15 warm-ups the way they do on fractions and factorising. There is one hint for each point in the working, picked by how far the student's lines have got. Pressing "hint" again before using the current one leads to the stall notice and the chat. The "hint" option greys out only after the last line.

**Blocked by:** 198 (the openers the stall path shows).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "the talk it through & hint settings are fucked up for a lot of the subskill warm ups that aren't a part of the 3 in the scripted demo -- so fractions, factorising, & null factor law all look good, but a lot of the others are fucked up. please go through each & ensure that functionality works as expected".

Walking all 15 in the browser (`probe.mjs`) showed the cause. Fractions and factorising have a hint for each point (`at`). The other 13 had one general hint with no `at`. After that hint, `pickHint` had nothing left to give and `stalledHint` never stalls a general hint, so "hint" greyed out for the rest of the problem. The student could never reach the stall notice or the chat on that hint. Null factor law had the same fault, but with two lines it was easy to miss. The user agreed it gets a second hint too, with its first hint kept as it was.

The hint-box sweep had also been skipping this. It opens only the warm-ups in the default sequence (4 of 15), and it stopped silently at the first stall notice, which covers the pad, so fractions' later hints were never swept either.

## Solution

- `data/practice.ts`: nonmonic, expand, linear, nfl, discriminant, graph features, formal justification, conclusions, sketching, evaluating, worded problems, zero-finding and binomial each get one hint per point, `at: [0]` to `at: [n - 1]`. The first hint is the old one where it fits a blank pad. Each later hint names the next move without writing the line. Its linked words point at the student's own line (the reference step), so they light fragments of that line. Discriminant-style `insert` covers formal justification's unwritten 1 in front of x².
- `lib/hint.test.ts`: every warm-up and follow-up has a hint for every point, and each hint names its point. Walking every warm-up line by line, the hint for each point is the one given, it stalls until the next line, and nothing is left at the end. The two general-hint tests use a synthetic problem instead of null factor law. A test holds the sweep's list to the bank.
- `scripts/warmup-leaves.json` (new): every warm-up leaf and its line count.
- `scripts/hint-box-sweep.mjs`: ticks every leaf in that list on the confidence screen, so the strip offers all 15. It reads every line and fails if the pad stops short, closes the stall notice and moves on to the next line, and leaves the conjured glyph (inside `.llap`) out of the "nothing moved" comparison, since it appears only while lit, at zero width.

## Acceptance

- [x] On all 15 warm-ups, at every point before the last line: "hint" is live and gives a new card labelled "Hint n". Pressing it again shows the stall notice, whose "Talk it through" opens the chat on "Let's talk about hint n…". After the last line: greyed.
- [x] The card's "Talk it through" opens on the question alone (ticket 198), on every warm-up
- [x] `npm run sweep:hint-boxes`: all 15 warm-ups, every line, every hint word, no lit box over a neighbour, nothing moves
- [x] vitest, eslint, tsc, next build; click-through `click199.mjs`
