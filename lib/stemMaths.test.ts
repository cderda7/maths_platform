import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A stem never writes maths as text, and never repeats its expression (ticket 342). Maths a stem needs is `$…$`, set in KaTeX by
 * `components/StemWords.tsx` on every screen; the expression shown after the stem is said once, in its TeX. Read from the data
 * files' source, so a stem added anywhere under `data/` is held to it.
 */
const DATA = join(__dirname, "..", "data");
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : f.endsWith(".ts") && !f.endsWith(".test.ts") ? [join(dir, f)] : []));
const unescape = (s: string) => JSON.parse(`"${s}"`) as string;

const stems = files(DATA).flatMap((file) => {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(/stem: "((?:[^"\\]|\\.)*)",(?:\s*\n\s*tex: "((?:[^"\\]|\\.)*)")?/g)].map((m) => ({ where: `${file.slice(DATA.length + 1)}: ${m[1].slice(0, 50)}`, stem: unescape(m[1]), tex: m[2] === undefined ? null : unescape(m[2]) }));
});

const words = (stem: string) => stem.replace(/\$[^$]*\$/g, "");
const inline = (stem: string) => stem.split("$").filter((_, i) => i % 2 === 1);
const compact = (tex: string) => tex.replace(/\s|\{|\}/g, "");

describe("stems and their maths (ticket 342)", () => {
  it("finds the app's stems", () => {
    expect(stems.length).toBeGreaterThan(150);
  });

  it("no stem writes maths as text: powers, roots, operators, relations and function notation are `$…$`", () => {
    for (const s of stems) {
      expect(s.stem.split("$").length % 2, `${s.where}: unbalanced $`).toBe(1);
      expect(words(s.stem), s.where).not.toMatch(/[²³√−=+<>±π≤≥]|\b[a-z]\([a-z]\)|\b\d+[a-z]\b/);
    }
  });

  it("no stem repeats its expression: no side of its inline maths is a side of the TeX shown after it", () => {
    // A side is what stands between `=`, `,` and `\quad`; a letter or a lone number naming something ("$w$ cm", "$-8$") is not an expression.
    const sides = (tex: string) => compact(tex).split(/=|,|\\quad|\\;/).filter((side) => side.length >= 4 && /[\d+\-^(]/.test(side));
    for (const s of stems) {
      if (!s.tex) continue;
      const shown = new Set(sides(s.tex));
      for (const piece of inline(s.stem)) for (const side of sides(piece)) expect(shown.has(side), `${s.where}: ${side}`).toBe(false);
    }
  });
});
