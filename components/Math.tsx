import katex from "katex";
import { hoistSpacing } from "@/lib/hint";

/** Typesets a TeX string with KaTeX. Works in server and client components alike. Spacing next to a linked hint fragment is kept outside its box. */
export default function M({ tex, display = false, className = "" }: { tex: string; display?: boolean; className?: string }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, trust: true });
  return <span className={className} dangerouslySetInnerHTML={{ __html: tex.includes("hint-term") ? hoistSpacing(html) : html }} />;
}
