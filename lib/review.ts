import { PROBLEMS } from "@/data/assignment";
import { DRAFT_LABELS, RECOMMENDATIONS, type ProposedQuestion, type Recommendation } from "@/data/review";
import type { Difficulty, Pathway, Problem } from "@/data/types";
import type { DraftQuestion } from "./classroom";
import { DEFAULT_PATHWAY } from "./pathway";
import { inferUnitFromProblems } from "./unit";

/**
 * The review step of a new assignment (ticket 120): the typed draft labelled by difficulty, the
 * scripted assessment matched against it, and the finalised set. Everything is keyed by the
 * normalised TeX of a question's expression, so a pasted set in any order gets the same labels
 * and the same recommendations, and a question the fixture does not know still gets a label
 * from a small heuristic. Pure; the screen holds no logic of its own.
 */

export const DIFFICULTIES: Difficulty[] = ["simple familiar", "simple unfamiliar", "complex familiar", "complex unfamiliar"];

/** The label after this one when a pill is tapped: the four in order, round again after the last (ticket 122). */
export function nextDifficulty(d: Difficulty): Difficulty {
  return DIFFICULTIES[(DIFFICULTIES.indexOf(d) + 1) % DIFFICULTIES.length];
}

/** The expression with nothing that varies between how it was typed and how the bank writes it. */
export function normTex(tex: string | null | undefined): string {
  if (!tex) return "";
  return tex
    .replace(/\\[td]frac/g, "\\frac")
    .replace(/\\left|\\right/g, "")
    .replace(/[{}\s]/g, "");
}

/** The bank problem with this expression, if any. */
export function bankMatch(tex: string | null | undefined): Problem | undefined {
  const key = normTex(tex);
  return key ? PROBLEMS.find((p) => normTex(p.tex) === key) : undefined;
}

const COMPLEX = /show that|prove|exact|which value|greatest|explain|justify|hence|model|dimensions|maximum|minimum/i;
const UNFAMILIAR = /graph|for which|touch|metres|height|land|area|holds|seconds/i;

/**
 * A label for a question the fixtures do not know. Unfamiliar when the stem is more than a
 * short instruction, has no expression, or sets a scene; complex when it asks for a justification,
 * an exact value or a parameter, or the expression carries a fraction or a root.
 */
export function heuristicLabel(stem: string, tex: string | null): Difficulty {
  const words = stem.trim().split(/\s+/).filter(Boolean).length;
  const unfamiliar = words > 7 || tex === null || UNFAMILIAR.test(stem);
  const complex = COMPLEX.test(stem) || /\\frac|\\sqrt/.test(tex ?? "");
  return `${complex ? "complex" : "simple"} ${unfamiliar ? "unfamiliar" : "familiar"}`;
}

/** The label the system gives a typed question: the bank's, the draft fixture's, or the heuristic's. */
export function defaultLabel(q: { stem: string; tex: string | null }): Difficulty {
  return bankMatch(q.tex)?.difficulty ?? DRAFT_LABELS[normTex(q.tex)] ?? heuristicLabel(q.stem, q.tex);
}

/** Every question's label, the teacher's overrides on top of the system's. */
export function labelsOf(questions: DraftQuestion[], overrides: Record<string, Difficulty> = {}): Record<string, Difficulty> {
  return Object.fromEntries(questions.map((q) => [q.id, overrides[q.id] ?? defaultLabel(q)]));
}

export function countByDifficulty(labels: Difficulty[]): Record<Difficulty, number> {
  const out = Object.fromEntries(DIFFICULTIES.map((d) => [d, 0])) as Record<Difficulty, number>;
  for (const d of labels) out[d]++;
  return out;
}

export type Answer = "accept" | "keep";
export type ReviewStep = "difficulty" | "recommendations" | "pathway";

/** The review step's decisions, kept in the classroom store so a reload lands on the same step. */
export interface ReviewState {
  step: ReviewStep;
  /** The draft the decisions were made about (`draftKey`); a different draft starts the step over. */
  forDraft: string;
  /** The teacher's relabels, by question id. */
  labels: Record<string, Difficulty>;
  /** Accept or keep, by recommendation id. */
  answers: Record<string, Answer>;
  /** Which alternative the addition shows. */
  addition: number;
  pathway: Pathway;
  /** The unit reassessed from the teacher's note, when they wrote one; otherwise the inferred unit stands, nothing to confirm (ticket 123). */
  unit?: 1 | 2 | 3 | 4;
}

