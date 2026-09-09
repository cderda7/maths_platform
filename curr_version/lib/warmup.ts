import type { PracticeProblem, Problem } from "@/data/types";
import { ASSIGNMENT } from "@/data/assignment";
import { PRACTICE, WARMUP_BANK } from "@/data/practice";
import { leafName, type LeafId } from "@/data/taxonomy";
import { problemLeaves } from "./hierarchy";

/**
 * The warm-up chooser's brain, simulated: what a student's message means, which skills the
 * selection and the message add up to, and which one problem from the bank covers most of them.
 * Pure, so every rule is unit-tested and the screen only renders.
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

const COMMUNICATION = "communication.";

/** Leaves the warm-up is about: the selected problems' leaves, then anything the messages named, in first-mention order. */
export function focusLeaves(selected: string[], messages: WarmupMessage[], problems: Problem[] = ASSIGNMENT.problems): LeafId[] {
  const out: LeafId[] = [];
  const add = (l: LeafId) => {
    if (!l.startsWith(COMMUNICATION) && !out.includes(l)) out.push(l);
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

/** Leaves a practice problem exercises: its headline leaf and every leaf tagged on a step. */
export function practiceCovers(p: PracticeProblem): LeafId[] {
  const out: LeafId[] = [p.leaf];
  for (const st of p.steps) for (const t of st.tags) if (!out.includes(t.leaf)) out.push(t.leaf);
  return out;
}

/**
 * The one problem to serve: the bank entry covering the most focus leaves; ties go to the entry
 * with fewer leaves outside the focus, then to the one whose steps are mostly on-focus, then to
 * bank order (composites first). Nothing in focus, or nothing covering it → the default warm-up.
 */
export function chooseWarmup(focus: LeafId[], bank: PracticeProblem[] = WARMUP_BANK): PracticeProblem {
  if (focus.length === 0) return PRACTICE;
  let best: PracticeProblem | null = null;
  let bestScore: [number, number, number] = [-1, -Infinity, -1];
  for (const p of bank) {
    const covers = practiceCovers(p);
    const hit = covers.filter((l) => focus.includes(l)).length;
    const onFocusSteps = p.steps.filter((st) => st.tags.some((t) => focus.includes(t.leaf))).length / p.steps.length;
    const score: [number, number, number] = [hit, hit - covers.length, onFocusSteps];
    if (score[0] > bestScore[0] || (score[0] === bestScore[0] && (score[1] > bestScore[1] || (score[1] === bestScore[1] && score[2] > bestScore[2])))) {
      best = p;
      bestScore = score;
    }
  }
  return bestScore[0] > 0 && best ? best : PRACTICE;
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
  const chosen = chooseWarmup(focus);
  const covered = practiceCovers(chosen).filter((l) => focus.includes(l));
  const missed = focus.filter((l) => !covered.includes(l));
  const head = `Got it. Warming up on ${list(names(focus))}.`;
  const tail = missed.length === 0 ? " One problem covers all of that." : ` One problem covers ${list(names(covered))}; ${list(names(missed))} can come in the set.`;
  return head + tail;
}

/** What the pad reads for a warm-up problem, one line per burst: its own model steps. */
export const warmupScript = (p: PracticeProblem): string[] => p.steps.map((st) => st.tex);
