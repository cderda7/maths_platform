import type { HintTerm, TexFragment } from "@/data/types";

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
  const found: { at: number; text: string; term: HintTerm }[] = [];
  const whole = terms.filter((t) => !t.within);
  if (whole.length > 0) {
    const byPhrase = new Map(whole.map((t) => [t.phrase.toLowerCase(), t]));
    const alternatives = [...byPhrase.keys()].sort((a, b) => b.length - a.length).map(escape).join("|");
    const re = new RegExp(`(?<![a-z])(?:${alternatives})(?![a-z])`, "gi");
    for (const m of hint.matchAll(re)) found.push({ at: m.index, text: m[0], term: byPhrase.get(m[0].toLowerCase())! });
  }
  // A term matched inside a longer word: "a" inside "4ac", found once, in the first occurrence of that word.
  for (const t of terms) {
    if (!t.within) continue;
    const ctx = hint.indexOf(t.within);
    if (ctx < 0) continue;
    const at = hint.indexOf(t.phrase, ctx);
    if (at >= 0 && at + t.phrase.length <= ctx + t.within.length) found.push({ at, text: t.phrase, term: t });
  }
  found.sort((a, b) => a.at - b.at || b.text.length - a.text.length);
  const out: HintSegment[] = [];
  let cursor = 0;
  for (const f of found) {
    if (f.at < cursor) continue;
    if (f.at > cursor) out.push({ text: hint.slice(cursor, f.at) });
    out.push({ text: f.text, term: f.term });
    cursor = f.at + f.text.length;
  }
  if (cursor < hint.length) out.push({ text: hint.slice(cursor) });
  return out;
}

/**
 * Wraps every fragment the terms point at in an `\htmlClass{hint-term}` group, adding
 * `hint-term-lit` to the fragments of the lit term. Every fragment is always wrapped so lighting
 * one changes colour only, never the typeset layout (KaTeX gives the group no spacing of its
 * own). First whole occurrence of each fragment: not a superscript or subscript, not part of a
 * longer number or of a command name, so "2" in `x^2 + 2x` is the coefficient; a scoped fragment
 * (`{ tex, within }`) is the first whole occurrence inside its `within`, which is how a later
 * "2" is named. A fragment inside a longer one is wrapped inside it, so "10" can light within
 * "10x"; two terms naming the same piece share one box, lit when either is the lit term; a
 * fragment the TeX does not contain is left alone. Two fragments that abut, like the two factors of a product, get a thin
 * space (`\\;`) between them so each reads as its own box. Needs KaTeX's `trust` option, which
 * `components/Math` sets.
 */
export function termTex(tex: string, terms: HintTerm[] = [], lit?: HintTerm): string {
  const keyOf = (f: TexFragment): string | null => {
    const at = locateFragment(tex, f);
    return at < 0 ? null : `${at}:${at + fragmentTex(f).length}`;
  };
  const litKeys = new Set((lit?.tex ?? []).map(keyOf));
  const spans = new Map<string, Span>();
  for (const f of terms.flatMap((t) => t.tex)) {
    const key = keyOf(f);
    if (!key) continue;
    const [at, end] = key.split(":").map(Number);
    spans.set(key, { at, end, lit: litKeys.has(key) || !!spans.get(key)?.lit });
  }
  const wrapped = spans.size ? wrap(tex, [...spans.values()]) : tex;
  return lit?.insert ? conjure(wrapped, lit.insert) : wrapped;
}

/** The text a fragment stands for, as written in the TeX. */
export const fragmentTex = (f: TexFragment): string => (typeof f === "string" ? f : f.tex);

/** Where a fragment sits in the TeX: its first whole occurrence, or for the scoped form the first whole occurrence inside the first occurrence of `within`; -1 when either is absent. */
export function locateFragment(tex: string, f: TexFragment): number {
  if (typeof f === "string") return findFragment(tex, f);
  const outer = findFragment(tex, f.within);
  if (outer < 0) return -1;
  const inner = findFragment(f.within, f.tex);
  return inner < 0 ? -1 : outer + inner;
}

/** Puts a lit fragment the problem does not write (the 1 in front of x²) just before `before`, or leaves the TeX alone when `before` is absent. */
function conjure(tex: string, insert: { before: string; tex: string }): string {
  const at = findFragment(tex, insert.before);
  return at < 0 ? tex : `${tex.slice(0, at)}\\htmlClass{hint-term hint-term-lit}{${insert.tex}}${tex.slice(at)}`;
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

/** One located fragment: `[at, end)` in the TeX it was found in, and whether it is lit. */
interface Span {
  at: number;
  end: number;
  lit: boolean;
}

/** Wraps each span in order; a span inside a longer one is wrapped inside it, positions shifted to the outer span's text. */
function wrap(tex: string, spans: Span[]): string {
  const sorted = [...spans].sort((a, b) => a.at - b.at || b.end - a.end);
  let out = "";
  let cursor = 0;
  let lastEnd = -1;
  for (const s of sorted) {
    if (s.at < cursor) continue;
    const text = tex.slice(s.at, s.end);
    const inner = sorted.filter((x) => x !== s && x.at >= s.at && x.end <= s.end).map((x) => ({ at: x.at - s.at, end: x.end - s.at, lit: x.lit }));
    const body = inner.length ? wrap(text, inner) : text;
    const gap = s.at === lastEnd ? "\\;" : "";
    out += tex.slice(cursor, s.at) + gap + `\\htmlClass{${s.lit ? "hint-term hint-term-lit" : "hint-term"}}{${body}}`;
    cursor = s.end;
    lastEnd = s.end;
  }
  return out + tex.slice(cursor);
}

const MSPACE = /^<span class="mspace" style="[^"]*"><\/span>/;

/**
 * KaTeX places the spacing between a `\\htmlClass` group and its neighbours inside the group, so a
 * lit fragment's box would run into the space before "=" or after "+". Moves any leading or
 * trailing `mspace` of every `hint-term` span outside it, so the box hugs the fragment and the
 * layout is unchanged. Pure string surgery on KaTeX's own markup; anything else passes through.
 */
export function hoistSpacing(html: string): string {
  const open = /<span class="enclosing hint-term[^"]*">/g;
  let out = "";
  let cursor = 0;
  for (const m of html.matchAll(open)) {
    if (m.index < cursor) continue;
    const start = m.index + m[0].length;
    const end = closeOf(html, start);
    if (end < 0) break;
    let inner = hoistSpacing(html.slice(start, end));
    let before = "";
    let after = "";
    const lead = inner.match(MSPACE);
    if (lead) {
      before = lead[0];
      inner = inner.slice(lead[0].length);
    }
    const tail = inner.match(/<span class="mspace" style="[^"]*"><\/span>$/);
    if (tail) {
      after = tail[0];
      inner = inner.slice(0, -tail[0].length);
    }
    out += html.slice(cursor, m.index) + before + m[0] + inner + "</span>" + after;
    cursor = end + "</span>".length;
  }
  return out + html.slice(cursor);
}

/** Index of the `</span>` that closes a span whose content starts at `from`, or -1. */
function closeOf(html: string, from: number): number {
  const tag = /<span\b[^>]*>|<\/span>/g;
  tag.lastIndex = from;
  let depth = 0;
  for (const m of html.matchAll(tag)) {
    if (m.index < from) continue;
    if (m[0] === "</span>") {
      if (depth === 0) return m.index;
      depth--;
    } else depth++;
  }
  return -1;
}
