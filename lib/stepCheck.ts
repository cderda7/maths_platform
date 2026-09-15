import type { MisconceptionId } from "@/data/misconceptions";
import type { SolutionStep } from "@/data/types";
import { isTex, toTex } from "./mathInput";
import { expressionAt, tokenizeTex, type TexNode, type TexToken } from "./texEval";

/**
 * The line check for a blank step (ticket 311): whether a line a student writes into a step left blank is that step.
 * A blank has one known line, so this is not marking in general, only "is the written line the same statement as the
 * expected one?". It knows nothing about where the step came from (a Q** question, a warm-up completion problem, a
 * set's own solution): it takes the step's TeX and skill tags and the line as recognised.
 *
 * **Same statement, decided by form.** Both lines are read with the app's one TeX grammar (`lib/texEval.ts`; typed
 * shorthand first goes through `toTex` from `lib/mathInput.ts`) into a canonical form, and the line is right exactly
 * when the two forms are equal. The form forgets what a reader would call the same writing: spacing; `\cdot`, `\times`
 * and side by side; the order of factors in a product and of terms in a sum; brackets that group nothing; `a - b` as
 * `a + (-b)`; a minus in front of a bracket standing alone carried in (`-(x - 2)` is `2 - x`, while `-(x - 4)(x + 2)`
 * keeps its minus in front); `\frac`, `\tfrac`, `\dfrac` and `/`, a minus on a fraction's top or bottom moved in front;
 * the two sides of an equation swapped (an inequality's sign turned with them); the statements of a line joined by
 * "or", "and", a comma or a colon in any order; `x = 2, 3` as `x = 2, x = 3`; words in `\text{…}` by their words
 * (case, punctuation and spacing aside); a `\checkmark`. It keeps everything that makes a step a step: nothing is
 * multiplied out, collected or worked out, so `x^2 - 5x + 6 = 0` is not `(x - 2)(x - 3) = 0`, `\tfrac{6}{2}` is not
 * `3`, `6x` is not `2 \cdot 3x`, `0.5` is not `\tfrac{1}{2}`, and a flipped sign or a missing factor is a different
 * statement. See DECISION_LOG.md, "A blank step is checked by form, not by value".
 *
 * **Wrong, with the misconception when the slip is a known one.** A wrong line is compared with the expected line
 * slip by slip (`SLIPS`): each slip either rebuilds the expected line the way that slip would have written it (the
 * signs in a factor pair flipped, the `2` of `2a` dropped) and asks whether that is the written line, or finds the one
 * place the two lines differ and reads it (a pair that multiplies right and adds wrong). The first slip that fits
 * names the misconception id from `data/misconceptions.ts`; a wrong line no slip fits is wrong with no id.
 *
 * **Unreadable** is a line the grammar cannot read at all: empty, unbalanced, an unknown command. A step whose own
 * TeX cannot be read is an authoring error and throws; the tests read every step.
 */

export type StepCheck = { result: "right" } | { result: "wrong"; misconception?: MisconceptionId } | { result: "unreadable" };

/** What the check needs of a step: its line and the skills it exercises. */
export type BlankStep = Pick<SolutionStep, "tex" | "tags">;

// ---------------------------------------------------------------------------------------------------------------
// The canonical form

type Sign = "+" | "-" | "±";
type Factor =
  | { f: "num"; p: number; q: number }
  | { f: "id"; v: string }
  | { f: "pow"; base: Sum; exp: Sum }
  | { f: "sqrt"; arg: Sum }
  | { f: "frac"; num: Sum; den: Sum }
  /** A bracket of two or more terms, as a factor of a product. */
  | { f: "group"; sum: Sum }
  | { f: "tuple"; items: Sum[] }
  /** The place a slip is looked at, when two lines are compared everywhere else. */
  | { f: "hole" };
