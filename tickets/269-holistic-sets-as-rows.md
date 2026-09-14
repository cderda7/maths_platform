# 269: Holistic grid: sets down, categories across, Class View's chips

**What to build:** User 2026-09-14, on Sam's holistic page (`/teacher/a/pset-5/students/sam`) beside a screenshot of Class View's roster head: "swap rows for columns & columns for rows ; also, add the [Class View's category chips] category headers should look like this".

**Blocked by:** 251, 252.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- **Transposed grid.** `HolisticPage`'s grid has a row per set (PS1–PS6, oldest first) and a column per category (Algebra, Functions, Graphing, Communication, Reasoning, New skills). A set's row head is the old column head unchanged (label, day, topic in two lines at most, live pill on Sam's live set) and still opens the student's report on that set; the corner reads SET.
- **Chips.** Each category heads its column with `CategoryChip` (`components/Tag.tsx`), the Class View roster's light blue uppercase chip, now one component used by both. The chip sets its own type at the roster head's computed values (11 px, 600, uppercase, 0.6 px tracking), so Class View renders exactly as before. On the holistic page it sits in a flex box so its middle is level with SET.
- **Model.** `HolisticView.columns` / `rows` become `sets` / `categories` (`HolisticSet`, `HolisticCategory`), naming what they hold rather than where they used to be drawn; cells stay one per set in each category. `holisticTiles` and the tests follow the rename.

## Acceptance

- [x] At 1280×800 and 1440×900, all twenty students on both routes: rows PS1… in order, six category heads in canonical order, every cell's word matches its status, every row's head one height, "PS1…" left-aligned with SET, no topic clipped, no cell text overflowing, every cell one width and centred under its chip, chip middles level with SET, no sideways scroll
- [x] Every holistic chip equals Class View's chip for the same category in width, height, font size, weight, tracking, line height, case, colours, radius and padding; Class View's chips keep the roster head's type
- [x] Sam's PS1–PS5 cells equal the story sheet (the user's screenshot); a set's row head opens that set's report for the student
- [x] vitest 911, eslint, tsc, next build, check:laptop 74; click-through `grid269.mjs` 13578 checks
