import M from "@/components/Math";
import { typesets, type ParsedQuestion, type Segment } from "@/lib/mathInput";

/**
 * A typed question as the student's problem card will show it (ticket 119): the prose with its
 * inline maths, then the centred expression. Sizes match `ProblemCard`'s full size. A run KaTeX
 * cannot set is shown as the teacher typed it, in a plain mono span, never as KaTeX's red error.
 */
export default function QuestionView({ parsed, placeholder }: { parsed: ParsedQuestion; placeholder?: string }) {
  const empty = parsed.stem.length === 0 && parsed.tex === null;
  return (
    <div data-question-view>
      <p className="text-[13.5px] leading-snug text-ink-soft" data-stem>
        {empty ? <span className="text-ink-muted/60">{placeholder}</span> : parsed.stem.map((s, i) => <Inline key={i} seg={s} />)}
      </p>
      {parsed.tex !== null && (
        <div className="math-lg mt-2.5 text-ink" data-expression>
          {typesets(parsed.tex) ? <M tex={parsed.tex} display /> : <div className="text-center font-mono text-[14px]">{parsed.raw}</div>}
        </div>
      )}
    </div>
  );
}

function Inline({ seg }: { seg: Segment }) {
  if (seg.kind === "text") return <>{seg.text}</>;
  return typesets(seg.tex) ? <M tex={seg.tex} className="text-ink" /> : <span className="font-mono text-[0.92em] text-ink">{seg.raw}</span>;
}
