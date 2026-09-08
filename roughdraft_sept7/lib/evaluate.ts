/**
 * Simulated step evaluator for a live (typed) attempt.
 *
 * The real product would evaluate each line of working with a model. This mockup recognises
 * lines against the problem's known solution steps and known missteps, so a reviewer typing a
 * plausible attempt sees the same quality of step-by-step feedback the scripted students get.
 * Anything it doesn't recognise is marked "unclear" and the note asks the student to say more —
 * which is also what the real evaluator should do rather than guess.
 */
import type { EvalStep, Evaluation, NextStep, Problem, SubskillId, SubskillStatus } from "@/data/types";
import { PROBLEMS, PROBLEM_MAP } from "@/data/problems";
import { SUBSKILL_MAP } from "@/data/subskills";

export const BUILT_ON_ABOVE = "Right move — this step is sound, it's just built on the line above.";
const UNCLEAR_NOTE = "I can't see how this line follows from the one above. What did you do here?";

/** Canonical form for comparing a typed line with a known one. Accepts plain typing or TeX. */
export function normalize(raw: string): string {
  let t = raw.trim().toLowerCase();
  t = t
    .replace(/\\(?:left|right|;|,|!|quad|qquad)/g, " ")
    .replace(/\\text\{([^}]*)\}/g, " $1 ")
    .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
    .replace(/√\s*\(?([0-9a-z.]+)\)?/g, "sqrt($1)")
    .replace(/\\(?:t|d)?frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, "($1)/($2)")
    .replace(/\\pm|±/g, "+-")
    .replace(/\\rightarrow|\\Rightarrow|=>|→|⇒/g, "=>")
    .replace(/\\approx|≈|~/g, "=~")
    .replace(/\*\*/g, "^")
    .replace(/\\cdot|\\times|×|·|\*/g, "*")
    .replace(/−|–/g, "-")
    .replace(/²/g, "^2")
    .replace(/\\checkmark|✓|✔/g, "ok")
    .replace(/[{}]/g, "")
    .replace(/\b(or|and)\b/g, "|")
    .replace(/,/g, "|")
    .replace(/\s+/g, "")
    .replace(/\(([\d.]+|[a-z])\)/g, "$1")
    .replace(/\bcheck:?/g, "check:")
    .replace(/\^\((\d+)\)/g, "^$1");
  // "x = 2 or x = 3" and "x = 3 or x = 2" are the same line.
  return t
    .split("|")
    .map((x) => x.replace(/^\((.*)\)$/, "$1"))
    .filter(Boolean)
    .sort()
    .join("|");
}

/** Plain typed maths → TeX for display. Lines that already contain TeX are passed through. */
export function toTex(raw: string): string {
  const s = raw.trim();
  if (s.includes("\\")) return s;
  return s
    .replace(/^check:?\s*/i, "\\text{Check: }")
    .replace(/(?<![a-z\\])\b(or|and)\b(?![a-z])/gi, "\\text{ $1 }")
    .replace(/\*\*/g, "^")
    .replace(/sqrt\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*\(?([0-9a-z.]+)\)?/g, "\\sqrt{$1}")
    .replace(/\+-|±/g, "\\pm ")
    .replace(/=>|→|⇒/g, "\\Rightarrow ")
    .replace(/≈|~/g, "\\approx ")
    .replace(/\*|×|·/g, "\\cdot ")
    .replace(/−|–/g, "-")
    .replace(/²/g, "^2")
    .replace(/\^(\d{2,})/g, "^{$1}")
    .replace(/(?<![\w)])(\d+)\/(\d+)(?!\w)/g, "\\tfrac{$1}{$2}")
    .replace(/✓|✔/g, "\\checkmark")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** TeX from the data files → the plain form a student would type. Used to prefill an attempt. */
