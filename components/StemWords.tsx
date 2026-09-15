import M from "@/components/Math";
import { unbrokenHyphens } from "@/lib/stem";

/**
 * A stem's words, as every screen that shows a problem's question sets them (ticket 342; first in `ProblemQuestion`, ticket 293):
 * any `$…$` piece is maths, set in KaTeX at the words' size in ink, unbroken, holding the punctuation right after it so a wrap
 * never starts a line with a comma; the words never break at a hyphen ("x-intercepts" stays whole). A stem's maths is written
 * this way, never as text, and never repeats the expression shown after it.
 */
export default function StemWords({ stem }: { stem: string }) {
  if (!stem.includes("$")) return <>{unbrokenHyphens(stem)}</>;
  const pieces = stem.split("$");
  return (
    <>
      {pieces.map((piece, i) => {
        if (i % 2 === 1) {
          const after = /^[,.;:?!]+/.exec(pieces[i + 1] ?? "")?.[0] ?? "";
          return (
            <span key={i} className="whitespace-nowrap" data-question-inline-tex>
              <M tex={piece} className="text-ink" />
              {after}
            </span>
          );
        }
        const lead = i > 0 ? (/^[,.;:?!]+/.exec(piece)?.[0] ?? "") : "";
        return <span key={i}>{unbrokenHyphens(piece.slice(lead.length))}</span>;
      })}
    </>
  );
}
