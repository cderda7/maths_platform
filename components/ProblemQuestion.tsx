import M from "@/components/Math";
import type { Problem } from "@/data/types";
import { unbrokenHyphens } from "@/lib/stem";

/**
 * A problem as the question the student was asked (ticket 271): the stem's words, then the expression, read as one
 * line of prose that wraps between words (never at a hyphen: "x-intercepts" stays whole). The words take `stemClass` (the soft ink by default) so the maths still
 * leads; the expression never breaks (`.katex` is nowrap). Every teacher screen that names a problem shows this,
 * never the bare expression, since "y = 2x² + 5x − 3" alone does not say what the student had to do with it.
 */
export default function ProblemQuestion({ problem: p, stemClass = "text-ink-soft", mathClass = "" }: { problem: Pick<Problem, "stem" | "tex">; stemClass?: string; mathClass?: string }) {
  return (
    <>
      <span className={stemClass} data-question-stem>
        {unbrokenHyphens(p.stem)}
      </span>{" "}
      <span className={`whitespace-nowrap ${mathClass}`} data-question-tex>
        <M tex={p.tex} />
      </span>
    </>
  );
}
