import manifest from "@/fixtures/extract/manifest.json";
import { base64ToBytes, parseDraftLine, sourceHash, type Draft, type Source, sourceName } from "@/lib/extract";
import { parseQuestion, splitPaste, stemText } from "@/lib/mathInput";

/**
 * What the extraction route answers when `EXTRACT_FIXTURES=1` (ticket 170): no model, the
 * drafts for the files `scripts/render-extract-fixtures.mjs` rendered from the demo set, matched
 * by the SHA-256 of the dropped bytes, and for typed text the shorthand parser's own reading
 * (`lib/mathInput`) with a few plain-English lines the parser cannot read spelled out here. The
 * click-throughs run against this; a real key runs the model.
 */

/** A fixture draft as the manifest stores it: what a draft is, minus `source` (set per request). */
type FixtureDraft = Omit<Draft, "source"> & { source?: number };

/** The rendered files by the hash of their bytes. */
export const FILE_FIXTURES: Record<string, { drafts: FixtureDraft[] }> = Object.fromEntries(Object.values(manifest.files).map((f) => [f.hash, { drafts: f.drafts as FixtureDraft[] }]));

/** Typed lines the shorthand parser cannot read but the model can: plain English, as the extractor would normalise it. Exact string in, drafts out. */
export const TEXT_FIXTURES: Record<string, FixtureDraft[]> = {
  "half of x squared plus 3": [{ stem: "", tex: "\\tfrac{1}{2}x^2 + 3" }],
  "solve x squared plus five x plus six equals zero": [{ stem: "Solve for $x$.", tex: "x^2 + 5x + 6 = 0" }],
  "what is the turning point of y equals x squared minus 4x minus 5": [{ stem: "What is the turning point of", tex: "y = x^2 - 4x - 5" }],
};

/** The draft a source gets when no fixture matches it, so a wrong fixture shows on the screen rather than as silence. */
export const noFixture = (s: Source, i: number): Draft => ({ source: i, stem: `No fixture for ${sourceName(s, i)}`, tex: null });

/** One typed line as a draft: a plain-English fixture when there is one, else the parser's reading; null for a line with nothing in it. */
function typedDraft(line: string): FixtureDraft[] | null {
  const key = line.trim().toLowerCase().replace(/\s+/g, " ");
  if (TEXT_FIXTURES[key]) return TEXT_FIXTURES[key];
  const parsed = parseQuestion(line);
  const stem = stemText(parsed.stem).trim();
  if (!stem && !parsed.tex) return null;
  return [{ stem, tex: parsed.tex }];
}

/** The fixture drafts for one source of a request, `source` set; the "no fixture" draft when nothing matches. */
export async function fixtureDrafts(s: Source, i: number): Promise<Draft[]> {
  if (s.kind === "text") {
    const out = splitPaste(s.text).flatMap((l) => typedDraft(l) ?? []);
    return out.length ? out.map((d) => ({ ...d, source: i })) : [];
  }
  const hit = FILE_FIXTURES[await sourceHash(base64ToBytes(s.data))];
  if (!hit) return [noFixture(s, i)];
  // Round-trip each through the line parser so a fixture can never carry a shape the model's lines could not.
  return hit.drafts.flatMap((d) => {
    const parsed = parseDraftLine(JSON.stringify({ ...d, source: i }), i + 1);
    return parsed ? [parsed] : [];
  });
}
