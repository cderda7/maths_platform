# 155: A badge in the picker's menu sits on its own line, the dot centred on the pair

**What to build:** In the example picker's menu, "unit focus" and "fixed in group review" sit on their own line under the mistake's name, never broken across lines, and the red or green dot is centred on the name-and-badge block so the badge reads as part of that mistake. The count stays on the right, centred the same way. In every menu, at every width.

**Blocked by:** 152.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with Q3's column C menu open where "UNIT FOCUS" wrapped as "UNIT" on the name's line and "FOCUS" on the next: "in all instances, move 'unit focus' to a new line. center the red dot in between the skill & the 'unit focus' tag to make it clear that unit focus is tied to that skill".

## Solution

- `app/teacher/whole-class/ExamplePicker.tsx`: the option is `items-center`; the middle column (`data-option-name`) is the name as a block and, when there is one, a `data-option-badges` row (`flex flex-wrap`, `whitespace-nowrap` badges) under it; the dot and the count centre on that block.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`.

## Acceptance

- [x] From the report stage at 1400 and 1280 px, every slot's menu on every ticked problem: each option's dot and count are centred on the name block (within 1.5 px); every badge lies below the name's line, on one line, inside the slot
- [x] vitest (427), eslint, tsc, `next build`, headless sweep (`badge.mjs`)
