/** One piece of a diagnostic's question: words, or maths with the punctuation that follows it. */
export type StemPart = { kind: "text"; text: string } | { kind: "math"; tex: string; after: string };

/**
 * Splits a stem with inline `$…$` maths, followed by an optional expression, into pieces ending in "?" (ticket 240). The "?"
 * and any punctuation right after a piece of maths join that piece, so they never start a line of their own.
 */
export function stemParts(stem: string, tex = ""): StemPart[] {
  const parts: StemPart[] = [];
  const pieces = stem.split("$");
  pieces.forEach((piece, i) => {
    if (i % 2 === 1) {
      parts.push({ kind: "math", tex: piece, after: "" });
      return;
    }
    let text = piece;
    const last = parts[parts.length - 1];
    const lead = /^[,.;:?!]+/.exec(text);
    if (lead && last?.kind === "math") {
      last.after += lead[0];
      text = text.slice(lead[0].length);
    }
    if (text) parts.push({ kind: "text", text });
  });
  if (tex) {
    const last = parts[parts.length - 1];
    if (last?.kind === "text" && !last.text.endsWith(" ")) last.text += " ";
    parts.push({ kind: "math", tex, after: "?" });
    return parts;
  }
  const last = parts[parts.length - 1];
  if (last?.kind === "math") last.after += "?";
  else if (last) last.text += "?";
  else parts.push({ kind: "text", text: "?" });
  return parts;
}

/** A hyphen inside a word becomes a non-breaking one (U+2011), so a narrow column never leaves "x-" at a line's end (ticket 271). */
export const unbrokenHyphens = (s: string) => s.replace(/(\w)-(\w)/g, "$1\u2011$2");
