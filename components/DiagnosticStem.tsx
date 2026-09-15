import MathProse from "@/components/MathProse";
import type { Diagnostic } from "@/data/diagnostic";
import { stemParts } from "@/lib/stem";

/**
 * A diagnostic's question as one line of prose (ticket 240): the stem's words, its inline maths between `$` signs, then the
 * expression, then "?". Each piece of maths keeps the punctuation right after it (the "?", a comma) on its own line, so a
 * wrap never leaves a mark alone at the start of a line; the maths itself never breaks (`.katex` is nowrap).
 */
export default function DiagnosticStem({ question: q }: { question: Pick<Diagnostic, "stem" | "tex"> }) {
  return <MathProse parts={stemParts(q.stem, q.tex)} />;
}
