/**
 * A small reader for the TeX the app's maths is written in (ticket 240), so the unit tests can check the maths a
 * projector will show instead of trusting it: numbers, single-letter variables and a few Greek letters, + − × ÷ and
 * implicit products, powers, brackets, \frac / \tfrac / \dfrac, \sqrt and ±. Not a general TeX parser; anything else
 * throws.
 *
 * Since ticket 311 the reading and the arithmetic are two stages. `tokenizeTex` and `expressionAt` read an expression
 * into a tree (`TexNode`); `evalTex` evaluates the tree, and `lib/stepCheck.ts` reads the same tree into a canonical
 * form to judge a written line against a step. One grammar, so an expression the tests evaluate is an expression the
 * line check reads the same way. The tokenizer also knows the pieces of a whole written line that are not expression
 * (relations, `,`/`;`, `\text{…}`, `\Rightarrow`); `expressionAt` stops at them, and `evalTex` still throws on them.
 */

export type TexToken =
  | { t: "num"; v: number; raw: string }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "cmd"; v: string }
  /** A relation: `=`, `<`, `>`, `\le`, `\ge`, `\ne`, written as `= < > ≤ ≥ ≠`. */
  | { t: "rel"; v: string }
  /** Words: a `\text{…}` group, or a bare "or" / "and" between statements. */
  | { t: "text"; v: string }
  /** An implication arrow, `\Rightarrow` or `\implies`. */
  | { t: "imp" };

/** Greek letters read as variables (`\Delta` for the discriminant). */
const GREEK = new Set(["alpha", "beta", "gamma", "delta", "Delta", "theta", "lambda", "mu", "pi"]);
const RELATIONS: Record<string, string> = { le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠" };
const TEXT_COMMANDS = new Set(["text", "textrm", "mathrm", "textit", "mbox"]);
/** Commands that set nothing a reader needs: spacing, sizing, the check mark after a checked line. */
const SILENT = new Set(["quad", "qquad", "checkmark", "displaystyle", "textstyle", "left", "right"]);

export function tokenizeTex(tex: string): TexToken[] {
  const out: TexToken[] = [];
  const s = tex.replace(/\\[;,!:> ]/g, " ").replace(/~/g, " ");
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) i++;
    else if (/[0-9.]/.test(ch)) {
      const m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i));
      if (!m) throw new Error(`bad number in ${tex}`);
      out.push({ t: "num", v: Number(m[0]), raw: m[0] });
      i += m[0].length;
    } else if (ch === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
      if (!m) throw new Error(`bad command in ${tex}`);
      i += m[0].length;
      const name = m[1];
      if (SILENT.has(name)) continue;
      if (TEXT_COMMANDS.has(name)) {
        while (s[i] === " ") i++;
        if (s[i] !== "{") throw new Error(`\\${name} without a group in ${tex}`);
        const close = s.indexOf("}", i);
        if (close < 0) throw new Error(`unclosed \\${name} in ${tex}`);
        out.push({ t: "text", v: s.slice(i + 1, close) });
        i = close + 1;
      } else if (GREEK.has(name)) out.push({ t: "id", v: `\\${name}` });
      else if (RELATIONS[name]) out.push({ t: "rel", v: RELATIONS[name] });
      else if (name === "Rightarrow" || name === "implies") out.push({ t: "imp" });
      else out.push({ t: "cmd", v: name });
    } else if (/[a-zA-Z]/.test(ch)) {
      // "or" and "and" typed as words between two statements; any other run of letters is a product of variables.
      const word = /^[a-zA-Z]+/.exec(s.slice(i))![0];
      if (word === "or" || word === "and") {
        out.push({ t: "text", v: word });
        i += word.length;
      } else {
        out.push({ t: "id", v: ch });
        i++;
      }
    } else if ("+-*/^(){},;:−×·÷".includes(ch)) {
      const v = ch === "−" ? "-" : ch === "×" || ch === "·" ? "*" : ch === "÷" ? "/" : ch;
      out.push({ t: "op", v });
      i++;
    } else if ("=<>≤≥≠".includes(ch)) {
      out.push({ t: "rel", v: ch });
      i++;
    } else if (ch === "±") {
      out.push({ t: "cmd", v: "pm" });
      i++;
    } else if (ch === "⇒") {
      out.push({ t: "imp" });
      i++;
    } else throw new Error(`unexpected '${ch}' in ${tex}`);
  }
  return out;
}

/** An expression as read: the tree both `evalTex` and the line check work from. `mul` is any product (`*`, `\times`, `\cdot`, side by side); `div` is `/` or a `\frac`. */
export type TexNode =
  | { k: "num"; v: number; raw: string }
  | { k: "id"; v: string }
  | { k: "add" | "sub" | "pm" | "mul" | "div" | "pow"; a: TexNode; b: TexNode }
  | { k: "neg" | "upm" | "sqrt"; a: TexNode }
  | { k: "tuple"; items: TexNode[] };

const FRACS = ["frac", "tfrac", "dfrac"];

/**
 * The expression that starts at token `from`, and the index just past it. It stops at the first token that cannot
 * continue it (a relation, a `,` outside brackets, words, an arrow, the end); it throws when no expression starts
 * there or a bracket or command is malformed.
 */
