import type { HintTerm } from "@/data/types";

/** A run of hint text: plain, or one of the problem's linked terms. */
export interface HintSegment {
  text: string;
  term?: HintTerm;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits a hint into plain runs and linked terms. Every whole-word occurrence of a phrase is a
 * term (so "b" is found in "add to b" but not in "by"), matched case-insensitively with the hint's
 * own capitalisation kept; the longest phrase wins where two could start at the same place, and
 * a phrase the hint does not contain is ignored.
 */
export function hintSegments(hint: string, terms: HintTerm[] = []): HintSegment[] {
  if (terms.length === 0) return [{ text: hint }];
  const byPhrase = new Map(terms.map((t) => [t.phrase.toLowerCase(), t]));
  const alternatives = [...byPhrase.keys()].sort((a, b) => b.length - a.length).map(escape).join("|");
  const re = new RegExp(`(?<![a-z])(?:${alternatives})(?![a-z])`, "gi");
  const out: HintSegment[] = [];
  let cursor = 0;
  for (const m of hint.matchAll(re)) {
    if (m.index > cursor) out.push({ text: hint.slice(cursor, m.index) });
    out.push({ text: m[0], term: byPhrase.get(m[0].toLowerCase()) });
    cursor = m.index + m[0].length;
  }
  if (cursor < hint.length) out.push({ text: hint.slice(cursor) });
  return out;
}

/**
 * Wraps every fragment the terms point at in an `\htmlClass{hint-term}` group, adding
 * `hint-term-lit` to the fragments of the lit term. Every fragment is always wrapped so lighting
 * one changes colour only, never the typeset layout (KaTeX gives the group no spacing of its
 * own). First whole occurrence of each fragment: not a superscript or subscript, not part of a
 * longer number or of a command name, so "2" in `x^2 + 2x` is the coefficient. A fragment inside
 * a longer one is wrapped inside it, so "10" can light within "10x"; a fragment the TeX does not
 * contain is left alone. Needs KaTeX's `trust` option, which `components/Math` sets.
 */
export function termTex(tex: string, terms: HintTerm[] = [], lit?: HintTerm): string {
  const fragments = [...new Set(terms.flatMap((t) => t.tex))];
  return fragments.length ? wrap(tex, fragments, new Set(lit?.tex ?? [])) : tex;
}

const alnum = (c: string | undefined) => c !== undefined && /[a-z0-9]/i.test(c);

/** Where `f` first occurs in `tex` as a whole token, or -1. */
export function findFragment(tex: string, f: string): number {
  for (let at = tex.indexOf(f); at >= 0; at = tex.indexOf(f, at + 1)) {
    const before = tex[at - 1];
    const script = before === "^" || before === "_" || (before === "{" && (tex[at - 2] === "^" || tex[at - 2] === "_"));
    const joinedBefore = before === "\\" || (alnum(before) && alnum(f[0]));
    const joinedAfter = /[0-9]$/.test(f) && /[0-9]/.test(tex[at + f.length] ?? "");
    if (!script && !joinedBefore && !joinedAfter) return at;
  }
  return -1;
}

function wrap(tex: string, fragments: string[], lit: Set<string>): string {
  const found = fragments
    .map((f) => ({ f, at: findFragment(tex, f) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at || b.f.length - a.f.length);
  let out = "";
  let cursor = 0;
  for (const { f, at } of found) {
    if (at < cursor) continue;
    const end = at + f.length;
    const inner = found.filter((x) => x.f !== f && x.at >= at && x.at + x.f.length <= end).map((x) => x.f);
    const body = inner.length ? wrap(f, inner, lit) : f;
    out += tex.slice(cursor, at) + `\\htmlClass{${lit.has(f) ? "hint-term hint-term-lit" : "hint-term"}}{${body}}`;
    cursor = end;
  }
  return out + tex.slice(cursor);
}
