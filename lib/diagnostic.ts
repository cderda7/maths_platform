import { DIAGNOSTIC_MAP, DIAGNOSTICS, type Diagnostic } from "@/data/diagnostic";

/** The question behind a push: one the teacher wrote (carried with the push) or a fixture by id. */
export function questionFor(questionId: string, question?: Diagnostic): Diagnostic | undefined {
  return question ?? DIAGNOSTIC_MAP[questionId];
}

export function isCorrect(questionId: string, option: string, question?: Diagnostic): boolean {
  return questionFor(questionId, question)?.correct === option;
}

/** The suggested check for a problem; the class view's example when no fixture names the problem. */
export function diagnosticFor(problemId: string): Diagnostic {
  return DIAGNOSTICS.find((d) => d.problemId === problemId) ?? DIAGNOSTICS[0];
}

/**
 * Whether a push (waiting or answered) came from the panel that shows `example` under
 * `problemId`: a fixture push is matched by its id, a teacher-written one by the problem it was
 * written under (none on the class view). The pending band, the response line and Withdraw
 * show only in the panel the push belongs to.
 */
export function pushBelongsTo(push: { questionId: string; question?: Diagnostic }, example: Diagnostic, problemId?: string): boolean {
  return push.question ? push.question.problemId === problemId : push.questionId === example.id;
}

/** A teacher-written question is valid with a stem, at least two options and a correct one among them. */
export function customQuestion(stem: string, tex: string, options: string[], correct: string, at = Date.now(), problemId?: string): Diagnostic | null {
  const opts = options.map((t, i) => ({ id: "abcd"[i], tex: t.trim() })).filter((o) => o.tex.length > 0);
  if (stem.trim().length === 0 || opts.length < 2 || !opts.some((o) => o.id === correct)) return null;
  const q: Diagnostic = { id: `custom-${at}`, stem: stem.trim(), tex: tex.trim(), options: opts, correct };
  return problemId ? { ...q, problemId } : q;
}
