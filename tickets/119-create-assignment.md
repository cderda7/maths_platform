# 119: The create screen: questions typed into tiles, and Q1 in the bank mirrored

**What to build:** A new first screen for a new assignment at `/teacher/assignments/create`, where the teacher types the questions and nothing else: a title, then the questions as tiles in the five-wide grid the student's overview uses. Each tile is one question and the grid is the editor. Maths is typed the way a calculator or a programming language takes it (`x**2`, `1/3`, `sqrt(2)`) and renders as KaTeX live. Continue saves the draft and opens the review screen, a stub for the screen that decides the unit, the pathway and the rest. The old screen at `/teacher/assignments/new` is left untouched for that work to reference. Separately, the bank's Q1 becomes `x^2 + 5x + 6 = 0`.

**Blocked by:** 19 (the old screen), 117 (last ticket on main).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on the old screen: "new assignment view sucks. eliminate all this … also eliminate checkmark -- if they've typed it, they're going to use it … fully open the question view -- so i'm not just seeing part of it … we need to have 2 screens. one: basic teacher input -- just inputting the question. for rn we'll skip the whole 'inputting latex' concern -- i'll type in basic like coding language, eg x**2 & want that to render as KaTeX … AFTER INPUT, this opens second window … rn don't touch the existing screen so that my new agent can still reference that. so build a new screen -- basic teacher input of questions. make it a fantastic user experience." Then the student overview's tile grid as the inspiration: "use this view for inspiration. good clear upload."

The interview settled: one free-text box per question with the maths detected rather than delimited; the tile is the editor (typed text on top, the rendered question beneath, live; blurred tiles show only the rendered question); the last tile is a ghost; Enter, Backspace-on-empty, × and paste-splits; a "Q3 removed. Undo" line plus Cmd+Z, last removal only; five across, fixed size, the page scrolls, nothing inside a tile scrolls or grows; no convention hint on screen; title optional; Continue pinned bottom right; the draft in the classroom store; a stub review route.

And, before starting: "change the first problem to x**2 + 5x + 6 = 0".

## Solution

- `lib/mathInput.ts`: `parseQuestion` reads one typed line into prose segments with inline maths and the centred expression (the final maths run when it ends the text, a trailing full stop allowed; a newline forces the split); `toTex` is the shorthand grammar (`**`/`^`, `_`, `a/b` as a stacked fraction bound to the atoms either side, `*`, `sqrt()`, `pi`, `inf`, `<= >= != +-`, upright `sin cos tan log ln exp`, pasted unicode); `typesets` guards against KaTeX's red; `stemText`, `splitPaste`. Detection is by token: strong (digits, operators, calls) versus weak (a single letter, maths only beside a strong token), with sentence punctuation closing a run.
- `components/QuestionView.tsx`: a parsed question as the student's card body, a run KaTeX cannot set shown as typed.
- `app/teacher/assignments/create/`: `page.tsx`, `CreateAssignment.tsx` (title, the grid, removal and undo, the draft saved on every change and read back on load via a client-only editor, Continue), `QuestionTile.tsx` (the tile as editor: the auto-growing text box, Enter/Shift+Enter/Backspace/paste, the ×), `review/page.tsx` and `review/ReviewStub.tsx` (lists the draft in the same tiles).
- `lib/classroom.ts`: `AssignmentDraft`, `DraftQuestion` (`id`, `text`, `stem` with inline maths as `$…$`, `tex`), `draft` on the state, the `draft/set` action.
- `app/teacher/TeacherChrome.tsx`: the "New assignment" pill points at the create route and is lit on either create route.
- `app/globals.css`: `.grow-wrap`, the text box that takes its text's height.
- Q1 mirrored through `data/assignment.ts`, `data/evaluation.ts`, `data/recognition.ts`, `data/classmates.ts` and nine test files: the correct factorisation is `(x+2)(x+3)`, roots −2 and −3; the scripted sign slip is now `(x-2)(x-3)` with roots 2 and 3; Grace's jump is `x = -2, -3`.
- Tests: `lib/mathInput.test.ts` (14), a `draft/set` case in `lib/classroom.test.ts`. Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `ASSUMPTIONS.md`, `README.md`.

## Acceptance

- [x] First load: the class eyebrow, "Untitled assignment" as the title's placeholder, one ghost tile Q1 with the caret in it, Continue off
- [x] Typing in a tile renders the question beneath the text box as you type; the next ghost appears; Enter moves the caret to it; Shift+Enter forces the prose/expression split; a paste of several lines becomes several tiles
- [x] `Solve for x. x**2 + 5x + 6 = 0`, `(x-3)(x+2) = 6`, `1/3x**2 + 2x + 8/3`, an inline `y = x**2 + 4x + 5` in the prose, `k` and `x-axis` as prose: all render as the bank's tiles do
- [x] Blurred tiles show only the rendered question; × on hover and while focused; × and Backspace-on-empty remove and renumber; "Q2 removed. Undo" and Cmd+Z restore in place; Backspace in the ghost steps back
- [x] Five across, fixed squares (±1px rounding), no tile's content overflowing, twenty-one questions scroll under a pinned Continue that never overlaps the reset pill
- [x] A reload keeps the title and the questions; Continue routes to the review stub, which lists them; the old screen still renders at its URL; no difficulty tags, chips, unit focus or pathway on the new screen
- [x] vitest (376), eslint, tsc, `next build`, headless run (`create.mjs`, 31 checks) with screenshots
