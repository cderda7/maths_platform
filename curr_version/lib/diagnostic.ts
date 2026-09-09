import { DIAGNOSTIC_MAP, type Diagnostic } from "@/data/diagnostic";

/** The question behind a push: one the teacher wrote (carried with the push) or a fixture by id. */
export function questionFor(questionId: string, question?: Diagnostic): Diagnostic | undefined {
  return question ?? DIAGNOSTIC_MAP[questionId];
}

export function isCorrect(questionId: string, option: string, question?: Diagnostic): boolean {
  return questionFor(questionId, question)?.correct === option;
}

/** A teacher-written question is valid with a stem, at least two options and a correct one among them. */
export function customQuestion(stem: string, tex: string, options: string[], correct: string, at = Date.now()): Diagnostic | null {
  const opts = options.map((t, i) => ({ id: "abcd"[i], tex: t.trim() })).filter((o) => o.tex.length > 0);
  if (stem.trim().length === 0 || opts.length < 2 || !opts.some((o) => o.id === correct)) return null;
  return { id: `custom-${at}`, stem: stem.trim(), tex: tex.trim(), options: opts, correct };
}
