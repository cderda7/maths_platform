# 310: Q* and Q** for every Problem Set 6 question, and a completion problem for every practice skill

**What to build:** the questions the worked example-problem pair runs on. For each of Problem Set 6's ten questions, two whole questions like it (Q*, the worked example; Q**, the one the student finishes). For each of the 15 practice skills, a completion problem that sits between today's practice problem (now the worked example) and its follow-up (now the problem done alone). Data and tests only; no screen changes.

**Blocked by:** none (can start immediately).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

An outside review: a worked example behind a help menu is a reference document, not an instructional structure. The unit of instruction is example → minimally different problem, and studying an example only teaches when the student does something with it. The strongest-evidenced version is faded guidance: a full example, then the same method with the last steps blank for the student to write, then a problem alone.

The user (2026-09-15) agreed and set the shape:

- **Help from a set question:** Q → Q* (a whole different question, fully worked) → Q** (another whole different question, the student writes the missing lines) → back to Q. "Whole question", not an isolated skill: the student sees the method inside a question like the one they are stuck on, so the jump back to Q is small.
- **The warm-up** (no Q yet): the same three steps on the skill itself: worked example → completion problem → a problem alone.
- The user is fine without checking the questions: "go for it".

## Acceptance

- [ ] Every Problem Set 6 question (Q1–Q10, `data/assignment.ts`) has a Q* and a Q**: the same stem and the same deep structure (same kind of question, same number of steps in the same order, same skills tagged step for step), each changing one or two surface things (a coefficient, a sign, the context's numbers). Q* and Q** differ from each other and from Q, and none repeats a problem anywhere else in the app (the practice bank, the diagnostics' similar problems, the homework problems)
- [ ] Every step of Q* and Q** carries its TeX, a label and the skill tags, like Q's own `solution` steps, so the lines left blank in Q** can be read from the tags of the skill the student names (`HelpPicker`)
- [ ] Every point of Q** that can be blank has a hint (a move, never the answer) and the help chat's `approaches` where Q offers a choice of ways in
- [ ] Every one of the 15 practice skills (`PRACTICES` in `data/practice.ts`) has a completion problem on the same leaf: the same working as its worked example with one thing changed, its own hints for every point. Today's problem becomes the worked example and today's `followUp` becomes the problem done alone; nothing a student sees changes in this ticket
- [ ] The rule for which lines are blank is data-driven and written down once: in Q**, the steps tagged with the named skill; when every step carries it (the warm-up's single-skill problems), the last two steps (the last one for a two-step problem)
- [ ] Every maths fact hand-checked and held by `lib/*.test.ts`: every factorisation expands back, every pair's sum and product, every root substituted, every discriminant and turning point recomputed, every step a true consequence of the one before
- [ ] Every TeX string typesets in KaTeX without error and on one line (the "maths never splits" rule); TeX backslashes doubled in TS strings (see project testing pitfalls)
- [ ] The types live beside `PracticeProblem` in `data/types.ts`; the data in a new file (for example `data/pairs.ts`), not in `data/assignment.ts`
- [ ] vitest, eslint, tsc, next build
- [ ] Ticket docs: architecture note `architecture/310.md`, the ARCHITECTURE row, a DECISION_LOG entry for the data shape

## Notes

- Keep Q's difficulty. Q2 is non-monic with a negative constant, so Q* and Q** are non-monic with a negative constant.
- A figure-based question (sketching) keeps the same kind of figure.
- Screens come in tickets 312 (help from a set question) and 313 (the warm-up).
