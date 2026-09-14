# The class story sheet: 11 Methods, Problem Sets 1–6

<!-- Generated from data/story.ts by `npm run story:sheet`. Do not edit by hand: change data/story.ts and regenerate; `data/story.test.ts` fails while the two differ. -->

The contract for the six sets in the Classroom (ticket 210). For every student and every category a set assesses, the status the Class View shows on that set and the one or two patterns behind anything short of secure, with the problems that carry them. Sets 5 and 6 are read from the real data (Set 6: the classmates' end state; Sam's Set 6 is his live session). Sets 1–4 are authored to it (tickets 211–214), and `data/finishedSets.test.ts` checks every registered set equals its rows.

## Rules

- **Statuses**: gap (red), developing (orange), solid (light green), secure (dark green). *not seen*: the set assesses the category but the student has nothing on it (missing, or never reached those problems). *absent*: the student was away for the set (ticket 250), out of its counts. *—*: the set does not assess the category. *live*: Sam on Set 6.
- **One step**: in each category, a student's neighbouring results (skipping *—*, *not seen* and *absent*) differ by at most one step, gap ↔ developing ↔ solid ↔ secure. Variation, never a jump.
- **How a status comes out** (`lib/hierarchy.ts`): a leaf is held lines ÷ attempted lines tagged with it (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap); a group and a category take their worst leaf. So one slip on a leaf the student wrote on five or more times reads solid, on three or four times developing, on one or two a gap. Communication is the share of lines that skip no step. A set's New skills count under New skills on that set, not under their home.
- **Priya** is secure in every category on every set. **Sam** is the demo student.
- **Review** (ticket 244; every set runs individual review, then group review, and a group takes on every problem one of its members got wrong): a *one-off* slip (that mistake on one problem of the set, the pattern naming only it) is fixed on the student's own rework; a *repeated* slip is fixed in group review when a groupmate handed that problem in without making it; a *pattern* (a gap in the slip's category on the set) stays wrong, and the group closes the problem unsolved on the first pattern-holder's working. A group's version is one: when its rework checks, every member still wrong there is fixed in group review, a pattern included (the case says so); the demo group's Set 6 versions are its scripted run (`data/group-scripts.ts`). `lib/reviewRule.ts` applies the rules; each set's review below lists every case with its reasoning.

## The sets

