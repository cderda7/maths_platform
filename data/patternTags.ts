import type { StoryCategory } from "./story";

/**
 * One pattern's tag on Holistic Assessment's tiles (ticket 252): the short label a pattern reads as, and the
 * pattern's wordings in the class story sheet (`data/story.ts`), one per set it shows on. The sheet words a
 * pattern for the set it shows on ("right split, the signs put into the wrong brackets" on Set 4, "right split,
 * signs in the wrong brackets" on Set 5), so the tile could not tell those are one pattern without this table;
 * it is authored, never matched by similarity. A pattern worded alike on every set needs no entry: its words
 * are its tag. Every text here is a pattern of that student in that category (`data/patternTags.test.ts`).
 */
export interface PatternTag {
  label: string;
  /** The sheet's wordings of the pattern, exactly, in that student's category. */
  texts: readonly string[];
}

const tag = (label: string, ...texts: string[]): PatternTag => ({ label, texts });

/** Per student, per category: the patterns the sheet words differently from set to set. Students in the class order. */
export const PATTERN_TAGS: Readonly<Record<string, Partial<Record<StoryCategory, readonly PatternTag[]>>>> = {
  sam: {
    algebra: [tag("signs in the wrong brackets", "right split, the signs put into the wrong brackets", "right split, signs in the wrong brackets")],
  },
  jordan: {
    algebra: [
      tag(
        "factor pairs not checked by expanding back",
        "a factor pair that multiplies to the constant, not checked by expanding",
        "non-monic pairs guessed, never expanded back",
        "non-monic factors not checked by expanding",
        "a pair that multiplies to 8 but adds to 9",
      ),
    ],
  },
  amelia: {
    algebra: [tag("a factor cleared and never put back", "a common factor taken out and not put back in the answer", "multiplied through by 3 and never took it back out")],
    reasoning: [
      tag(
        "the sentence doesn't follow from the working",
        "the area found, the sentence about the diagonal left out",
        "the last line doesn't say what was shown",
        "the negative width kept in the answer sentence",
        "the landing given as the nozzle's zero",
        "said the graph crosses twice",
      ),
    ],
    new: [tag("added to complete the square, never taken away", "added 9 to complete the square, never took it away", "added 16 to complete the square, never took it away")],
  },
  tomas: {
    algebra: [tag("fractions turned over", "the fraction turned over dividing surds", "the fraction turned over rationalising", "solved 2x + 1 = 0 as x = −2", "solved 3x + 2 = 0 as −3/2")],
    graphing: [tag("the turning point's sign copied from the bracket", "the minimum's x read with the sign flipped", "h read as +3 from (x + 3)", "axis of symmetry without the minus")],
    new: [
      tag(
        "the sign copied from the bracket",
        "multiplied by the same bracket, not its conjugate",
        "the middle term's sign copied from the bracket",
        "factors set to zero with their signs flipped",
        "intercepts read off the factors with the signs flipped",
      ),
    ],
  },
  zara: {
    graphing: [tag("the axis given where the height is asked", "the minimum value given as the x of the turning point", "axis given as the height")],
    new: [tag("added to complete the square, never taken away", "added the square to complete it, never took it away", "added 16 to complete the square, never took it away")],
  },
  liam: {
    algebra: [tag("factor pairs guessed, never expanded back", "non-monic pairs guessed, never expanded back", "guessed a factor pair without expanding back")],
    new: [tag("a bracket squared term by term", "(√7 + 2)² squared term by term", "(2x − 3)² squared term by term")],
  },
  aiden: {
    algebra: [
      tag(
        "scales one part, leaves the rest",
        "√2 multiplied into the first term only",
        "√3 multiplied into the first term only",
        "the common factor divided out of the first two terms only",
        "the 2 taken out of 2x² only",
        "the 2 multiplied x² and nothing else",
        "scaled two of three terms",
      ),
    ],
  },
  mia: {
    algebra: [tag("factor pairs guessed, never expanded back", "tried brackets until one looked close", "non-monic pairs guessed, never expanded back", "guessed a factor pair, never expanded back")],
  },
  noah: {
    new: [tag("a bracket squared term by term", "(√7 + 2)² squared term by term", "(2x − 3)² squared term by term", "(x − 3)² squared term by term")],
  },
  chloe: {
    algebra: [
      tag("factor pairs guessed without checking", "a factor pair guessed without checking", "a non-monic pair guessed, never expanded back", "non-monic pair guessed, never expanded back"),
      tag("halves lost", "halves lost completing the square", "sum of the intercepts never halved"),
    ],
    functions: [tag("a negative's sign lost", "a root's sign lost rearranging", "(−3)² taken as −9")],
  },
  ethan: {
    algebra: [tag("factor pairs written without checking", "a factor pair written without checking the middle", "a non-monic pair guessed, never expanded back", "non-monic pair guessed, never expanded back")],
    functions: [tag("a sign lost in the rush", "a root's sign lost in the rush", "(−3)² taken as −9, the axis not shown")],
    graphing: [tag("the axis given where the height is asked", "the minimum value given as the x, jumped straight to it", "axis given as the height, jumped straight to it", "axis given as the height, a step skipped")],
    communication: [
      tag(
        "steps jumped, the working in one line",
        "steps jumped on the exact answer",
        "the rationalising done in one line",
        "the square completed in one line",
        "steps jumped completing the square and in the worded problem",
        "the landing written straight down, the working not shown",
        "the height given in one jump",
      ),
    ],
  },
  isla: {
    algebra: [
      tag(
        "a sign copied, not worked out",
        "the product's sign copied from the bracket",
        "signs in the second bracket copied, not multiplied",
        "the common factor's sign left behind",
        "x² − 3x = 10 rearranged with the 10's sign copied",
        "took −1 out and left the signs inside behind",
        "−b written as −5",
      ),
    ],
    graphing: [tag("the turning point's sign copied from the bracket", "the turning point's sign copied from the bracket", "axis of symmetry without the minus")],
    reasoning: [
      tag(
        "the sentence says what the working doesn't",
        "the sentence gives the area where the diagonal was asked",
        "the working shown, the last line doesn't say what it shows",
        "the negative width given in the sentence",
        "the landing given as the nozzle's zero",
        "said the graph crosses twice",
      ),
    ],
  },
  lucas: {
    algebra: [
      tag("a pair that multiplies but doesn't add", "a pair that multiplies to 24 but adds to 10", "a pair that multiplies to 8 but adds to 9"),
      tag("a sign lost", "a sign lost expanding (2 + √5)(3 − √5)", "x² − 3x = 10 rearranged with a sign lost", "took −1 out and left the signs inside behind"),
    ],
    graphing: [tag("the turning point read with the sign flipped", "the turning point read with the sign flipped", "turning point read with the sign flipped")],
    reasoning: [
      tag(
        "unsure what the result means in context",
        "the diagonal stated without saying which length it is",
        "width and length swapped in the sentence",
        "the landing given as the nozzle's zero",
        "negative discriminant, two solutions",
      ),
    ],
  },
  grace: {
    communication: [
      tag(
        "right, but jumps steps a reader can't follow",
        "simplified in one jump, the square factor not shown",
        "rationalised in one line",
        "factorised in one line, the pair not shown",
        "solved in one jump",
        "right every time, but jumps steps a reader can't follow",
      ),
    ],
  },
  harper: {
    algebra: [tag("a sign lost expanding or rearranging", "the minus not multiplied through the bracket", "a sign lost in the expansion", "the common factor's sign lost", "a sign lost rearranging x² − 3x = 10")],
    graphing: [tag("the height read from the wrong line", "the minimum value read off the wrong line", "axis given as the height, jumped straight to it", "turning point's height from the wrong line")],
    communication: [tag("steps written in one line", "the perfect square written in one line", "the square completed in one line", "the landing written straight down", "the height given in one jump")],
    new: [tag("a perfect square's middle term slipped", "(√7 + 2)² with the middle term's 2 lost", "(2x − 3)²'s middle term sign lost")],
  },
  oliver: {
    algebra: [tag("factor pairs guessed, never expanded back", "factor pairs guessed without expanding back", "non-monic pairs guessed, never expanded back", "guesses factor pairs without expanding back")],
    new: [
      tag("a bracket squared term by term", "(2x − 3)² squared term by term", "(x − 3)² squared term by term"),
      tag("null factor law on a product that isn't 0", "null factor law on x(x − 3) = 10, a product that isn't 0", "null factor law on a product that isn't 0"),
    ],
  },
  ruby: {
    algebra: [
      tag(
        "a pair that multiplies but doesn't add",
        "a pair that multiplies to −15 but doesn't add to 2",
        "a pair that multiplies but doesn't add, never expanded back",
        "a pair that multiplies to −8 but doesn't add to −2",
        "a pair that multiplies to 8 but adds to 9",
      ),
    ],
    graphing: [tag("the turning point's height misread", "the minimum value given as the x of the turning point", "axis given as the height", "turning point's height from the wrong line")],
  },
  finn: {
    algebra: [
      tag("a fraction turned over solving", "divided the wrong way round solving for x", "the fraction turned over rationalising", "solved 2x + 1 = 0 as x = −2", "solved 3x + 2 = 0 as −3/2"),
      tag("a sign flipped", "a factor's sign flipped writing the pair", "sign lost solving 2x − 1 = 0"),
    ],
  },
  sofia: {
    algebra: [
      tag("a non-monic pair guessed", "a non-monic pair guessed", "non-monic pairs guessed, never expanded back"),
      tag("fractions and halves astray", "the fraction left upside down dividing surds", "rationalised the top instead of the bottom", "halves lost completing the square", "denominator a, not 2a"),
    ],
    new: [tag("fractions astray", "the conjugate's fraction left unsimplified", "(5/2)² taken as 5/4 completing the square")],
  },
};

/** The tag a pattern reads as: its entry's label, or its own words. */
export function patternTagLabel(student: string, category: StoryCategory, text: string): string {
  return PATTERN_TAGS[student]?.[category]?.find((t) => t.texts.includes(text))?.label ?? text;
}
