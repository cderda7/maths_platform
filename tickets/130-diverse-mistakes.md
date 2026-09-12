# 130: More mistakes, more kinds of mistake

**What to build:** The classmates make about a third more mistakes, and the mistakes come in more kinds. Every problem that had one way to go wrong has at least two; Q7 has three. The class's slips take a shape a teacher would recognise: one problem nearly everyone got wrong (Q7, twelve classmates), one that a single student got wrong (Q6, Amelia), and one nobody got wrong (Q8). The screens that read the same fixtures (class view, groups, report, the board race, class review examples, peers) follow.

**Blocked by:** none (fixtures from tickets 36 and 23; the exact-mistake boxes are ticket 131).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "let's diversify the mistakes more & have students make more mistakes. like 30% higher mistakes." The fixtures had 32 wrong student-problem entries and, for six of the ten problems, exactly one wrong line in the evaluation table, so every pill on the mistake view was one identical mistake and the view to come (ticket 131, a box per exact mistake) would have had nothing to show. In the interview the user settled: the shape beats the budget (the total lands where twelve / one / zero put it, about 44); Q7 is the twelve with at least three dysfunctional strategies, Q6 Amelia's alone, Q8 nobody's; only problems a student already reached; Priya, Chloe and Grace untouched; every new wrong with a teacher note and the clarification extended; the other screens and their tests move with the data.

## Solution

- `data/evaluation.ts`: six new wrong lines, each with a student clue and a teacher note, plus the lines that follow from them (`builtOn`): Q1 `(x − 1)(x − 6) = 0` (a pair that multiplies to 6 but adds to 7); Q2 `x = −½ or x = −4` (the right factors, a sign lost solving one; linear equations); Q3 `x² + x − 6 = 6` (a sign lost in the expansion); Q4 `x = (−5 ± √37) / 6` (−b written as −5); Q7 `1 × 8 = 8, 1 + 8 = 9` (the third taken out, then the wrong pair; monic factorising); Q9 `−x(x + 6) = 0` (−x taken out with the sign left behind; expansion). Q10's existing "Δ < 0 ⇒ two real solutions" gains the sentence that follows from it.
- `data/classmates.ts`: eight new attempt scripts (`Q1_PAIR`, `Q2_SIGN`, `Q3_EXPAND`, `Q4_B_SIGN`, `Q7_LOST_THIRD`, `Q7_PAIR`, `Q9_SIGN`, `Q10_FORMAL`). The wrongs go from 32 to 45: Q7 gains Amelia, Zara, Ethan, Finn (multiplied through, lost the third), Isla, Oliver, Sofia (two of three terms scaled) and Lucas, Ruby (the wrong pair), so twelve classmates in six / four / two, Noah the one eligible student who got it right; Lucas loses Q6 (Amelia alone) and his Q10 becomes the formal slip; Liam gains Q1 (the wrong pair, beside Oliver's, now the same) under Ethan's sign flip; Finn Q2, Harper Q3, Isla Q4, Mia Q9. Every new wrong has a note on the student and their clarification says it in their words; Tomas's Q3 and Q5, which had none, get theirs.
- `data/race.ts`: the mint and violet rows follow their unions (six and seven problems), tuned so mint and amber are still home inside five minutes and coral and violet after nine.
- Tests follow the data: `lib/mistakes.test.ts` (the shape: 45 wrongs, Q7's twelve in three strategies, Q6's one, Q8's none, two slips under one skill on Q1 and Q4 and under two on Q2, Q3, Q9, Q10, the untouched three, a note for every wrong), `standings` (the demo group's twelfths, the unions and totals, the five-minute snapshot), `group`, `peers`, `examples` (Q2's third bucket), `commentary`.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] 45 wrong entries across the eighteen classmates who handed in; Priya, Chloe and Grace as before
- [x] Mistake view: Q7 has twelve students (fractions pill over ten, monic factorising over two), each with exactly one wrong line, six / four / two by wrong line; Q6 has Amelia alone; Q8 is absent
- [x] Q1 and Q4 each one pill over two different wrong lines; Q2, Q3, Q9 and Q10 each two pills
- [x] Every line of every classmate's working is known to the evaluator (no unclear lines)
- [x] Class review setup ranks Q7 first (12/14 struggled), Q2 and Q3 next; Q2 offers three examples (correct, non-monic factorising, linear equations)
- [x] The board race still has two groups home before five minutes and two after nine, all inside ten
- [x] vitest (396), eslint, tsc, `next build`, headless run (`mistakes130.mjs`, 18 checks, crops of the mistake view, class view, report, groups and class review)
