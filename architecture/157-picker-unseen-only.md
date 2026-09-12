# 157 · The picker's menu offers only mistakes not already on show

Route: `/teacher/whole-class`.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/whole-class/WholeClassSetup.tsx` | `taken`: the option key behind each of the problem's slots, passed to every `ExamplePicker`. |
| `app/teacher/whole-class/ExamplePicker.tsx` | Lists `options − taken`; with none left the header is inert (no chevron, no popup, a title). |

## How it connects

```
 Q7 card            options: correct · scaled two… · tripled… · pair adds to nine
 ┌─────────┬─────────┬─────────┐
 │ A       │ B       │ C       │   refs ──optionOf──► taken = [correct, scaled two…, tripled…]
 │ correct │ scaled… │ tripled…│
 └────┬────┴─────────┴─────────┘
      ▾ menu = options − taken = [ pair adds to nine ]
 swap B ► pair adds to nine   ⇒ taken changes ⇒ every menu now offers "scaled two…"
 Q3: three options, three slots ⇒ unseen = [] ⇒ headers inert, no chevron
```

## Verified by

vitest (432), eslint, tsc, `next build`; `unseen.mjs`: Q7's three menus each offer only "pair adds to nine"; after swapping B, A's menu offers "scaled two of three terms"; Q3's three headers are inert with no chevron and a click opens nothing.