| Set | Due | New skills | Pathway | Assesses | Absent | Missing | Did not finish | Top gap | Data |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Problem Set 1 — Surds | Tue 25 Aug | surds | individual → group | Algebra, Communication, Reasoning, New skills | nobody | nobody | tomas 9, liam 2, grace 8 | surds | ticket 211, data/pset1/ |
| Problem Set 2 — Rationalising and expanding with surds | Fri 28 Aug | surds, binomial identity | individual → group | Algebra, Communication, Reasoning, New skills | nobody | nobody | tomas 8, liam 3, grace 7 | binomial identity | ticket 212, data/pset2/ |
| Problem Set 3 — Expanding and factorising | Tue 1 Sep | binomial identity | individual → group | Algebra, Communication, Reasoning, New skills | nobody | liam | jordan 9, grace 9, oliver 9 | binomial identity | ticket 213, data/pset3/ |
| Problem Set 4 — Non-monic factorising and completing the square | Fri 4 Sep | binomial identity, null factor law | individual → group | Algebra, Functions, Graphing, Communication, Reasoning, New skills | nobody | nobody | jordan 8, tomas 9, liam 2, grace 6, oliver 8 | non-monic factorising | ticket 214, data/pset4/ |
| Problem Set 5 — Features of a parabola | Mon 7 Sep | null factor law, binomial identity | individual → group | Algebra, Functions, Graphing, Communication, Reasoning, New skills | nobody | liam | jordan 8, tomas 7, grace 7, oliver 9 | graph features | data/pset5/ (ticket 187) |
| Problem Set 6 — Roots of a quadratic | Thu 10 Sep | discriminant, null factor law | individual → group | Algebra, Functions, Graphing, Communication, Reasoning, New skills | chloe | nobody | jordan 7, tomas 7, liam 2, noah 9, ethan 8, grace 4, harper 6, oliver 7 | fractions | data/assignment.ts, data/classmates.ts (the live set; rows are the classmates' end state) |

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
| liam | 2/10 | not seen | secure | not seen | developing |
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

The set's review (individual → group): 13 fixed on the student's own rework, 2 in group review, 0 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| amelia | Q3, Q7 | — | — |
| tomas | Q4, Q7 | — | — |
| liam | Q2 | — | — |
| aiden | Q8 | — | — |
| chloe | Q1, Q5 | — | — |
| isla | Q4 | — | — |
| oliver | Q4, Q10 | — | — |
| ruby | — | Q1, Q6 | — |
| finn | Q9 | — | — |
| sofia | Q7 | — | — |

- amelia Q3 · own rework: One-off: √12 + √27 collected before simplifying, on Q3 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: cancelled the numbers but not the surds when dividing, on Q7 alone. Found on the second submission.
- tomas Q4 · own rework: One-off: a sign lost collecting 2√18 − √8, on Q4 alone. Found on the second submission.
- tomas Q7 · own rework: One-off: the fraction turned over dividing surds, on Q7 alone. Found on the second submission.
- liam Q2 · own rework: One-off: √50 written as 25√2, on Q2 alone. Found on the second submission.
- aiden Q8 · own rework: One-off: √2 multiplied into the first term only, on Q8 alone. Found on the second submission.
- chloe Q1 · own rework: One-off: √48 simplified to 2√12 and left there, on Q1 alone. Found on the second submission.
- chloe Q5 · own rework: One-off: √60 taken as 4√15, the 4 not rooted, on Q5 alone. Found on the second submission.
- isla Q4 · own rework: One-off: a sign copied subtracting like surds, on Q4 alone. Found on the second submission.
- oliver Q4 · own rework: One-off: √8 simplified as 4√2, on Q4 alone. Found on the second submission.
- oliver Q10 · own rework: One-off: √(72 + 72) split into √72 + √72, on Q10 alone. Found on the second submission.
- ruby Q1 · group review: Repeated: a square factor left under the root (Q1, Q6). Oliver, Finn and Sofia handed Q1 in without it, and the group's rework holds.
- ruby Q6 · group review: Repeated: a square factor left under the root (Q1, Q6). Oliver, Finn and Sofia handed Q6 in without it, and the group's rework holds.
- finn Q9 · own rework: One-off: divided the wrong way round solving for x, on Q9 alone. Found on the second submission.
- sofia Q7 · own rework: One-off: the fraction left upside down dividing surds, on Q7 alone. Found on the second submission.

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
| liam | 3/10 | developing | secure | not seen | gap |
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

The set's review (individual → group): 26 fixed on the student's own rework, 6 in group review, 1 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q2, Q7 | — | — |
| jordan | Q2 | — | — |
| amelia | Q9, Q10 | Q7, Q8 | — |
| tomas | Q7 | Q5, Q6 | — |
| zara | Q3, Q9 | — | — |
| liam | Q2 | — | Q3 |
| aiden | Q1 | — | — |
| mia | Q9 | — | — |
| noah | Q3 | — | — |
| chloe | Q8, Q9 | — | — |
| ethan | Q8 | — | — |
| isla | Q2, Q10 | — | — |
| lucas | Q2, Q10 | — | — |
| harper | Q1, Q3 | — | — |
| oliver | Q2, Q4 | — | — |
| ruby | Q9 | — | — |
| finn | Q6 | — | — |
| sofia | Q7 | Q5, Q6 | — |

- sam Q2 · own rework: One-off: √5 × (−√5) as +5, on Q2 alone. Found on the second submission.
- sam Q7 · own rework: One-off: the conjugate's sign copied from the denominator, on Q7 alone. Found on the second submission.
- jordan Q2 · own rework: One-off: a bracket expanded without checking the middle terms, on Q2 alone. Found on the second submission.
- amelia Q7 · group review: Repeated: multiplied only the denominator by the conjugate (Q7, Q8). Priya, Tomas and Aiden handed Q7 in without it, and the group's rework holds.
- amelia Q8 · group review: Repeated: multiplied only the denominator by the conjugate (Q7, Q8). Priya, Tomas and Aiden handed Q8 in without it, and the group's rework holds.
- amelia Q9 · own rework: One-off: a denominator dropped adding the two fractions, on Q9 alone. Found on the second submission.
- amelia Q10 · own rework: One-off: the area found, the sentence about the diagonal left out, on Q10 alone. Found on the second submission.
- tomas Q5 · group review: Repeated: the fraction turned over rationalising (Q5, Q6). Priya, Amelia and Aiden handed Q5 in without it, and the group's rework holds.
- tomas Q6 · group review: Repeated: the fraction turned over rationalising (Q5, Q6). Priya, Amelia and Aiden handed Q6 in without it, and the group's rework holds.
- tomas Q7 · own rework: One-off: multiplied by the same bracket, not its conjugate, on Q7 alone. Found on the second submission.
- zara Q3 · own rework: One-off: (√7 + 2)² with 2√7 for the middle term, on Q3 alone. Found on the second submission.
- zara Q9 · own rework: One-off: a common denominator found, one numerator not scaled, on Q9 alone. Found on the second submission.
- liam Q2 · own rework: One-off: only two of the four terms expanded, on Q2 alone. Found on the second submission.
- liam Q3 · still wrong: Pattern: New skills is a gap on the set ((√7 + 2)² squared term by term). The group's last try is their own first submission.
- aiden Q1 · own rework: One-off: √3 multiplied into the first term only, on Q1 alone. Found on the second submission.
- mia Q9 · own rework: One-off: a denominator dropped adding fractions, on Q9 alone. Found on the second submission.
- noah Q3 · own rework: One-off: (√7 + 2)² squared term by term, on Q3 alone. Found on the second submission.
- chloe Q8 · own rework: One-off: the conjugate multiplied on the bottom only, on Q8 alone. Found on the second submission.
- chloe Q9 · own rework: One-off: a denominator dropped adding fractions, on Q9 alone. Found on the second submission.
- ethan Q8 · own rework: One-off: a term dropped expanding in a rush, on Q8 alone. Found on the second submission.
- isla Q2 · own rework: One-off: the product's sign copied from the bracket, on Q2 alone. Found on the second submission.
- isla Q10 · own rework: One-off: the sentence gives the area where the diagonal was asked, on Q10 alone. Found on the second submission.
- lucas Q2 · own rework: One-off: a sign lost expanding (2 + √5)(3 − √5), on Q2 alone. Found on the second submission.
- lucas Q10 · own rework: One-off: the diagonal stated without saying which length it is, on Q10 alone. Found on the second submission.
- harper Q1 · own rework: One-off: the minus not multiplied through the bracket, on Q1 alone. Found on the second submission.
- harper Q3 · own rework: One-off: (√7 + 2)² with the middle term's 2 lost, on Q3 alone. Found on the second submission.
- oliver Q2 · own rework: One-off: brackets expanded by guessing the middle term, on Q2 alone. Found on the second submission.
- oliver Q4 · own rework: One-off: (3 − √2)(3 + √2) taken as 9 + 2, on Q4 alone. Found on the second submission.
- ruby Q9 · own rework: One-off: a common denominator's numerator not scaled, on Q9 alone. Found on the second submission.
- finn Q6 · own rework: One-off: the fraction turned over rationalising, on Q6 alone. Found on the second submission.
- sofia Q5 · group review: Repeated: rationalised the top, not bottom (Q5, Q6). Oliver, Ruby and Finn handed Q5 in without it, and the group's rework holds.
- sofia Q6 · group review: Repeated: rationalised the top, not bottom (Q5, Q6). Oliver, Ruby and Finn handed Q6 in without it, and the group's rework holds.
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
| liam | missing | not seen | not seen | not seen | not seen |
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

The set's review (individual → group): 29 fixed on the student's own rework, 10 in group review, 2 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q8 | — | — |
| jordan | Q6 | Q8, Q9 | — |
| amelia | Q2, Q4, Q7, Q10 | — | — |
| tomas | Q2, Q6, Q10 | — | Q1, Q7 |
| zara | Q4 | — | — |
| aiden | Q1, Q3, Q7 | — | — |
| mia | Q4, Q9 | — | — |
| noah | — | Q2, Q10 | — |
| chloe | Q8 | — | — |
| ethan | Q6, Q8 | — | — |
| isla | Q1, Q7, Q10 | — | — |
| lucas | Q8, Q10 | — | — |
| harper | Q1, Q2, Q7 | — | — |
| oliver | Q2, Q6 | Q5, Q8 | — |
| ruby | — | Q5, Q8 | — |
| finn | — | Q5, Q8 | — |
| sofia | Q9 | — | — |

- sam Q8 · own rework: One-off: the signs of a factor pair swapped, not expanded back, on Q8 alone. Found on the second submission.
- jordan Q6 · own rework: One-off: a perfect square factorised as a difference of squares, not checked, on Q6 alone. Found on the second submission.
- jordan Q8 · group review: Repeated: a factor pair that multiplies to the constant, not checked by expanding (Q8, Q9). Sam and Zara handed Q8 in without it, and the group's rework holds.
- jordan Q9 · group review: Repeated: a factor pair that multiplies to the constant, not checked by expanding (Q8, Q9). Sam and Zara handed Q9 in without it, and the group's rework holds.
- amelia Q2 · own rework: One-off: (2x − 3)² expanded without the middle term, on Q2 alone. Found on the second submission.
- amelia Q4 · own rework: One-off: difference of squares as square, on Q4 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: a common factor taken out and not put back in the answer, on Q7 alone. Found on the second submission.
- amelia Q10 · own rework: One-off: the last line doesn't say what was shown, on Q10 alone. Found on the second submission.
- tomas Q1 · still wrong: Pattern: Algebra is a gap on the set (signs in the second bracket copied, not multiplied). The group's last try is their own first submission.
- tomas Q2 · own rework: One-off: the middle term's sign copied from the bracket, on Q2 alone. Found on the second submission.
- tomas Q6 · own rework: One-off: the square's sign flipped, on Q6 alone. Found on the second submission.
- tomas Q7 · still wrong: Pattern: Algebra is a gap on the set (a negative common factor's sign lost). The group's last try is their own first submission.
- tomas Q10 · own rework: One-off: both squares expanded, the subtraction's signs not shown, on Q10 alone. Found on the second submission.
- zara Q4 · own rework: One-off: x² − 49 factorised as (x − 7)², on Q4 alone. Found on the second submission.
- aiden Q1 · own rework: One-off: the 4 on x only, on Q1 alone. Found on the second submission.
- aiden Q3 · own rework: One-off: (3x)² as 3x², on Q3 alone. Found on the second submission.
- aiden Q7 · own rework: One-off: the common factor divided out of the first two terms only, on Q7 alone. Found on the second submission.
- mia Q4 · own rework: One-off: x² − 49 written as (x − 7)², on Q4 alone. Found on the second submission.
- mia Q9 · own rework: One-off: tried brackets until one looked close, on Q9 alone. Found on the second submission.
- noah Q2 · group review: Repeated: (2x − 3)² squared term by term (Q2, Q10). Mia, Chloe and Ethan handed Q2 in without it, and the group's rework holds.
- noah Q10 · group review: Repeated: squared each term separately (Q2, Q10). Mia, Chloe and Ethan handed Q10 in without it, and the group's rework holds.
- chloe Q8 · own rework: One-off: a factor pair guessed without checking, on Q8 alone. Found on the second submission.
- ethan Q6 · own rework: One-off: a perfect square's middle term rushed, on Q6 alone. Found on the second submission.
- ethan Q8 · own rework: One-off: a factor pair written without checking the middle, on Q8 alone. Found on the second submission.
- isla Q1 · own rework: One-off: signs in the second bracket copied, not multiplied, on Q1 alone. Found on the second submission.
- isla Q7 · own rework: One-off: the common factor's sign left behind, on Q7 alone. Found on the second submission.
- isla Q10 · own rework: One-off: the working shown, the last line doesn't say what it shows, on Q10 alone. Found on the second submission.
- lucas Q8 · own rework: One-off: a pair that multiplies to 24 but adds to 10, on Q8 alone. Found on the second submission.
- lucas Q10 · own rework: One-off: the identity shown, one line's sign not justified, on Q10 alone. Found on the second submission.
- harper Q1 · own rework: One-off: a sign lost in the expansion, on Q1 alone. Found on the second submission.
- harper Q2 · own rework: One-off: (2x − 3)²'s middle term sign lost, on Q2 alone. Found on the second submission.
- harper Q7 · own rework: One-off: the common factor's sign lost, on Q7 alone. Found on the second submission.
- oliver Q2 · own rework: One-off: (2x − 3)² squared term by term, on Q2 alone. Found on the second submission.
- oliver Q5 · group review: Repeated: factor pairs guessed without expanding back (Q5, Q8). Ruby, Finn and Sofia handed Q5 in without it, and the group's rework holds.
- oliver Q6 · own rework: One-off: perfect square as difference, on Q6 alone. Found on the second submission.
- oliver Q8 · group review: Repeated: factor pairs guessed without expanding back (Q5, Q8). Ruby, Finn and Sofia handed Q8 in without it, and the group's rework holds.
- ruby Q5 · group review: Repeated: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8). Oliver, Finn and Sofia handed Q5 in without it, and the group's rework holds.
- ruby Q8 · group review: Repeated: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8). Oliver, Finn and Sofia handed Q8 in without it, and the group's rework holds.
- finn Q5 · group review: Repeated: sign flipped writing the pair (Q5, Q8). Oliver, Ruby and Sofia handed Q5 in without it, and the group's rework holds.
- finn Q8 · group review: Repeated: a factor's sign flipped writing the pair (Q5, Q8). Oliver, Ruby and Sofia handed Q8 in without it, and the group's rework holds.
- sofia Q9 · own rework: One-off: a non-monic pair guessed, on Q9 alone. Found on the second submission.

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
| liam | 2/10 | gap | not seen | not seen | secure | not seen | not seen |
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

