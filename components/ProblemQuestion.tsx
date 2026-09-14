import Figure from "@/components/Figure";
import M from "@/components/Math";
import type { Problem } from "@/data/types";
import { unbrokenHyphens } from "@/lib/stem";

/**
 * A problem as the question the student was asked (ticket 271): the stem's words, then the expression, read as one
 * line of prose that wraps between words (never at a hyphen: "x-intercepts" stays whole). The words take `stemClass` (the soft ink by default) so the maths still
 * leads; the expression never breaks (`.katex` is nowrap). Every teacher screen that names a problem shows this,
 * never the bare expression, since "y = 2x² + 5x − 3" alone does not say what the student had to do with it. A problem
 * with a figure ("The graph of the following is shown") carries a small thumbnail of it after the expression,
 * `figureWidth` layout px wide (the figure is 300 × 190), so a header row keeps close to its height.
 */
export default function ProblemQuestion({ problem: p, stemClass = "text-ink-soft", mathClass = "", figureWidth = 64 }: { problem: Pick<Problem, "stem" | "tex" | "figure">; stemClass?: string; mathClass?: string; figureWidth?: number }) {
  return (
    <>
      <span className={stemClass} data-question-stem>
        {unbrokenHyphens(p.stem)}
      </span>{" "}
      <span className={`whitespace-nowrap ${mathClass}`} data-question-tex>
        <M tex={p.tex} />
      </span>
      {p.figure && (
        <>
          {" "}
          <span className="inline-block rounded-md border border-line bg-paper p-0.5 align-middle" style={{ width: figureWidth }} data-question-figure={p.figure}>
            <Figure id={p.figure} />
          </span>
        </>
      )}
    </>
  );
}
