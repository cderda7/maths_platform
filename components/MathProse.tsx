import M from "@/components/Math";
import { proseParts, type StemPart } from "@/lib/stem";

/**
 * Words with inline maths (ticket 240; its own component since ticket 304): each piece of maths keeps the punctuation right
 * after it on its own line, so a wrap never leaves a mark alone at the start of a line; the maths itself never breaks
 * (`.katex` is nowrap). Given `text`, the `$…$` pieces are split out; given `parts`, they are drawn as they come
 * (a diagnostic's stem, which ends in its "?").
 */
export default function MathProse({ text, parts }: { text: string; parts?: undefined } | { parts: StemPart[]; text?: undefined }) {
  return (
    <>
      {(parts ?? proseParts(text!)).map((p, i) =>
        p.kind === "text" ? (
          <span key={i}>{p.text}</span>
        ) : (
          <span key={i} className="whitespace-nowrap">
            <M tex={p.tex} />
            {p.after}
          </span>
        ),
      )}
    </>
  );
}