export function toPlain(tex: string): string {
  return tex
    .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
    .replace(/\\(?:t|d)?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) =>
      /^[\d.]+$/.test(a.trim()) && /^[\d.]+$/.test(b.trim()) ? `${a.trim()}/${b.trim()}` : `(${a.trim()})/(${b.trim()})`,
    )
    .replace(/\\text\{\s*(or|and)\s*\}/g, " $1 ")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\(?:;|,|!|quad|qquad)/g, " ")
    .replace(/\\pm/g, "+-")
    .replace(/\\Rightarrow|\\rightarrow/g, "=>")
    .replace(/\\approx/g, "~")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\\checkmark/g, "✓")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function statusFor(markers: EvalStep["marker"][]): SubskillStatus {
  if (markers.includes("slip")) return "slip";
  if (markers.includes("shaky")) return "shaky";
  return "sound";
}

const STATUS_NOTE: Record<SubskillStatus, string> = {
  sound: "",
  shaky: "Held, but not justified on the page.",
  slip: "One line didn't hold.",
  unseen: "",
};

/** Mark each typed line, then write the summary the way the scripted evaluations are written. */
export interface AttemptContext {
  /** Problems visited so far on this path, in order, excluding the current one. */
  visited: string[];
  /** Evaluations already given on this path, by problem id. */
  evals: Record<string, Evaluation>;
}

export function evaluateAttempt(problem: Problem, rawLines: string[], ctx: AttemptContext = { visited: [], evals: {} }): Evaluation {
  const lines = rawLines.map((l) => l.trim()).filter(Boolean);
  const solution = problem.solution.map((s) => ({ ...s, key: normalize(s.tex) }));
  const missteps = (problem.missteps ?? []).map((m) => ({
    ...m,
    key: normalize(m.tex),
    then: (m.then ?? []).map((t) => ({ ...t, key: normalize(t.tex) })),
  }));

  const steps: EvalStep[] = [];
  const matchedSolution = new Set<number>();
  let active: (typeof missteps)[number] | null = null;

  for (const raw of lines) {
    const key = normalize(raw);
    const tex = toTex(raw);
    const si = solution.findIndex((s) => s.key === key);
    // A correct line can still be shaky: right answer, but the step that justifies it was skipped.
    const unjustified = si > 0 && !matchedSolution.has(si - 1) ? missteps.find((x) => x.marker === "shaky" && x.key === key) : null;
    if (si >= 0 && !unjustified) {
      matchedSolution.add(si);
      steps.push({ tex, marker: "sound", label: solution[si].label, subskill: solution[si].subskill });
      active = null;
      continue;
    }
    const m = missteps.find((x) => x.key === key);
    if (m) {
      steps.push({ tex, marker: m.marker, label: m.label, subskill: m.subskill, note: m.note });
      active = m.marker === "slip" ? m : null;
      continue;
    }
    const follow = active?.then.find((t) => t.key === key);
    if (follow) {
      steps.push({ tex, marker: "sound", label: follow.label, subskill: follow.subskill, note: BUILT_ON_ABOVE });
      continue;
    }
    steps.push({ tex, marker: "unclear", label: "Can't follow this yet", note: UNCLEAR_NOTE });
    active = null;
  }

  const bySubskill = new Map<SubskillId, EvalStep["marker"][]>();
  for (const s of steps) {
    if (!s.subskill) continue;
    bySubskill.set(s.subskill, [...(bySubskill.get(s.subskill) ?? []), s.marker]);
  }
  const exercised = [...bySubskill.entries()].map(([id, markers]) => {
    const status = statusFor(markers);
    return { id, status, note: STATUS_NOTE[status] };
  });

  const reached = matchedSolution.has(solution.length - 1);
  const summary = summarise(steps, reached);
  const next = planNext(problem, exercised, ctx, reached);
  return { problemId: problem.id, steps, summary, exercised, next, reached };
}