/**
 * A short signature of the questions as typed, so decisions made about one draft are not shown
 * over another. The order is left out (ticket 150): a reorder on the create screen or the
 * review's grid keeps every decision, since labels and answers are by id, not by position.
 */
export function draftKey(questions: DraftQuestion[]): string {
  let h = 5381;
  const s = questions
    .map((q) => `${q.id}\u0000${q.text}`)
    .sort()
    .join("\u0001");
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${questions.length}:${(h >>> 0).toString(36)}`;
}

export function initialReview(questions: DraftQuestion[]): ReviewState {
  return { step: "difficulty", forDraft: draftKey(questions), labels: {}, answers: {}, addition: 0, pathway: DEFAULT_PATHWAY };
}

/** The stored review if it was made about these questions, else a fresh one (the relabels kept: they are by id). */
export function reviewFor(questions: DraftQuestion[], stored: ReviewState | null | undefined): ReviewState {
  const key = draftKey(questions);
  if (stored && stored.forDraft === key) return stored;
  return { ...initialReview(questions), labels: stored?.labels ?? {}, pathway: stored?.pathway ?? DEFAULT_PATHWAY };
}

/** A recommendation matched against the draft: its target's id when it has one. */
export interface ActiveRecommendation {
  rec: Recommendation;
  targetId?: string;
}

/** The recommendations that apply to these questions: a change or removal needs its target pasted; an addition always applies. */
export function recommendationsFor(questions: DraftQuestion[]): ActiveRecommendation[] {
  const out: ActiveRecommendation[] = [];
  for (const rec of RECOMMENDATIONS) {
    if (rec.kind === "add") {
      out.push({ rec });
      continue;
    }
    const target = questions.find((q) => normTex(q.tex) === rec.target);
    if (target) out.push({ rec, targetId: target.id });
  }
  return out;
}

export const allAnswered = (active: ActiveRecommendation[], answers: Record<string, Answer>) => active.every((a) => answers[a.rec.id] !== undefined);

/** The alternative the addition currently proposes. */
export function additionOption(options: ProposedQuestion[], index: number): ProposedQuestion {
  return options[((index % options.length) + options.length) % options.length];
}

/** A question in the finalised set: as typed, or as the assessment changed or added it. */
export interface ReviewedQuestion extends DraftQuestion {
  difficulty: Difficulty;
  origin: "typed" | "changed" | "added";
}

/** The set as the answers leave it: changes and removals applied to their targets, the addition appended. */
export function applyReview(questions: DraftQuestion[], review: Pick<ReviewState, "labels" | "answers" | "addition">): ReviewedQuestion[] {
  const labels = labelsOf(questions, review.labels);
  const active = recommendationsFor(questions);
  const accepted = active.filter((a) => review.answers[a.rec.id] === "accept");
  const out: ReviewedQuestion[] = [];
  for (const q of questions) {
    const change = accepted.find((a) => a.rec.kind === "change" && a.targetId === q.id);
    if (change && change.rec.kind === "change") {
      out.push({ id: q.id, text: change.rec.to.text, stem: change.rec.to.stem, tex: change.rec.to.tex, difficulty: change.rec.to.difficulty, origin: "changed" });
      continue;
    }
    if (accepted.some((a) => a.rec.kind === "remove" && a.targetId === q.id)) continue;
    out.push({ ...q, difficulty: labels[q.id], origin: "typed" });
  }
  for (const a of accepted) {
    if (a.rec.kind !== "add") continue;
    const o = additionOption(a.rec.options, review.addition);
    out.push({ id: `added-${a.rec.id}`, text: o.text, stem: o.stem, tex: o.tex, difficulty: o.difficulty, origin: "added" });
  }
  return out;
}

/** The bank problems the finalised set contains, in bank order: what the student side can run. */
export function bankProblemsOf(final: { tex: string | null }[]): Problem[] {
  const keys = new Set(final.map((f) => normTex(f.tex)).filter(Boolean));
  return PROBLEMS.filter((p) => keys.has(normTex(p.tex)));
}

/** The unit the finalised set points at, from the bank problems it contains. */
export function inferUnitFromReviewed(final: { tex: string | null }[]): 1 | 2 | 3 | 4 {
  return inferUnitFromProblems(bankProblemsOf(final));
}
