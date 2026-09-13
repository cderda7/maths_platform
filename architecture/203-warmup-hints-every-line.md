# 203 · Every warm-up has a hint for every line of its working

## Files touched

| File | What it does |
| --- | --- |
| `data/practice.ts` | 13 warm-ups go from one general hint to one hint per point (`at: [k]`, k = 0 … lines − 1), with linked words written against the student's line at that point. |
| `lib/hint.test.ts` | Every warm-up covers every point, the walk picks and stalls each hint in turn, general-hint tests on a synthetic problem, and the sweep's list matches the bank. |
| `scripts/warmup-leaves.json` | New: every warm-up leaf → lines in its working, which the sweep reads. |
| `scripts/hint-box-sweep.mjs` | Ticks all 15 leaves, reads every line (fails if it stops short), closes the stall notice and goes on, and ignores the zero-width conjured glyph when checking for movement. |

## How it connects

```
 data/practice.ts  PRACTICES[leaf].hints: [{ text, at: [0], terms → problem TeX },
                                           { text, at: [1], terms → steps[0].tex  (the student's line 1) }, …]
        │
        ├──► lib/hint.ts  pickHint(problem, lines, shown)   ── hint for where the lines have got
        │                 stalledHint(problem, lines, shown) ── latest hint, until a line past its point
        │                 hintAnchor(hint, lineCount)        ── problem (0) or the student's line k
        │
        ▼
 components/PracticePad.tsx
   "hint" live ⇔ pickHint ≠ null ∨ stalledHint ≠ null
     ├─ stalled → StallNotice → talkHint(hintOpener(n))   (ticket 198)
     └─ else    → run/hint → HintCard "Hint n" ( Talk it through → talkHint(TALK_OPENER) )

 scripts/warmup-leaves.json ──► scripts/hint-box-sweep.mjs (all 15, every line, every word)
        ▲
        └── lib/hint.test.ts holds it equal to { leaf: steps.length } over PRACTICES
```

## Verification

vitest, eslint, tsc, `next build`. `npm run sweep:hint-boxes` covers all 15 warm-ups, every line and every hint word, and checks that no lit box covers a neighbour and nothing moves. Before this ticket it reached 4 warm-ups and stopped at the first stall. Click-through `click199.mjs`: on every warm-up, at every point, "hint" is live and gives "Hint n". A second press shows the stall notice, and its pill opens the chat on hint n. The card's pill opens on the question alone. After the last line, "hint" is greyed.