interface Term {
  sign: Sign;
  /** Unordered: keys sort them. Numbers are kept apart (`2 \times 4` stays two factors), their sign on the term. */
  factors: Factor[];
}
/** Unordered terms. */
type Sum = Term[];
type Piece = { text: string } | { sum: Sum };
/** One statement: items joined by relations. `items[0]` is null for a line that opens on its relation (`= 18 - 3 - 5 = 10`). */
interface Chain {
  items: (Piece[] | null)[];
  rels: string[];
}
/** Statements joined by "or", "and" or a comma: unordered. */
type Part = Chain[];
/** Parts joined by `\Rightarrow`: ordered. */
type Line = Part[];

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** A number as written, as an exact fraction: "0.25" is 1/4. */
function numberFactor(raw: string): Factor {
  const [whole, frac = ""] = raw.split(".");
  const p = Number((whole || "0") + frac);
  const q = 10 ** frac.length;
  const g = gcd(p, q) || 1;
  return { f: "num", p: p / g, q: q / g };
}

const flip = (s: Sign): Sign => (s === "+" ? "-" : s === "-" ? "+" : "±");
const negate = (s: Sum): Sum => s.map((t) => ({ ...t, sign: flip(t.sign) }));
const group = (s: Sum): Factor => ({ f: "group", sum: s });
/** A sum as one term: itself when it is one, else a bracket. */
const asTerm = (s: Sum): Term => (s.length === 1 ? s[0] : { sign: "+", factors: [group(s)] });
const plusMinus = (s: Sum): Sum => (s.length === 1 ? [{ ...s[0], sign: "±" }] : [{ sign: "±", factors: [group(s)] }]);
const signTimes = (a: Sign, b: Sign): Sign => (a === "±" || b === "±" ? "±" : a === b ? "+" : "-");

/** A term that is a single bracket, opened into the sum around it (`-(x - 2)` as `-x + 2`). */
function opened(t: Term): Term[] {
  if (t.factors.length !== 1 || t.factors[0].f !== "group") return [t];
  const inner = t.factors[0].sum;
  return t.sign === "+" ? inner : t.sign === "-" ? negate(inner) : [t];
}

/** A sum that is a single signed number (`-3`, `\tfrac{1}{2}`, `2 \times 4`), as an exact fraction; null otherwise. */
function rationalOf(s: Sum): { p: number; q: number } | null {
  if (s.length !== 1 || s[0].sign === "±" || s[0].factors.length === 0) return null;
  let p = s[0].sign === "-" ? -1 : 1;
  let q = 1;
  for (const f of s[0].factors) {
    if (f.f === "num") {
      p *= f.p;
      q *= f.q;
    } else if (f.f === "frac") {
      const n = rationalOf(f.num);
      const d = rationalOf(f.den);
      if (!n || !d || d.p === 0) return null;
      p *= n.p * d.q;
      q *= n.q * d.p;
    } else return null;
  }
  return q < 0 ? { p: -p, q: -q } : { p, q };
}
const valueOf = (s: Sum): number | null => {
  const r = rationalOf(s);
  return r ? r.p / r.q : null;
};

function numberSum(p: number, q: number): Sum {
  const g = gcd(Math.abs(p), q) || 1;
  return [{ sign: p < 0 ? "-" : "+", factors: [{ f: "num", p: Math.abs(p) / g, q: q / g }] }];
}

/** A fraction as written: never worked out (`\tfrac{6}{2}` is not 3), a minus on its top or bottom moved in front. */
function quotient(num: Sum, den: Sum): Sum {
  let sign: Sign = "+";
  const unsign = (s: Sum): Sum => {
    if (s.length === 1 && s[0].sign === "-") {
      sign = flip(sign);
      return [{ ...s[0], sign: "+" }];
    }
    return s;
  };
  const top = unsign(num);
  const bottom = unsign(den);
  return [{ sign, factors: [{ f: "frac", num: top, den: bottom }] }];
}

/** One side of a product as a term: a minus in front of a bracket stays in front of the product (`-(x - 4)(x + 2)`), never carried into the bracket. */
function factorOf(n: TexNode): Term {
  if (n.k === "neg") {
    const t = factorOf(n.a);
    return { ...t, sign: flip(t.sign) };
  }
  return asTerm(sumOf(n));
}

