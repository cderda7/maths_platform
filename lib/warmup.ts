import type { ChatMessage, Confidence, PracticeProblem, Problem } from "@/data/types";
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

/** A skill's name as the chat marks it: `**word**`, which the chat bubble renders in a light blue box (`skillRuns`). */
const named = (word: string) => `**${word}**`;
/**
 * The follow-up ask for a later skill. A named rule ("null factor law", "chain rule", "the
 * discriminant") is asked as a thing, "How about the null factor law?"; a topic or an activity
 * ("fractions", "factorising") as a place to go, "How about with fractions?".
 */
export const howAbout = (word: string): string => (/^the\b|\b(laws?|rule|identity|formula|distribution)$/.test(word) ? `How about the ${named(word.replace(/^the /, ""))}?` : `How about with ${named(word)}?`);

/**
 * Reflective listening, fixed for the demo: the bubble the tutor opens its next turn with after
 * each of the student's answers, in answer order; the last line repeats for every later answer.
 * The first trails off ("It sounds like…") as the demo's sign that this is the place a live
 * restatement of the student's own words goes (see FUTURE_FEATURES, ticket 102).
 */
export const REFLECTIONS = ["Gotcha. It sounds like…", "Agreed: that's a tricky skill.", "A lot of students share that struggle."] as const;
/** The reflection after the student's answer number `i` (0-based). */
export const reflection = (i: number): string => REFLECTIONS[Math.min(Math.max(i, 0), REFLECTIONS.length - 1)];

/**
 * The concerns chat's turns, one per seed skill in the order the student ticked them, each a list
 * of bubbles the tutor sends one at a time. The opening is two bubbles: the setup naming every
 * skill, then the ask. Each later turn is two: the reflection on the answer just given, then the
 * next question. No seed (the student answered "confident" or "not confident" overall) asks one
 * open question. Every bubble that is about one skill carries that skill's name marked (`**…**`,
 * boxed on screen) so the student sees which skill is up; the setup, which names them all, and
 * the reflections do not.
 */
export function concernTurns(seed: LeafId[]): string[][] {
  const w = seed.map(skillWord);
  if (w.length === 0) return [["Let's do a warm up.", "Tell me a little bit about what you'd like to warm up on."]];
  if (w.length === 1) return [[`Let's do a warm up on ${w[0]}.`, `Tell me a little bit about your concerns with ${named(w[0])}.`]];
  return [[`Let's do a warm up on ${amp(w)}.`, `First, tell me a little bit about your concerns with ${named(w[0])}.`], ...w.slice(1).map((x, i) => [reflection(i), howAbout(x)])];
}

/** A tutor line split for rendering: plain runs and `**skill**` runs, in order. The student's lines are never split. */
export const skillRuns = (text: string): { text: string; skill: boolean }[] =>
  text
    .split(/(\*\*[^*]+\*\*)/)
    .filter((s) => s !== "")
    .map((s) => (s.startsWith("**") && s.endsWith("**") ? { text: s.slice(2, -2), skill: true } : { text: s, skill: false }));

/**
 * The chat's closing turn, after the final answer: the reflection on that answer, then thanks for
 * the student's insight (one answer) or insights (more) and the skill the warm-up opens on.
 */
export const closingTurn = (first: LeafId | undefined, answers: number): string[] => [
  reflection(answers - 1),
  `Thank you for ${answers === 1 ? "that insight" : "those insights"}. Let's start${first ? ` with ${skillWord(first)}` : ""}.`,
];

/** The chat's rhythm: a beat after the student's bubble before the dots, the dots' length, and the wait after the closing bubble before the pad. */
export const CHAT_BEAT_MS = 400;
export const CHAT_DOTS_MS = 1000;
export const CHAT_CLOSE_MS = 1200;

/** One moment in a tutor turn's playback: how many of its bubbles are on screen, and whether the typing dots are. */
export interface PlayStep {
  at: number;
  shown: number;
  dots: boolean;
}

/**
 * How a tutor turn of `bubbles` bubbles plays out, from the moment the turn begins (the screen
 * opening, or the student's send). The opening turn's first bubble is already there at 0 and the
 * dots start at once; otherwise a beat, then the dots, then the bubble, for each bubble in turn.
 */
export function turnSteps(bubbles: number, opening: boolean): PlayStep[] {
  const first = opening ? 1 : 0;
  const steps: PlayStep[] = [];
  let t = 0;
  for (let i = first; i < bubbles; i++) {
    if (!opening || i > first) t += CHAT_BEAT_MS;
    steps.push({ at: t, shown: i, dots: true });
    t += CHAT_DOTS_MS;
    steps.push({ at: t, shown: i + 1, dots: false });
  }
  if (steps.length === 0 || steps[0].at > 0) steps.unshift({ at: 0, shown: first, dots: false });
  return steps;
}

/** The chat so far: each turn's bubbles, then the student's answer to it, up to the first turn still unanswered. Only the student's lines are stored; the tutor's are derived. */
export function concernTranscript(seed: LeafId[], messages: WarmupMessage[]): WarmupMessage[] {
  const answers = messages.filter((m) => m.from === "student");
  const out: WarmupMessage[] = [];
  concernTurns(seed).some((turn, i) => {
    for (const text of turn) out.push({ from: "tutor", text });
    if (!answers[i]) return true;
    out.push(answers[i]);
    return false;
  });
  return out;
}

/** True once every turn has its answer: the closing bubble, then the warm-up. */
export const concernsAnswered = (seed: LeafId[], messages: WarmupMessage[]): boolean => messages.filter((m) => m.from === "student").length >= concernTurns(seed).length;

/**
 * The warm-up offer's two lines, on the confidence screen after a not-confident answer: the tutor's
 * question naming the ticked skills in tick order, and a muted line sizing the warm-up at one short
 * problem per skill. A plain "not confident" (no skills) gets the open question and "a few".
 */
export function offerLines(confidence: Confidence): { question: string; size: string } {
  const w = confidence.level === "low-when" ? confidence.leaves.map(skillWord) : [];
  if (w.length === 0) return { question: "Warm up before the set?", size: "a few short problems, then the set" };
  return { question: `Warm up on ${amp(w)} first?`, size: `${w.length} short problem${w.length === 1 ? "" : "s"}, then the set` };
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