The set's review (individual → group): 28 fixed on the student's own rework, 15 in group review, 11 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q7, Q8 | Q1, Q2 | — |
| jordan | — | Q1, Q2 | Q4 |
| amelia | Q6, Q7, Q10 | — | — |
| tomas | Q5, Q9 | — | Q3, Q6, Q7 |
| zara | Q7 | Q6, Q8, Q9 | — |
| liam | — | Q1, Q2 | — |
| aiden | Q8 | — | — |
| mia | Q6 | — | Q1, Q4 |
| noah | Q6 | — | — |
| chloe | Q2, Q5, Q7 | — | — |
| ethan | Q2, Q4, Q5, Q7, Q9 | — | — |
| isla | Q5, Q8 | — | Q10 |
| lucas | Q5, Q10 | Q8, Q9 | — |
| harper | Q5, Q9 | — | — |
| oliver | Q5 | — | Q1, Q2 |
| ruby | Q9 | Q4, Q5 | — |
| finn | Q8 | Q3, Q4 | — |
| sofia | — | — | Q2, Q7 |

- sam Q1 · group review: Repeated: right split, the signs put into the wrong brackets (Q1, Q2). Jordan, Zara and Liam handed Q1 in without it, and the group's rework holds.
- sam Q2 · group review: Repeated: right split, the signs put into the wrong brackets (Q1, Q2). Jordan, Zara and Liam handed Q2 in without it, and the group's rework holds.
- sam Q7 · own rework: One-off: half of b taken with the wrong sign completing the square, on Q7 alone. Found on the second submission.
- sam Q8 · own rework: One-off: turning point read with the sign flipped, on Q8 alone. Found on the second submission.
- jordan Q1 · group review: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back), but the group's rework holds (Sam's repeated slip here was the group's to fix) and the group's version is one.
- jordan Q2 · group review: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back), but the group's rework holds (Sam's repeated slip here was the group's to fix) and the group's version is one.
- jordan Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- amelia Q6 · own rework: One-off: added 9 to complete the square, never took it away, on Q6 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: half of b squared as a whole number over 2, on Q7 alone. Found on the second submission.
- amelia Q10 · own rework: One-off: the negative width kept in the answer sentence, on Q10 alone. Found on the second submission.
- tomas Q3 · still wrong: Pattern: New skills is a gap on the set (factors set to zero with their signs flipped). The group's last try is their own first submission.
- tomas Q5 · own rework: One-off: a root's sign copied from its bracket, on Q5 alone. Found on the second submission.
- tomas Q6 · still wrong: Pattern: New skills is a gap on the set (half of b taken with the wrong sign). The group's last try is their own first submission.
- tomas Q7 · still wrong: Pattern: Algebra is a gap on the set (fractions lost in half of b). The group's last try is their own first submission.
- tomas Q9 · own rework: One-off: the minimum's x read with the sign flipped, on Q9 alone. Found on the second submission.
- zara Q6 · group review: Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam and Jordan handed Q6 in without it, and the group's rework holds.
- zara Q7 · own rework: One-off: half of −5 squared as 25/2, on Q7 alone. Found on the second submission.
- zara Q8 · group review: Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam and Jordan handed Q8 in without it, and the group's rework holds.
- zara Q9 · group review: Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam handed Q9 in without it, and the group's rework holds.
- liam Q1 · group review: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back), but the group's rework holds (Sam's repeated slip here was the group's to fix) and the group's version is one.
- liam Q2 · group review: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back), but the group's rework holds (Sam's repeated slip here was the group's to fix) and the group's version is one.
- aiden Q8 · own rework: One-off: the 2 taken out of 2x² only, on Q8 alone. Found on the second submission.
- mia Q1 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- mia Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- mia Q6 · own rework: One-off: half of b squared without its sign, on Q6 alone. Found on the second submission.
- noah Q6 · own rework: One-off: the square completed, its constant not taken away, on Q6 alone. Found on the second submission.
- chloe Q2 · own rework: One-off: a non-monic pair guessed, never expanded back, on Q2 alone. Found on the second submission.
- chloe Q5 · own rework: One-off: a root's sign lost rearranging, on Q5 alone. Found on the second submission.
- chloe Q7 · own rework: One-off: halves lost completing the square, on Q7 alone. Found on the second submission.
- ethan Q2 · own rework: One-off: a non-monic pair guessed, never expanded back, on Q2 alone. Found on the second submission.
- ethan Q4 · own rework: One-off: a root's sign lost in the rush, on Q4 alone. Found on the second submission.
- ethan Q5 · own rework: One-off: factorised before making the equation equal zero, on Q5 alone. Found on the second submission.
- ethan Q7 · own rework: One-off: half of −5 rushed as −5/4, on Q7 alone. Found on the second submission.
- ethan Q9 · own rework: One-off: the minimum value given as the x, jumped straight to it, on Q9 alone. Found on the second submission.
- isla Q5 · own rework: One-off: x² − 3x = 10 rearranged with the 10's sign copied, on Q5 alone. Found on the second submission.
- isla Q8 · own rework: One-off: the turning point's sign copied from the bracket, on Q8 alone. Found on the second submission.
- isla Q10 · still wrong: Pattern: Reasoning is a gap on the set (the negative width given in the sentence). The group's last try is their own first submission.
- lucas Q5 · own rework: One-off: x² − 3x = 10 rearranged with a sign lost, on Q5 alone. Found on the second submission.
- lucas Q8 · group review: Repeated: the turning point read with the sign flipped (Q8, Q9). Harper handed Q8 in without it, and the group's rework holds.
- lucas Q9 · group review: Repeated: the turning point read with the sign flipped (Q8, Q9). Isla and Harper handed Q9 in without it, and the group's rework holds.
- lucas Q10 · own rework: One-off: width and length swapped in the sentence, on Q10 alone. Found on the second submission.
- harper Q5 · own rework: One-off: a sign lost rearranging x² − 3x = 10, on Q5 alone. Found on the second submission.
- harper Q9 · own rework: One-off: the minimum value read off the wrong line, on Q9 alone. Found on the second submission.
- oliver Q1 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- oliver Q2 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- oliver Q5 · own rework: One-off: null factor law on x(x − 3) = 10, a product that isn't 0, on Q5 alone. Found on the second submission.
- ruby Q4 · group review: Repeated: a pair that multiplies but doesn't add, never expanded back (Q4, Q5). Oliver, Finn and Sofia handed Q4 in without it, and the group's rework holds.
- ruby Q5 · group review: Repeated: a pair that multiplies but doesn't add, never expanded back (Q4, Q5). Oliver, Finn and Sofia handed Q5 in without it, and the group's rework holds.
- ruby Q9 · own rework: One-off: the minimum value given as the x of the turning point, on Q9 alone. Found on the second submission.
- finn Q3 · group review: Repeated: solved 2x + 1 = 0 as x = −2 (Q3, Q4). Oliver, Ruby and Sofia handed Q3 in without it, and the group's rework holds.
- finn Q4 · group review: Repeated: solved 2x + 1 = 0 as x = −2 (Q3, Q4). Oliver, Ruby and Sofia handed Q4 in without it, and the group's rework holds.
- finn Q8 · own rework: One-off: turning point read with the sign flipped, on Q8 alone. Found on the second submission.
- sofia Q2 · still wrong: Pattern: Algebra is a gap on the set (a non-monic pair guessed). The group's last try is Oliver's first submission.
- sofia Q7 · still wrong: Pattern: Algebra is a gap on the set (halves lost completing the square). The group's last try is their own first submission.

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
| liam | missing | not seen | not seen | not seen | not seen | not seen | not seen |
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

