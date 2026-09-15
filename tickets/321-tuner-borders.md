# 321: Design tuner Borders: problem set cards and homework cells

**What to build:** a Borders section in the design tuner (⌥C) that sets the border of the Classroom's boxes, teacher's and Sam's, for two kinds apart: problem set cards and homework cells. Each kind gets a width, a style (solid, dashed, dotted) and a colour, live on the page, saved to `app/globals.css` like every other token.

**Blocked by:** 296 (the design tuner).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), with the tuner open on the teacher's Classroom: "i'm trying to add a border to the PSET & HW boxes, but it doenst' seem like there's functionality for that in my current in-window editor tool." The boxes already had a 1px border in `line` (#e7e4f1), nearly invisible on cream; the tuner could only move `line`, which paints about 160 hairlines across the app, and border width was a literal 1px with no token.

## Decisions (asked 2026-09-15)

- Separate per kind: problem set cards and homework cells tune apart (the user picked "Separate per kind" over Classroom-only or every big card).
- Width, colour and style (the user picked all three).
- Both Classrooms, since both show the same two objects (the design is mirrored on both sides).
- The line is drawn inward from the box's edge, so no width moves a box or a word.
- A state keeps its own colour: hover, Sam's To do card (accent), a completed (green) or missed (dark red) homework cell. The teacher's sent cell keeps its own dashed line-strong border and takes none of the tokens.

## Solution

- `app/globals.css`: `--color-set-border` and `--color-hw-border` in `@theme` (both `#e7e4f1`, today's `line`); `--set-card-border-width/-style` and `--hw-card-border-width/-style` in a `:root` block (1px, solid); `@utility set-card-edge` / `hw-card-edge`: a transparent 1px border (the layout the box always had) and an outline of the token width and style at `outline-offset: -width`.
- `app/teacher/Classroom.tsx`: problem set cards `set-card-edge outline-set-border`, hover `outline-accent-line`, focus `outline-accent` with the ring; homework cells `hw-card-edge outline-hw-border`, sent unchanged.
- `app/student/StudentClassroom.tsx`: set cards `set-card-edge` (`outline-set-border`, To do `outline-accent-line`, hover `outline-line-strong`); homework cells `hw-card-edge` (completed `outline-secure-line`, missed `outline-wrong-deep`, others `outline-hw-border`). A pressable card's focus ring is still the 2px accent outline, and its 1px border shows the line under it while focused.
- `lib/designTokens.ts`: `BORDER_KINDS` (label and the three tokens per kind), `BORDER_STYLES`, `BORDER_MAX_PX` (4).
- `components/DesignTuner.tsx`: a Borders section below Corners: per kind a Width slider (0–4 px, 0.5 steps), a Solid/Dashed/Dotted switch and the colour (swatch row opening the lightness/vividness/hue editor); the two border colours leave the Colours list; ⌥-click on a Classroom box opens Borders.
- Tests: `lib/designTokens.test.ts` holds the defaults to today's look (1px, solid, `line`'s hex) and a proposal that changes one kind to leave the other and `line` alone through save.

## Acceptance

- [x] Borders lists Problem set cards and Homework cells, each with width, style and colour
- [x] Moving a kind's control changes only that kind's boxes, on both Classrooms, live
- [x] No box or word moves at any width, under the teacher's zoom and Sam's scaled iPad
- [x] At the saved values each box paints as its old 1px border (antialiasing only)
- [x] Hover, To do, completed and missed colours win; the sent cell keeps its dashes
- [x] Space shows the saved design, Reset returns it, Save writes the six tokens
- [x] vitest, eslint, tsc, next build; click-through

## Verification

- vitest 1145, eslint, tsc, next build.
- Click-through `click321.mjs` 238/238 under `next dev` at 1280x800 and 1440x900 on `/teacher` and `/student`: every tuned box is a 1px solid inward outline over a clear border at the saved values, in its old colour (sent dashed line-strong, missed dark red, completed green, To do accent); each on-screen box repainted with its old real border differs by antialiasing only (teacher: rounded corners, at most 6/255; Sam's scaled iPad: edge shading, at most 4/255); with set cards at 4px dashed in a new colour every box and its words keep their rects to 0.01 px, set cards read 4px dashed inward, homework cells and `line` untouched; the panel lists both kinds with their controls and no border rows in Colours; the homework slider at 3px, Dotted and a typed #3355aa move the cells (completed and missed keep their colours, sent its own border) without moving anything; Space shows the saved borders; hover colour wins; ⌥-click on a homework cell opens Borders; Reset restores; nothing scrolls sideways. Screenshots checked.