function summarise(steps: EvalStep[], reached: boolean): string {
  const firstSlip = steps.findIndex((s) => s.marker === "slip");
  const unclear = steps.filter((s) => s.marker === "unclear").length;
  const shaky = steps.filter((s) => s.marker === "shaky").length;
  if (firstSlip >= 0) {
    const after = steps.slice(firstSlip + 1).some((s) => s.note === BUILT_ON_ABOVE);
    const lead = firstSlip === 0 ? "Line 1 doesn't hold" : `The method is right through line ${firstSlip}. Line ${firstSlip + 1} doesn't hold`;
    return `${lead} — the note beside it says what to check.${after ? " The lines after it are correct given that line, so the fix is local." : ""}`;
  }
  if (unclear > 0) {
    return unclear === 1
      ? "One line I couldn't follow. Add the move that gets you there — a line for each step — and check again."
      : `${unclear} lines I couldn't follow. Add the move between each — a line for each step — and check again.`;
  }
  if (shaky > 0) return "The idea holds. One step was rushed — the note beside it says what would settle it.";
  if (!reached) return "Every line so far holds. You haven't reached the answer yet — keep going.";
  return "Every step holds, and the working shows the method, not just the answer.";
}

const CORE = PROBLEMS.filter((p) => p.kind === "core").map((p) => p.id);

/** The next core problem after `current` that hasn't been visited. */
export function nextCoreAfter(current: string, visited: string[]): string | null {
  const cur = PROBLEM_MAP[current];
  // From a warm-up, continue after the last core problem visited.
  const anchor = cur.kind === "core" ? current : [...visited].reverse().find((id) => PROBLEM_MAP[id]?.kind === "core") ?? null;
  const from = anchor ? CORE.indexOf(anchor) + 1 : 0;
  return CORE.slice(from).find((id) => !visited.includes(id)) ?? null;
}

const allSound = (e: Evaluation | undefined) => !!e && e.exercised.every((x) => x.status === "sound");

function planNext(
  problem: Problem,
  exercised: Evaluation["exercised"],
  ctx: AttemptContext,
  reached: boolean,
): NextStep {
  const seen = [...ctx.visited, problem.id];
  const nextId = nextCoreAfter(problem.id, seen);
  const next = nextId ? PROBLEM_MAP[nextId] : null;

  // A slip on a subskill that has a warm-up → offer it as preparation for the next problem.
  const slip = exercised.find((e) => e.status === "slip");
  const warmup = slip ? PROBLEMS.find((p) => p.kind === "prereq" && p.subskill === slip.id && !seen.includes(p.id)) : null;
  if (slip && warmup && next) {
    const sub = SUBSKILL_MAP[slip.id];
    return {
      kind: "sidestep",
      title: `A quick one before ${next.label}`,
      body: `${next.label} leans on ${sub.name.toLowerCase()} too. Here's ${sub.invitation} with the check built in — it'll make ${next.label} quicker.`,
      targetProblemId: warmup.id,
      reason: `${sub.short} slip on ${problem.label === "Warm-up" ? "the warm-up" : problem.label}. Framed as preparation for ${next.label}, not as remediation.`,
    };
  }

  if (!next) {
    return {
      kind: "finish",
      title: "That's the set",
      body: reached
        ? "Every core problem has been attempted. Anything marked shaky or a slip is worth one more look before Thursday."
        : "Every core problem has been attempted. This last one isn't finished — it'll be here when you come back.",
    };
  }

  // Three clean core problems in a row → offer the stretch, declinable (mirrors Priya's path).
  const priorCore = ctx.visited.filter((id) => PROBLEM_MAP[id].kind === "core").slice(-2);
  const clean =
    problem.kind === "core" &&
    priorCore.length === 2 &&
    priorCore.every((id) => allSound(ctx.evals[id])) &&
    exercised.every((e) => e.status === "sound");
  if (clean && reached && next.id !== "q6" && !seen.includes("q6")) {
    return {
      kind: "stretch",
      title: "Skip ahead to Q6?",
      body: "You're moving quickly. Q6 is a different kind of question — it asks about k, not x. You can come back to the ones in between afterwards.",
      targetProblemId: "q6",
      reason: "Three sound problems in a row with full working.",
    };
  }

  return {
    kind: "advance",
    title: `On to ${next.label}`,
    body: next.lead ?? "Same ideas, one step further.",
    targetProblemId: next.id,
  };
}
