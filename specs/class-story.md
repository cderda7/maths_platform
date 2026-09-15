# The class story sheet: 11 Methods, Problem Sets 1–6

<!-- Generated from data/story.ts by `npm run story:sheet`. Do not edit by hand: change data/story.ts and regenerate; `data/story.test.ts` fails while the two differ. -->

The contract for the six sets in the Classroom (ticket 210). For every student and every category a set assesses, the status the Class View shows on that set and the one or two patterns behind anything short of secure, with the problems that carry them. Sets 5 and 6 are read from the real data (Set 6: the classmates' end state; Sam's Set 6 is his live session). Sets 1–4 are authored to it (tickets 211–214), and `data/finishedSets.test.ts` checks every registered set equals its rows.

## Rules

- **Statuses**: gap (red), developing (orange), solid (light green), secure (dark green). *not seen*: the set assesses the category but the student has nothing on it (missing, or never reached those problems). *absent*: the student was away for the set (ticket 250), out of its counts. *—*: the set does not assess the category. *live*: Sam on Set 6.
- **One step**: in each category, a student's neighbouring results (skipping *—*, *not seen* and *absent*) differ by at most one step, gap ↔ developing ↔ solid ↔ secure. Variation, never a jump.
- **How a status comes out** (`lib/hierarchy.ts`): a leaf is held lines ÷ attempted lines tagged with it (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap); a group and a category take their worst leaf. So one slip on a leaf the student wrote on five or more times reads solid, on three or four times developing, on one or two a gap. Communication is the share of lines that skip no step. A set's New skills count under New skills on that set, not under their home.
- **Priya** is secure in every category on every set. **Sam** is the demo student.
- **Review** (tickets 244, 278, 281; settled with the user 2026-09-14): a student brings to their seating group every problem they did not get right first time (a mistake, a problem left incomplete, one not attempted; a student away brings nothing). A *one-off* slip (that mistake on one problem of the set, the pattern naming only it, no gap in its category) is fixed on the student's own rework. Everything else is the group's: a *repeated* slip, a *pattern* (a gap in the slip's category on the set), a problem left incomplete or not attempted. The group solves it when a member at the table had it right first time, a pattern included; a problem nobody at the table had right stays unsolved, and the group's last try is its own working, still wrong, never a member's first submission. At most once a set, the *exception*: a problem nobody had right that the group solves because one member's first submission went wrong on a single line and the hint after the second wrong check named it. On every set one or two groups meet the set's hardest problem with nobody at the table able to do it. The demo group's Set 6 versions are its scripted run (`data/group-scripts.ts`). `lib/reviewRule.ts` applies the rules; each set's review below lists every case with its reasoning.
- **Class review** (ticket 281): on Sets 1, 3 and 6 only. It covers every problem a group left unsolved, each with one or two examples of the class's real wrong working, shown unnamed: the most common slip first, from a table that left it unsolved when one made it.

## The sets

| Set | Due | New skills | Pathway | Assesses | Absent | Missing | Did not finish | Top gaps | Data |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Problem Set 1 — Surds | Tue 25 Aug | surds | individual → group → whole-class | Algebra, Communication, Reasoning, New skills | nobody | nobody | tomas 9, liam 5, grace 8 | square out, root not taken; roots added like numbers; divided the wrong way round | ticket 211, data/pset1/ |
| Problem Set 2 — Rationalising and expanding with surds | Fri 28 Aug | surds, binomial identity | individual → group | Algebra, Communication, Reasoning, New skills | nobody | nobody | tomas 8, liam 5, grace 7 | not multiplied into every term; square and difference mixed; sign of a product wrong | ticket 212, data/pset2/ |
| Problem Set 3 — Expanding and factorising | Tue 1 Sep | binomial identity | individual → group → whole-class | Algebra, Communication, Reasoning, New skills | nobody | nobody | jordan 9, liam 5, grace 9, oliver 9 | product right, sum wrong; square and difference mixed; minus not carried through | ticket 213, data/pset3/ |
| Problem Set 4 — Non-monic factorising and completing the square | Fri 4 Sep | binomial identity, null factor law | individual → group | Algebra, Functions, Graphing, Communication, Reasoning, New skills | nobody | nobody | jordan 8, tomas 9, liam 5, grace 6, oliver 8 | brackets don't expand back; root or vertex sign wrong; square added, not taken away | ticket 214, data/pset4/ |
| Problem Set 5 — Features of a parabola | Mon 7 Sep | null factor law, binomial identity | individual → group | Algebra, Functions, Graphing, Communication, Reasoning, New skills | nobody | nobody | jordan 8, tomas 7, liam 5, grace 7, oliver 9 | brackets don't expand back; root or vertex sign wrong; signs swapped in the pair | data/pset5/ (ticket 187) |
| Problem Set 6 — Roots of a quadratic | Thu 10 Sep | discriminant, null factor law | individual → group → whole-class | Algebra, Functions, Graphing, Communication, Reasoning, New skills | chloe | nobody | jordan 7, tomas 7, liam 4, noah 9, ethan 8, grace 4, harper 6, oliver 7 | not multiplied into every term; product right, sum wrong; brackets don't expand back | data/assignment.ts, data/classmates.ts (the live set; rows are the classmates' end state) |

### Problem Set 1 — Surds

Simplifying surds and operating with them: simplify, collect like surds, multiply and divide, leave answers exact, a short worded problem.

| Problem | Asks | Model solution carries at least |
| --- | --- | --- |
| Q1 | Simplify √48. | surds (`algebra.number.surds`) |
| Q2 | Simplify 3√50. | surds (`algebra.number.surds`) |
| Q3 | Simplify and collect: √12 + √27. | surds (`algebra.number.surds`), linear equations (`algebra.equations.linear`) |
| Q4 | Simplify and collect: 2√18 − √8. | surds (`algebra.number.surds`), linear equations (`algebra.equations.linear`) |
| Q5 | Multiply and simplify: √6 × √10. | surds (`algebra.number.surds`), indices (`algebra.number.indices`) |
| Q6 | Multiply and simplify: 2√3 × 5√6. | surds (`algebra.number.surds`), indices (`algebra.number.indices`) |
| Q7 | Divide and simplify: 6√10 ÷ 2√5. | surds (`algebra.number.surds`), fractions (`algebra.number.fractions`) |
| Q8 | Expand and simplify: √2(3 + √8). | surds (`algebra.number.surds`), expansion (`algebra.expand-factor.expand`) |
| Q9 | Solve, leaving the answer exact: √3 x = √75 − √12. | surds (`algebra.number.surds`), linear equations (`algebra.equations.linear`), fractions (`algebra.number.fractions`) |
| Q10 | A square tile has area 72 cm². Find its side length and its diagonal, exactly. | worded problems (`reasoning.interpret.worded`), surds (`algebra.number.surds`), conclusions in context (`reasoning.justify.conclusions`) |

The set's rows (each student's patterns are under their name below):

| Student | Handed in | Algebra | Communication | Reasoning | New skills |
| --- | --- | --- | --- | --- | --- |
| sam | 10/10 | secure | secure | secure | secure |
| priya | 10/10 | secure | secure | secure | secure |
| jordan | 10/10 | secure | secure | secure | secure |
| amelia | 10/10 | developing | secure | secure | solid |
| tomas | 9/10 | developing | secure | not seen | solid |
| zara | 10/10 | secure | secure | secure | secure |
| liam | 5/10 | not seen | secure | not seen | developing |
| aiden | 10/10 | developing | secure | secure | secure |
| mia | 10/10 | secure | secure | secure | secure |
| noah | 10/10 | secure | secure | secure | secure |
| chloe | 10/10 | secure | secure | secure | solid |
| ethan | 10/10 | secure | solid | secure | secure |
| isla | 10/10 | secure | secure | secure | solid |
| lucas | 10/10 | secure | secure | secure | secure |
| grace | 8/10 | secure | solid | not seen | secure |
| harper | 10/10 | secure | secure | secure | secure |
| oliver | 10/10 | secure | secure | secure | solid |
| ruby | 10/10 | secure | secure | secure | solid |
| finn | 10/10 | solid | secure | secure | secure |
| sofia | 10/10 | developing | secure | secure | secure |

The set's review (individual → group → whole-class): 13 fixed on the student's own rework, 12 solved in group review, 3 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| amelia | Q3, Q7 | — | — |
| tomas | Q4, Q7 | Q10 | — |
| liam | Q2, Q3, Q4 | Q6, Q7, Q8, Q9, Q10 | — |
| aiden | Q8 | — | — |
| chloe | Q1, Q5 | — | — |
| isla | Q4 | — | — |
| grace | — | Q9, Q10 | — |
| oliver | Q4, Q10 | — | — |
| ruby | — | Q1, Q6 | Q10 |
| finn | — | Q9 | Q10 |
| sofia | — | Q7 | Q10 |

