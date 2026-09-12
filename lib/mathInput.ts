import katex from "katex";

/**
 * The teacher's typed question, read into prose and maths (ticket 119). A teacher types one
 * plain line, "Solve for x. x**2 + 5x + 6 = 0", in the shorthand of a calculator or a
 * programming language rather than TeX: `**` or `^` for a power, `/` for a fraction, `sqrt(2)`,
 * `pi`, `<=`. This module finds the maths in the line, turns each run of it into TeX, and
 * decides which run is the centred expression under the prose, the shape of the student's
 * problem card (`stem` + `tex` on `Problem`).
 *
 * Detection is by token. A token is *strong* when it can only be maths: it holds a digit, one
 * of `^ * / = < >`, or is a bare operator (`+`, `-`, `=`, `<=`, `+-`), or a call such as
 * `sqrt(`. A single letter (`x`, `k`) is *weak*: maths only when it sits in a run with a strong
 * token, so "for x." and "a ball" stay prose while "y = x**2" is maths. A token ending in
 * sentence punctuation can only close a run, so "Solve for x. x**2 = 4" is two sentences, not
 * one run. Everything else is prose.
 *
 * Two things arrived with the extraction funnel (ticket 171). A run between dollars, `$y =
 * x^2$`, is maths by declaration: it is kept as one inline segment with its TeX as written,
 * and it never becomes the centred expression (an explicit inline stays inline). And a line
 * that is already TeX (a `\command` or a brace group) passes through `toTex` untouched, so an
 * uploaded question, whose tile text is the model's TeX, re-renders as the model wrote it.
 */

export type Segment = { kind: "text"; text: string } | { kind: "math"; tex: string; raw: string; explicit?: true };

export interface ParsedQuestion {
  /** The prose, with inline maths as TeX segments. */
  stem: Segment[];
  /** The centred expression under the prose, or null when the question is prose alone. */
  tex: string | null;
  /** The typed form of `tex`, for a fallback when it will not typeset. */
  raw: string | null;
}

const SENTENCE_END = /[.,;:?!]+$/;
const STRONG = /\d|[\^*\/=<>]|^[+\-±×]$|^(sqrt|sin|cos|tan|log|ln|exp)\(/;
const WEAK = /^[A-Za-z]$/;
const OPERATOR = /^([+\-=<>±×*\/]|<=|>=|!=|\+-)$/;
const FUNCTIONS = ["sqrt", "sin", "cos", "tan", "log", "ln", "exp"];

interface Token {
  text: string;
  /** The whitespace that preceded it in the source. */
  gap: string;
  strong: boolean;
  weak: boolean;
  /** Ends with sentence punctuation, so it can only close a run. */
  closes: boolean;
}

function tokenise(line: string): Token[] {
  const out: Token[] = [];
  const re = /(\s*)(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const text = m[2];
    const body = text.replace(SENTENCE_END, "");
    out.push({ text, gap: m[1], strong: STRONG.test(body), weak: WEAK.test(body), closes: SENTENCE_END.test(text) && body.length > 0 });
  }
  return out;
}

/** Runs of maths in one line of prose: each run is a contiguous span of tokens with at least one strong token. */
function segmentLine(line: string): Segment[] {
  const tokens = tokenise(line);
  const segs: Segment[] = [];
  let text = "";
  let i = 0;
  const flush = () => {
    if (text) segs.push({ kind: "text", text });
    text = "";
  };
  while (i < tokens.length) {
    const t = tokens[i];
    if (!(t.strong || t.weak)) {
      text += t.gap + t.text;
      i++;
      continue;
    }
    // A candidate run: strong and weak tokens until a prose token, or just after a closing one.
    let j = i;
    let anyStrong = false;
    while (j < tokens.length && (tokens[j].strong || tokens[j].weak)) {
      anyStrong ||= tokens[j].strong;
      j++;
      if (tokens[j - 1].closes) break;
    }
    if (!anyStrong) {
      for (let k = i; k < j; k++) text += tokens[k].gap + tokens[k].text;
      i = j;
      continue;
    }
    // A weak token at the run's tail is prose ("x = 2 a second time") unless an operator holds it ("+ k").
    while (j - 1 > i && tokens[j - 1].weak && !tokens[j - 1].closes && !OPERATOR.test(tokens[j - 2].text)) j--;
    const last = tokens[j - 1];
    const trail = last.closes ? (last.text.match(SENTENCE_END)?.[0] ?? "") : "";
    const raw = tokens
      .slice(i, j)
      .map((tk, k) => (k === 0 ? "" : tk.gap) + (tk === last && trail ? tk.text.slice(0, -trail.length) : tk.text))
      .join("");
    text += tokens[i].gap;
    flush();
    segs.push({ kind: "math", tex: toTex(raw), raw });
    if (trail) text += trail;
    i = j;
  }
  flush();
  return segs;
}

/**
 * The typed shorthand as TeX. Handled: `**`/`^` powers (with a bracketed or signed exponent),
 * `_` subscripts, `a/b` as a stacked fraction binding to the atoms either side (`1/3x**2` is
 * ⅓x², `(x+1)/(x-2)` a full fraction), `*` gone between a number and a letter and `\times`
 * between two numbers, `sqrt(...)`, `pi`, `inf`, `<= >= != +-`, upright function names, and the
 * unicode a teacher might paste (`×`, `−`, `²`, `³`, `≤`, `≥`, `≠`, `±`). Anything else passes
 * through to KaTeX as typed.
 */
export function toTex(raw: string): string {
  if (isTex(raw)) return raw.trim().replace(/\s+/g, " ");
  let s = raw.trim();
  s = s.replace(/\*\*/g, "^").replace(/−/g, "-").replace(/×/g, "*").replace(/²/g, "^2").replace(/³/g, "^3");
  s = s.replace(/<=|≤/g, "\\le ").replace(/>=|≥/g, "\\ge ").replace(/!=|≠/g, "\\ne ").replace(/\+-|±/g, "\\pm ");
  s = s.replace(/\bpi\b/g, "\\pi ").replace(/\binf(inity)?\b/g, "\\infty ");
  s = s.replace(new RegExp(`\\b(${FUNCTIONS.join("|")})\\(`, "g"), (_, f: string) => (f === "sqrt" ? "\\sqrt(" : `\\${f}(`));
  s = sqrtGroups(s);
  s = scripts(s, "^");
  s = scripts(s, "_");
  s = fractions(s);
  s = s.replace(/(\d)\s*\*\s*(\d)/g, "$1 \\times $2").replace(/\s*\*\s*/g, "");
  return s.replace(/\s+/g, " ").trim();
}

/** Whether a run is TeX already (a `\command` or a brace group) rather than the typing shorthand, so it is left as written. */
export const isTex = (raw: string): boolean => /\\[A-Za-z]+|[{}]/.test(raw);

/** The index just past the group that opens at `open` (a `(`), or -1 when unbalanced. */
function closeOf(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i + 1;
  }
  return -1;
}

