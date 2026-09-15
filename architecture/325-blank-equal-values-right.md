# 325: A line in a blank step with its numbers written another way is right

## Files touched

| File | What it does |
| --- | --- |
| `lib/stepCheck.ts` | `checkStep` keeps its signature and result. Inside the canonical form: `numberFactor` reads a number exactly in whole numbers (BigInt; too long to hold exactly, it stays its digits); `quotient` makes a fraction of two lone numbers that number, except a fraction the step writes not in lowest terms, which a `Reading` notes while the step is read (`held`) and keeps as a fraction in both lines; `termKey` reads each bracket of a product either way round, its minus on the term. The slips and the rest of the form are unchanged. |
| `lib/stepCheck.test.ts` | One existing test updated (`x = -0.5` for `x = -\tfrac{1}{2}` is now right). New block: the spec's equal forms right, rounded numbers wrong, equal lines that are another step wrong, the kept fraction, sentences by their words, slips still named, and every blank of `data/pairs.ts` (through `blankSteps`) right with its fractions as decimals and its numbers as unsimplified fractions, and not right written as the step before or after. |

## How it connects

```
  a blank step { tex, tags }                         the line written into it
  (Q** / completion via lib/pairs.ts blankSteps,     "x = 0.5 or x = -\tfrac{8}{2}"
   Problem Set 6, the practice bank)                  │
        │                                             │
        ▼                                             ▼
  ┌───────────────────────────────────────────────────────────────────────────┐
  │ lib/stepCheck.ts  checkStep(step, line) → right | wrong(+id) | unreadable │
  │                                                                           │
  │  held = {}                                                                │
  │  readLine(step.tex, { step: true,  held }) ──┐  notes \dfrac{6}{2}-style   │
  │  readLine(line,     { step: false, held }) ──┤  fractions into held       │
  │                                              ▼                            │
  │   sumOf / factorOf ─▶ numberFactor ◄325  exact p/q (BigInt), never rounded│
  │                    ─▶ quotient     ◄325  n/m of lone numbers → its value  │
  │                                          unless held (the step's point)   │
  │   lineKey ─▶ termKey ◄325  each bracket either way round, sign on the term│
  │                                                                           │
  │   keys equal ─▶ right      else SLIPS (unchanged) ─▶ wrong + misconception │
  └───────────────────────────────────────────────────────────────────────────┘
        │ same signature and result shape
        ▼
  ticket 312's ladder (lib/ladder.ts, in flight) · the tests (stepCheck, pairs, evaluation tables)
```

## Notes

- No screen changes.
- Still a different statement: products of numbers multiplied (`2 \times 4` for `8`), sums collected, equations rearranged or turned by −1, a fraction of x for a coefficient (`\tfrac{x}{2}` for `\tfrac{1}{2}x`), sentences in other words.