export function expressionAt(tokens: TexToken[], from: number, source = ""): { node: TexNode; end: number } {
  let p = from;
  const peek = () => tokens[p];
  const isOp = (v: string) => peek()?.t === "op" && (peek() as { v: string }).v === v;
  const isCmd = (...vs: string[]) => peek()?.t === "cmd" && vs.includes((peek() as { v: string }).v);
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`expected ${v} in ${source}`);
    p++;
  };
  const startsFactor = () => {
    const k = peek();
    return !!k && (k.t === "num" || k.t === "id" || (k.t === "op" && (k.v === "(" || k.v === "{")) || (k.t === "cmd" && [...FRACS, "sqrt"].includes(k.v)));
  };
  function expr(): TexNode {
    let v = term();
    for (;;) {
      if (isOp("+")) {
        p++;
        v = { k: "add", a: v, b: term() };
      } else if (isOp("-")) {
        p++;
        v = { k: "sub", a: v, b: term() };
      } else if (isCmd("pm")) {
        p++;
        v = { k: "pm", a: v, b: term() };
      } else return v;
    }
  }
  function term(): TexNode {
    let v = unary();
    for (;;) {
      if (isOp("*") || isCmd("times", "cdot")) {
        p++;
        v = { k: "mul", a: v, b: unary() };
      } else if (isOp("/") || isCmd("div")) {
        p++;
        v = { k: "div", a: v, b: unary() };
      } else if (startsFactor()) v = { k: "mul", a: v, b: power() };
      else return v;
    }
  }
  function unary(): TexNode {
    if (isOp("-")) {
      p++;
      return { k: "neg", a: unary() };
    }
    if (isOp("+")) {
      p++;
      return unary();
    }
    if (isCmd("pm")) {
      p++;
      return { k: "upm", a: unary() };
    }
    return power();
  }
  function power(): TexNode {
    const base = atom();
    if (isOp("^")) {
      p++;
      return { k: "pow", a: base, b: atom() };
    }
    return base;
  }
  function atom(): TexNode {
    const k = peek();
    if (!k) throw new Error(`unexpected end of ${source}`);
    p++;
    if (k.t === "num") return { k: "num", v: k.v, raw: k.raw };
    if (k.t === "id") return { k: "id", v: k.v };
    if (k.t === "op" && (k.v === "(" || k.v === "{")) {
      const close = k.v === "(" ? ")" : "}";
      const first = expr();
      if (close === ")" && isOp(",")) {
        const items = [first];
        while (isOp(",")) {
          p++;
          items.push(expr());
        }
        expect(")");
        return { k: "tuple", items };
      }
      expect(close);
      return first;
    }
    if (k.t === "cmd" && FRACS.includes(k.v)) {
      expect("{");
      const n = expr();
      expect("}");
      expect("{");
      const d = expr();
      expect("}");
      return { k: "div", a: n, b: d };
    }
    if (k.t === "cmd" && k.v === "sqrt") {
      expect("{");
      const v = expr();
      expect("}");
      return { k: "sqrt", a: v };
    }
    throw new Error(`unexpected ${"v" in k ? k.v : k.t} in ${source}`);
  }
  const node = expr();
  return { node, end: p };
}

/** A whole expression read into its tree; throws on anything after it. */
export function parseTex(tex: string): TexNode {
  const tokens = tokenizeTex(tex);
  const { node, end } = expressionAt(tokens, 0, tex);
  if (end !== tokens.length) throw new Error(`trailing input in ${tex}`);
  return node;
}

/** Evaluates an expression at the given variables; `pm` is the sign ± takes. */
export function evalTex(tex: string, vars: Record<string, number> = {}, pm: 1 | -1 = 1): number {
  const run = (n: TexNode): number => {
    switch (n.k) {
      case "num":
        return n.v;
      case "id":
        if (!(n.v in vars)) throw new Error(`unknown ${n.v} in ${tex}`);
        return vars[n.v];
      case "add":
        return run(n.a) + run(n.b);
      case "sub":
        return run(n.a) - run(n.b);
      case "pm":
        return run(n.a) + pm * run(n.b);
      case "mul":
        return run(n.a) * run(n.b);
      case "div":
        return run(n.a) / run(n.b);
      case "pow":
        return run(n.a) ** run(n.b);
      case "neg":
        return -run(n.a);
      case "upm":
        return pm * run(n.a);
      case "sqrt":
        return Math.sqrt(run(n.a));
      case "tuple":
        throw new Error(`a point is not a number in ${tex}`);
    }
  };
  return run(parseTex(tex));
}

/** An equation or inequality's two sides and relation; an expression alone is its left side, with no relation and 0 on the right. */
export function sides(tex: string): { left: string; rel: "=" | "<" | ">" | null; right: string } {
  const m = /^(.*?)(=|<|>)(.*)$/.exec(tex);
  return m ? { left: m[1], rel: m[2] as "=" | "<" | ">", right: m[3] } : { left: tex, rel: null, right: "0" };
}

/** Two expressions (or equations, as left minus right) agree at every sample value of x. */
export function sameFunction(a: string, b: string, variable = "x"): boolean {
  const f = (tex: string, v: number) => {
    const s = sides(tex);
    return evalTex(s.left, { [variable]: v }) - evalTex(s.right, { [variable]: v });
  };
  return [-3.5, -1, 0, 0.5, 2, 4.25, 7].every((v) => Math.abs(f(a, v) - f(b, v)) < 1e-9);
}

/** The values an answer names: "x = 3 \;\text{or}\; x = -4", "x = \dfrac{7 \pm \sqrt{73}}{4}" (both signs), "k = 16". */
export function namedValues(tex: string): number[] {
  return tex
    .split(/\\;\\text\{or\}\\;/)
    .flatMap((part) => {
      const rhs = sides(part).right;
      return rhs.includes("\\pm") ? [evalTex(rhs, {}, 1), evalTex(rhs, {}, -1)] : [evalTex(rhs)];
    })
    .sort((a, b) => a - b);
}

export const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
export const sameValues = (a: number[], b: number[]) => a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => near(v, [...b].sort((x, y) => x - y)[i]));
