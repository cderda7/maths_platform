# 155 · A badge in the picker's menu on its own line

Route: `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/whole-class/ExamplePicker.tsx` | Menu option: `items-center`; name as a block with a badges row under it; dot and count centred on the block. |

## How it connects

```
 menu option (flex, items-center)
 ┌──┬────────────────────────────────┬──────────────┐
 │  │ null factor law without zero   │              │
 │● │ [UNIT FOCUS]                   │  5 students  │   ← dot and count centred on the two-line block
 │  │                                │              │
 └──┴────────────────────────────────┴──────────────┘
      data-option-name: block name + data-option-badges (flex-wrap, nowrap badges)
```

## Verified by

vitest (427), eslint, tsc, `next build`; `badge.mjs`: from the report stage at 1400 and 1280 px, every slot's menu opened; per option the dot's and the count's centres within 1.5 px of the name block's centre, every badge below the name's line, one line tall, inside the slot.
