# 157: The picker's menu offers only mistakes not already on show

**What to build:** On the class review setup, a slot's menu lists only the options (correct, or a mistake) that are not already in one of that problem's slots, this slot's own included. Swapping frees the old option for the other slots' menus. When every option is on show, the slot's header is inert: no chevron, no menu, a title saying every mistake on this problem is already shown.

**Blocked by:** 155.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with Q3's column C menu open listing correct, null factor law without zero and sign lost in the expansion, all three already in A, B and C: "only present options that haven't already been selected."

## Solution

- `app/teacher/whole-class/WholeClassSetup.tsx`: per problem, `taken` is the option key behind each slot's example (`optionOf`); passed to every slot.
- `app/teacher/whole-class/ExamplePicker.tsx`: `unseen = options − taken` is what the menu lists; with none, the header carries `aria-disabled`, `data-pick-exhausted`, no `aria-haspopup`, no chevron and a title, and a click does nothing.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] Q7 (four options, three slots): each slot's header is live with a chevron and its menu offers exactly "pair adds to nine"
- [x] Swapping B to it: B reads "pair adds to nine" and A's menu now offers "scaled two of three terms"
- [x] Q3 (three options, three slots): every header inert with no chevron and no popup; a click opens nothing
- [x] vitest (432), eslint, tsc, `next build`, headless run (`unseen.mjs`)