function sumOf(n: TexNode): Sum {
  switch (n.k) {
    case "num":
      return [{ sign: "+", factors: [numberFactor(n.raw)] }];
    case "id":
      return [{ sign: "+", factors: [{ f: "id", v: n.v }] }];
    case "add":
      return [...sumOf(n.a), ...sumOf(n.b)];
    case "sub":
      return [...sumOf(n.a), ...negate(sumOf(n.b))];
    case "pm":
      return [...sumOf(n.a), ...plusMinus(sumOf(n.b))];
    case "neg":
      return negate(sumOf(n.a));
    case "upm":
      return plusMinus(sumOf(n.a));
    case "mul": {
      const a = factorOf(n.a);
      const b = factorOf(n.b);
      return [{ sign: signTimes(a.sign, b.sign), factors: [...a.factors, ...b.factors] }];
    }
    case "div":
      return quotient(sumOf(n.a), sumOf(n.b));
    case "pow":
      return [{ sign: "+", factors: [{ f: "pow", base: sumOf(n.a), exp: sumOf(n.b) }] }];
    case "sqrt":
      return [{ sign: "+", factors: [{ f: "sqrt", arg: sumOf(n.a) }] }];
    case "tuple":
      return [{ sign: "+", factors: [{ f: "tuple", items: n.items.map(sumOf) }] }];
  }
}

// Keys: two forms are the same exactly when their keys are equal.

function factorKey(f: Factor): string {
  switch (f.f) {
    case "num":
      return f.q === 1 ? `${f.p}` : `${f.p}/${f.q}`;
    case "id":
      return f.v;
    case "pow":
      return `^[${sumKey(f.base)}][${sumKey(f.exp)}]`;
    case "sqrt":
      return `√[${sumKey(f.arg)}]`;
    case "frac":
      return `frac[${sumKey(f.num)}][${sumKey(f.den)}]`;
    case "group":
      return `(${sumKey(f.sum)})`;
    case "tuple":
      return `<${f.items.map(sumKey).join(" , ")}>`;
    case "hole":
      return "□";
  }
}
const termKey = (t: Term): string => t.sign + t.factors.map(factorKey).sort().join("·");
const sumKey = (s: Sum): string => s.map(termKey).sort().join(" ");
const normText = (s: string): string => s.toLowerCase().replace(/[.,!?;:]/g, " ").replace(/\s+/g, " ").trim();
const itemKey = (it: Piece[] | null): string => (it === null ? "∅" : it.map((p) => ("text" in p ? `"${p.text}"` : `{${sumKey(p.sum)}}`)).join(" "));
const TURNED: Record<string, string> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };
function chainKey(c: Chain): string {
  const join = (items: (Piece[] | null)[], rels: string[]) => items.map((it, i) => (i === 0 ? itemKey(it) : ` ${rels[i - 1]} ${itemKey(it)}`)).join("");
  const forward = join(c.items, c.rels);
  if (c.items[0] === null) return forward;
  const backward = join([...c.items].reverse(), [...c.rels].reverse().map((r) => TURNED[r] ?? r));
  return forward < backward ? forward : backward;
}
const partKey = (p: Part): string => p.map(chainKey).sort().join(" ; ");
const lineKey = (l: Line): string => l.map(partKey).join(" ⇒ ");

// Reading a line

const EXPRESSION_START = (k: TexToken | undefined) =>
  !!k && (k.t === "num" || k.t === "id" || (k.t === "op" && "({-+".includes(k.v)) || (k.t === "cmd" && ["frac", "tfrac", "dfrac", "sqrt", "pm"].includes(k.v)));
const isSeparator = (k: TexToken | undefined) => !!k && ((k.t === "op" && (k.v === "," || k.v === ";" || k.v === ":")) || (k.t === "text" && /^(or|and)$/.test(normText(k.v))));

