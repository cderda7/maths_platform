import type { PracticeProblem, Problem } from "@/data/types";
import { ASSIGNMENT } from "@/data/assignment";
import { PRACTICE, PRACTICES } from "@/data/practice";
import { groupOf, leafName, type LeafId } from "@/data/taxonomy";
import { problemLeaves } from "./hierarchy";

/**
 * The warm-up chooser's brain, simulated: what a student's message means, which skills the
 * selection and the message add up to, and the order those skills are warmed up in, one short
 * problem each, easiest first. Pure, so every rule is unit-tested and the screen only renders.
 */

export interface WarmupMessage {
  from: "student" | "tutor";
  text: string;
}

/** A skill word or phrase a student might use, mapped to the leaves it means. First match wins per leaf. */
const SKILL_WORDS: [RegExp, LeafId[]][] = [
  [/non-?\s?monic/i, ["algebra.expand-factor.nonmonic"]],
  [/(?<!non-?\s?)\bmonic\b/i, ["algebra.expand-factor.monic"]],
  /** Plain "factorising" means both kinds, unless the message already said which. */
  [/^(?![\s\S]*monic)[\s\S]*factor/i, ["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic"]],
  [/expan(d|sion)|brackets? out|multiply(ing)? out/i, ["algebra.expand-factor.expand"]],
  [/fraction|decimal|percent|denominator/i, ["algebra.number.fractions"]],
  [/null factor|zero product/i, ["unit.u1.nfl"]],
  [/discriminant|\bdelta\b|how many (real )?roots/i, ["unit.u1.discriminant"]],
  [/binomial|perfect square|difference of (two )?squares/i, ["unit.u1.binomial"]],
  [/quadratic formula|the formula|quadratic equation|solv(e|ing) quadratics/i, ["algebra.equations.quadratic"]],
  [/linear|rearrang|standard form|one side/i, ["algebra.equations.linear"]],
  [/turning point|axis of symmetry|vertex|features|intercepts?/i, ["graphing.quadratics.features"]],
  [/sketch|parabola|draw(ing)? the graph|graph/i, ["graphing.quadratics.sketch", "graphing.quadratics.features"]],
  [/zero-?finding|zeros|roots of a function|where .* (meets|crosses)/i, ["functions.zeros.zero-finding"]],
  [/evaluat|substitut|f\(x\)/i, ["functions.notation.evaluate"]],
  [/word(ed|y)? problem|in words|story|real[- ]life|context/i, ["reasoning.interpret.worded"]],
  [/show that|prove|proof|justif|explain why/i, ["reasoning.justify.formal"]],
  [/conclusion|what it means|interpret/i, ["reasoning.justify.conclusions"]],
];

/** What one message points at: the leaves its words name and the problems it references ("Q2", "q 4"). */
export function interpret(text: string, problems: Problem[] = ASSIGNMENT.problems): { leaves: LeafId[]; problems: string[] } {
  const leaves: LeafId[] = [];
  for (const [re, ids] of SKILL_WORDS) if (re.test(text)) for (const l of ids) if (!leaves.includes(l)) leaves.push(l);
  const refs: string[] = [];
  for (const m of text.matchAll(/\bq\s?(\d{1,2})\b/gi)) {
    const p = problems.find((q) => q.label.toLowerCase() === `q${m[1]}`);
    if (p && !refs.includes(p.id)) refs.push(p.id);
  }
  return { leaves, problems: refs };
}

/**
 * Leaves the warm-up never isolates: communication (it is about how work is shown, not a skill to
 * drill) and "quadratic equations" (it is the whole of this set; a warm-up on it is the set).
 */
export const NOT_WARMED: readonly LeafId[] = ["algebra.equations.quadratic"];
const COMMUNICATION = "communication.";

/** Leaves the warm-up is about: the selected problems' leaves, then anything the messages named, in first-mention order. */
export function focusLeaves(selected: string[], messages: WarmupMessage[], problems: Problem[] = ASSIGNMENT.problems): LeafId[] {
  const out: LeafId[] = [];
  const add = (l: LeafId) => {
    if (!l.startsWith(COMMUNICATION) && !NOT_WARMED.includes(l) && !out.includes(l)) out.push(l);
  };
  const byId = (id: string) => problems.find((p) => p.id === id);
  for (const id of selected) for (const l of problemLeaves(byId(id) ?? { solution: [] } as unknown as Problem)) add(l);
  for (const m of messages) {
    if (m.from !== "student") continue;
    const { leaves, problems: refs } = interpret(m.text, problems);
    for (const l of leaves) add(l);
    for (const id of refs) for (const l of problemLeaves(byId(id) ?? { solution: [] } as unknown as Problem)) add(l);
  }
  return out;
}

/**
 * Perceived ease, easiest first: the order the warm-up walks a student's focus. A leaf not listed
 * comes after every listed one, in focus order.
 */
export const EASE: LeafId[] = [
  "algebra.number.fractions",
  "algebra.equations.linear",
  "algebra.expand-factor.expand",
  "functions.notation.evaluate",
  "algebra.equations.quadratic",
  "algebra.expand-factor.monic",
  "unit.u1.nfl",
  "algebra.expand-factor.nonmonic",
  "unit.u1.binomial",
  "unit.u1.discriminant",
  "functions.zeros.zero-finding",
  "graphing.quadratics.features",
  "graphing.quadratics.sketch",
  "reasoning.interpret.worded",
  "reasoning.justify.formal",
  "reasoning.justify.conclusions",
];
const rank = (l: LeafId) => {
  const i = EASE.indexOf(l);
  return i < 0 ? EASE.length : i;
};

/** The focus sorted easiest first (a stable sort, so unlisted leaves keep their focus order). */
export const byEase = (focus: LeafId[]): LeafId[] => [...focus].sort((a, b) => rank(a) - rank(b));

/** The practice for a leaf: its own, else a sibling's in the same group, else none. */
function practiceFor(leaf: LeafId): PracticeProblem | null {
  if (PRACTICES[leaf]) return PRACTICES[leaf]!;
  const g = groupOf(leaf);
  const alt = (Object.keys(PRACTICES) as LeafId[]).find((l) => groupOf(l) === g);
  return alt ? PRACTICES[alt]! : null;
}

/**
 * The warm-up as a sequence: one problem per focus leaf, easiest first, no problem twice. Nothing
 * in focus, or nothing with a practice → the default warm-up alone.
 */
export function warmupSequence(focus: LeafId[]): PracticeProblem[] {
  const out: PracticeProblem[] = [];
  for (const l of byEase(focus)) {
    const p = practiceFor(l);
    if (p && !out.some((q) => q.id === p.id)) out.push(p);
  }
  return out.length > 0 ? out : [PRACTICE];
}

const names = (ls: LeafId[]) => ls.map((l) => leafName(l).short);
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** The tutor's reply to a student message, given the whole focus after it. */
export function tutorReply(message: string, focus: LeafId[], problems: Problem[] = ASSIGNMENT.problems): string {
  const { leaves, problems: refs } = interpret(message, problems);
  if (leaves.length === 0 && refs.length === 0) {
    return focus.length === 0
      ? "I couldn't match that to a skill in this set. Try naming one, like \"fractions\", or a question, like \"Q2\"."
      : `I couldn't add anything from that. Still warming up on ${list(names(focus))}.`;
  }
  return "Got it. Let's get started.";
}

/** What the pad reads for a warm-up problem, one line per burst: its own model steps. */
export const warmupScript = (p: PracticeProblem): string[] => p.steps.map((st) => st.tex);
