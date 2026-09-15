import type { MisconceptionId } from "@/data/misconceptions";
import { QUESTION_HELP } from "@/data/questionHelp";
import type { LeafId } from "@/data/taxonomy";
import type { Approach, CompletionQuestion, Hint, PracticeProblem, Problem, SolutionStep, WorkedQuestion } from "@/data/types";
import { blankSteps, pairFor } from "./pairs";
import type { RevealedLine } from "./recognition";
import { checkStep } from "./stepCheck";
import { padScript, type ScriptSlips } from "./warmup";

/**
 * Help on a set question in three steps (ticket 312): Q*, a whole question like Q, worked; Q**, another, with the named
 * skill's lines blank for the student to write; then back on Q. Pure: the session records the step and when it began, the
 * screens draw what these functions say. The questions are ticket 310's (`data/pairs.ts`), the line check ticket 311's
 * (`lib/stepCheck.ts`). See DECISION_LOG.md, 2026-09-15 (help on a question runs Q*, Q**, back on Q).
 */

/** The three steps, in order: what the session records per question and the teacher's place model shows. */
export type LadderStep = "worked" | "completion" | "back";
export const LADDER_STEPS: readonly LadderStep[] = ["worked", "completion", "back"];

/**
 * A question as the practice pad's helpers read one (the worked example card, the hint picker, the help chat): its
 * working as `steps`, the skill the student named as `leaf`. Q* carries no hints; Q** and Q back on itself carry theirs.
 */
export function asPractice(q: Problem & { hints?: Hint[]; approaches?: Approach[] }, leaf: LeafId): PracticeProblem {
  return { id: q.id, leaf, stem: q.stem, tex: q.tex, steps: q.solution, why: "", hints: q.hints ?? [], ...(q.approaches ? { approaches: q.approaches } : {}) };
}

/** What help on question `problemId` for skill `leaf` runs on: Q*, Q** and Q**'s blank lines. Null for a question with no pair (the older isolated practice runs instead). */
export function ladderFor(problemId: string, leaf: LeafId): { worked: WorkedQuestion; completion: CompletionQuestion; blanks: number[] } | null {
  const pair = pairFor(problemId);
  if (!pair) return null;
  return { worked: pair.worked, completion: pair.completion, blanks: blankSteps(pair.completion.solution, leaf) };
}

/** Q back on itself, with its own hints and ways in, as the pad's helpers read it; null for a question without them. */
export function questionPractice(q: Problem, leaf: LeafId): PracticeProblem | null {
  const help = QUESTION_HELP[q.id];
  return help ? asPractice({ ...q, ...help }, leaf) : null;
}

// ── A written line, marked ──────────────────────────────────────────────────────────────────────────────────────────

/**
 * What a line written into a blank shows. Every result of the line check comes through `markLine` and every consequence
 * of one through `MARK_RULES`, so a further result (right maths written another way, if the user wants 0.5 for ½ to count)
 * is one more kind here and one more row there, with the screen's structure untouched.
 */
export type LineMark = { kind: "right" } | { kind: "wrong"; misconception?: MisconceptionId } | { kind: "unreadable" };

/** The one place a check result becomes a mark. */
export function markLine(step: Pick<SolutionStep, "tex" | "tags">, tex: string): LineMark {
  const c = checkStep(step, tex);
  switch (c.result) {
    case "right":
      return { kind: "right" };
    case "wrong":
      return c.misconception ? { kind: "wrong", misconception: c.misconception } : { kind: "wrong" };
    case "unreadable":
      return { kind: "unreadable" };
  }
}

/** What each mark does to its blank: `fills` moves the student on to the next blank; `tries` counts towards the blank filling itself in. */
export const MARK_RULES: Record<LineMark["kind"], { fills: boolean; tries: boolean }> = {
  right: { fills: true, tries: false },
  wrong: { fills: false, tries: true },
  unreadable: { fills: false, tries: false },
};

/** Wrong lines on one blank before it fills in and the student carries on. */
export const TRIES_BEFORE_FILL = 2;

// ── Q**, line by line ───────────────────────────────────────────────────────────────────────────────────────────────

export interface WrittenLine {
  tex: string;
  mark: LineMark;
  /** The line's index in what the pad has read. */
  index: number;
}

export interface BlankState {
  /** The step of the working this blank is. */
  step: number;
  /** The lines written into it, in order. */
  written: WrittenLine[];
  /** open: being written (or not reached); right: written right; filled: filled in after `TRIES_BEFORE_FILL` wrong lines. */
  status: "open" | "right" | "filled";
}

export interface CompletionState {
  blanks: BlankState[];
  /** The step being written, or null once every blank is right or filled. */
  current: number | null;
  /** Steps 0 … shown − 1 are on screen: the given lines up to the blank being written and that blank itself; every step once done. */
  shown: number;
  done: boolean;
}

/**
 * Q** as it stands after the lines the pad has read, in order, each against the blank being written: a mark that fills
 * moves on to the next blank, a line that tries counts, and `TRIES_BEFORE_FILL` of them fill the blank in. Nothing after the
 * blank being written is on screen, so no later line gives a blank away. Lines read after the last blank are not part of it.
 * Derived from the lines alone, so undo, a reload and the teacher's tab all agree.
 */
export function completionState(steps: readonly Pick<SolutionStep, "tex" | "tags">[], blanks: readonly number[], lines: readonly Pick<RevealedLine, "tex">[]): CompletionState {
  const states: BlankState[] = blanks.map((step) => ({ step, written: [], status: "open" }));
  let k = 0;
  lines.forEach((l, index) => {
    const b = states[k];
    if (!b) return;
    const mark = markLine(steps[b.step], l.tex);
    b.written.push({ tex: l.tex, mark, index });
    if (MARK_RULES[mark.kind].fills) {
      b.status = "right";
      k++;
    } else if (b.written.filter((w) => MARK_RULES[w.mark.kind].tries).length >= TRIES_BEFORE_FILL) {
      b.status = "filled";
      k++;
    }
  });
  const current = states[k]?.step ?? null;
  return { blanks: states, current, shown: current === null ? steps.length : current + 1, done: current === null };
}

/** The working as the hint picker and the chat read it: every step before the blank being written, as written in the reference (a filled or right blank stands for its step). */
export const completionWorking = (steps: readonly { tex: string }[], state: CompletionState): string[] => steps.slice(0, state.current ?? steps.length).map((s) => s.tex);

// ── The demo ────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Wrong lines the demo pad writes into a Q** blank before its right line, by Q** and by the step of its working (a slip
 * shows only when that step is blank for the skill named). Sam's own slip on non-monic factorising: the right numbers with
 * their signs put into the wrong brackets (`data/story.ts`, his non-monic sets; his Problem Set 6 Q2 line (2x + 4)(x − 1)).
 */
export const LADDER_SLIPS: Readonly<Record<string, ScriptSlips>> = {
  "q2-star-star": { 4: ["(2x + 3)(x - 5) = 0"] },
};

/** What the demo pad reads on Q**, one line per burst: each blank's line in order, any slip for that step just before it (`padScript`, ticket 311). */
export function completionScript(q: Pick<CompletionQuestion, "id" | "solution">, blanks: readonly number[], slips: Readonly<Record<string, ScriptSlips>> = LADDER_SLIPS): string[] {
  const own = slips[q.id] ?? {};
  return padScript(
    blanks.map((b) => q.solution[b]),
    Object.fromEntries(blanks.flatMap((b, k) => (own[b] ? [[k, own[b]]] : []))),
  );
}
