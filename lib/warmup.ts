import type { ChatMessage, PracticeProblem, Problem } from "@/data/types";
import { ASSIGNMENT } from "@/data/assignment";
import { isolatable, PRACTICE, PRACTICES } from "@/data/practice";
import { groupOf, studentLeafName, type LeafId } from "@/data/taxonomy";
import { problemLeaves } from "./hierarchy";

/**
 * The warm-up's brain, simulated: the concerns chat that follows the confidence answer (one
 * question per skill the student ticked), what a student's answer means, which skills the answer
 * and the answers add up to, and the order those skills are warmed up in, one short problem each,
 * easiest first. Pure, so every rule is unit-tested and the screens only render.
 */

export type WarmupMessage = ChatMessage;

/** A skill as the chat says it: the student-facing name, lowercase, as the confidence list shows it. */
const skillWord = (l: LeafId) => studentLeafName(l).name.toLowerCase();
/** "a", "a & b", "a, b, & c". */
const amp = (xs: string[]) => (xs.length <= 1 ? xs.join("") : xs.length === 2 ? `${xs[0]} & ${xs[1]}` : `${xs.slice(0, -1).join(", ")}, & ${xs[xs.length - 1]}`);

/**
 * The concerns chat's questions, one per seed skill in the order the student ticked them. The
 * first names every skill; each answer is followed by the next skill's question. No seed (the
 * student answered "confident" or "not confident" overall) asks one open question.
 */
export function concernPrompts(seed: LeafId[]): string[] {
  const w = seed.map(skillWord);
  if (w.length === 0) return ["Let's do a warm up. Tell me a little bit about what you'd like to warm up on."];
  if (w.length === 1) return [`Let's do a warm up on ${w[0]}. Tell me a little bit about your concerns with ${w[0]}.`];
  return [`Let's do a warm up on ${amp(w)}. First, tell me a little bit about your concerns with ${w[0]}.`, ...w.slice(1).map((x) => `Next, tell me about your concerns with ${x}.`)];
}

/** The chat so far: each question, then the student's answer to it, up to the first question still unanswered. Only the student's lines are stored; the questions are derived. */
export function concernTranscript(seed: LeafId[], messages: WarmupMessage[]): WarmupMessage[] {
  const answers = messages.filter((m) => m.from === "student");
  const out: WarmupMessage[] = [];
  concernPrompts(seed).some((text, i) => {
    out.push({ from: "tutor", text });
    if (!answers[i]) return true;
    out.push(answers[i]);
    return false;
  });
  return out;
}

/** True once every question has its answer: the warm-up starts. */
export const concernsAnswered = (seed: LeafId[], messages: WarmupMessage[]): boolean => messages.filter((m) => m.from === "student").length >= concernPrompts(seed).length;

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

/** Leaves the warm-up is about: the skills the student ticked, then anything the answers named (a skill word, or a question's skills), in first-mention order. Only moves (`isolatable`). */
export function focusLeaves(seed: LeafId[], messages: WarmupMessage[], problems: Problem[] = ASSIGNMENT.problems): LeafId[] {
  const out: LeafId[] = [];
  const add = (l: LeafId) => {
    if (isolatable(l) && !out.includes(l)) out.push(l);
  };
  const byId = (id: string) => problems.find((p) => p.id === id);
  for (const l of seed) add(l);
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

/** The practice for a leaf: its own, else a sibling's in the same group, else none. Never for a whole-task leaf. */
export function practiceFor(leaf: LeafId): PracticeProblem | null {
  if (!isolatable(leaf)) return null;
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

/** What the pad reads for a warm-up problem, one line per burst: its own model steps. */
export const warmupScript = (p: PracticeProblem): string[] => p.steps.map((st) => st.tex);