/** A line as the canonical form, or null when it cannot be read. Typed shorthand (`x = 1/3 or x = -2`) is turned into TeX first. */
function readLine(written: string): Line | null {
  const raw = written.trim();
  if (!raw) return null;
  const tex = isTex(raw) ? raw : toTex(raw);
  try {
    const tokens = tokenizeTex(tex);
    let p = 0;
    const item = (): Piece[] => {
      const pieces: Piece[] = [];
      for (;;) {
        const k = tokens[p];
        if (k?.t === "text" && !isSeparator(k)) {
          let text = normText(k.v);
          p++;
          // A unit squared after its words: "\text{ cm}^2".
          const power = tokens[p]?.t === "op" && (tokens[p] as { v: string }).v === "^" ? tokens[p + 1] : undefined;
          if (power?.t === "num") {
            text += `^${power.raw}`;
            p += 2;
          }
          if (text) pieces.push({ text });
        } else if (EXPRESSION_START(k)) {
          const { node, end } = expressionAt(tokens, p, tex);
          pieces.push({ sum: sumOf(node) });
          p = end;
        } else break;
      }
      if (pieces.length === 0) throw new Error(`nothing to read at ${p} in ${tex}`);
      return pieces;
    };
    const chain = (): Chain => {
      const items: (Piece[] | null)[] = [tokens[p]?.t === "rel" ? null : item()];
      const rels: string[] = [];
      while (tokens[p]?.t === "rel") {
        rels.push((tokens[p] as { v: string }).v);
        p++;
        items.push(item());
      }
      return { items, rels };
    };
    const part = (): Part => {
      const chains = [chain()];
      while (isSeparator(tokens[p])) {
        p++;
        const next = chain();
        const prev = chains[chains.length - 1];
        // "x = 2, 3": a bare value after "x = …" is another value of x.
        const bare = next.items.length === 1 && next.items[0]!.length === 1 && "sum" in next.items[0]![0];
        const named = prev.items.length === 2 && prev.rels[0] === "=" && soleId(prev.items[0]) !== null;
        chains.push(bare && named ? { items: [prev.items[0], next.items[0]], rels: ["="] } : next);
      }
      return chains;
    };
    const line: Line = [part()];
    while (tokens[p]?.t === "imp") {
      p++;
      line.push(part());
    }
    return p === tokens.length ? line : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The check

/** Whether a written line is the step: right, wrong (with the misconception when the slip is a known one), or unreadable. */
export function checkStep(step: BlankStep, written: string): StepCheck {
  const expected = readLine(step.tex);
  if (!expected) throw new Error(`step does not read: ${step.tex}`);
  const got = readLine(written);
  if (!got) return { result: "unreadable" };
  if (lineKey(got) === lineKey(expected)) return { result: "right" };
  const leaves = step.tags.map((t) => t.leaf as string);
  for (const slip of SLIPS) {
    const misconception = slip(expected, got, leaves);
    if (misconception) return { result: "wrong", misconception };
  }
  return { result: "wrong" };
}

/** Whether a step's TeX reads at all (the tests hold every authored step to it). */
export const readsAsStep = (tex: string): boolean => readLine(tex) !== null;

type Slip = (expected: Line, got: Line, leaves: string[]) => MisconceptionId | null;

// Walking a line's terms

/** The line rebuilt with `fn` asked about every term, outside in: a list replaces the term in its sum, undefined keeps it and looks inside. */
function mapLine(line: Line, fn: (t: Term) => Term[] | undefined): Line {
  const mapSum = (s: Sum): Sum => s.flatMap((t) => fn(t) ?? [{ sign: t.sign, factors: t.factors.map(mapFactor) }]);
  const mapFactor = (f: Factor): Factor => {
    switch (f.f) {
      case "pow":
        return { f: "pow", base: mapSum(f.base), exp: mapSum(f.exp) };
      case "sqrt":
        return { f: "sqrt", arg: mapSum(f.arg) };
      case "frac":
        return { f: "frac", num: mapSum(f.num), den: mapSum(f.den) };
      case "group":
        return { f: "group", sum: mapSum(f.sum) };
      case "tuple":
        return { f: "tuple", items: f.items.map(mapSum) };
      default:
        return f;
    }
  };
  return line.map((part) => part.map((c) => ({ rels: c.rels, items: c.items.map((it) => it && it.map((pc) => ("sum" in pc ? { sum: mapSum(pc.sum) } : pc))) })));
}

const termsOf = (line: Line): Term[] => {
  const out: Term[] = [];
  mapLine(line, (t) => {
    out.push(t);
    return undefined;
  });
  return out;
};

/** The line with its `i`-th term (in `termsOf` order) replaced. */
function replaced(line: Line, i: number, by: Term[]): Line {
  let j = 0;
  return mapLine(line, () => (j++ === i ? by : undefined));
}

/** A slip that rewrites one term of the expected line: the misconception when one of the rewrites is the written line. */
const rewrites =
  (id: MisconceptionId, variants: (t: Term) => Term[][]): Slip =>
  (expected, got) => {
    const target = lineKey(got);
    const terms = termsOf(expected);
    for (let i = 0; i < terms.length; i++) for (const v of variants(terms[i])) if (lineKey(replaced(expected, i, v)) === target) return id;
    return null;
  };

const HOLE: Term = { sign: "+", factors: [{ f: "hole" }] };

/** A slip read at the one place two lines differ: a term of each that `pick` accepts, with every other part of the two lines the same, judged side by side. */
const atOnePlace =
  (pick: (t: Term) => boolean, judge: (expected: Term, got: Term, leaves: string[]) => MisconceptionId | null): Slip =>
  (expected, got, leaves) => {
    const places = (line: Line) => termsOf(line).flatMap((t, i) => (pick(t) ? [{ t, frame: lineKey(replaced(line, i, [HOLE])) }] : []));
    const gotPlaces = places(got);
    for (const e of places(expected)) for (const g of gotPlaces) if (e.frame === g.frame) {
      const id = judge(e.t, g.t, leaves);
      if (id) return id;
    }
    return null;
  };

/** Every non-empty subset of `n` things as bit masks, the full set last; `proper` leaves the full set out. */
const masks = (n: number, proper = false): number[] => Array.from({ length: (1 << n) - (proper ? 2 : 1) }, (_, i) => i + 1);

/** A bracket `(ax + c)`: one term in a single variable to the first power, one number. */
function linearBracket(f: Factor): { v: string; a: number; c: number; constant: number } | null {
  if (f.f !== "group" || f.sum.length !== 2) return null;
  const ci = f.sum.findIndex((t) => rationalOf([t]) !== null);
  if (ci < 0) return null;
  const vt = f.sum[1 - ci];
  const ids = vt.factors.filter((x) => x.f === "id");
  const coef = vt.factors.filter((x) => x.f === "num");
  if (vt.sign === "±" || ids.length !== 1 || ids.length + coef.length !== vt.factors.length) return null;
  const a = (vt.sign === "-" ? -1 : 1) * coef.reduce((m, x) => m * ((x as { p: number }).p / (x as { q: number }).q), 1);
  return { v: (ids[0] as { v: string }).v, a, c: valueOf([f.sum[ci]])!, constant: ci };
}
const bracketsOf = (t: Term) => t.factors.flatMap((f, i) => {
  const b = linearBracket(f);
  return b ? [{ ...b, i }] : [];
});
const otherKeys = (t: Term, skip: number[]) => t.factors.filter((_, i) => !skip.includes(i)).map(factorKey).sort().join("·");
const withFactor = (t: Term, i: number, f: Factor): Term => ({ sign: t.sign, factors: t.factors.map((x, j) => (j === i ? f : x)) });
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const sameMultiset = (a: number[], b: number[]) => a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => near(v, [...b].sort((x, y) => x - y)[i]));

/** An item that is one variable alone (`x`), its name; null otherwise. */
function soleId(it: Piece[] | null): string | null {
  if (!it || it.length !== 1 || !("sum" in it[0])) return null;
  const s = it[0].sum;
  return s.length === 1 && s[0].sign === "+" && s[0].factors.length === 1 && s[0].factors[0].f === "id" ? s[0].factors[0].v : null;
}
const soleValue = (it: Piece[] | null): number | null => (it && it.length === 1 && "sum" in it[0] ? valueOf(it[0].sum) : null);

// The slips, in the order they are tried

/** `-x(x - 6)` written `-x(x + 6)`: a negative in front of a bracket that changed some of its signs and not the others. */
const minusNotDistributed = rewrites("minus-not-distributed", (t) => {
  const groups = t.factors.flatMap((f, i) => (f.f === "group" ? [i] : []));
  if (t.sign !== "-" || groups.length !== 1) return [];
  const gi = groups[0];
  const inner = (t.factors[gi] as { sum: Sum }).sum;
  if (inner.length > 6) return [];
  return masks(inner.length, true).map((m) => [withFactor(t, gi, group(inner.map((u, k) => (m & (1 << k) ? { ...u, sign: flip(u.sign) } : u))))]);
});

/** `(x - 2)(x - 3)` written `(x + 2)(x + 3)`: the right numbers in a factorisation's brackets, some signs flipped. */
const pairSignsSwapped = rewrites("pair-signs-swapped", (t) => {
  const bs = bracketsOf(t);
  if (bs.length < 2 || bs.length > 4) return [];
  return masks(bs.length).map((m) => {
    let out = t;
    bs.forEach((b, k) => {
      if (!(m & (1 << k))) return;
      const inner = (t.factors[b.i] as { sum: Sum }).sum.map((u, j) => (j === b.constant ? { ...u, sign: flip(u.sign) } : u));
      out = withFactor(out, b.i, group(inner));
    });
    return [out];
  });
});

/** Two monic brackets `(x + p)(x + q)` written with another pair: the product right and the sum wrong, or the other way round. */
const monicPair = (t: Term) => {
  const bs = bracketsOf(t);
  return bs.length === 2 && bs.every((b) => near(b.a, 1) && b.v === bs[0].v) ? bs : null;
};
const bracketPair = atOnePlace(
  (t) => monicPair(t) !== null,
  (e, g) => {
    const E = monicPair(e)!;
    const G = monicPair(g)!;
    if (e.sign !== g.sign || E[0].v !== G[0].v || otherKeys(e, E.map((b) => b.i)) !== otherKeys(g, G.map((b) => b.i))) return null;
    const [p, q] = E.map((b) => b.c);
    const [r, s] = G.map((b) => b.c);
    if (sameMultiset([p, q], [r, s])) return null;
    if (near(r * s, p * q) && !near(r + s, p + q)) return "pair-sum-wrong";
    if (near(r + s, p + q) && !near(r * s, p * q)) return "pair-product-wrong";
    return null;
  },
);

/** "2 × 4 = 8, 2 + 4 = 6" written "1 × 8 = 8, 1 + 8 = 9": a pair stated as its product and its sum. */
function statedPair(line: Line): { product: number; sum: number; productIs: number; sumIs: number; pair: number[] } | null {
  if (line.length !== 1 || line[0].length !== 2) return null;
  let product: { of: number; is: number } | null = null;
  let sum: { of: number; is: number; pair: number[] } | null = null;
  for (const c of line[0]) {
    if (c.items.length !== 2 || c.rels[0] !== "=" || !c.items[0] || c.items[0].length !== 1 || !("sum" in c.items[0][0])) return null;
    const left = c.items[0][0].sum;
    const is = soleValue(c.items[1]);
    if (is === null) return null;
    if (left.length === 1 && left[0].sign !== "±" && left[0].factors.length === 2 && left[0].factors.every((f) => f.f === "num")) product = { of: valueOf(left)!, is };
    else if (left.length === 2 && left.every((t) => rationalOf([t]) !== null)) {
      const pair = left.map((t) => valueOf([t])!);
      sum = { of: pair[0] + pair[1], is, pair };
    } else return null;
  }
  return product && sum ? { product: product.of, productIs: product.is, sum: sum.of, sumIs: sum.is, pair: sum.pair } : null;
}
const statedPairWrong: Slip = (expected, got) => {
  const e = statedPair(expected);
  const g = statedPair(got);
  if (!e || !g) return null;
  if (sameMultiset(g.pair.map(Math.abs), e.pair.map(Math.abs)) && !sameMultiset(g.pair, e.pair)) return "pair-signs-swapped";
  if (near(g.product, e.productIs) && !near(g.sum, e.sumIs)) return "pair-sum-wrong";
  if (near(g.sum, e.sumIs) && !near(g.product, e.productIs)) return "pair-product-wrong";
  return null;
};

/** "x = 5 or x = -1" written "x = -5 or x = 1": the values of a variable, the right sizes with a sign wrong. */
function valuesOf(line: Line): { v: string; value: number }[] | null {
  if (line.length !== 1) return null;
  const out: { v: string; value: number }[] = [];
  for (const c of line[0]) {
    if (c.items.length !== 2 || c.rels[0] !== "=") return null;
    const [a, b] = c.items;
    const v = soleId(a) ?? soleId(b);
    const value = soleId(a) !== null ? soleValue(b) : soleValue(a);
    if (v === null || value === null) return null;
    out.push({ v, value });
  }
  return out;
}
const valueSigns: Slip = (expected, got, leaves) => {
  const e = valuesOf(expected);
  const g = valuesOf(got);
  if (!e || !g || e.length !== g.length) return null;
  const vars = [...new Set(e.map((x) => x.v))];
  if (!vars.every((v) => sameMultiset(e.filter((x) => x.v === v).map((x) => Math.abs(x.value)), g.filter((x) => x.v === v).map((x) => Math.abs(x.value))))) return null;
  const flipped = g.filter((x) => !e.some((y) => y.v === x.v && near(y.value, x.value)));
  if (flipped.length === 0) return null;
  if (leaves.includes("algebra.equations.linear") || flipped.some((x) => !Number.isInteger(x.value))) return "solving-sign";
  // Intercepts read off a graph, not solved from factors.
  if (leaves.includes("graphing.quadratics.features") && leaves.includes("functions.zeros.zero-finding") && !leaves.includes("functions.zeros.nfl")) return "graph-signs";
  return "root-vertex-sign";
};

/** The quadratic formula's fraction: a numerator with a ± in it. */
const formulaFractions = (t: Term) => t.factors.flatMap((f, i) => (f.f === "frac" && f.num.some((u) => u.sign === "±") ? [{ f, i }] : []));

/** `\dfrac{5 \pm \sqrt{37}}{6}` written over 3: the formula's denominator taken as a, not 2a. */
const formula2a = rewrites("formula-2a", (t) =>
  formulaFractions(t).flatMap(({ f, i }) => {
    const r = rationalOf(f.den);
    if (!r || r.q !== 1 || r.p % 2 !== 0) return [];
    return [[withFactor(t, i, { f: "frac", num: f.num, den: numberSum(r.p / 2, 1) })]];
  }),
);

/** `\dfrac{5 \pm \sqrt{37}}{6}` written `\dfrac{-5 \pm \sqrt{37}}{6}`: −b's minus not applied to a negative b. */
const minusBDropped = rewrites("minus-b-dropped", (t) =>
  formulaFractions(t).map(({ f, i }) => [withFactor(t, i, { f: "frac", num: f.num.map((u) => (u.sign === "±" ? u : { ...u, sign: flip(u.sign) })), den: f.den })]),
);

/** `\tfrac{1}{3}(x + 2)(x + 4)` written `(x + 2)(x + 4)`: a factor taken out and missing, with a bracket still there. */
const factorMissing = rewrites("factor-missing", (t) =>
  t.factors.length < 2
    ? []
    : t.factors.flatMap((_, i) => {
        const rest = t.factors.filter((_, j) => j !== i);
        return rest.some((f) => f.f === "group") ? [opened({ sign: t.sign, factors: rest })] : [];
      }),
);

/** `\dfrac{a}{(b)(c)}` written `\dfrac{a}{b}`: a factor of the bottom of a fraction lost. */
const denominatorDropped = rewrites("denominator-dropped", (t) =>
  t.factors.flatMap((f, i) => {
    if (f.f !== "frac" || f.den.length !== 1 || f.den[0].factors.length < 2) return [];
    const d = f.den[0];
    return d.factors.map((_, j) => [withFactor(t, i, { f: "frac", num: f.num, den: opened({ sign: d.sign, factors: d.factors.filter((_, k) => k !== j) }) })]);
  }),
);

/** The value of a sum with its one variable at `x`; NaN for what has no single value (±, a point). */
function valueAt(s: Sum, x: number): number {
  const factor = (f: Factor): number => {
    switch (f.f) {
      case "num":
        return f.p / f.q;
      case "id":
        return x;
      case "pow":
        return valueAt(f.base, x) ** valueAt(f.exp, x);
      case "sqrt":
        return Math.sqrt(valueAt(f.arg, x));
      case "frac":
        return valueAt(f.num, x) / valueAt(f.den, x);
      case "group":
        return valueAt(f.sum, x);
      default:
        return NaN;
    }
  };
  return s.reduce((acc, t) => {
    if (t.sign === "±") return NaN;
    const v = t.factors.reduce((m, f) => m * factor(f), 1);
    return acc + (t.sign === "-" ? -v : v);
  }, 0);
}
const SAMPLES = [-3.5, -1, 0, 0.5, 2, 4.25, 7];
const sameValue = (a: Sum, b: Sum) => SAMPLES.every((x) => near(valueAt(a, x), valueAt(b, x)));
const variablesOf = (t: Term) => new Set(bracketsOf(t).map((b) => b.v));

/** `(x - 3)(x - 8) = x^2 - 11x + 24` written `(x - 3)(x + 8) = x^2 - 11x + 24`: an expand-back check whose stated result is not what its brackets expand to. */
const checkWrong: Slip = (expected, got) => {
  const sidesOf = (line: Line) => {
    if (line.length !== 1 || line[0].length !== 1) return null;
    const c = line[0][0];
    if (c.items.length !== 2 || c.rels[0] !== "=" || c.items.some((it) => !it || it.length !== 1 || !("sum" in it[0]))) return null;
    const [a, b] = c.items.map((it) => (it![0] as { sum: Sum }).sum);
    const isBrackets = (s: Sum) => s.length === 1 && bracketsOf(s[0]).length >= 2 && variablesOf(s[0]).size === 1;
    const expanded = (s: Sum) => s.length >= 2 && s.every((t) => t.factors.every((f) => f.f !== "group"));
    if (isBrackets(a) && expanded(b)) return { brackets: a, expansion: b };
    if (isBrackets(b) && expanded(a)) return { brackets: b, expansion: a };
    return null;
  };
  const e = sidesOf(expected);
  const g = sidesOf(got);
  if (!e || !g || sumKey(e.expansion) !== sumKey(g.expansion) || sumKey(e.brackets) === sumKey(g.brackets)) return null;
  return sameValue(g.brackets, g.expansion) ? null : "check-wrong";
};

/** Brackets that expand to a different quadratic, no narrower slip fitting. */
const bracketsDontExpand = atOnePlace(
  (t) => bracketsOf(t).length >= 2 && t.sign !== "±" && variablesOf(t).size === 1,
  (e, g) => {
    const E = bracketsOf(e);
    const G = bracketsOf(g);
    if (E.length !== G.length || E[0].v !== G[0].v || otherKeys(e, E.map((b) => b.i)) !== otherKeys(g, G.map((b) => b.i))) return null;
    return sameValue([e], [g]) ? null : "brackets-dont-expand";
  },
);

/** Tried in order; the first that fits names the misconception. The narrower slips come before the ones they would also fit. */
const SLIPS: Slip[] = [checkWrong, minusNotDistributed, pairSignsSwapped, bracketPair, statedPairWrong, valueSigns, formula2a, minusBDropped, denominatorDropped, factorMissing, bracketsDontExpand];

/** The misconceptions the check can name, for the tests and for anyone deciding whether a wrong line without an id is expected. */
export const CHECKED_MISCONCEPTIONS: readonly MisconceptionId[] = [
  "check-wrong",
  "denominator-dropped",
  "minus-not-distributed",
  "pair-signs-swapped",
  "pair-sum-wrong",
  "pair-product-wrong",
  "solving-sign",
  "graph-signs",
  "root-vertex-sign",
  "formula-2a",
  "minus-b-dropped",
  "factor-missing",
  "brackets-dont-expand",
];
