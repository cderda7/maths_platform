# 82: A hint's linked words point at the student's own line; a lit fraction is boxed whole

**What to build:** Two fixes on the practice pad. (1) A lit fragment that is a fraction gets a box the height of the fraction, not of a digit. (2) A hint for a point in the working points at the student's own line in the read-as column, not at the problem statement: its eyebrow says "your line 4", hovering a linked word lights the piece in that line and tints the line, and the problem statement is left to the hints that are about it (the opening hint, a general hint). The fractions hints' fragments are written against the line each is for.

**Blocked by:** 80 (hints by position), 77 (scoped fragments).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with screenshots: "fix the fraction view -- it wants to shrink it into the size of a normal integer, instead of the taller fraction" (the lit 9/2 had a box the height of the line, the numerator and denominator spilling out) and "the color coding / highlight of terminology no longer makes sense when you're 4 hints in. instead, reference back to the student work in text -- in the read as column" (the fourth hint's "4" and "other side" lit the 4 and the 9/2 of the original problem, which the student had long since rewritten).

## Solution

- `app/globals.css`: `.hint-term` is `inline-block`, so its background and ring paint the whole fragment.
- `lib/hint.ts`: `hintAnchor(hint, lineCount)`: 0 for the problem (a blank-pad hint, a general hint, or one given ahead of its point), else the latest of the hint's lines the student has written.
- `components/PracticePad.tsx`: the problem wraps only the terms anchored to it; each read line wraps the terms anchored to it (`ReadAs.decorate`); the line a lit word points at is passed as `highlight`; each card's eyebrow carries "your line k".
- `components/ReadAs.tsx`: `decorate` and `highlight` props; the highlighted line takes the soft standout tint.
- `components/HintCard.tsx`: `note` beside the label; a visible focus ring on the collapse toggle instead of the browser default.
- `data/practice.ts`: the third, fourth and fifth fractions hints' fragments are written against lines 3, 4 and 5 (x/4 and 2x/4, their 4s and numerators; the 4 under 3x and 21/2; the 3).
- Tests: `hintAnchor`; every hint's fragments locate in the TeX it points at (the problem, or each of its lines); lighting moves no spacing in a read line; the fractions hints' lit markup per line.

## Acceptance

- [x] Hovering "other side" on a blank pad boxes the whole 9/2, numerator to denominator
- [x] Four lines read, hint asked: the card reads "Hint 2 · your line 4"; hovering "4" lights the 4 under 3x in the fourth read-as line and tints that line; the problem statement shows no box for it
- [x] The opening hint still points at the problem statement
- [x] vitest, eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log, future features