The set's review (individual → group): 30 fixed on the student's own rework, 2 in group review, 15 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | Q4, Q6, Q9 | — | — |
| jordan | — | — | Q4, Q8 |
| amelia | Q6, Q8 | — | Q10 |
| tomas | Q2, Q5 | — | Q1, Q4 |
| zara | Q4, Q6, Q10 | — | — |
| aiden | Q7 | — | — |
| mia | — | — | Q4, Q8, Q9 |
| noah | Q7 | — | — |
| chloe | Q4, Q5, Q8 | — | — |
| ethan | Q5, Q8, Q10 | — | — |
| isla | Q5, Q9 | — | Q10 |
| lucas | Q9 | Q2, Q3 | Q10 |
| harper | Q7, Q9, Q10 | — | — |
| oliver | Q7 | — | Q4, Q8 |
| ruby | Q5, Q10 | — | Q9 |
| finn | Q4, Q6, Q8 | — | — |
| sofia | — | — | Q4, Q8 |

- sam Q4 · own rework: One-off: right split, signs in the wrong brackets, on Q4 alone. Found on the second submission.
- sam Q6 · own rework: One-off: turning point read with the sign flipped, on Q6 alone. Found on the second submission.
- sam Q9 · own rework: One-off: negative a read as concave up, on Q9 alone. Found on the second submission.
- jordan Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- jordan Q8 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- amelia Q6 · own rework: One-off: added 16 to complete the square, never took it away, on Q6 alone. Found on the second submission.
- amelia Q8 · own rework: One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission.
- amelia Q10 · still wrong: Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). The group's last try is their own first submission.
- tomas Q1 · still wrong: Pattern: New skills is a gap on the set (intercepts read off the factors with the signs flipped). The group's last try is their own first submission.
- tomas Q2 · own rework: One-off: h read as +3 from (x + 3), on Q2 alone. Found on the second submission.
- tomas Q4 · still wrong: Pattern: Algebra is a gap on the set (solved 3x + 2 = 0 as −3/2). The group's last try is their own first submission.
- tomas Q5 · own rework: One-off: axis of symmetry without the minus, on Q5 alone. Found on the second submission.
- zara Q4 · own rework: One-off: solved 3x + 2 = 0 as −3/2, on Q4 alone. Found on the second submission.
- zara Q6 · own rework: One-off: added 16 to complete the square, never took it away, on Q6 alone. Found on the second submission.
- zara Q10 · own rework: One-off: axis given as the height, on Q10 alone. Found on the second submission.
- aiden Q7 · own rework: One-off: the 2 multiplied x² and nothing else, on Q7 alone. Found on the second submission.
- mia Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- mia Q8 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- mia Q9 · still wrong: Pattern: Algebra is a gap on the set (sign left behind in bracket). The group's last try is their own first submission.
- noah Q7 · own rework: One-off: (x − 3)² squared term by term, on Q7 alone. Found on the second submission.
- chloe Q4 · own rework: One-off: non-monic pair guessed, never expanded back, on Q4 alone. Found on the second submission.
- chloe Q5 · own rework: One-off: (−3)² taken as −9, on Q5 alone. Found on the second submission.
- chloe Q8 · own rework: One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission.
- ethan Q5 · own rework: One-off: (−3)² taken as −9, the axis not shown, on Q5 alone. Found on the second submission.
- ethan Q8 · own rework: One-off: non-monic pair guessed, never expanded back, on Q8 alone. Found on the second submission.
- ethan Q10 · own rework: One-off: axis given as the height, jumped straight to it, on Q10 alone. Found on the second submission.
- isla Q5 · own rework: One-off: axis of symmetry without the minus, on Q5 alone. Found on the second submission.
- isla Q9 · own rework: One-off: took −1 out and left the signs inside behind, on Q9 alone. Found on the second submission.
- isla Q10 · still wrong: Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). The group's last try is their own first submission.
- lucas Q2 · group review: Repeated: turning point read with the sign flipped (Q2, Q3). Isla, Grace and Harper handed Q2 in without it, and the group's rework holds.
- lucas Q3 · group review: Repeated: turning point read with the sign flipped (Q2, Q3). Isla, Grace and Harper handed Q3 in without it, and the group's rework holds.
- lucas Q9 · own rework: One-off: took −1 out and left the signs inside behind, on Q9 alone. Found on the second submission.
- lucas Q10 · still wrong: Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). The group's last try is Isla's first submission.
- harper Q7 · own rework: One-off: the 2 multiplied x² and nothing else, on Q7 alone. Found on the second submission.
- harper Q9 · own rework: One-off: negative a read as concave up, on Q9 alone. Found on the second submission.
- harper Q10 · own rework: One-off: axis given as the height, jumped straight to it, on Q10 alone. Found on the second submission.
- oliver Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- oliver Q7 · own rework: One-off: (x − 3)² squared term by term, on Q7 alone. Found on the second submission.
- oliver Q8 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is their own first submission.
- ruby Q5 · own rework: One-off: (−3)² taken as −9, on Q5 alone. Found on the second submission.
- ruby Q9 · still wrong: Pattern: Algebra is a gap on the set (a pair that multiplies to −8 but doesn't add to −2). The group's last try is their own first submission.
- ruby Q10 · own rework: One-off: axis given as the height, on Q10 alone. Found on the second submission.
- finn Q4 · own rework: One-off: solved 3x + 2 = 0 as −3/2, on Q4 alone. Found on the second submission.
- finn Q6 · own rework: One-off: turning point read with the sign flipped, on Q6 alone. Found on the second submission.
- finn Q8 · own rework: One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission.
- sofia Q4 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is Oliver's first submission.
- sofia Q8 · still wrong: Pattern: Algebra is a gap on the set (non-monic pairs guessed, never expanded back). The group's last try is Oliver's first submission.

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
| liam | 2/10 | gap | not seen | not seen | secure | not seen | gap |
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

The set's review (individual → group): 23 fixed on the student's own rework, 7 in group review, 16 still wrong (each closed unsolved by the group).

| Student | Own rework | Group review | Still wrong |
| --- | --- | --- | --- |
| sam | live | live | live |
| jordan | Q2, Q7 | — | — |
| amelia | Q6, Q7 | — | Q10 |
| tomas | Q3 | — | Q4, Q5, Q7 |
| zara | Q3, Q7, Q9 | — | — |
| liam | — | Q1, Q2, Q3 | — |
| aiden | Q7 | — | — |
| mia | — | — | Q2, Q7, Q9 |
| noah | Q3 | — | — |
| ethan | Q1, Q4, Q7, Q9 | — | — |
| isla | Q4, Q7 | — | Q10 |
| lucas | Q7 | — | Q10 |
| harper | — | — | Q3, Q5, Q9 |
| oliver | Q3, Q7 | Q1, Q2 | — |
| ruby | Q5, Q7, Q9 | — | — |
| finn | Q5 | Q2 | Q4, Q7 |
| sofia | — | Q2 | Q4, Q7 |

- jordan Q2 · own rework: One-off: non-monic factors not checked by expanding, on Q2 alone. Found on the second submission.
- jordan Q7 · own rework: One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission.
- amelia Q6 · own rework: One-off: read “touches once” as discriminant > 0, on Q6 alone. Found on the second submission.
- amelia Q7 · own rework: One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission.
- amelia Q10 · still wrong: Pattern: Reasoning is a gap on the set (said the graph crosses twice). The group's last try is their own first submission.
- tomas Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- tomas Q4 · still wrong: Pattern: Algebra is a gap on the set (divided by a, not 2a). The group's last try is their own first submission.
- tomas Q5 · still wrong: Pattern: Algebra is a gap on the set (roots with the signs flipped). The group's last try is their own first submission.
- tomas Q7 · still wrong: Pattern: Algebra is a gap on the set (scaled two of three terms). The group's last try is their own first submission.
- zara Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- zara Q7 · own rework: One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission.
- zara Q9 · own rework: One-off: axis given as the height, on Q9 alone. Found on the second submission.
- liam Q1 · group review: Pattern: Algebra is a gap on the set (guessed a factor pair without expanding back), but the group's rework holds (the demo group's scripted run solves it) and the group's version is one.
- liam Q2 · group review: Pattern: Algebra is a gap on the set (guessed a factor pair without expanding back), but the group's rework holds (the demo group's scripted run solves it) and the group's version is one.
- liam Q3 · group review: Pattern: New skills is a gap on the set (null factor law on a product that isn't 0), but the group's rework holds (the demo group's scripted run solves it) and the group's version is one.
- aiden Q7 · own rework: One-off: scaled two of three terms, on Q7 alone. Found on the second submission.
- mia Q2 · still wrong: Pattern: Algebra is a gap on the set (guessed a factor pair, never expanded back). The group's last try is their own first submission.
- mia Q7 · still wrong: Pattern: Algebra is a gap on the set (scaled two of three terms). The group's last try is their own first submission.
- mia Q9 · still wrong: Pattern: Algebra is a gap on the set (took −x out and left the sign behind). The group's last try is their own first submission.
- noah Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- ethan Q1 · own rework: One-off: signs flipped in the pair, on Q1 alone. Found on the second submission.
- ethan Q4 · own rework: One-off: divided by a, not 2a, on Q4 alone. Found on the second submission.
- ethan Q7 · own rework: One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission.
- ethan Q9 · own rework: One-off: axis given as the height, a step skipped, on Q9 alone. Found on the second submission.
- isla Q4 · own rework: One-off: −b written as −5, on Q4 alone. Found on the second submission.
- isla Q7 · own rework: One-off: scaled two of three terms, on Q7 alone. Found on the second submission.
- isla Q10 · still wrong: Pattern: Reasoning is a gap on the set (said the graph crosses twice). The group's last try is their own first submission.
- lucas Q7 · own rework: One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission.
- lucas Q10 · still wrong: Pattern: Reasoning is a gap on the set (negative discriminant, two solutions). The group's last try is Isla's first submission.
- harper Q3 · still wrong: Pattern: Algebra is a gap on the set (a sign lost in the expansion). The group's last try is their own first submission.
- harper Q5 · still wrong: Pattern: Graphing is a gap on the set (turning point's height from the wrong line). The group's last try is their own first submission.
- harper Q9 · still wrong: Pattern: Graphing is a gap on the set (axis given as the height, jumped straight to it). The group's last try is their own first submission.
- oliver Q1 · group review: Repeated: guesses factor pairs without expanding back (Q1, Q2). Ruby, Finn and Sofia handed Q1 in without it, and the group's rework holds.
- oliver Q2 · group review: Repeated: guesses factor pairs without expanding back (Q1, Q2). Ruby and Finn handed Q2 in without it, and the group's rework holds.
- oliver Q3 · own rework: One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission.
- oliver Q7 · own rework: One-off: scaled two of three terms, on Q7 alone. Found on the second submission.
- ruby Q5 · own rework: One-off: turning point's height from the wrong line, on Q5 alone. Found on the second submission.
- ruby Q7 · own rework: One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission.
- ruby Q9 · own rework: One-off: axis given as the height, on Q9 alone. Found on the second submission.
- finn Q2 · group review: Pattern: Algebra is a gap on the set (sign lost solving 2x − 1 = 0), but the group's rework holds (Oliver's repeated slip here was the group's to fix) and the group's version is one.
- finn Q4 · still wrong: Pattern: Algebra is a gap on the set (divided by a, not 2a). The group's last try is their own first submission.
- finn Q5 · own rework: One-off: turning point's height from the wrong line, on Q5 alone. Found on the second submission.
- finn Q7 · still wrong: Pattern: Algebra is a gap on the set (tripled, third never restored). The group's last try is their own first submission.
- sofia Q2 · group review: Pattern: Algebra is a gap on the set (guessed pair, not expanded back), but the group's rework holds (Oliver's repeated slip here was the group's to fix) and the group's version is one.
- sofia Q4 · still wrong: Pattern: Algebra is a gap on the set (denominator a, not 2a). The group's last try is Finn's first submission.
- sofia Q7 · still wrong: Pattern: Algebra is a gap on the set (scaled two of three terms). The group's last try is Finn's first submission.

## The students

### Sam Okonkwo (`sam`)

Confident and quick, mostly right; careless signs that cost him on the factorising sets, which is why he names factorising as the skill he is unsure of on Set 6.

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
- PS3 · Algebra · solid: the signs of a factor pair swapped, not expanded back (Q8)
- PS4 · Algebra · developing: right split, the signs put into the wrong brackets (Q1, Q2)
- PS5 · Algebra · developing: right split, signs in the wrong brackets (Q4)
- PS4 · Graphing · solid: turning point read with the sign flipped (Q8)
- PS5 · Graphing · developing: turning point read with the sign flipped (Q6)
- PS5 · Graphing · developing: negative a read as concave up (Q9)
- PS2 · New skills · solid: the conjugate's sign copied from the denominator (Q7)
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

Finds numbers that multiply to the constant and writes the brackets without expanding back; it starts on Set 3's pairs, is a gap by the non-monic sets, and begins to lift on Set 6. Runs out of time from Set 3 on, so never reaches the worded problem.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 9/10 | 8/10 | 8/10 | 7/10 |
| Algebra | secure | solid | developing | gap | gap | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | not seen | not seen | not seen | not seen |
| New skills | secure | secure | solid | secure | secure | secure |

- PS2 · Algebra · solid: a bracket expanded without checking the middle terms (Q2)
- PS3 · Algebra · developing: a factor pair that multiplies to the constant, not checked by expanding (Q8, Q9)
- PS4 · Algebra · gap: non-monic pairs guessed, never expanded back (Q1, Q2, Q4)
- PS5 · Algebra · gap: non-monic pairs guessed, never expanded back (Q4, Q8)
- PS6 · Algebra · developing: non-monic factors not checked by expanding (Q2)
- PS6 · Algebra · developing: a pair that multiplies to 8 but adds to 9 (Q7)
- PS3 · New skills · solid: a perfect square factorised as a difference of squares, not checked (Q6)

### Amelia Chen (`amelia`)

Low in confidence. Something added or cleared is not taken back (the square's constant, the third), and her sentence does not follow from her own working, which slides from solid to a gap as the worded problems get harder.

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

Low on fractions: turns fractions over and copies the sign printed in a bracket. A gap in algebra from Set 3 on; slow, so the worded problem is usually out of reach.

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
- PS3 · Algebra · gap: signs in the second bracket copied, not multiplied (Q1)
- PS3 · Algebra · gap: a negative common factor's sign lost (Q7)
- PS4 · Algebra · gap: solved 2x + 1 = 0 as x = −2 (Q3)
- PS4 · Algebra · gap: fractions lost in half of b (Q7)
- PS5 · Algebra · gap: solved 3x + 2 = 0 as −3/2 (Q4)
- PS6 · Algebra · gap: divided by a, not 2a (Q4)
- PS6 · Algebra · gap: scaled two of three terms (Q7)
- PS4 · Functions · solid: a root's sign copied from its bracket (Q5)
- PS4 · Graphing · solid: the minimum's x read with the sign flipped (Q9)
- PS5 · Graphing · solid: h read as +3 from (x + 3) (Q2)
- PS5 · Graphing · solid: axis of symmetry without the minus (Q5)
- PS3 · Reasoning · solid: both squares expanded, the subtraction's signs not shown (Q10)
- PS1 · New skills · solid: a sign lost collecting 2√18 − √8 (Q4)
- PS2 · New skills · developing: multiplied by the same bracket, not its conjugate (Q7)
- PS3 · New skills · developing: the middle term's sign copied from the bracket (Q2)
- PS4 · New skills · gap: factors set to zero with their signs flipped (Q3)
- PS4 · New skills · gap: half of b taken with the wrong sign (Q6)
- PS5 · New skills · gap: intercepts read off the factors with the signs flipped (Q1)
- PS6 · New skills · developing: null factor law on a product that isn't 0 (Q3)

### Zara Haddad (`zara`)

Confident and mostly right. Reads the axis where the height is asked (from Set 4's minimum value on), and adds to complete the square without taking it away.

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

Hands in little: two or three problems when he hands in at all, missing on Sets 3 and 5. Guesses brackets and pairs rather than checking.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 2/10 | 3/10 | missing | 2/10 | missing | 2/10 |
| Algebra | not seen | developing | not seen | gap | not seen | gap |
| Functions | — | — | — | not seen | not seen | not seen |
| Graphing | — | — | — | not seen | not seen | not seen |
| Communication | secure | secure | not seen | secure | not seen | secure |
| Reasoning | not seen | not seen | not seen | not seen | not seen | not seen |
| New skills | developing | gap | not seen | not seen | not seen | gap |

- PS2 · Algebra · developing: only two of the four terms expanded (Q2)
- PS4 · Algebra · gap: non-monic pairs guessed, never expanded back (Q1, Q2)
- PS6 · Algebra · gap: guessed a factor pair without expanding back (Q1, Q2)
- PS1 · New skills · developing: √50 written as 25√2 (Q2)
- PS2 · New skills · gap: (√7 + 2)² squared term by term (Q3)
- PS6 · New skills · gap: null factor law on a product that isn't 0 (Q3)

### Aiden Park (`aiden`)

Confident and right almost everywhere; scales part of an expression and leaves the rest, the same slip on every set.

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

Low on factorising: with a number in front of x² she tries brackets until one looks close. Secure on surds, a gap from the non-monic set on.

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
- PS3 · Algebra · developing: tried brackets until one looked close (Q9)
- PS4 · Algebra · gap: non-monic pairs guessed, never expanded back (Q1, Q4)
- PS5 · Algebra · gap: non-monic pairs guessed, never expanded back (Q4, Q8)
- PS6 · Algebra · gap: guessed a factor pair, never expanded back (Q2)
- PS6 · Algebra · gap: took −x out and left the sign behind (Q9)
- PS4 · Functions · solid: solved 2x − 1 = 0 as x = −1/2 (Q4)
- PS3 · New skills · solid: x² − 49 written as (x − 7)² (Q4)
- PS4 · New skills · solid: half of b squared without its sign (Q6)

### Noah Fitzgerald (`noah`)

Confident and secure outside New skills, where he squares a bracket term by term on every set that asks for one.

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

Confident; guesses a pair and does negatives in her head. Hands in every set she sits; away for Set 6, where she is the class's absent student.

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
- PS3 · Algebra · solid: a factor pair guessed without checking (Q8)
- PS4 · Algebra · developing: a non-monic pair guessed, never expanded back (Q2)
- PS4 · Algebra · developing: halves lost completing the square (Q7)
- PS5 · Algebra · developing: non-monic pair guessed, never expanded back (Q4)
- PS5 · Algebra · developing: sum of the intercepts never halved (Q8)
- PS4 · Functions · solid: a root's sign lost rearranging (Q5)
- PS5 · Functions · solid: (−3)² taken as −9 (Q5)
- PS1 · New skills · solid: √48 simplified to 2√12 and left there (Q1)
- PS1 · New skills · solid: √60 taken as 4√15, the 4 not rooted (Q5)
- PS2 · New skills · solid: the conjugate multiplied on the bottom only (Q8)

### Ethan Kowalski (`ethan`)

Rushes the end and jumps steps: the axis given as the height, working written in one line. Low on Set 5, confident on Set 6.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 8/10 |
| Algebra | secure | solid | solid | developing | solid | developing |
| Functions | — | — | — | solid | solid | secure |
| Graphing | — | — | — | developing | solid | solid |
| Communication | solid | solid | solid | developing | solid | solid |
| Reasoning | secure | secure | secure | secure | secure | secure |
| New skills | secure | secure | solid | solid | secure | secure |

- PS2 · Algebra · solid: a term dropped expanding in a rush (Q8)
- PS3 · Algebra · solid: a factor pair written without checking the middle (Q8)
- PS4 · Algebra · developing: a non-monic pair guessed, never expanded back (Q2)
- PS4 · Algebra · developing: factorised before making the equation equal zero (Q5)
- PS5 · Algebra · solid: non-monic pair guessed, never expanded back (Q8)
- PS6 · Algebra · developing: divided by a, not 2a (Q4)
- PS6 · Algebra · developing: multiplied through by 3 and never took it back out (Q7)
- PS4 · Functions · solid: a root's sign lost in the rush (Q4)
- PS5 · Functions · solid: (−3)² taken as −9, the axis not shown (Q5)
- PS4 · Graphing · developing: the minimum value given as the x, jumped straight to it (Q9)
- PS5 · Graphing · solid: axis given as the height, jumped straight to it (Q10)
- PS6 · Graphing · solid: axis given as the height, a step skipped (Q9)
- PS1 · Communication · solid: steps jumped on the exact answer (Q9)
- PS2 · Communication · solid: the rationalising done in one line (Q8)
- PS3 · Communication · solid: the square completed in one line (Q6)
- PS4 · Communication · developing: steps jumped completing the square and in the worded problem (Q8, Q10)
- PS5 · Communication · solid: the landing written straight down, the working not shown (Q10)
- PS6 · Communication · solid: the height given in one jump (Q9)
- PS3 · New skills · solid: a perfect square's middle term rushed (Q6)
- PS4 · New skills · solid: half of −5 rushed as −5/4 (Q7)

### Isla Moretti (`isla`)

Copies a sign instead of working it out, and does not read her answer back: the sentence says something her working does not, a gap from the non-monic set on.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Algebra | secure | solid | developing | developing | developing | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | solid | solid | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | solid | developing | gap | gap | gap |
| New skills | solid | secure | secure | secure | secure | secure |

- PS2 · Algebra · solid: the product's sign copied from the bracket (Q2)
- PS3 · Algebra · developing: signs in the second bracket copied, not multiplied (Q1)
- PS3 · Algebra · developing: the common factor's sign left behind (Q7)
- PS4 · Algebra · developing: x² − 3x = 10 rearranged with the 10's sign copied (Q5)
- PS5 · Algebra · developing: took −1 out and left the signs inside behind (Q9)
- PS6 · Algebra · developing: −b written as −5 (Q4)
- PS6 · Algebra · developing: scaled two of three terms (Q7)
- PS4 · Graphing · solid: the turning point's sign copied from the bracket (Q8)
- PS5 · Graphing · solid: axis of symmetry without the minus (Q5)
- PS2 · Reasoning · solid: the sentence gives the area where the diagonal was asked (Q10)
- PS3 · Reasoning · developing: the working shown, the last line doesn't say what it shows (Q10)
- PS4 · Reasoning · gap: the negative width given in the sentence (Q10)
- PS5 · Reasoning · gap: the landing given as the nozzle's zero (Q10)
- PS6 · Reasoning · gap: said the graph crosses twice (Q10)
- PS1 · New skills · solid: a sign copied subtracting like surds (Q4)

### Lucas Tanaka (`lucas`)

Unsure which number means what: the turning point's sign, which way a sign moves the graph, what his result says in context. Graphing lifts to secure by Set 6; reasoning slides to a gap.

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

Right every time, in one jump a line; starts late, so never reaches the last problems. Communication is developing on every set.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 8/10 | 7/10 | 9/10 | 6/10 | 7/10 | 4/10 |
| Algebra | secure | secure | secure | secure | secure | secure |
| Functions | — | — | — | secure | secure | not seen |
| Graphing | — | — | — | not seen | secure | not seen |
| Communication | solid | developing | developing | developing | developing | developing |
| Reasoning | not seen | not seen | not seen | not seen | not seen | not seen |
| New skills | secure | secure | secure | secure | secure | secure |

- PS1 · Communication · solid: simplified in one jump, the square factor not shown (Q1, Q2)
- PS2 · Communication · developing: rationalised in one line (Q5, Q6, Q7)
- PS3 · Communication · developing: factorised in one line, the pair not shown (Q5, Q8)
- PS4 · Communication · developing: solved in one jump (Q3, Q4)
- PS5 · Communication · developing: right every time, but jumps steps a reader can't follow (Q1, Q2)
- PS6 · Communication · developing: right every time, but jumps steps a reader can't follow (Q1, Q2)

### Harper Singh (`harper`)

Signs and squares done too fast: a sign lost in an expansion, a height read from the wrong line. Algebra and graphing drift down to gaps by Set 6.

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
- PS5 · Graphing · developing: axis given as the height, jumped straight to it (Q10)
- PS6 · Graphing · gap: turning point's height from the wrong line (Q5)
- PS6 · Graphing · gap: axis given as the height, jumped straight to it (Q9)
- PS3 · Communication · solid: the perfect square written in one line (Q6)
- PS4 · Communication · solid: the square completed in one line (Q8)
- PS5 · Communication · solid: the landing written straight down (Q10)
- PS6 · Communication · solid: the height given in one jump (Q9)
- PS2 · New skills · solid: (√7 + 2)² with the middle term's 2 lost (Q3)
- PS3 · New skills · solid: (2x − 3)²'s middle term sign lost (Q2)

### Oliver Brennan (`oliver`)

Low on factorising: guesses pairs and hopes, squares a bracket without writing it out, and uses the null factor law on a product that isn't zero from Set 4 on. Algebra is a gap on the factorising sets and lifts on Set 6.

| Category | PS1 | PS2 | PS3 | PS4 | PS5 | PS6 |
| --- | --- | --- | --- | --- | --- | --- |
| handed in | 10/10 | 10/10 | 9/10 | 8/10 | 9/10 | 7/10 |
| Algebra | secure | solid | developing | gap | gap | developing |
| Functions | — | — | — | secure | secure | secure |
| Graphing | — | — | — | secure | secure | secure |
| Communication | secure | secure | secure | secure | secure | secure |
| Reasoning | secure | secure | not seen | not seen | not seen | not seen |
| New skills | solid | solid | developing | developing | developing | developing |

- PS2 · Algebra · solid: brackets expanded by guessing the middle term (Q2)
- PS3 · Algebra · developing: factor pairs guessed without expanding back (Q5, Q8)
- PS4 · Algebra · gap: non-monic pairs guessed, never expanded back (Q1, Q2)
- PS5 · Algebra · gap: non-monic pairs guessed, never expanded back (Q4, Q8)
- PS6 · Algebra · developing: guesses factor pairs without expanding back (Q1, Q2)
- PS6 · Algebra · developing: scaled two of three terms (Q7)
- PS1 · New skills · solid: √8 simplified as 4√2 (Q4)
- PS1 · New skills · solid: √(72 + 72) split into √72 + √72 (Q10)
- PS2 · New skills · solid: (3 − √2)(3 + √2) taken as 9 + 2 (Q4)
- PS3 · New skills · developing: (2x − 3)² squared term by term (Q2)
- PS4 · New skills · developing: null factor law on x(x − 3) = 10, a product that isn't 0 (Q5)
- PS5 · New skills · developing: (x − 3)² squared term by term (Q7)
- PS6 · New skills · developing: null factor law on a product that isn't 0 (Q3)

### Ruby Castellanos (`ruby`)

Confident. Takes a pair that multiplies without checking it adds, and reads the height off the wrong part of the turning point; algebra dips to a gap on Set 5 and recovers.

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
- PS4 · Algebra · developing: a pair that multiplies but doesn't add, never expanded back (Q4, Q5)
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

Low on fractions on Set 5, confident on Set 6: fractions and halves go astray, and she guesses a non-monic pair. Algebra developing on the surd sets, a gap from Set 4 on.

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
- PS3 · Algebra · developing: a non-monic pair guessed (Q9)
- PS4 · Algebra · gap: halves lost completing the square (Q7)
- PS4 · Algebra · gap: a non-monic pair guessed (Q2)
- PS5 · Algebra · gap: non-monic pairs guessed, never expanded back (Q4, Q8)
- PS6 · Algebra · gap: denominator a, not 2a (Q4)
- PS6 · Algebra · gap: scaled two of three terms (Q7)
- PS2 · New skills · solid: the conjugate's fraction left unsimplified (Q7)
- PS4 · New skills · solid: (5/2)² taken as 5/4 completing the square (Q7)

