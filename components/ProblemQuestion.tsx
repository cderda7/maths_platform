import Figure from "@/components/Figure";
import M from "@/components/Math";
import StemWords from "@/components/StemWords";
import type { FigureId } from "@/data/types";
import { ANCHOR } from "@/lib/markup";

/** A question as `ProblemQuestion` shows it: a problem's, or a typed one's (a stem with inline `$…$` maths, maybe no expression, maybe an uploaded diagram). */
export interface QuestionLike {
  stem: string;
  tex: string | null;
  figure?: FigureId;
  /** A diagram cut from an uploaded file (a data URL). */
  figureUrl?: string;
}

/**
 * A problem as the question the student was asked (ticket 271): the stem's words, then the expression, read as one
 * line of prose that wraps between words (never at a hyphen: "x-intercepts" stays whole). The words take `stemClass` (the soft ink by default) so the maths still
 * leads; the expression never breaks (`.katex` is nowrap). Every teacher screen that names a problem shows this,
 * never the bare expression, since "y = 2x² + 5x − 3" alone does not say what the student had to do with it. A problem
 * with a figure ("The graph of the following is shown") carries a small thumbnail of it after the expression,
 * `figureWidth` layout px wide (the figure is 300 × 190), so a header row keeps close to its height.
 *
 * A typed question (ticket 293, the homework screen's teacher's ten) may carry inline maths in its stem between `$` signs:
 * each piece is set in KaTeX at the words' size in ink, unbroken, holding the punctuation right after it so a wrap never starts a line with a comma.
 */
export default function ProblemQuestion({
  problem: p,
  stemClass = "text-ink-soft",
  mathClass = "",
  figureWidth = 64,
  inkAnchors = false,
}: {
  problem: QuestionLike;
  stemClass?: string;
  mathClass?: string;
  figureWidth?: number;
  /** The stem and the expression are anchors for the teacher's marks over a class review slide (ticket 330). */
  inkAnchors?: boolean;
}) {
  return (
    <>
      <span className={stemClass} data-question-stem data-ink-anchor={inkAnchors ? ANCHOR.stem : undefined}>
        <StemWords stem={p.stem} />
      </span>
      {p.tex && (
        <>
          {" "}
          <span className={`whitespace-nowrap ${mathClass}`} data-question-tex data-ink-anchor={inkAnchors ? ANCHOR.tex : undefined}>
            <M tex={p.tex} />
          </span>
        </>
      )}
      {(p.figure || p.figureUrl) && (
        <>
          {" "}
          <span className="inline-block rounded-md border border-line bg-paper p-0.5 align-middle" style={{ width: figureWidth }} data-question-figure={p.figure ?? "uploaded"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a data URL the browser drew */}
            {p.figure ? <Figure id={p.figure} /> : <img src={p.figureUrl} alt="" className="block w-full" />}
          </span>
        </>
      )}
    </>
  );
}
