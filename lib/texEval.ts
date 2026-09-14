/**
 * A small evaluator for the TeX the diagnostic options are written in (ticket 240), so the unit tests can check the maths
 * a projector will show instead of trusting it: numbers, x and k, + − × and implicit products, powers, brackets,
 * \frac / \tfrac / \dfrac, \sqrt and ±. Not a general TeX parser; anything else throws.
 */

type Token = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string } | { t: "cmd"; v: string };

function tokenize(tex: string): Token[] {
  const out: Token[] = [];
  const s = tex.replace(/\\left|\\right/g, "").replace(/\\[;,!]|\\quad/g, " ");
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) i++;
    else if (/[0-9.]/.test(ch)) {
      const m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i))!;
      out.push({ t: "num", v: Number(m[0]) });
      i += m[0].length;
    } else if (ch === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
      if (!m) throw new Error(`bad command in ${tex}`);
      out.push({ t: "cmd", v: m[1] });
      i += m[0].length;
    } else if (/[a-zA-Z]/.test(ch)) {
      out.push({ t: "id", v: ch });
      i++;
    } else if ("+-*/^(){}−".includes(ch)) {
      out.push({ t: "op", v: ch === "−" ? "-" : ch });
      i++;
    } else throw new Error(`unexpected '${ch}' in ${tex}`);
  }
  return out;
}

/** Evaluates an expression at the given variables; `pm` is the sign ± takes. */
export function evalTex(tex: string, vars: Record<string, number> = {}, pm: 1 | -1 = 1): number {
  const tokens = tokenize(tex);
  let p = 0;
  const peek = () => tokens[p];
  const isOp = (v: string) => peek()?.t === "op" && peek()!.v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`expected ${v} in ${tex}`);
    p++;
  };
  const startsFactor = () => {
    const k = peek();
    return !!k && (k.t === "num" || k.t === "id" || (k.t === "op" && (k.v === "(" || k.v === "{")) || (k.t === "cmd" && ["frac", "tfrac", "dfrac", "sqrt"].includes(k.v)));
  };
  function expr(): number {
    let v = term();
    for (;;) {
      if (isOp("+")) {
        p++;
        v += term();
      } else if (isOp("-")) {
        p++;
        v -= term();
      } else if (peek()?.t === "cmd" && peek()!.v === "pm") {
        p++;
        v += pm * term();
      } else return v;
    }
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (isOp("*") || (peek()?.t === "cmd" && (peek()!.v === "times" || peek()!.v === "cdot"))) {
        p++;
        v *= unary();
      } else if (isOp("/")) {
        p++;
        v /= unary();
      } else if (startsFactor()) v *= power();
      else return v;
    }
  }
  function unary(): number {
    if (isOp("-") || isOp("+")) {
      const sign = peek()!.v === "-" ? -1 : 1;
      p++;
      return sign * unary();
    }
    return power();
  }
  function power(): number {
    const base = atom();
    if (isOp("^")) {
      p++;
      return base ** atom();
    }
    return base;
  }
  function atom(): number {
    const k = peek();
    if (!k) throw new Error(`unexpected end of ${tex}`);
    p++;
    if (k.t === "num") return k.v;
    if (k.t === "id") {
      if (!(k.v in vars)) throw new Error(`unknown ${k.v} in ${tex}`);
      return vars[k.v];
    }
    if (k.t === "op" && (k.v === "(" || k.v === "{")) {
      const v = expr();
      expect(k.v === "(" ? ")" : "}");
      return v;
    }
    if (k.t === "cmd" && ["frac", "tfrac", "dfrac"].includes(k.v)) {
      expect("{");
      const n = expr();
      expect("}");
      expect("{");
      const d = expr();
      expect("}");
      return n / d;
    }
    if (k.t === "cmd" && k.v === "sqrt") {
      expect("{");
      const v = expr();
      expect("}");
      return Math.sqrt(v);
    }
    throw new Error(`unexpected ${k.v} in ${tex}`);
  }
  const v = expr();
  if (p !== tokens.length) throw new Error(`trailing input in ${tex}`);
  return v;
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