- amelia Q3 · own rework: One-off: √12 + √27 collected before simplifying, on Q3 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: cancelled the numbers but not the surds when dividing, on Q7 alone. Found on the second submission.
- tomas Q4 · own rework: One-off: a sign lost collecting 2√18 − √8, on Q4 alone. Found on the second submission.
- tomas Q7 · own rework: One-off: the fraction turned over dividing surds, on Q7 alone. Found on the second submission.
- tomas Q10 · group review: Not attempted. Priya, Amelia and Aiden had Q10 right, and the group's rework holds.
- liam Q2 · own rework: One-off: √50 written as 25√2, on Q2 alone. Found on the second submission.
- liam Q3 · own rework: One-off: √12 and √27 added under one root, on Q3 alone. Found on the second submission.
- liam Q4 · own rework: One-off: the subtraction collected as an addition, on Q4 alone. Found on the second submission.
- liam Q6 · group review: Not attempted. Sam, Jordan and Zara had Q6 right, and the group's rework holds.
- liam Q7 · group review: Not attempted. Sam, Jordan and Zara had Q7 right, and the group's rework holds.
- liam Q8 · group review: Not attempted. Sam, Jordan and Zara had Q8 right, and the group's rework holds.
- liam Q9 · group review: Not attempted. Sam, Jordan and Zara had Q9 right, and the group's rework holds.
- liam Q10 · group review: Not attempted. Sam, Jordan and Zara had Q10 right, and the group's rework holds.
- aiden Q8 · own rework: One-off: √2 multiplied into the first term only, on Q8 alone. Found on the second submission.
- chloe Q1 · own rework: One-off: √48 simplified to 2√12 and left there, on Q1 alone. Found on the second submission.
- chloe Q5 · own rework: One-off: √60 taken as 4√15, the 4 not rooted, on Q5 alone. Found on the second submission.
- isla Q4 · own rework: One-off: a sign wrong subtracting like surds, on Q4 alone. Found on the second submission.
- grace Q9 · group review: Not attempted. Isla, Lucas and Harper had Q9 right, and the group's rework holds.
- grace Q10 · group review: Not attempted. Isla, Lucas and Harper had Q10 right, and the group's rework holds.
- oliver Q4 · own rework: One-off: √8 simplified as 4√2, on Q4 alone. Found on the second submission.
- oliver Q10 · own rework: One-off: √(72 + 72) split into √72 + √72, on Q10 alone. Found on the second submission.
- ruby Q1 · group review: Repeated: a square factor left under the root (Q1, Q6, Q10). Oliver, Finn and Sofia had Q1 right, and the group's rework holds.
- ruby Q6 · group review: Repeated: a square factor left under the root (Q1, Q6, Q10). Oliver, Finn and Sofia had Q6 right, and the group's rework holds.
- ruby Q10 · still wrong: Repeated: a square factor left under the root (Q1, Q6, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong.
- finn Q9 · group review: Repeated: divided the wrong way round solving for x (Q9, Q10). Oliver, Ruby and Sofia had Q9 right, and the group's rework holds.
- finn Q10 · still wrong: Repeated: the diagonal found by dividing the side by √2 (Q9, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong.
- sofia Q7 · group review: Repeated: divided the wrong way round (Q7, Q10). Oliver, Ruby and Finn had Q7 right, and the group's rework holds.
- sofia Q10 · still wrong: Repeated: divided the wrong way round (Q7, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong.

Class review covered Q10:

- Q10 · shown: finn, oliver. Violet left Q10 unsolved. The board shows Finn's working (divided the wrong way round, 2 in the class) and Oliver's working (root of a sum split, 1 in the class), unnamed.

### Problem Set 2 — Rationalising and expanding with surds

Expanding brackets with surds, perfect squares and (a + b)(a − b) with surds, rationalising single-term and binomial denominators with the conjugate, a geometric problem left exact.

| Problem | Asks | Model solution carries at least |
| --- | --- | --- |
| Q1 | Expand and simplify √3(2√3 − 1). | surds (`algebra.number.surds`), expansion (`algebra.expand-factor.expand`) |
| Q2 | Expand and simplify (2 + √5)(3 − √5). | surds (`algebra.number.surds`), expansion (`algebra.expand-factor.expand`) |
| Q3 | Expand (√7 + 2)². | binomial identity (`algebra.expand-factor.binomial`), surds (`algebra.number.surds`) |
| Q4 | Expand (3 − √2)(3 + √2). | binomial identity (`algebra.expand-factor.binomial`), surds (`algebra.number.surds`) |
| Q5 | Rationalise 6/√3. | surds (`algebra.number.surds`), fractions (`algebra.number.fractions`) |
| Q6 | Rationalise √2/(2√5). | surds (`algebra.number.surds`), fractions (`algebra.number.fractions`) |
| Q7 | Rationalise 4/(√5 − 1). | binomial identity (`algebra.expand-factor.binomial`), surds (`algebra.number.surds`), fractions (`algebra.number.fractions`) |
| Q8 | Rationalise (√3 + 1)/(√3 − 1). | binomial identity (`algebra.expand-factor.binomial`), surds (`algebra.number.surds`), fractions (`algebra.number.fractions`), expansion (`algebra.expand-factor.expand`) |
| Q9 | Simplify 1/(2 + √3) + 1/(2 − √3). | binomial identity (`algebra.expand-factor.binomial`), fractions (`algebra.number.fractions`) |
| Q10 | A rectangle is (3 + √2) cm by (3 − √2) cm. Find its area and the length of its diagonal, exactly. | worded problems (`reasoning.interpret.worded`), binomial identity (`algebra.expand-factor.binomial`), surds (`algebra.number.surds`), conclusions in context (`reasoning.justify.conclusions`) |

The set's rows (each student's patterns are under their name below):

| Student | Handed in | Algebra | Communication | Reasoning | New skills |
| --- | --- | --- | --- | --- | --- |
| sam | 10/10 | solid | secure | secure | solid |
| priya | 10/10 | secure | secure | secure | secure |
| jordan | 10/10 | solid | secure | secure | secure |
| amelia | 10/10 | developing | secure | solid | developing |
| tomas | 8/10 | developing | secure | not seen | developing |
| zara | 10/10 | solid | secure | secure | solid |
| liam | 5/10 | developing | secure | not seen | gap |
| aiden | 10/10 | developing | secure | secure | secure |
| mia | 10/10 | solid | secure | secure | secure |
| noah | 10/10 | secure | secure | secure | solid |
| chloe | 10/10 | solid | secure | secure | solid |
| ethan | 10/10 | solid | solid | secure | secure |
| isla | 10/10 | solid | secure | solid | secure |
| lucas | 10/10 | solid | secure | solid | secure |
| grace | 7/10 | secure | developing | not seen | secure |
| harper | 10/10 | solid | secure | secure | solid |
| oliver | 10/10 | solid | secure | secure | solid |
| ruby | 10/10 | solid | secure | secure | secure |
| finn | 10/10 | solid | secure | secure | secure |
| sofia | 10/10 | developing | secure | secure | solid |

The set's review (individual → group): 25 fixed on the student's own rework, 18 solved in group review, 2 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q2, Q7 | — | — |
| jordan | Q2 | — | — |
| amelia | Q9, Q10 | Q7, Q8 | — |
| tomas | Q7 | Q5, Q6, Q9, Q10 | — |
| zara | Q3, Q9 | — | — |
| liam | Q2 | Q3, Q4, Q6, Q7, Q8, Q9, Q10 | — |
| aiden | Q1 | — | — |
| mia | Q9 | — | — |
| noah | Q3 | — | — |
| chloe | Q8, Q9 | — | — |
| ethan | Q8 | — | — |
| isla | Q2, Q10 | — | — |
| lucas | Q2, Q10 | — | — |
| grace | — | Q8, Q9 | Q10 |
| harper | Q1 | Q3 | Q10 |
| oliver | Q2, Q4 | — | — |
| ruby | Q9 | — | — |
| finn | Q6 | — | — |
| sofia | Q7 | Q5, Q6 | — |

- sam Q2 · own rework: One-off: √5 × (−√5) as +5, on Q2 alone. Found on the second submission.
- sam Q7 · own rework: One-off: the conjugate's sign wrong, on Q7 alone. Found on the second submission.
- jordan Q2 · own rework: One-off: a bracket's middle terms wrong expanding, on Q2 alone. Found on the second submission.
- amelia Q7 · group review: Repeated: multiplied only the denominator by the conjugate (Q7, Q8). Priya and Aiden had Q7 right, and the group's rework holds.
- amelia Q8 · group review: Repeated: multiplied only the denominator by the conjugate (Q7, Q8). Priya, Tomas and Aiden had Q8 right, and the group's rework holds.
- amelia Q9 · own rework: One-off: a denominator dropped adding the two fractions, on Q9 alone. Found on the second submission.
- amelia Q10 · own rework: One-off: the area found, the sentence about the diagonal left out, on Q10 alone. Found on the second submission.
- tomas Q5 · group review: Repeated: the fraction turned over rationalising (Q5, Q6). Priya, Amelia and Aiden had Q5 right, and the group's rework holds.
- tomas Q6 · group review: Repeated: the fraction turned over rationalising (Q5, Q6). Priya, Amelia and Aiden had Q6 right, and the group's rework holds.
- tomas Q7 · own rework: One-off: multiplied by the same bracket, not its conjugate, on Q7 alone. Found on the second submission.
- tomas Q9 · group review: Not attempted. Priya and Aiden had Q9 right, and the group's rework holds.
- tomas Q10 · group review: Not attempted. Priya and Aiden had Q10 right, and the group's rework holds.
- zara Q3 · own rework: One-off: (√7 + 2)² with 2√7 for the middle term, on Q3 alone. Found on the second submission.
- zara Q9 · own rework: One-off: a common denominator found, one numerator not scaled, on Q9 alone. Found on the second submission.
- liam Q2 · own rework: One-off: only two of the four terms expanded, on Q2 alone. Found on the second submission.
- liam Q3 · group review: Pattern: New skills is a gap on the set ((√7 + 2)² squared term by term). Sam and Jordan had Q3 right, and the group's rework holds.
- liam Q4 · group review: Pattern: New skills is a gap on the set ((3 − √2)(3 + √2) taken as 9 + 2). Sam, Jordan and Zara had Q4 right, and the group's rework holds.
- liam Q6 · group review: Not attempted. Sam, Jordan and Zara had Q6 right, and the group's rework holds.
- liam Q7 · group review: Not attempted. Jordan and Zara had Q7 right, and the group's rework holds.
- liam Q8 · group review: Not attempted. Sam, Jordan and Zara had Q8 right, and the group's rework holds.
- liam Q9 · group review: Not attempted. Sam and Jordan had Q9 right, and the group's rework holds.
- liam Q10 · group review: Not attempted. Sam, Jordan and Zara had Q10 right, and the group's rework holds.
- aiden Q1 · own rework: One-off: √3 multiplied into the first term only, on Q1 alone. Found on the second submission.
- mia Q9 · own rework: One-off: a denominator dropped adding fractions, on Q9 alone. Found on the second submission.
- noah Q3 · own rework: One-off: (√7 + 2)² squared term by term, on Q3 alone. Found on the second submission.
- chloe Q8 · own rework: One-off: the conjugate multiplied on the bottom only, on Q8 alone. Found on the second submission.
- chloe Q9 · own rework: One-off: a denominator dropped adding fractions, on Q9 alone. Found on the second submission.
- ethan Q8 · own rework: One-off: a term dropped expanding, on Q8 alone. Found on the second submission.
- isla Q2 · own rework: One-off: the product's sign wrong, on Q2 alone. Found on the second submission.
- isla Q10 · own rework: One-off: the sentence gives the area where the diagonal was asked, on Q10 alone. Found on the second submission.
- lucas Q2 · own rework: One-off: a sign lost expanding (2 + √5)(3 − √5), on Q2 alone. Found on the second submission.
- lucas Q10 · own rework: One-off: the diagonal stated without saying which length it is, on Q10 alone. Found on the second submission.
- grace Q8 · group review: Not attempted. Isla, Lucas and Harper had Q8 right, and the group's rework holds.
- grace Q9 · group review: Not attempted. Isla, Lucas and Harper had Q9 right, and the group's rework holds.
- grace Q10 · still wrong: Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong.
- harper Q1 · own rework: One-off: the minus not multiplied through the bracket, on Q1 alone. Found on the second submission.
- harper Q3 · group review: Repeated: (√7 + 2)² with the middle term's 2 lost (Q3, Q10). Isla, Lucas and Grace had Q3 right, and the group's rework holds.
- harper Q10 · still wrong: Repeated: (3 − √2)²'s middle term not doubled (Q3, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong.
- oliver Q2 · own rework: One-off: the middle term wrong expanding, on Q2 alone. Found on the second submission.
- oliver Q4 · own rework: One-off: (3 − √2)(3 + √2) taken as 9 + 2, on Q4 alone. Found on the second submission.
- ruby Q9 · own rework: One-off: a common denominator's numerator not scaled, on Q9 alone. Found on the second submission.
- finn Q6 · own rework: One-off: the fraction turned over rationalising, on Q6 alone. Found on the second submission.
- sofia Q5 · group review: Repeated: rationalised the top instead of the bottom (Q5, Q6). Oliver, Ruby and Finn had Q5 right, and the group's rework holds.
- sofia Q6 · group review: Repeated: rationalised the top instead of the bottom (Q5, Q6). Oliver and Ruby had Q6 right, and the group's rework holds.
- sofia Q7 · own rework: One-off: the conjugate's fraction left unsimplified, on Q7 alone. Found on the second submission.

### Problem Set 3 — Expanding and factorising

Distributive expansion, perfect squares and the difference of two squares both ways, monic factorising by the pair, common factors first, a first simple non-monic, expanding back to check.

| Problem | Asks | Model solution carries at least |
| --- | --- | --- |
| Q1 | Expand (x + 4)(x − 7). | expansion (`algebra.expand-factor.expand`) |
| Q2 | Expand (2x − 3)². | binomial identity (`algebra.expand-factor.binomial`) |
| Q3 | Expand (3x + 5)(3x − 5). | binomial identity (`algebra.expand-factor.binomial`) |
| Q4 | Factorise x² − 49. | binomial identity (`algebra.expand-factor.binomial`) |
| Q5 | Factorise x² + 2x − 15. | monic factorising (`algebra.expand-factor.monic`) |
| Q6 | Factorise x² − 10x + 25. | binomial identity (`algebra.expand-factor.binomial`), monic factorising (`algebra.expand-factor.monic`) |
| Q7 | Factorise 3x² − 12x − 36, taking the common factor out first. | expansion (`algebra.expand-factor.expand`), monic factorising (`algebra.expand-factor.monic`) |
| Q8 | Factorise x² − 11x + 24. | monic factorising (`algebra.expand-factor.monic`) |
| Q9 | Factorise 2x² + 7x + 3. | non-monic factorising (`algebra.expand-factor.nonmonic`) |
| Q10 | Show that (x + 3)² − (x − 3)² = 12x. | formal justification (`reasoning.justify.formal`), binomial identity (`algebra.expand-factor.binomial`), expansion (`algebra.expand-factor.expand`) |

The set's rows (each student's patterns are under their name below):

| Student | Handed in | Algebra | Communication | Reasoning | New skills |
| --- | --- | --- | --- | --- | --- |
| sam | 10/10 | solid | secure | secure | secure |
| priya | 10/10 | secure | secure | secure | secure |
| jordan | 9/10 | developing | secure | not seen | solid |
| amelia | 10/10 | solid | secure | developing | developing |
| tomas | 10/10 | gap | secure | solid | developing |
| zara | 10/10 | secure | secure | secure | solid |
| liam | 5/10 | gap | secure | not seen | developing |
| aiden | 10/10 | developing | secure | secure | secure |
| mia | 10/10 | developing | secure | secure | solid |
| noah | 10/10 | secure | secure | secure | developing |
| chloe | 10/10 | solid | secure | secure | secure |
| ethan | 10/10 | solid | solid | secure | solid |
| isla | 10/10 | developing | secure | developing | secure |
| lucas | 10/10 | solid | secure | solid | secure |
| grace | 9/10 | secure | developing | not seen | secure |
| harper | 10/10 | developing | solid | secure | solid |
| oliver | 9/10 | developing | secure | not seen | developing |
| ruby | 10/10 | developing | secure | secure | secure |
| finn | 10/10 | developing | secure | secure | secure |
| sofia | 10/10 | developing | secure | secure | secure |

The set's review (individual → group → whole-class): 22 fixed on the student's own rework, 28 solved in group review, 2 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q8 | — | — |
| jordan | Q6 | Q8, Q9, Q10 | — |
| amelia | Q7, Q10 | Q2, Q4 | — |
| tomas | — | Q1, Q2, Q6, Q7, Q10 | — |
| zara | Q4 | — | — |
| liam | Q2 | Q5, Q6, Q7, Q8, Q9, Q10 | — |
| aiden | Q3 | Q1, Q7 | — |
| mia | Q4, Q9 | — | — |
| noah | — | Q2, Q10 | — |
| chloe | Q8 | — | — |
| ethan | Q6, Q8 | — | — |
| isla | Q1, Q7, Q10 | — | — |
| lucas | Q8, Q10 | — | — |
| grace | — | — | Q10 |
| harper | Q2, Q7 | Q1 | Q10 |
| oliver | Q2, Q6 | Q5, Q8, Q10 | — |
| ruby | — | Q5, Q8 | — |
| finn | — | Q5, Q8 | — |
| sofia | Q9 | — | — |

- sam Q8 · own rework: One-off: the signs of a factor pair swapped, on Q8 alone. Found on the second submission.
- jordan Q6 · own rework: One-off: a perfect square factorised as a difference of squares, on Q6 alone. Found on the second submission.
- jordan Q8 · group review: Repeated: a factor pair that multiplies to the constant, the brackets wrong (Q8, Q9). Zara had Q8 right, and the group's rework holds.
- jordan Q9 · group review: Repeated: a factor pair that multiplies to the constant, the brackets wrong (Q8, Q9). Sam and Zara had Q9 right, and the group's rework holds.
- jordan Q10 · group review: Not attempted. Sam and Zara had Q10 right, and the group's rework holds.
- amelia Q2 · group review: Repeated: a perfect square and a difference of two squares written for each other (Q2, Q4). Priya and Aiden had Q2 right, and the group's rework holds.
- amelia Q4 · group review: Repeated: a perfect square and a difference of two squares written for each other (Q2, Q4). Priya, Tomas and Aiden had Q4 right, and the group's rework holds.
- amelia Q7 · own rework: One-off: a common factor taken out and not put back in the answer, on Q7 alone. Found on the second submission.
- amelia Q10 · own rework: One-off: the last line doesn't say what was shown, on Q10 alone. Found on the second submission.
- tomas Q1 · group review: Pattern: Algebra is a gap on the set (the second bracket's signs wrong multiplying). Priya and Amelia had Q1 right, and the group's rework holds.
- tomas Q2 · group review: Repeated: a perfect square's sign wrong (Q2, Q6). Priya and Aiden had Q2 right, and the group's rework holds.
- tomas Q6 · group review: Repeated: a perfect square's sign wrong (Q2, Q6). Priya, Amelia and Aiden had Q6 right, and the group's rework holds.
- tomas Q7 · group review: Pattern: Algebra is a gap on the set (a negative common factor's sign lost). Priya had Q7 right, and the group's rework holds.
- tomas Q10 · group review: Repeated: a minus not carried through a bracket (Q7, Q10). Priya and Aiden had Q10 right, and the group's rework holds.
- zara Q4 · own rework: One-off: x² − 49 factorised as (x − 7)², on Q4 alone. Found on the second submission.
- liam Q2 · own rework: One-off: (2x − 3)² squared term by term, on Q2 alone. Found on the second submission.
- liam Q5 · group review: Pattern: Algebra is a gap on the set (a pair that multiplies to −15 but adds to 14). Sam, Jordan and Zara had Q5 right, and the group's rework holds.
- liam Q6 · group review: Not attempted. Sam and Zara had Q6 right, and the group's rework holds.
- liam Q7 · group review: Not attempted. Sam, Jordan and Zara had Q7 right, and the group's rework holds.
- liam Q8 · group review: Not attempted. Zara had Q8 right, and the group's rework holds.
- liam Q9 · group review: Not attempted. Sam and Zara had Q9 right, and the group's rework holds.
- liam Q10 · group review: Not attempted. Sam and Zara had Q10 right, and the group's rework holds.
- aiden Q1 · group review: Repeated: a multiplier applied to some terms only (Q1, Q7). Priya and Amelia had Q1 right, and the group's rework holds.
- aiden Q3 · own rework: One-off: (3x)² as 3x², on Q3 alone. Found on the second submission.
- aiden Q7 · group review: Repeated: a multiplier applied to some terms only (Q1, Q7). Priya had Q7 right, and the group's rework holds.
- mia Q4 · own rework: One-off: x² − 49 written as (x − 7)², on Q4 alone. Found on the second submission.
- mia Q9 · own rework: One-off: factor brackets wrong, on Q9 alone. Found on the second submission.
- noah Q2 · group review: Repeated: (2x − 3)² squared term by term (Q2, Q10). Mia, Chloe and Ethan had Q2 right, and the group's rework holds.
- noah Q10 · group review: Repeated: (2x − 3)² squared term by term (Q2, Q10). Mia, Chloe and Ethan had Q10 right, and the group's rework holds.
- chloe Q8 · own rework: One-off: a pair that multiplies to 24 but adds to −14, on Q8 alone. Found on the second submission.
- ethan Q6 · own rework: One-off: a perfect square's middle term with the wrong sign, on Q6 alone. Found on the second submission.
- ethan Q8 · own rework: One-off: a pair that multiplies to 24 but adds to −14, on Q8 alone. Found on the second submission.
- isla Q1 · own rework: One-off: the second bracket's signs wrong multiplying, on Q1 alone. Found on the second submission.
- isla Q7 · own rework: One-off: the common factor's sign left behind, on Q7 alone. Found on the second submission.
- isla Q10 · own rework: One-off: the working shown, the last line doesn't say what it shows, on Q10 alone. Found on the second submission.
- lucas Q8 · own rework: One-off: a pair that multiplies to 24 but adds to 10, on Q8 alone. Found on the second submission.
- lucas Q10 · own rework: One-off: the identity shown, one line's sign not justified, on Q10 alone. Found on the second submission.
- grace Q10 · still wrong: Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong.
- harper Q1 · group review: Repeated: a sign lost in the expansion (Q1, Q10). Lucas and Grace had Q1 right, and the group's rework holds.
- harper Q2 · own rework: One-off: (2x − 3)²'s middle term sign lost, on Q2 alone. Found on the second submission.
- harper Q7 · own rework: One-off: the common factor's sign lost, on Q7 alone. Found on the second submission.
- harper Q10 · still wrong: Repeated: x² − x² collected as 2x² (Q1, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong.
- oliver Q2 · own rework: One-off: (2x − 3)² squared term by term, on Q2 alone. Found on the second submission.
- oliver Q5 · group review: Repeated: a pair that multiplies but doesn't add (Q5, Q8). Sofia had Q5 right, and the group's rework holds.
- oliver Q6 · own rework: One-off: perfect square as difference, on Q6 alone. Found on the second submission.
- oliver Q8 · group review: Repeated: a pair that multiplies but doesn't add (Q5, Q8). Sofia had Q8 right, and the group's rework holds.
- oliver Q10 · group review: Not attempted. Ruby, Finn and Sofia had Q10 right, and the group's rework holds.
- ruby Q5 · group review: Repeated: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8). Sofia had Q5 right, and the group's rework holds.
- ruby Q8 · group review: Repeated: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8). Sofia had Q8 right, and the group's rework holds.
- finn Q5 · group review: Repeated: a factor's sign flipped writing the pair, the check's result wrong (Q5, Q8). Sofia had Q5 right, and the group's rework holds.
- finn Q8 · group review: Repeated: a factor's sign flipped writing the pair (Q5, Q8). Sofia had Q8 right, and the group's rework holds.
- sofia Q9 · own rework: One-off: non-monic brackets wrong, on Q9 alone. Found on the second submission.

Class review covered Q10:

- Q10 · shown: isla, lucas. Mint left Q10 unsolved. The board shows Isla's working (last line solves for x, 2 in the class) and Lucas's working (one sign left unchanged, 1 in the class), unnamed.

### Problem Set 4 — Non-monic factorising and completing the square

Non-monic factorising by the split and grouping, solving factorised equations with the null factor law, completing the square (monic, then with a leading coefficient), a worded problem.

| Problem | Asks | Model solution carries at least |
| --- | --- | --- |
| Q1 | Factorise 2x² + 3x − 2. | non-monic factorising (`algebra.expand-factor.nonmonic`) |
| Q2 | Factorise 3x² + x − 10. | non-monic factorising (`algebra.expand-factor.nonmonic`) |
| Q3 | Solve (x − 4)(2x + 1) = 0. | null factor law (`functions.zeros.nfl`), zero-finding (`functions.zeros.zero-finding`), fractions (`algebra.number.fractions`) |
| Q4 | Solve 2x² − 7x + 3 = 0. | non-monic factorising (`algebra.expand-factor.nonmonic`), null factor law (`functions.zeros.nfl`), zero-finding (`functions.zeros.zero-finding`), fractions (`algebra.number.fractions`) |
| Q5 | Solve x² − 3x = 10. | quadratic equations (`algebra.equations.quadratic`), monic factorising (`algebra.expand-factor.monic`), null factor law (`functions.zeros.nfl`), zero-finding (`functions.zeros.zero-finding`) |
| Q6 | Complete the square: x² + 6x + 2. | binomial identity (`algebra.expand-factor.binomial`) |
| Q7 | Complete the square: x² − 5x + 1. | binomial identity (`algebra.expand-factor.binomial`), fractions (`algebra.number.fractions`) |
| Q8 | Write 2x² + 8x − 3 in the form a(x + h)² + k and state the turning point. | binomial identity (`algebra.expand-factor.binomial`), expansion (`algebra.expand-factor.expand`), graph features (`graphing.quadratics.features`) |
| Q9 | Find the minimum value of x² − 4x + 7 by completing the square. | binomial identity (`algebra.expand-factor.binomial`), graph features (`graphing.quadratics.features`) |
| Q10 | A rectangle's length is 3 cm more than twice its width and its area is 35 cm². Find its width. | worded problems (`reasoning.interpret.worded`), quadratic equations (`algebra.equations.quadratic`), non-monic factorising (`algebra.expand-factor.nonmonic`), null factor law (`functions.zeros.nfl`), conclusions in context (`reasoning.justify.conclusions`) |

The set's rows (each student's patterns are under their name below):

| Student | Handed in | Algebra | Functions | Graphing | Communication | Reasoning | New skills |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sam | 10/10 | developing | secure | solid | secure | secure | solid |
| priya | 10/10 | secure | secure | secure | secure | secure | secure |
| jordan | 8/10 | gap | secure | secure | secure | not seen | secure |
| amelia | 10/10 | solid | secure | secure | secure | developing | developing |
| tomas | 9/10 | gap | solid | solid | secure | not seen | gap |
| zara | 10/10 | solid | secure | solid | secure | secure | developing |
| liam | 5/10 | gap | not seen | not seen | secure | not seen | not seen |
| aiden | 10/10 | developing | secure | secure | secure | secure | secure |
| mia | 10/10 | gap | solid | secure | secure | secure | solid |
| noah | 10/10 | secure | secure | secure | secure | secure | solid |
| chloe | 10/10 | developing | solid | secure | secure | secure | secure |
| ethan | 10/10 | developing | solid | developing | developing | secure | solid |
| isla | 10/10 | developing | secure | solid | secure | gap | secure |
| lucas | 10/10 | developing | secure | developing | secure | developing | secure |
| grace | 6/10 | secure | secure | not seen | developing | not seen | secure |
| harper | 10/10 | developing | secure | solid | solid | secure | secure |
| oliver | 8/10 | gap | secure | secure | secure | not seen | developing |
| ruby | 10/10 | developing | secure | solid | secure | secure | secure |
| finn | 10/10 | developing | secure | solid | secure | secure | secure |
| sofia | 10/10 | gap | secure | secure | secure | secure | solid |

The set's review (individual → group): 25 fixed on the student's own rework, 45 solved in group review, 3 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q7, Q8 | Q1, Q2, Q10 | — |
| jordan | — | Q1, Q2, Q4, Q9, Q10 | — |
| amelia | Q6, Q7, Q10 | — | — |
| tomas | — | Q3, Q5, Q6, Q7, Q9, Q10 | — |
| zara | Q7 | Q6, Q8, Q9 | — |
| liam | — | Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10 | — |
| aiden | Q8 | — | — |
| mia | Q6 | Q1, Q4 | — |
| noah | Q6 | — | — |
| chloe | Q2, Q5, Q7 | — | — |
| ethan | Q2, Q4, Q5, Q7, Q9 | — | — |
| isla | Q5, Q8 | — | Q10 |
| lucas | Q5, Q10 | Q8, Q9 | — |
| grace | — | Q7, Q8, Q9 | Q10 |
| harper | Q9 | Q5 | Q10 |
| oliver | Q5 | Q1, Q2, Q9, Q10 | — |
| ruby | Q9 | Q4, Q5 | — |
| finn | Q8 | Q3, Q4 | — |
| sofia | — | Q2, Q7 | — |

- sam Q1 · group review: Repeated: right split, the signs put into the wrong brackets (Q1, Q2, Q10). Zara had Q1 right, and the group's rework holds.
- sam Q2 · group review: Repeated: right split, the signs put into the wrong brackets (Q1, Q2, Q10). Zara had Q2 right, and the group's rework holds.
- sam Q7 · own rework: One-off: half of b taken with the wrong sign completing the square, on Q7 alone. Found on the second submission.
- sam Q8 · own rework: One-off: turning point read with the sign flipped, on Q8 alone. Found on the second submission.
- sam Q10 · group review: Repeated: right split, the signs put into the wrong brackets (Q1, Q2, Q10). Zara had Q10 right, and the group's rework holds.
- jordan Q1 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Zara had Q1 right, and the group's rework holds.
- jordan Q2 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Zara had Q2 right, and the group's rework holds.
- jordan Q4 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Sam and Zara had Q4 right, and the group's rework holds.
- jordan Q9 · group review: Not attempted. Sam had Q9 right, and the group's rework holds.
- jordan Q10 · group review: Not attempted. Zara had Q10 right, and the group's rework holds.
- amelia Q6 · own rework: One-off: added 9 to complete the square, never took it away, on Q6 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: half of b squared as a whole number over 2, on Q7 alone. Found on the second submission.
- amelia Q10 · own rework: One-off: the negative width kept in the answer sentence, on Q10 alone. Found on the second submission.
- tomas Q3 · group review: Pattern: New skills is a gap on the set (factors set to zero with their signs flipped). Priya, Amelia and Aiden had Q3 right, and the group's rework holds.
- tomas Q5 · group review: Repeated: a root or turning point with the sign of its bracket's number (Q3, Q5, Q9). Priya, Amelia and Aiden had Q5 right, and the group's rework holds.
- tomas Q6 · group review: Pattern: New skills is a gap on the set (half of b taken with the wrong sign). Priya and Aiden had Q6 right, and the group's rework holds.
- tomas Q7 · group review: Pattern: Algebra is a gap on the set (fractions lost in half of b). Priya and Aiden had Q7 right, and the group's rework holds.
- tomas Q9 · group review: Repeated: a root or turning point with the sign of its bracket's number (Q3, Q5, Q9). Priya, Amelia and Aiden had Q9 right, and the group's rework holds.
- tomas Q10 · group review: Not attempted. Priya and Aiden had Q10 right, and the group's rework holds.
- zara Q6 · group review: Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam and Jordan had Q6 right, and the group's rework holds.
- zara Q7 · own rework: One-off: half of −5 squared as 25/2, on Q7 alone. Found on the second submission.
- zara Q8 · group review: Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Jordan had Q8 right, and the group's rework holds.
- zara Q9 · group review: Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam had Q9 right, and the group's rework holds.
- liam Q1 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Zara had Q1 right, and the group's rework holds.
- liam Q2 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Zara had Q2 right, and the group's rework holds.
- liam Q3 · group review: Pattern: Algebra is a gap on the set (2x = −1 and 2x = 1 solved with the fraction turned over). Sam, Jordan and Zara had Q3 right, and the group's rework holds.
- liam Q4 · group review: Pattern: Algebra is a gap on the set (2x = −1 and 2x = 1 solved with the fraction turned over). Sam and Zara had Q4 right, and the group's rework holds.
- liam Q5 · group review: Pattern: Algebra is a gap on the set (one root found by trying, the equation never made zero). Sam, Jordan and Zara had Q5 right, and the group's rework holds.
- liam Q6 · group review: Not attempted. Sam and Jordan had Q6 right, and the group's rework holds.
- liam Q7 · group review: Not attempted. Jordan had Q7 right, and the group's rework holds.
- liam Q8 · group review: Not attempted. Jordan had Q8 right, and the group's rework holds.
- liam Q9 · group review: Not attempted. Sam had Q9 right, and the group's rework holds.
- liam Q10 · group review: Not attempted. Zara had Q10 right, and the group's rework holds.
- aiden Q8 · own rework: One-off: the 2 taken out of 2x² only, on Q8 alone. Found on the second submission.
- mia Q1 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Noah, Chloe and Ethan had Q1 right, and the group's rework holds.
- mia Q4 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Noah and Chloe had Q4 right, and the group's rework holds.
- mia Q6 · own rework: One-off: half of b squared without its sign, on Q6 alone. Found on the second submission.
- noah Q6 · own rework: One-off: the square completed, its constant not taken away, on Q6 alone. Found on the second submission.
- chloe Q2 · own rework: One-off: non-monic brackets wrong, on Q2 alone. Found on the second submission.
- chloe Q5 · own rework: One-off: a root's sign lost rearranging, on Q5 alone. Found on the second submission.
- chloe Q7 · own rework: One-off: halves lost completing the square, on Q7 alone. Found on the second submission.
- ethan Q2 · own rework: One-off: non-monic brackets wrong, on Q2 alone. Found on the second submission.
- ethan Q4 · own rework: One-off: a root's sign lost, on Q4 alone. Found on the second submission.
- ethan Q5 · own rework: One-off: factorised before making the equation equal zero, on Q5 alone. Found on the second submission.
- ethan Q7 · own rework: One-off: half of −5 taken as −5/4, on Q7 alone. Found on the second submission.
- ethan Q9 · own rework: One-off: the minimum value given as the x, the working not shown, on Q9 alone. Found on the second submission.
- isla Q5 · own rework: One-off: x² − 3x = 10 rearranged with the 10's sign wrong, on Q5 alone. Found on the second submission.
- isla Q8 · own rework: One-off: the turning point's sign wrong, on Q8 alone. Found on the second submission.
- isla Q10 · still wrong: Pattern: Reasoning is a gap on the set (the negative width given in the sentence). Nobody at the table had Q10 right, so the group's last try is still wrong.
- lucas Q5 · own rework: One-off: x² − 3x = 10 rearranged with a sign lost, on Q5 alone. Found on the second submission.
- lucas Q8 · group review: Repeated: the turning point read with the sign flipped (Q8, Q9). Harper had Q8 right, and the group's rework holds.
- lucas Q9 · group review: Repeated: the turning point read with the sign flipped (Q8, Q9). Isla had Q9 right, and the group's rework holds.
- lucas Q10 · own rework: One-off: width and length swapped in the sentence, on Q10 alone. Found on the second submission.
- grace Q7 · group review: Not attempted. Isla, Lucas and Harper had Q7 right, and the group's rework holds.
- grace Q8 · group review: Not attempted. Harper had Q8 right, and the group's rework holds.
- grace Q9 · group review: Not attempted. Isla had Q9 right, and the group's rework holds.
- grace Q10 · still wrong: Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong.
- harper Q5 · group review: Repeated: a sign lost rearranging x² − 3x = 10 (Q5, Q10). Grace had Q5 right, and the group's rework holds.
- harper Q9 · own rework: One-off: the minimum value read off the wrong line, on Q9 alone. Found on the second submission.
- harper Q10 · still wrong: Repeated: a sign lost rearranging w(2w + 3) = 35 (Q5, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong.
- oliver Q1 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Ruby, Finn and Sofia had Q1 right, and the group's rework holds.
- oliver Q2 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Ruby and Finn had Q2 right, and the group's rework holds.
- oliver Q5 · own rework: One-off: null factor law on x(x − 3) = 10, a product that isn't 0, on Q5 alone. Found on the second submission.
- oliver Q9 · group review: Not attempted. Finn and Sofia had Q9 right, and the group's rework holds.
- oliver Q10 · group review: Not attempted. Ruby, Finn and Sofia had Q10 right, and the group's rework holds.
- ruby Q4 · group review: Repeated: a pair that multiplies but doesn't add (Q4, Q5). Oliver and Sofia had Q4 right, and the group's rework holds.
- ruby Q5 · group review: Repeated: a pair that multiplies but doesn't add (Q4, Q5). Finn and Sofia had Q5 right, and the group's rework holds.
- ruby Q9 · own rework: One-off: the minimum value given as the x of the turning point, on Q9 alone. Found on the second submission.
- finn Q3 · group review: Repeated: solved 2x + 1 = 0 as x = −2 (Q3, Q4). Oliver, Ruby and Sofia had Q3 right, and the group's rework holds.
- finn Q4 · group review: Repeated: solved 2x + 1 = 0 as x = −2 (Q3, Q4). Oliver and Sofia had Q4 right, and the group's rework holds.
- finn Q8 · own rework: One-off: turning point read with the sign flipped, on Q8 alone. Found on the second submission.
- sofia Q2 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Ruby and Finn had Q2 right, and the group's rework holds.
- sofia Q7 · group review: Pattern: Algebra is a gap on the set (halves lost completing the square). Oliver, Ruby and Finn had Q7 right, and the group's rework holds.

### Problem Set 5 — Features of a parabola

The three forms of a quadratic: read the feature each form hands over, compute the others, move between forms.

Authored: data/pset5/ (ticket 187).

The set's rows (each student's patterns are under their name below):

| Student | Handed in | Algebra | Functions | Graphing | Communication | Reasoning | New skills |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sam | 10/10 | developing | secure | developing | secure | secure | secure |
| priya | 10/10 | secure | secure | secure | secure | secure | secure |
| jordan | 8/10 | gap | secure | secure | secure | not seen | secure |
| amelia | 10/10 | solid | secure | secure | secure | gap | developing |
| tomas | 7/10 | gap | secure | solid | secure | not seen | gap |
| zara | 10/10 | solid | secure | solid | secure | secure | developing |
| liam | 5/10 | gap | secure | secure | secure | not seen | gap |
| aiden | 10/10 | developing | secure | secure | secure | secure | secure |
| mia | 10/10 | gap | secure | secure | secure | secure | secure |
| noah | 10/10 | secure | secure | secure | secure | secure | developing |
| chloe | 10/10 | developing | solid | secure | secure | secure | secure |
| ethan | 10/10 | solid | solid | solid | solid | secure | secure |
| isla | 10/10 | developing | secure | solid | secure | gap | secure |
| lucas | 10/10 | developing | secure | solid | secure | gap | secure |
| grace | 7/10 | secure | secure | secure | developing | not seen | secure |
| harper | 10/10 | developing | secure | developing | solid | secure | secure |
| oliver | 9/10 | gap | secure | secure | secure | not seen | developing |
| ruby | 10/10 | gap | solid | solid | secure | secure | secure |
| finn | 10/10 | developing | secure | solid | secure | secure | secure |
| sofia | 10/10 | gap | secure | secure | secure | secure | secure |

The set's review (individual → group): 29 fixed on the student's own rework, 28 solved in group review, 6 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q4, Q6, Q9 | — | — |
| jordan | — | Q8, Q9, Q10 | Q4 |
| amelia | Q6, Q8 | Q10 | — |
| tomas | Q5 | Q1, Q2, Q4, Q8, Q9, Q10 | — |
| zara | Q4, Q6, Q10 | — | — |
| liam | — | Q1, Q6, Q7, Q8, Q9, Q10 | Q4 |
| aiden | Q7 | — | — |
| mia | — | Q4, Q8, Q9 | — |
| noah | Q7 | — | — |
| chloe | Q4, Q5, Q8 | — | — |
| ethan | Q5, Q8, Q10 | — | — |
| isla | Q5, Q9 | — | Q10 |
| lucas | Q9 | Q2, Q3 | Q10 |
| grace | — | Q8 | Q9, Q10 |
| harper | Q7, Q9, Q10 | — | — |
| oliver | Q7 | Q4, Q8, Q10 | — |
| ruby | Q5, Q10 | Q9 | — |
| finn | Q4, Q6, Q8 | — | — |
| sofia | — | Q4, Q8 | — |

- sam Q4 · own rework: One-off: right split, signs in the wrong brackets, on Q4 alone. Found on the second submission.
- sam Q6 · own rework: One-off: turning point read with the sign flipped, on Q6 alone. Found on the second submission.
- sam Q9 · own rework: One-off: negative a read as concave up, on Q9 alone. Found on the second submission.
- jordan Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Nobody at the table had Q4 right, so the group's last try is still wrong.
- jordan Q8 · group review: Pattern: Algebra is a gap on the set (the non-monic pair's signs swapped). Sam and Zara had Q8 right, and the group's rework holds.
- jordan Q9 · group review: Not attempted. Zara had Q9 right, and the group's rework holds.
- jordan Q10 · group review: Not attempted. Sam had Q10 right, and the group's rework holds.
- amelia Q6 · own rework: One-off: added 16 to complete the square, never took it away, on Q6 alone. Found on the second submission.
- amelia Q8 · own rework: One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission.
- amelia Q10 · group review: Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). Priya and Aiden had Q10 right, and the group's rework holds.
- tomas Q1 · group review: Pattern: New skills is a gap on the set (intercepts read off the factors with the signs flipped). Priya, Amelia and Aiden had Q1 right, and the group's rework holds.
- tomas Q2 · group review: Repeated: an intercept or turning point with the sign of its bracket's number (Q1, Q2). Priya, Amelia and Aiden had Q2 right, and the group's rework holds.
- tomas Q4 · group review: Pattern: Algebra is a gap on the set (solved 3x + 2 = 0 as −3/2). Priya, Amelia and Aiden had Q4 right, and the group's rework holds.
- tomas Q5 · own rework: One-off: axis of symmetry without the minus, on Q5 alone. Found on the second submission.
- tomas Q8 · group review: Not attempted. Priya and Aiden had Q8 right, and the group's rework holds.
- tomas Q9 · group review: Not attempted. Priya, Amelia and Aiden had Q9 right, and the group's rework holds.
- tomas Q10 · group review: Not attempted. Priya and Aiden had Q10 right, and the group's rework holds.
- zara Q4 · own rework: One-off: solved 3x + 2 = 0 as −3/2, on Q4 alone. Found on the second submission.
- zara Q6 · own rework: One-off: added 16 to complete the square, never took it away, on Q6 alone. Found on the second submission.
- zara Q10 · own rework: One-off: axis given as the height, on Q10 alone. Found on the second submission.
- liam Q1 · group review: Pattern: New skills is a gap on the set (intercepts read off the factors with the signs flipped). Sam, Jordan and Zara had Q1 right, and the group's rework holds.
- liam Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Nobody at the table had Q4 right, so the group's last try is still wrong.
- liam Q6 · group review: Not attempted. Jordan had Q6 right, and the group's rework holds.
- liam Q7 · group review: Not attempted. Sam, Jordan and Zara had Q7 right, and the group's rework holds.
- liam Q8 · group review: Not attempted. Sam and Zara had Q8 right, and the group's rework holds.
- liam Q9 · group review: Not attempted. Zara had Q9 right, and the group's rework holds.
- liam Q10 · group review: Not attempted. Sam had Q10 right, and the group's rework holds.
- aiden Q7 · own rework: One-off: the 2 multiplied x² and nothing else, on Q7 alone. Found on the second submission.
- mia Q4 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Noah and Ethan had Q4 right, and the group's rework holds.
- mia Q8 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Noah had Q8 right, and the group's rework holds.
- mia Q9 · group review: Pattern: Algebra is a gap on the set (took −1 out and left the signs inside behind). Noah, Chloe and Ethan had Q9 right, and the group's rework holds.
- noah Q7 · own rework: One-off: (x − 3)² squared term by term, on Q7 alone. Found on the second submission.
- chloe Q4 · own rework: One-off: non-monic brackets wrong, on Q4 alone. Found on the second submission.
- chloe Q5 · own rework: One-off: (−3)² taken as −9, on Q5 alone. Found on the second submission.
- chloe Q8 · own rework: One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission.
- ethan Q5 · own rework: One-off: (−3)² taken as −9, the axis not shown, on Q5 alone. Found on the second submission.
- ethan Q8 · own rework: One-off: the non-monic pair's signs swapped, on Q8 alone. Found on the second submission.
- ethan Q10 · own rework: One-off: axis given as the height, the working not shown, on Q10 alone. Found on the second submission.
- isla Q5 · own rework: One-off: axis of symmetry without the minus, on Q5 alone. Found on the second submission.
- isla Q9 · own rework: One-off: took −1 out and left the signs inside behind, on Q9 alone. Found on the second submission.
- isla Q10 · still wrong: Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). Nobody at the table had Q10 right, so the group's last try is still wrong.
- lucas Q2 · group review: Repeated: turning point read with the sign flipped (Q2, Q3). Isla, Grace and Harper had Q2 right, and the group's rework holds.
- lucas Q3 · group review: Repeated: turning point read with the sign flipped (Q2, Q3). Isla, Grace and Harper had Q3 right, and the group's rework holds.
- lucas Q9 · own rework: One-off: took −1 out and left the signs inside behind, on Q9 alone. Found on the second submission.
- lucas Q10 · still wrong: Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). Nobody at the table had Q10 right, so the group's last try is still wrong.
- grace Q8 · group review: Not attempted. Isla, Lucas and Harper had Q8 right, and the group's rework holds.
- grace Q9 · still wrong: Not attempted. Nobody at the table had Q9 right, so the group's last try is still wrong.
- grace Q10 · still wrong: Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong.
- harper Q7 · own rework: One-off: the 2 multiplied x² and nothing else, on Q7 alone. Found on the second submission.
- harper Q9 · own rework: One-off: negative a read as concave up, on Q9 alone. Found on the second submission.
- harper Q10 · own rework: One-off: axis given as the height, the working not shown, on Q10 alone. Found on the second submission.
- oliver Q4 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Ruby had Q4 right, and the group's rework holds.
- oliver Q7 · own rework: One-off: (x − 3)² squared term by term, on Q7 alone. Found on the second submission.
- oliver Q8 · group review: Pattern: Algebra is a gap on the set (the non-monic pair's signs swapped). Ruby had Q8 right, and the group's rework holds.
- oliver Q10 · group review: Not attempted. Finn and Sofia had Q10 right, and the group's rework holds.
- ruby Q5 · own rework: One-off: (−3)² taken as −9, on Q5 alone. Found on the second submission.
- ruby Q9 · group review: Pattern: Algebra is a gap on the set (a pair that multiplies to −8 but doesn't add to −2). Oliver, Finn and Sofia had Q9 right, and the group's rework holds.
- ruby Q10 · own rework: One-off: axis given as the height, on Q10 alone. Found on the second submission.
- finn Q4 · own rework: One-off: solved 3x + 2 = 0 as −3/2, on Q4 alone. Found on the second submission.
- finn Q6 · own rework: One-off: turning point read with the sign flipped, on Q6 alone. Found on the second submission.
- finn Q8 · own rework: One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission.
- sofia Q4 · group review: Pattern: Algebra is a gap on the set (non-monic brackets wrong). Ruby had Q4 right, and the group's rework holds.
- sofia Q8 · group review: Pattern: Algebra is a gap on the set (the non-monic pair's signs swapped). Ruby had Q8 right, and the group's rework holds.

### Problem Set 6 — Roots of a quadratic

Solving quadratics by factorising and the formula, the discriminant, roots and the graph.

Authored: data/assignment.ts, data/classmates.ts (the live set; rows are the classmates' end state).

The set's rows (each student's patterns are under their name below):

| Student | Handed in | Algebra | Functions | Graphing | Communication | Reasoning | New skills |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sam | live | live | live | live | live | live | live |
| priya | 10/10 | secure | secure | secure | secure | secure | secure |
| jordan | 7/10 | developing | secure | secure | secure | not seen | secure |
| amelia | 10/10 | developing | secure | secure | secure | gap | developing |
| tomas | 7/10 | gap | secure | secure | secure | not seen | developing |
| zara | 10/10 | developing | secure | solid | secure | secure | solid |
| liam | 4/10 | gap | not seen | not seen | secure | not seen | gap |
| aiden | 10/10 | developing | secure | secure | secure | secure | secure |
| mia | 10/10 | gap | secure | secure | secure | secure | secure |
| noah | 9/10 | secure | secure | secure | secure | secure | solid |
| chloe | absent | absent | absent | absent | absent | absent | absent |
| ethan | 8/10 | developing | secure | solid | solid | secure | secure |
| isla | 10/10 | developing | secure | secure | secure | gap | secure |
| lucas | 10/10 | developing | secure | secure | secure | gap | secure |
| grace | 4/10 | secure | not seen | not seen | developing | not seen | secure |
| harper | 6/10 | gap | secure | gap | solid | secure | secure |
| oliver | 7/10 | developing | secure | secure | secure | not seen | developing |
| ruby | 10/10 | developing | secure | developing | secure | secure | secure |
| finn | 10/10 | gap | secure | solid | secure | secure | secure |
| sofia | 10/10 | gap | secure | secure | secure | secure | secure |

The set's review (individual → group → whole-class): 23 fixed on the student's own rework, 40 solved in group review, 9 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | live | live | live |
| jordan | Q2, Q7 | Q8, Q9, Q10 | — |
| amelia | Q6, Q7 | Q10 | — |
| tomas | Q3 | Q4, Q5, Q7, Q8, Q9, Q10 | — |
| zara | Q3, Q7, Q9 | — | — |
| liam | — | Q1, Q2, Q3, Q5, Q6, Q8, Q9, Q10 | Q7 |
| aiden | Q7 | — | — |
| mia | — | Q2, Q7, Q9 | — |
| noah | Q3 | Q10 | — |
| ethan | Q1, Q4, Q7, Q9 | Q10 | — |
| isla | Q4, Q7 | — | Q10 |
| lucas | Q7 | — | Q10 |
| grace | — | Q5, Q6, Q8, Q9 | Q7, Q10 |
| harper | — | Q3, Q5, Q8, Q9 | Q7, Q10 |
| oliver | Q3, Q7 | Q1, Q2, Q8, Q9, Q10 | — |
| ruby | Q5, Q7, Q9 | — | — |
| finn | Q5 | Q2, Q4 | Q7 |
| sofia | — | Q2, Q4 | Q7 |

- jordan Q2 · own rework: One-off: non-monic brackets wrong, on Q2 alone. Found on the second submission.
- jordan Q7 · own rework: One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission.
- jordan Q8 · group review: Not attempted. Zara had Q8 right, and the group's rework holds (the demo group's scripted run).
- jordan Q9 · group review: Not attempted. Nobody at the table had Q9 right; Zara's first submission went wrong on one line, the hint after the group's second wrong check named it, and the third try holds (the one exception on the set).
- jordan Q10 · group review: Not attempted. Zara had Q10 right, and the group's rework holds (the demo group's scripted run).
- amelia Q6 · own rework: One-off: read “touches once” as discriminant > 0, on Q6 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission.
- amelia Q10 · group review: Pattern: Reasoning is a gap on the set (said the graph crosses twice). Priya and Aiden had Q10 right, and the group's rework holds.
- tomas Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- tomas Q4 · group review: Pattern: Algebra is a gap on the set (divided by a, not 2a). Priya, Amelia and Aiden had Q4 right, and the group's rework holds.
- tomas Q5 · group review: Pattern: Algebra is a gap on the set (roots read off the factors with the signs flipped). Priya, Amelia and Aiden had Q5 right, and the group's rework holds.
- tomas Q7 · group review: Pattern: Algebra is a gap on the set (scaled two of three terms). Priya had Q7 right, and the group's rework holds.
- tomas Q8 · group review: Not attempted. Priya, Amelia and Aiden had Q8 right, and the group's rework holds.
- tomas Q9 · group review: Not attempted. Priya, Amelia and Aiden had Q9 right, and the group's rework holds.
- tomas Q10 · group review: Not attempted. Priya and Aiden had Q10 right, and the group's rework holds.
- zara Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- zara Q7 · own rework: One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission.
- zara Q9 · own rework: One-off: axis given as the height, on Q9 alone. Found on the second submission.
- liam Q1 · group review: Pattern: Algebra is a gap on the set (factor brackets wrong). Jordan and Zara had Q1 right, and the group's rework holds (the demo group's scripted run).
- liam Q2 · group review: Pattern: Algebra is a gap on the set (factor brackets wrong). Zara had Q2 right, and the group's rework holds (the demo group's scripted run).
- liam Q3 · group review: Pattern: New skills is a gap on the set (null factor law on a product that isn't 0). Jordan had Q3 right, and the group's rework holds (the demo group's scripted run).
- liam Q5 · group review: Pattern: Algebra is a gap on the set (roots read off the factors with the signs flipped). Jordan and Zara had Q5 right, and the group's rework holds (the demo group's scripted run).
- liam Q6 · group review: Not attempted. Jordan and Zara had Q6 right, and the group's rework holds (the demo group's scripted run).
- liam Q7 · still wrong: Not attempted. Nobody at the table had Q7 right, so the group's last try is still wrong (the demo group's scripted run).
- liam Q8 · group review: Not attempted. Zara had Q8 right, and the group's rework holds (the demo group's scripted run).
- liam Q9 · group review: Not attempted. Nobody at the table had Q9 right; Zara's first submission went wrong on one line, the hint after the group's second wrong check named it, and the third try holds (the one exception on the set).
- liam Q10 · group review: Not attempted. Zara had Q10 right, and the group's rework holds (the demo group's scripted run).
- aiden Q7 · own rework: One-off: scaled two of three terms, on Q7 alone. Found on the second submission.
- mia Q2 · group review: Pattern: Algebra is a gap on the set (factor brackets wrong). Noah and Ethan had Q2 right, and the group's rework holds.
- mia Q7 · group review: Pattern: Algebra is a gap on the set (the third off by a third). Noah had Q7 right, and the group's rework holds.
- mia Q9 · group review: Pattern: Algebra is a gap on the set (took −x out and left the sign behind). Noah had Q9 right, and the group's rework holds.
- noah Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- noah Q10 · group review: Not attempted. Mia had Q10 right, and the group's rework holds.
- ethan Q1 · own rework: One-off: signs flipped in the pair, on Q1 alone. Found on the second submission.
- ethan Q4 · own rework: One-off: divided by a, not 2a, on Q4 alone. Found on the second submission.
- ethan Q7 · own rework: One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission.
- ethan Q9 · own rework: One-off: axis given as the height, a step skipped, on Q9 alone. Found on the second submission.
- ethan Q10 · group review: Not attempted. Mia had Q10 right, and the group's rework holds.
- isla Q4 · own rework: One-off: −b written as −5, on Q4 alone. Found on the second submission.
- isla Q7 · own rework: One-off: scaled two of three terms, on Q7 alone. Found on the second submission.
- isla Q10 · still wrong: Pattern: Reasoning is a gap on the set (said the graph crosses twice). Nobody at the table had Q10 right, so the group's last try is still wrong.
- lucas Q7 · own rework: One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission.
- lucas Q10 · still wrong: Pattern: Reasoning is a gap on the set (negative discriminant, two solutions). Nobody at the table had Q10 right, so the group's last try is still wrong.
- grace Q5 · group review: Not attempted. Isla and Lucas had Q5 right, and the group's rework holds.
- grace Q6 · group review: Not attempted. Isla, Lucas and Harper had Q6 right, and the group's rework holds.
- grace Q7 · still wrong: Not attempted. Nobody at the table had Q7 right, so the group's last try is still wrong.
- grace Q8 · group review: Not attempted. Isla and Lucas had Q8 right, and the group's rework holds.
- grace Q9 · group review: Not attempted. Isla and Lucas had Q9 right, and the group's rework holds.
- grace Q10 · still wrong: Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong.
- harper Q3 · group review: Pattern: Algebra is a gap on the set (a sign lost in the expansion). Isla, Lucas and Grace had Q3 right, and the group's rework holds.
- harper Q5 · group review: Pattern: Graphing is a gap on the set (turning point's height from the wrong line). Isla and Lucas had Q5 right, and the group's rework holds.
- harper Q7 · still wrong: Not attempted. Nobody at the table had Q7 right, so the group's last try is still wrong.
- harper Q8 · group review: Not attempted. Isla and Lucas had Q8 right, and the group's rework holds.
- harper Q9 · group review: Pattern: Graphing is a gap on the set (axis given as the height, the working not shown). Isla and Lucas had Q9 right, and the group's rework holds.
- harper Q10 · still wrong: Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong.
- oliver Q1 · group review: Repeated: factor brackets wrong (Q1, Q2). Ruby, Finn and Sofia had Q1 right, and the group's rework holds.
- oliver Q2 · group review: Repeated: factor brackets wrong (Q1, Q2). Ruby had Q2 right, and the group's rework holds.
- oliver Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- oliver Q7 · own rework: One-off: scaled two of three terms, on Q7 alone. Found on the second submission.
- oliver Q8 · group review: Not attempted. Ruby, Finn and Sofia had Q8 right, and the group's rework holds.
- oliver Q9 · group review: Not attempted. Finn and Sofia had Q9 right, and the group's rework holds.
- oliver Q10 · group review: Not attempted. Ruby, Finn and Sofia had Q10 right, and the group's rework holds.
- ruby Q5 · own rework: One-off: turning point's height from the wrong line, on Q5 alone. Found on the second submission.
- ruby Q7 · own rework: One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission.
- ruby Q9 · own rework: One-off: axis given as the height, on Q9 alone. Found on the second submission.
- finn Q2 · group review: Pattern: Algebra is a gap on the set (sign lost solving 2x − 1 = 0). Ruby had Q2 right, and the group's rework holds.
- finn Q4 · group review: Pattern: Algebra is a gap on the set (divided by a, not 2a). Oliver and Ruby had Q4 right, and the group's rework holds.
- finn Q5 · own rework: One-off: turning point's height from the wrong line, on Q5 alone. Found on the second submission.
- finn Q7 · still wrong: Pattern: Algebra is a gap on the set (multiplied through by 3 and never took it back out). Nobody at the table had Q7 right, so the group's last try is still wrong.
- sofia Q2 · group review: Pattern: Algebra is a gap on the set (factor brackets wrong). Ruby had Q2 right, and the group's rework holds.
- sofia Q4 · group review: Pattern: Algebra is a gap on the set (denominator a, not 2a). Oliver and Ruby had Q4 right, and the group's rework holds.
- sofia Q7 · still wrong: Pattern: Algebra is a gap on the set (scaled two of three terms). Nobody at the table had Q7 right, so the group's last try is still wrong.

Class review covered Q7, Q10:

- Q7 · shown: isla, zara. Mint, Sky and Violet left Q7 unsolved. The board shows Isla's working (scaled two of three terms, 6 in the class) and Zara's working (tripled, third never restored, 4 in the class), unnamed.
- Q10 · shown: isla, lucas. Mint left Q10 unsolved. The board shows Isla's working (said the graph crosses twice, 2 in the class) and Lucas's working (negative Δ read as two, 1 in the class), unnamed.

## The students

### Sam Okonkwo (`sam`)

Minus signs wrong on four sets: a minus dropped, flipped or moved to another term, in a surd bracket, factor pairs, turning points, concavity and completing the square. His other lines are right.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | live |
| Algebra | secure | solid | solid | developing | developing | live |
| Functions | — | — | — | secure | secure | live |
| Graphing | — | — | — | solid | developing | live |
| Communication | secure | secure | secure | secure | secure | live |
| Reasoning | secure | secure | secure | secure | secure | live |
| New skills | secure | solid | secure | solid | secure | live |

- PS2 · Algebra · solid: a sign lost multiplying out a surd bracket (Q2)
- PS3 · Algebra · solid: the signs of a factor pair swapped (Q8)
- PS4 · Algebra · developing: right split, the signs put into the wrong brackets (Q1, Q2, Q10)
- PS5 · Algebra · developing: right split, signs in the wrong brackets (Q4)
- PS4 · Graphing · solid: turning point read with the sign flipped (Q8)
- PS5 · Graphing · developing: turning point read with the sign flipped (Q6)
- PS5 · Graphing · developing: negative a read as concave up (Q9)
- PS2 · New skills · solid: the conjugate's sign wrong (Q7)
- PS4 · New skills · solid: half of b taken with the wrong sign completing the square (Q7)

### Priya Raman (`priya`)

Secure in every category on every set.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | secure | secure | secure | secure | secure |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | secure | secure | secure | secure | secure |

### Jordan Whitlock (`jordan`)

Factor brackets wrong: pairs that multiply to the constant but give the wrong middle term, from Set 3's pairs to a gap on the non-monic sets, lifting on Set 6. From Set 3 on he does not reach the worded problem.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 9/10 | 8/10 | 8/10 | 7/10 |
| Algebra | secure | solid | developing | gap | gap | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | not seen | not seen | not seen | not seen |
| New skills | secure | secure | solid | secure | secure | secure |

- PS2 · Algebra · solid: a bracket's middle terms wrong expanding (Q2)
- PS3 · Algebra · developing: a factor pair that multiplies to the constant, the brackets wrong (Q8, Q9)
- PS4 · Algebra · gap: non-monic brackets wrong (Q1, Q2, Q4)
- PS5 · Algebra · gap: non-monic brackets wrong (Q4)
- PS5 · Algebra · gap: the non-monic pair's signs swapped (Q8)
- PS6 · Algebra · developing: non-monic brackets wrong (Q2)
- PS6 · Algebra · developing: a pair that multiplies to 8 but adds to 9 (Q7)
- PS3 · New skills · solid: a perfect square factorised as a difference of squares (Q6)

### Amelia Chen (`amelia`)

Something added or cleared is not taken back (the square's constant, the third), and her closing sentence does not follow from her own working, which slides from solid to a gap as the worded problems get harder.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | developing | developing | solid | solid | solid | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | solid | developing | developing | gap | gap |
| New skills | solid | developing | developing | developing | developing | developing |

- PS1 · Algebra · developing: cancelled the numbers but not the surds when dividing (Q7)
- PS2 · Algebra · developing: a denominator dropped adding the two fractions (Q9)
- PS3 · Algebra · solid: a common factor taken out and not put back in the answer (Q7)
- PS4 · Algebra · solid: half of b squared as a whole number over 2 (Q7)
- PS5 · Algebra · solid: sum of the intercepts never halved (Q8)
- PS6 · Algebra · developing: multiplied through by 3 and never took it back out (Q7)
- PS2 · Reasoning · solid: the area found, the sentence about the diagonal left out (Q10)
- PS3 · Reasoning · developing: the last line doesn't say what was shown (Q10)
- PS4 · Reasoning · developing: the negative width kept in the answer sentence (Q10)
- PS5 · Reasoning · gap: the landing given as the nozzle's zero (Q10)
- PS6 · Reasoning · gap: said the graph crosses twice (Q10)
- PS1 · New skills · solid: √12 + √27 collected before simplifying (Q3)
- PS2 · New skills · developing: multiplied only the denominator by the conjugate (Q7, Q8)
- PS3 · New skills · developing: (2x − 3)² expanded without the middle term (Q2)
- PS4 · New skills · developing: added 9 to complete the square, never took it away (Q6)
- PS5 · New skills · developing: added 16 to complete the square, never took it away (Q6)
- PS6 · New skills · developing: read “touches once” as discriminant > 0 (Q6)

### Tomas Reyes (`tomas`)

Fractions turned over, and roots, turning points and middle terms with the sign of the bracket's number. A gap in algebra from Set 3 on; on most sets his work ends before the worded problem.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 9/10 | 8/10 | 10/10 | 9/10 | 7/10 | 7/10 |
| Algebra | developing | developing | gap | gap | gap | gap |
| Functions | — | — | — | solid | secure | secure |
| Graphing | — | — | — | solid | solid | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | not seen | not seen | solid | not seen | not seen | not seen |
| New skills | solid | developing | developing | gap | gap | developing |

- PS1 · Algebra · developing: the fraction turned over dividing surds (Q7)
- PS2 · Algebra · developing: the fraction turned over rationalising (Q5, Q6)
- PS3 · Algebra · gap: the second bracket's signs wrong multiplying (Q1)
- PS3 · Algebra · gap: a negative common factor's sign lost (Q7)
- PS4 · Algebra · gap: solved 2x + 1 = 0 as x = −2 (Q3)
- PS4 · Algebra · gap: fractions lost in half of b (Q7)
- PS5 · Algebra · gap: solved 3x + 2 = 0 as −3/2 (Q4)
- PS6 · Algebra · gap: divided by a, not 2a (Q4)
- PS6 · Algebra · gap: scaled two of three terms (Q7)
- PS4 · Functions · solid: a root's sign wrong (Q5)
- PS4 · Graphing · solid: the minimum's x read with the sign flipped (Q9)
- PS5 · Graphing · solid: h read as +3 from (x + 3) (Q2)
- PS5 · Graphing · solid: axis of symmetry without the minus (Q5)
- PS3 · Reasoning · solid: both squares expanded, the subtraction's signs not shown (Q10)
- PS1 · New skills · solid: a sign lost collecting 2√18 − √8 (Q4)
- PS2 · New skills · developing: multiplied by the same bracket, not its conjugate (Q7)
- PS3 · New skills · developing: the middle term's sign wrong (Q2)
- PS4 · New skills · gap: factors set to zero with their signs flipped (Q3)
- PS4 · New skills · gap: half of b taken with the wrong sign (Q6)
- PS5 · New skills · gap: intercepts read off the factors with the signs flipped (Q1)
- PS6 · New skills · developing: null factor law on a product that isn't 0 (Q3)

### Zara Haddad (`zara`)

Gives the axis where the height is asked (from Set 4's minimum value on), and adds to complete the square without taking it away.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | solid | secure | solid | solid | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | solid | solid | solid |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | solid | solid | developing | developing | solid |

- PS2 · Algebra · solid: a common denominator found, one numerator not scaled (Q9)
- PS4 · Algebra · solid: half of −5 squared as 25/2 (Q7)
- PS5 · Algebra · solid: solved 3x + 2 = 0 as −3/2 (Q4)
- PS6 · Algebra · developing: multiplied through by 3 and never took it back out (Q7)
- PS4 · Graphing · solid: the minimum value given as the x of the turning point (Q9)
- PS5 · Graphing · solid: axis given as the height (Q10)
- PS6 · Graphing · solid: axis given as the height (Q9)
- PS2 · New skills · solid: (√7 + 2)² with 2√7 for the middle term (Q3)
- PS3 · New skills · solid: x² − 49 factorised as (x − 7)² (Q4)
- PS4 · New skills · developing: added the square to complete it, never took it away (Q6, Q8, Q9)
- PS5 · New skills · developing: added 16 to complete the square, never took it away (Q6)
- PS6 · New skills · solid: null factor law on a product that isn't 0 (Q3)

### Liam O'Connell (`liam`)

Hands in about half and does not reach the last problems: five on every finished set, four on Set 6 with a fifth started. Factor brackets wrong on every set from Set 3, and brackets squared term by term.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 5/10 | 5/10 | 5/10 | 5/10 | 5/10 | 4/10 |
| Algebra | not seen | developing | gap | gap | gap | gap |
| Functions | — | — | — | not seen | secure | not seen |
| Graphing | — | — | — | not seen | secure | not seen |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | not seen | not seen | not seen | not seen | not seen | not seen |
| New skills | developing | gap | developing | not seen | gap | gap |

- PS2 · Algebra · developing: only two of the four terms expanded (Q2)
- PS3 · Algebra · gap: a pair that multiplies to −15 but adds to 14 (Q5)
- PS4 · Algebra · gap: non-monic brackets wrong (Q1, Q2)
- PS5 · Algebra · gap: non-monic brackets wrong (Q4)
- PS6 · Algebra · gap: factor brackets wrong (Q1, Q2)
- PS1 · New skills · developing: √50 written as 25√2 (Q2)
- PS2 · New skills · gap: (√7 + 2)² squared term by term (Q3)
- PS3 · New skills · developing: (2x − 3)² squared term by term (Q2)
- PS5 · New skills · gap: intercepts read off the factors with the signs flipped (Q1)
- PS6 · New skills · gap: null factor law on a product that isn't 0 (Q3)

### Aiden Park (`aiden`)

Right almost everywhere; scales part of an expression and leaves the rest, on every set.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | developing | developing | developing | developing | developing | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | secure | secure | secure | secure | secure |

- PS1 · Algebra · developing: √2 multiplied into the first term only (Q8)
- PS2 · Algebra · developing: √3 multiplied into the first term only (Q1)
- PS3 · Algebra · developing: the common factor divided out of the first two terms only (Q7)
- PS4 · Algebra · developing: the 2 taken out of 2x² only (Q8)
- PS5 · Algebra · developing: the 2 multiplied x² and nothing else (Q7)
- PS6 · Algebra · developing: scaled two of three terms (Q7)

### Mia Nguyen (`mia`)

Factor brackets wrong with a number in front of x², from Set 3 on. Secure on surds, a gap from the non-monic set on.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | solid | developing | gap | gap | gap |
| Functions | — | — | — | solid | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | secure | solid | solid | secure | secure |

- PS2 · Algebra · solid: a denominator dropped adding fractions (Q9)
- PS3 · Algebra · developing: factor brackets wrong (Q9)
- PS4 · Algebra · gap: non-monic brackets wrong (Q1, Q4)
- PS5 · Algebra · gap: non-monic brackets wrong (Q4, Q8)
- PS6 · Algebra · gap: factor brackets wrong (Q2)
- PS6 · Algebra · gap: took −x out and left the sign behind (Q9)
- PS4 · Functions · solid: solved 2x − 1 = 0 as x = −1/2 (Q4)
- PS3 · New skills · solid: x² − 49 written as (x − 7)² (Q4)
- PS4 · New skills · solid: half of b squared without its sign (Q6)

### Noah Fitzgerald (`noah`)

Secure outside New skills, where he squares a bracket term by term on every set that asks for one.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 9/10 |
| Algebra | secure | secure | secure | secure | secure | secure |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | solid | developing | solid | developing | solid |

- PS2 · New skills · solid: (√7 + 2)² squared term by term (Q3)
- PS3 · New skills · developing: (2x − 3)² squared term by term (Q2)
- PS4 · New skills · solid: the square completed, its constant not taken away (Q6)
- PS5 · New skills · developing: (x − 3)² squared term by term (Q7)
- PS6 · New skills · solid: null factor law on a product that isn't 0 (Q3)

### Chloe Abara (`chloe`)

Factor brackets wrong, halves lost, and a negative's sign lost: a root rearranged, (−3)² taken as −9. Hands in every set she sits; away for Set 6, where she is the class's absent student.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | absent |
| Algebra | secure | solid | solid | developing | developing | absent |
| Functions | — | — | — | solid | solid | absent |
| Graphing | — | — | — | secure | secure | absent |
| Communication | secure | secure | secure | secure | secure | absent |
| Reasoning | secure | secure | secure | secure | secure | absent |
| New skills | solid | solid | secure | secure | secure | absent |

- PS2 · Algebra · solid: a denominator dropped adding fractions (Q9)
- PS3 · Algebra · solid: a pair that multiplies to 24 but adds to −14 (Q8)
- PS4 · Algebra · developing: non-monic brackets wrong (Q2)
- PS4 · Algebra · developing: halves lost completing the square (Q7)
- PS5 · Algebra · developing: non-monic brackets wrong (Q4)
- PS5 · Algebra · developing: sum of the intercepts never halved (Q8)
- PS4 · Functions · solid: a root's sign lost rearranging (Q5)
- PS5 · Functions · solid: (−3)² taken as −9 (Q5)
- PS1 · New skills · solid: √48 simplified to 2√12 and left there (Q1)
- PS1 · New skills · solid: √60 taken as 4√15, the 4 not rooted (Q5)
- PS2 · New skills · solid: the conjugate multiplied on the bottom only (Q8)

### Ethan Kowalski (`ethan`)

Leaves steps unwritten, most on the last problems: the axis given as the height, working written in one line.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 8/10 |
| Algebra | secure | solid | solid | developing | solid | developing |
| Functions | — | — | — | solid | solid | secure |
| Graphing | — | — | — | developing | solid | solid |
| Communication | solid | solid | solid | developing | solid | solid |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | secure | solid | solid | secure | secure |

- PS2 · Algebra · solid: a term dropped expanding (Q8)
- PS3 · Algebra · solid: a pair that multiplies to 24 but adds to −14 (Q8)
- PS4 · Algebra · developing: non-monic brackets wrong (Q2)
- PS4 · Algebra · developing: factorised before making the equation equal zero (Q5)
- PS5 · Algebra · solid: the non-monic pair's signs swapped (Q8)
- PS6 · Algebra · developing: divided by a, not 2a (Q4)
- PS6 · Algebra · developing: multiplied through by 3 and never took it back out (Q7)
- PS4 · Functions · solid: a root's sign lost (Q4)
- PS5 · Functions · solid: (−3)² taken as −9, the axis not shown (Q5)
- PS4 · Graphing · developing: the minimum value given as the x, the working not shown (Q9)
- PS5 · Graphing · solid: axis given as the height, the working not shown (Q10)
- PS6 · Graphing · solid: axis given as the height, a step skipped (Q9)
- PS1 · Communication · solid: steps not shown on the exact answer (Q9)
- PS2 · Communication · solid: the rationalising done in one line (Q8)
- PS3 · Communication · solid: the square completed in one line (Q6)
- PS4 · Communication · developing: steps not shown completing the square and in the worded problem (Q8, Q10)
- PS5 · Communication · solid: the landing written straight down, the working not shown (Q10)
- PS6 · Communication · solid: the height given in one line (Q9)
- PS3 · New skills · solid: a perfect square's middle term with the wrong sign (Q6)
- PS4 · New skills · solid: half of −5 taken as −5/4 (Q7)

### Isla Moretti (`isla`)

Signs wrong from a bracket: products, rearranging, turning points, −b. Her closing sentence says something her working does not, a gap from the non-monic set on.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | solid | developing | developing | developing | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | solid | solid | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | solid | developing | gap | gap | gap |
| New skills | solid | secure | secure | secure | secure | secure |

- PS2 · Algebra · solid: the product's sign wrong (Q2)
- PS3 · Algebra · developing: the second bracket's signs wrong multiplying (Q1)
- PS3 · Algebra · developing: the common factor's sign left behind (Q7)
- PS4 · Algebra · developing: x² − 3x = 10 rearranged with the 10's sign wrong (Q5)
- PS5 · Algebra · developing: took −1 out and left the signs inside behind (Q9)
- PS6 · Algebra · developing: −b written as −5 (Q4)
- PS6 · Algebra · developing: scaled two of three terms (Q7)
- PS4 · Graphing · solid: the turning point's sign wrong (Q8)
- PS5 · Graphing · solid: axis of symmetry without the minus (Q5)
- PS2 · Reasoning · solid: the sentence gives the area where the diagonal was asked (Q10)
- PS3 · Reasoning · developing: the working shown, the last line doesn't say what it shows (Q10)
- PS4 · Reasoning · gap: the negative width given in the sentence (Q10)
- PS5 · Reasoning · gap: the landing given as the nozzle's zero (Q10)
- PS6 · Reasoning · gap: said the graph crosses twice (Q10)
- PS1 · New skills · solid: a sign wrong subtracting like surds (Q4)

### Lucas Tanaka (`lucas`)

Reads a number as the wrong feature: the turning point's sign, which way a sign moves the graph, what his result says in context. Graphing lifts to secure by Set 6; reasoning slides to a gap.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | solid | solid | developing | developing | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | developing | solid | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | solid | solid | developing | gap | gap |
| New skills | secure | secure | secure | secure | secure | secure |

- PS2 · Algebra · solid: a sign lost expanding (2 + √5)(3 − √5) (Q2)
- PS3 · Algebra · solid: a pair that multiplies to 24 but adds to 10 (Q8)
- PS4 · Algebra · developing: x² − 3x = 10 rearranged with a sign lost (Q5)
- PS5 · Algebra · developing: took −1 out and left the signs inside behind (Q9)
- PS6 · Algebra · developing: a pair that multiplies to 8 but adds to 9 (Q7)
- PS4 · Graphing · developing: the turning point read with the sign flipped (Q8, Q9)
- PS5 · Graphing · solid: turning point read with the sign flipped (Q2, Q3)
- PS2 · Reasoning · solid: the diagonal stated without saying which length it is (Q10)
- PS3 · Reasoning · solid: the identity shown, one line's sign not justified (Q10)
- PS4 · Reasoning · developing: width and length swapped in the sentence (Q10)
- PS5 · Reasoning · gap: the landing given as the nozzle's zero (Q10)
- PS6 · Reasoning · gap: negative discriminant, two solutions (Q10)

### Grace Okoye (`grace`)

Right every time, several steps to a line; starts later than the class, so does not reach the last problems. Communication is developing on every set.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 8/10 | 7/10 | 9/10 | 6/10 | 7/10 | 4/10 |
| Algebra | secure | secure | secure | secure | secure | secure |
| Functions | — | — | — | secure | secure | not seen |
| Graphing | — | — | — | not seen | secure | not seen |
| Communication | solid | developing | developing | developing | developing | developing |
| Reasoning | not seen | not seen | not seen | not seen | not seen | not seen |
| New skills | secure | secure | secure | secure | secure | secure |

- PS1 · Communication · solid: simplified in one line, the square factor not shown (Q1, Q2)
- PS2 · Communication · developing: rationalised in one line (Q5, Q6, Q7)
- PS3 · Communication · developing: factorised in one line, the pair not shown (Q5, Q8)
- PS4 · Communication · developing: solved in one line (Q3, Q4)
- PS5 · Communication · developing: right every time, with steps left out a reader needs (Q1, Q2)
- PS6 · Communication · developing: right every time, with steps left out a reader needs (Q1, Q2)

### Harper Singh (`harper`)

Signs and heights: a sign lost in an expansion, a height read from the wrong line, a square completed in one line. Algebra and graphing drift down to gaps by Set 6.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 6/10 |
| Algebra | secure | solid | developing | developing | developing | gap |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | solid | developing | gap |
| Communication | secure | secure | solid | solid | solid | solid |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | solid | solid | secure | secure | secure |

- PS2 · Algebra · solid: the minus not multiplied through the bracket (Q1)
- PS3 · Algebra · developing: a sign lost in the expansion (Q1)
- PS3 · Algebra · developing: the common factor's sign lost (Q7)
- PS4 · Algebra · developing: a sign lost rearranging x² − 3x = 10 (Q5)
- PS5 · Algebra · developing: the 2 multiplied x² and nothing else (Q7)
- PS6 · Algebra · gap: a sign lost in the expansion (Q3)
- PS4 · Graphing · solid: the minimum value read off the wrong line (Q9)
- PS5 · Graphing · developing: negative a read as concave up (Q9)
- PS5 · Graphing · developing: axis given as the height, the working not shown (Q10)
- PS6 · Graphing · gap: turning point's height from the wrong line (Q5)
- PS6 · Graphing · gap: axis given as the height, the working not shown (Q9)
- PS3 · Communication · solid: the perfect square written in one line (Q6)
- PS4 · Communication · solid: the square completed in one line (Q8)
- PS5 · Communication · solid: the landing written straight down (Q10)
- PS6 · Communication · solid: the height given in one line (Q9)
- PS2 · New skills · solid: (√7 + 2)² with the middle term's 2 lost (Q3)
- PS3 · New skills · solid: (2x − 3)²'s middle term sign lost (Q2)

### Oliver Brennan (`oliver`)

Factor brackets wrong, brackets squared term by term, and the null factor law used on a product that isn't zero from Set 4 on. Algebra is a gap on the factorising sets and lifts on Set 6.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 9/10 | 8/10 | 9/10 | 7/10 |
| Algebra | secure | solid | developing | gap | gap | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | not seen | not seen | not seen | not seen |
| New skills | solid | solid | developing | developing | developing | developing |

- PS2 · Algebra · solid: the middle term wrong expanding (Q2)
- PS3 · Algebra · developing: a pair that multiplies but doesn't add (Q5, Q8)
- PS4 · Algebra · gap: non-monic brackets wrong (Q1, Q2)
- PS5 · Algebra · gap: non-monic brackets wrong (Q4)
- PS5 · Algebra · gap: the non-monic pair's signs swapped (Q8)
- PS6 · Algebra · developing: factor brackets wrong (Q1, Q2)
- PS6 · Algebra · developing: scaled two of three terms (Q7)
- PS1 · New skills · solid: √8 simplified as 4√2 (Q4)
- PS1 · New skills · solid: √(72 + 72) split into √72 + √72 (Q10)
- PS2 · New skills · solid: (3 − √2)(3 + √2) taken as 9 + 2 (Q4)
- PS3 · New skills · developing: (2x − 3)² squared term by term (Q2)
- PS4 · New skills · developing: null factor law on x(x − 3) = 10, a product that isn't 0 (Q5)
- PS5 · New skills · developing: (x − 3)² squared term by term (Q7)
- PS6 · New skills · developing: null factor law on a product that isn't 0 (Q3)

### Ruby Castellanos (`ruby`)

Factor pairs that multiply to the constant but don't add to the middle term, and the turning point's height wrong; algebra dips to a gap on Set 5 and recovers.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | solid | developing | developing | gap | developing |
| Functions | — | — | — | secure | solid | secure |
| Graphing | — | — | — | solid | solid | developing |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | solid | secure | secure | secure | secure | secure |

- PS2 · Algebra · solid: a common denominator's numerator not scaled (Q9)
- PS3 · Algebra · developing: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8)
- PS4 · Algebra · developing: a pair that multiplies but doesn't add (Q4, Q5)
- PS5 · Algebra · gap: a pair that multiplies to −8 but doesn't add to −2 (Q9)
- PS6 · Algebra · developing: a pair that multiplies to 8 but adds to 9 (Q7)
- PS5 · Functions · solid: (−3)² taken as −9 (Q5)
- PS4 · Graphing · solid: the minimum value given as the x of the turning point (Q9)
- PS5 · Graphing · solid: axis given as the height (Q10)
- PS6 · Graphing · developing: turning point's height from the wrong line (Q5)
- PS6 · Graphing · developing: axis given as the height (Q9)
- PS1 · New skills · solid: a square factor left under the root (Q1, Q6)

### Finn Dlamini (`finn`)

Right factors, then a sign or a fraction flipped solving them; a turning point read with its sign flipped. Algebra slides one step at a time to a gap on Set 6.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | solid | solid | developing | developing | developing | gap |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | solid | solid | solid |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | secure | secure | secure | secure | secure |

- PS1 · Algebra · solid: divided the wrong way round solving for x (Q9)
- PS2 · Algebra · solid: the fraction turned over rationalising (Q6)
- PS3 · Algebra · developing: a factor's sign flipped writing the pair (Q8)
- PS4 · Algebra · developing: solved 2x + 1 = 0 as x = −2 (Q3, Q4)
- PS5 · Algebra · developing: solved 3x + 2 = 0 as −3/2 (Q4)
- PS5 · Algebra · developing: sum of the intercepts never halved (Q8)
- PS6 · Algebra · gap: divided by a, not 2a (Q4)
- PS6 · Algebra · gap: sign lost solving 2x − 1 = 0 (Q2)
- PS4 · Graphing · solid: turning point read with the sign flipped (Q8)
- PS5 · Graphing · solid: turning point read with the sign flipped (Q6)
- PS6 · Graphing · solid: turning point's height from the wrong line (Q5)

### Sofia Petrov (`sofia`)

Fractions turned over, halves wrong, and non-monic brackets wrong. Algebra developing on the surd sets, a gap from Set 4 on.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | developing | developing | developing | gap | gap | gap |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | solid | secure | solid | secure | secure |

- PS1 · Algebra · developing: the fraction left upside down dividing surds (Q7)
- PS2 · Algebra · developing: rationalised the top instead of the bottom (Q5, Q6)
- PS3 · Algebra · developing: non-monic brackets wrong (Q9)
- PS4 · Algebra · gap: halves lost completing the square (Q7)
- PS4 · Algebra · gap: non-monic brackets wrong (Q2)
- PS5 · Algebra · gap: non-monic brackets wrong (Q4)
- PS5 · Algebra · gap: the non-monic pair's signs swapped (Q8)
- PS6 · Algebra · gap: denominator a, not 2a (Q4)
- PS6 · Algebra · gap: scaled two of three terms (Q7)
- PS2 · New skills · solid: the conjugate's fraction left unsimplified (Q7)
- PS4 · New skills · solid: (5/2)² taken as 5/4 completing the square (Q7)