/** `\sqrt(…)` as `\sqrt{…}`. */
function sqrtGroups(s: string): string {
  let at = s.indexOf("\\sqrt(");
  while (at !== -1) {
    const open = at + 5;
    const end = closeOf(s, open);
    if (end === -1) break;
    s = s.slice(0, at) + "\\sqrt{" + s.slice(open + 1, end - 1) + "}" + s.slice(end);
    at = s.indexOf("\\sqrt(", at + 6);
  }
  return s;
}

/** `x^10`, `e^(2x)`, `x^-1` as `x^{10}`, `e^{2x}`, `x^{-1}` (and the same for `_`). */
function scripts(s: string, mark: "^" | "_"): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] !== mark) {
      out += s[i++];
      continue;
    }
    let j = i + 1;
    while (s[j] === " ") j++;
    if (s[j] === "(") {
      const end = closeOf(s, j);
      if (end !== -1) {
        out += `${mark}{${s.slice(j + 1, end - 1)}}`;
        i = end;
        continue;
      }
    }
    if (s[j] === "{") {
      out += s[i++];
      continue;
    }
    const m = /^-?[A-Za-z0-9.]+|^\\[a-z]+/.exec(s.slice(j));
    if (m) {
      out += `${mark}{${m[0]}}`;
      i = j + m[0].length;
    } else out += s[i++];
  }
  return out;
}

const ATOM_TAIL = /(\\[a-z]+(?:\{[^}]*\})*|-?\d+(?:\.\d+)?|[A-Za-z])(?:[\^_]\{[^}]*\})*$/;
const ATOM_HEAD = /^(\\[a-z]+(?:\{[^}]*\})*|-?\d+(?:\.\d+)?|[A-Za-z])(?:[\^_]\{[^}]*\})*/;

/** `a/b` as `\frac{a}{b}`, each side an atom: a bracketed group, a number, or a letter or command with its scripts. */
function fractions(s: string): string {
  let at = s.indexOf("/");
  while (at !== -1) {
    const left = s.slice(0, at).replace(/\s+$/, "");
    const right = s.slice(at + 1).replace(/^\s+/, "");
    let num: string | null = null;
    let numStart = left.length;
    if (left.endsWith(")")) {
      const open = openOf(left, left.length - 1);
      if (open !== -1) {
        num = left.slice(open + 1, -1);
        numStart = open;
      }
    } else {
      const m = ATOM_TAIL.exec(left);
      if (m) {
        num = m[0];
        numStart = left.length - m[0].length;
      }
    }
    let den: string | null = null;
    let denEnd = 0;
    if (right.startsWith("(")) {
      const end = closeOf(right, 0);
      if (end !== -1) {
        den = right.slice(1, end - 1);
        denEnd = end;
      }
    } else {
      const m = ATOM_HEAD.exec(right);
      if (m) {
        den = m[0];
        denEnd = m[0].length;
      }
    }
    if (num !== null && den !== null) {
      s = `${left.slice(0, numStart)}\\frac{${num}}{${den}}${right.slice(denEnd)}`;
      at = s.indexOf("/", numStart + 7 + num.length + den.length);
    } else at = s.indexOf("/", at + 1);
  }
  return s;
}

