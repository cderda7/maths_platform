# 01: Scaffold, iPad stage, demo assignment fixture

**What to build:** A fresh Next.js + Tailwind app in `curr_version/` that a developer runs at localhost on macOS. Opening it shows a landscape iPad frame in the desktop browser with student and teacher entry points. The student entry shows the demo assignment: title, the skill/subskill list, and four problems on roots of a quadratic rendered as typeset maths. The look matches the real Edexia product (serif display, indigo accent, warm off-white ground); the design tokens and small kit (buttons, tags, brand mark, KaTeX wrapper) are ported from the Sept 7 roughdraft rather than reinvented.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] `npm run dev` from `curr_version/` serves the app; build, lint and tsc pass
- [x] Root route offers "Student (iPad)" and "Teacher" entry points
- [x] Student route renders inside a fixed landscape iPad frame (1180×820 logical px or similar), centred, with a device bezel so it reads as an iPad at a glance
- [x] Demo assignment fixture: one assignment, five prerequisite subskills (rearranging & standard form, fractions, factorising, expansion, reading the graph), four problems each with a worked solution
- [x] All maths is typeset with KaTeX; nothing renders as raw `x^2`
- [x] Design tokens (colours, fonts, shadows) live in one place and match the roughdraft's palette plus a blue "standout correct" colour
- [x] Architecture note written for the ticket and folded into `ARCHITECTURE.md`
