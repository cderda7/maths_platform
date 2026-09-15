# 330: Class review: the teacher marks up the examples anywhere on the slide, and the students see it

**What to build:** in class review the teacher's pen works anywhere on the slide, not only in the working pad: a circle round a term in example B, an arrow to a line in A, a cross beside C, a note under the stem. The pad stays. The board and the laptop's Board controls page both take the pen (the laptop gains the A/B/C columns beside its pad), and every student's screen shows the markup over the same maths, in screens frozen and in write with me alike.

**Blocked by:** 54 (the board takes the pen).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-15: "we need to expand drawpad functionality for teacher in class review. what i want to have happen is that they can draw ANYWHERE. leave the drawpad as an option, but more pragmatic for them to be marking up the A B C options. this also projects to the studnet screen when in 'screens frozen' mode"

Settled with Carson the same day:

- Surface: the board and the laptop. The laptop's Board controls page gains the A/B/C columns so the teacher can mark up from the laptop too; both write the same ink.
- Write with me: the markup shows read-only over the examples in both modes; in write with me the pad stays the student's own.
- Undo / Clear: one set. Undo takes back the last stroke wherever it was drawn (pad or slide); Clear wipes the pad and the markup for the problem. The pad keeps its buttons; the board header carries a copy.
- Colour: the pad's navy ink.

## Solution

- The board, the laptop and the iPad set the slide at different sizes (the columns are fitted per surface, ticket 161), so a mark cannot be stored in screen pixels. A mark is pinned to the piece of the slide it was drawn on: every example line's maths, every example letter, the problem label, its expression and its stem carry `data-ink-anchor`; a finished stroke is stored against the anchor nearest its middle, in ems of that anchor's font size from its top left corner. KaTeX glyphs scale with the font size, so a circle round a term lands round that term on every surface.
- `lib/markup.ts`: the anchored stroke type and the pure geometry (nearest anchor, to and from anchor ems).
- `wholeClass.ink[problem]` holds pad strokes (as before) and slide marks in drawing order, so one Undo takes the last of either; `currentSlide` hands out `teacherInk` (the pad's) and `markup`.
- `components/SlideInk.tsx`: wraps a slide; draws the marks as an SVG over it, redrawn on resize, scroll and font fit; with `onMark` it takes the pen anywhere inside except buttons, links and the pad.
- The board's `Slide`, the laptop's `BoardControls` (question card and a board-sized columns | pad row) and the student's `FrozenScreen` wrap their slide in it.

## Acceptance

- [x] Board: a stroke over example B's second line appears round the same maths on the laptop and on a frozen student's screen, and in write with me too (read-only there)
- [x] Laptop: the same from the laptop's columns to the board and the student
- [x] A stroke on the pad still lands on the pad everywhere; buttons (mode toggle, Undo, Clear, marks, next) still press
- [x] Undo on the pad or the board header takes the last stroke, wherever it was; Clear wipes both
- [x] Marks survive Show marks / Hide marks and a window resize, and each problem keeps its own
- [x] vitest, eslint, tsc, next build; click-through against a production build with the board, laptop and student tabs at 1440×900 and 1280×800, screenshots checked (click330.mjs 52/52; check:laptop 76)
