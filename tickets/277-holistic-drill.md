# 277: Holistic page: a result opens its skills and their problems; patterns beside the grid, no scroll

**What to build:** User 2026-09-14, on Zara's holistic page (`/teacher/a/pset-6/students/zara`): "in holistic view, i want the functionality of being able to click on the pill & see the problems that led to that score ; similar to functionality elsewhere". Then, over a screenshot of Sam's page: "have the dot skills open directly below the category skill. let's use the top right part of the page to put the Qs. reorganize 'confident & quick, ...' to not take up so much space horizontally. also make sure that i don't have to scroll to see the Algebra Graphing New Skills habits. can make the table itself a bit smaller if needed." On the details: "reorder from PS6 at top to PS1 at bottom … shrink text -- make it fit, & i'll tell you if that doesn't work … click pill opens tree, not Qs -- but add grey text to the left of the dot skills that says 'click to see examples' & an arrow to each of the dot skills. but yeah after clicking on pill, have WHOLE tree open up -- down to dot skills … the laptop. every line must show. consider creating a 3rd column if needed for students like Zara. also make table only marginally smaller". Measured at 1280×800, every line under a near-full table could not fit (Tomas's 18 lines needed ~680 layout px, 75 were free); the user chose patterns in a column beside the table.

**Blocked by:** 251, 269.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- **Cells open their skills.** On a student's holistic page (both routes) a coloured result (secure, solid, developing, gap) is a button. A press opens a flyout under the result's row, over the rows below, so nothing on the page moves: the category's whole tree on that set as Class View draws it (`SkillTree`, every group open and fixed, every skill under it), the dots starting at the result's left edge (shifted left at the grid's right edge), and grey "click to see examples" to the left of the tree with an arrow to each skill. With no room below in the scroll region and more above, it opens above the row. The open result is ringed in ink; a second press, a press elsewhere, or Escape closes it. Not seen, absent and "—" stay plain.
- **A skill shows its problems.** A skill pressed in the flyout puts its problems in the side column (top right), in the patterns' place: the set and category, the skill's name and result, a close ×, then every problem its result is read from (`problemsBehindLeaf`: the problems that invoke it; for Communication's working, every problem the student wrote on) as the teacher's report draws them (whole question, marked lines, a rule on the lines tagged to the skill, ⚠ chips opening the skill a slip was identified as), in balanced columns (two, three past six problems), zoomed down to fit the column's height. Escape closes the problems first, then the flyout.
- **The tree matches the result.** `holisticWork(student, set, now)` (`lib/holistic.ts`) reads the set's hierarchy from the same evidence as the Class View (`rosterEvidence`); a test holds every coloured cell equal to its tree's category result for all twenty, before Create, mid-stream and after.
- **Layout.** The header (eyebrow, name, summary) and grid take the left; the patterns run down a 540 px side column from the header's top to the bottom of the scroll region, zoomed to fit its height (`components/FitHeight.tsx`), so a laptop never scrolls for them. Sets are newest first (PS6 at the top). The grid is a little smaller: set column 272 px with the topic held at two lines, cells padded 8 px, rows 94 px (were ~99).
- **Class View's drill** gets the same working fix: a Communication working skill's panel lists every problem the student wrote on instead of none.

## Acceptance

- [x] Unit: `holisticWork` rolls up to every coloured cell for all twenty (fresh, mid-stream, after); null for an absent student, an unknown student, a set not yet created; `problemsBehindLeaf` for a tagged leaf and for working
- [x] Click-through `drill277.mjs` at 1280×800 and 1440×900, all twenty on both routes: no page scroll, no sideways scroll, rows PS6…PS1 one height, every pattern inside the side column and the column inside the scroll region; every coloured cell on the set route opens its own flyout (expanded, on screen, not covering its row, inside the grid box, tree at the pill unless shifted, an arrow per skill, hint inside) with the grid and side column unmoved; at 1280×800 every skill shows its problems (cards inside the column, no scroll, pressed); a second press closes; Escape closes the problems then the flyout; an outside press closes
- [x] vitest, eslint, tsc, next build, check:laptop
