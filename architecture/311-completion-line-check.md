# 311: A line written into a blank step is checked against that step

## Files touched

| File | What it does |
| --- | --- |
| `lib/stepCheck.ts` | New. `checkStep({ tex, tags }, line)` → `right`, `wrong` (with a `MisconceptionId` when a known slip fits) or `unreadable`. Reads both lines into a canonical form (`Line` → parts joined by ⇒ → unordered statements → chains of items and relations → unordered sums of terms → unordered factors) and compares keys. A wrong line runs through `SLIPS` in order. `readsAsStep` and `CHECKED_MISCONCEPTIONS` for the tests. |
| `lib/texEval.ts` | Reading and arithmetic split into two stages. `tokenizeTex` also knows relations, `,` `;` `:`, `\text{…}`, bare "or"/"and", `\Rightarrow`, Greek letters, and drops spacing and `\checkmark`. `expressionAt(tokens, from)` returns a `TexNode` tree and stops where an expression ends (`,` inside `(…)` makes a point). `parseTex` reads a whole expression. `evalTex` evaluates the tree and still throws on anything else, so ticket 240's tests read the same. `sides`, `sameFunction`, `namedValues` are unchanged. |
| `lib/warmup.ts` | `ScriptSlips` (wrong lines by step index), `padScript(steps, slips)` and `warmupScript(p, slips = {})`. With no slips it writes exactly the steps, as every run today does. |
| `lib/stepCheck.test.ts` | New, 706 cases. Every Problem Set 6 step and every practice problem and follow-up reads and is right against itself, unspaced and double-spaced. A sign flipped or a digit changed is wrong. Equivalent forms are right, unreadable lines are unreadable, and each named slip carries its id. The check agrees with every set's evaluation table (verdicts, and misconceptions where it names one). The demo script writes a wrong line and then the right one, burst by burst through `nextLine`. |

## How it connects

```
  a blank step (any source)          a recognised line
  { tex, tags }                      "x = -4 or x = -1/2"
  data/assignment.ts solution          │
  data/practice.ts steps               │ isTex? else lib/mathInput.ts toTex (x**2, 1/3, <=)
  ticket 310's Q** / completion        │
        │                              ▼
        │              ┌──────────────────────────────────────────────┐
        └────────────▶ │ lib/stepCheck.ts  checkStep ◄311             │
                       │   readLine: tokens ─▶ parts ⇒ statements     │
                       │     (or / and / , / :) ─▶ chains (= < >)     │
                       │     ─▶ items: \text words · expressions      │
                       │   sumOf(TexNode) ─▶ canonical Sum/Term/Factor│
                       │   lineKey(expected) = lineKey(got) ─▶ right  │
                       │   else SLIPS in order ─▶ wrong + id | wrong  │
                       │   rewrites(expected term) · atOnePlace(frame)│
                       └───────────────┬──────────────────────────────┘
                                       │ tokenizeTex · expressionAt
                                       ▼
                       ┌──────────────────────────────────────────────┐
                       │ lib/texEval.ts ◄311  one grammar             │
                       │   TexToken ─▶ TexNode ─▶ evalTex (tests of   │
                       │   diagnostics, homework: unchanged results)  │
                       └──────────────────────────────────────────────┘
                                       │ ids
                                       ▼
                       data/misconceptions.ts  MisconceptionId (names on every screen)

  demo pad (unchanged callers)
  components/PracticePad ── warmup and practice overlay ──▶ warmupScript(p)        ─▶ exactly p.steps
  ticket 312 (Q**)        ─────────────────────────────────▶ padScript(steps, slips) ─▶ …, wrong, right, …
                                                                    │ one line per burst
                                                                    ▼
                                                      lib/recognition.ts nextLine ─▶ checkStep per line
```

## Notes

- Nothing on screen changes. Ticket 312 draws the marking and chooses the demo's slips (named simulation data, passed as `slips`).
- Ticket 310 had not landed on main when this was built, so its blanks are not tested here. Ticket 312 adds those tests.