/** The index of the `(` that the `)` at `close` closes, or -1. */
function openOf(s: string, close: number): number {
  let depth = 0;
  for (let i = close; i >= 0; i--) {
    if (s[i] === ")") depth++;
    else if (s[i] === "(" && --depth === 0) return i;
  }
  return -1;
}

const DOLLARS = /\$([^$\n]+)\$/g;

/** A line of prose with its maths: `$…$` runs as explicit inline segments, the shorthand found by token in the text between them. */
function segmentText(line: string): Segment[] {
  const segs: Segment[] = [];
  let at = 0;
  for (const m of line.matchAll(DOLLARS)) {
    segs.push(...prose(line.slice(at, m.index)));
    const tex = m[1].trim();
    if (tex) segs.push({ kind: "math", tex, raw: m[0], explicit: true });
    at = m.index + m[0].length;
  }
  segs.push(...prose(line.slice(at)));
  return mergeText(segs);
}

/** A stretch of the line between dollar runs, read by token; the whitespace at its ends, which the tokeniser drops, kept as text so "of $y$" keeps its space. */
function prose(chunk: string): Segment[] {
  if (!chunk) return [];
  const lead = chunk.match(/^\s*/)?.[0] ?? "";
  const trail = chunk.trim() ? (chunk.match(/\s*$/)?.[0] ?? "") : "";
  const inner = chunk.trim();
  const out: Segment[] = [];
  if (lead) out.push({ kind: "text", text: lead });
  if (inner) out.push(...segmentLine(inner));
  if (trail) out.push({ kind: "text", text: trail });
  return out;
}

/** Adjacent text segments as one (the pieces around a dollar run come back separately). */
function mergeText(segs: Segment[]): Segment[] {
  const out: Segment[] = [];
  for (const s of segs) {
    const last = out[out.length - 1];
    if (s.kind === "text" && last?.kind === "text") out[out.length - 1] = { kind: "text", text: last.text + s.text };
    else out.push(s);
  }
  return out;
}

/** A run wrapped in dollars, unwrapped: the newline form of a question may carry its expression as `$…$`. */
const undollar = (s: string): string => (/^\$[^$]+\$$/.test(s) ? s.slice(1, -1).trim() : s);

/**
 * One typed question as the student's card shows it: prose, then the centred expression. The
 * expression is the last maths run when it ends the text (a trailing full stop allowed); a
 * newline in the text forces the split there instead, whatever follows it read whole as maths.
 * An explicit `$…$` run is inline by declaration and is never taken as the expression.
 */
export function parseQuestion(text: string): ParsedQuestion {
  const nl = text.indexOf("\n");
  if (nl !== -1) {
    const after = undollar(text.slice(nl + 1).replace(/\s+/g, " ").trim());
    const stem = segmentText(text.slice(0, nl).trim());
    return after ? { stem, tex: toTex(after), raw: after } : { stem, tex: null, raw: null };
  }
  const segs = segmentText(text.trim());
  const last = segs[segs.length - 1];
  const tail = last?.kind === "text" ? segs[segs.length - 2] : last;
  const endsInMath = last?.kind === "math" || (last?.kind === "text" && /^[.]$/.test(last.text.trim()) && tail?.kind === "math");
  if (!endsInMath || !tail || tail.kind !== "math" || tail.explicit) return { stem: segs, tex: null, raw: null };
  const stem = segs.slice(0, segs.indexOf(tail));
  const lastStem = stem[stem.length - 1];
  if (lastStem?.kind === "text") stem[stem.length - 1] = { kind: "text", text: lastStem.text.replace(/\s+$/, "") };
  return { stem: stem.filter((s) => s.kind !== "text" || s.text), tex: tail.tex, raw: tail.raw };
}

/** Whether KaTeX can set the TeX at all; a run it cannot is shown as typed instead of in red. */
export function typesets(tex: string): boolean {
  try {
    katex.renderToString(tex, { throwOnError: true, strict: false, trust: true });
    return true;
  } catch {
    return false;
  }
}

/** The prose as one string with inline maths as `$…$`, the form kept on the draft for the next screen. */
export function stemText(stem: Segment[]): string {
  return stem.map((s) => (s.kind === "text" ? s.text : `$${s.tex}$`)).join("");
}

/**
 * The create screen's text for a question that arrived as a stem and an expression rather than
 * as typing (ticket 171): the stem on the first line, the TeX on the second, the newline form
 * `parseQuestion` reads back into the same stem and expression. No stem: the TeX alone; no
 * expression: the stem with a newline after it, so the prose is read as prose whatever it ends
 * in (a bare "…after 5 seconds." would otherwise have its last run taken as the expression).
 */
export function draftText(stem: string, tex: string | null): string {
  const s = stem.trim();
  if (!tex) return s ? `${s}\n` : "";
  return s ? `${s}\n${tex}` : tex;
}

/** The questions in one pasted block: one per non-empty line. */
export function splitPaste(clip: string): string[] {
  return clip
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
