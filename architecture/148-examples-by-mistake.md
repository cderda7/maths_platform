# 148 · Class review examples chosen by mistake

Route: `/teacher/whole-class` (the setup); the counts reach `/board`.

## Files touched

| File | What it does |
|---|---|
| `data/evaluation.ts` | `LineVerdict.name` on every wrong line: the mistake in five words or fewer. |
| `lib/examples.ts` | `mistakeOf`, `Candidate.mistake`, `ExampleOption`, `optionsFor`, `optionOf`, `exampleOf`, `PickerContext`; `suggestExamples` and `boardExamples` by exact mistake. |
| `app/teacher/whole-class/ExamplePicker.tsx` | One slot: header (name · count), chip and badges, working, names, the flyout menu. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | Renders the picker per slot with the unit and the group run; swap by `ExampleRef`. |
| `lib/examples.test.ts`, `lib/evaluate.test.ts` | Tests. |

## How it connects

```
 candidatesFor(problem, session)                       data/evaluation.ts
 ┌───────────────────────────────┐                     wrong line ─► { tags, name: "scaled two of three terms", … }
 │ Candidate { lines, bucket,    │
 │   mistake = wrong lines' TeX }│──┐
 └───────────────────────────────┘  │  optionsFor(cands, { unit, group })
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ ExampleOption[]  (correct first, then by count, fixedInGroup last)      │
 │  { key, name, leaf, count, columns: [ {lines, students}, … ] (largest  │
 │    first), unitFocus: a tag on the unit's leaf, fixedInGroup: a member │
 │    of the group that resolved this problem is on it }                  │
 └──────────────┬───────────────────────────────────────┬─────────────────┘
                │ suggestExamples → exampleOf(option)   │ optionOf(options, studentId)
                ▼                                       ▼
 /teacher/whole-class                          ExamplePicker (per slot)
 ┌───────────────────────────────────────┐     ┌──────────────────────────────────┐
 │ problem list (unchanged)  │ Q7 card   │     │ A  [correct · 7 ▾]               │
 │ ✓ Q7 12/14 struggled      │ A │ B │ C │     │    chip  unit focus  fixed…      │
 │ ✓ Q2 …                    │   │   │   │     │    working lines                 │
 │ ✓ Q3 …                    └───┴───┴───┘     │    Priya, Noah                   │
 │ [Project]  → wc/setup { examples: ExampleRef[] } │  ▾ menu (absolute, z-30):    │
 └───────────────────────────────────────┘     │    ● correct           2 students│
                                               │    ● scaled two…       7 students│
 /board  boardExamples(refs)                   │    ● tripled…          4 students│
   count = students with the same `mistake`    │    ● pair adds to nine 2 students│
   (correct: all who got it right) / handed in └──────────────────────────────────┘
```

## Verified by

vitest (426), eslint, tsc, `next build`; the click-through `picker.mjs` (student tab at individual review, the setup, the board, then the report stage): the problem list untouched; Q7's slots correct · 2, scaled two of three terms · 7, tripled, third never restored · 4 with chips and names; Q3's unit focus badge; the menu a flyout with the card's rect unchanged, correct then 7 / 4 / 2, current checked; the swap changes B only; the board's Q2 counts equal the setup's; at the report stage Q2's guessed pair is badged fixed in group review, last in the menu and not suggested.
