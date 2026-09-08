import katex from "katex";

/** Typesets a TeX string with KaTeX. Works in server and client components alike. */
export default function M({ tex, display = false, className = "" }: { tex: string; display?: boolean; className?: string }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, trust: true });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
