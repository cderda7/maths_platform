import { hexToOklch, oklchToHex, type Oklch } from "@/lib/oklch";

/**
 * The design tuner's model (ticket 296): the tokens in `app/globals.css`, how colours group into families, and
 * what a proposal makes of them. Pure, so the panel (components/DesignTuner.tsx) and the save route
 * (app/api/dev/design-tokens/route.ts) share one reading of the file.
 */
export type Token = { name: string; value: string };

/** The top-level blocks whose declarations are tokens: Tailwind's `@theme` and plain `:root`. */
const BLOCK = /^(@theme|:root)\s*\{\s*$/;

/** Every `--name: value;` declared directly in a token block, in file order. */
export function parseTokens(css: string): Token[] {
  const tokens: Token[] = [];
  let inBlock = false;
  for (const line of css.split("\n")) {
    if (!inBlock) {
      inBlock = BLOCK.test(line.trim());
      continue;
    }
    if (line.trim() === "}") {
      inBlock = false;
      continue;
    }
    const m = /^\s*(--[\w-]+)\s*:\s*([^;]+);/.exec(line);
    if (m) tokens.push({ name: m[1], value: m[2].trim() });
  }
  return tokens;
}

/** The css with each named token's value replaced in its token block; everything else byte for byte. Throws on a name the file does not declare. */
export function setTokenValues(css: string, values: Record<string, string>): string {
  const pending = new Set(Object.keys(values));
  let inBlock = false;
  const out = css.split("\n").map((line) => {
    if (!inBlock) {
      inBlock = BLOCK.test(line.trim());
      return line;
    }
    if (line.trim() === "}") {
      inBlock = false;
      return line;
    }
    const m = /^(\s*)(--[\w-]+)(\s*:\s*)([^;]+)(;.*)$/.exec(line);
    if (!m || !pending.has(m[2])) return line;
    const value = values[m[2]];
    if (!/^[^;{}\n]+$/.test(value)) throw new Error(`Bad value for ${m[2]}: ${value}`);
    pending.delete(m[2]);
    return `${m[1]}${m[2]}${m[3]}${value.trim()}${m[5]}`;
  });
  if (pending.size) throw new Error(`Not declared in a token block: ${[...pending].join(", ")}`);
  return out.join("\n");
}

const SHADE_SUFFIXES = ["soft", "line", "deep", "dark", "strong", "muted"];

export type Family = { base: string; main: string | null; shades: string[] };

/** Colour tokens (`--color-*` with a hex value) grouped by base: `--color-gap` with `-soft` and `-line`. A family with no plain token (covered) has shades only. */
export function colorFamilies(tokens: Token[]): Family[] {
  const colors = tokens.filter((t) => t.name.startsWith("--color-") && hexToOklch(t.value));
  const families = new Map<string, Family>();
  const family = (base: string) => families.get(base) ?? families.set(base, { base, main: null, shades: [] }).get(base)!;
  for (const { name } of colors) {
    const cut = name.lastIndexOf("-");
    const baseName = name.slice(0, cut);
    if (SHADE_SUFFIXES.includes(name.slice(cut + 1)) && baseName !== "--color") family(baseName.slice("--color-".length)).shades.push(name);
    else family(name.slice("--color-".length)).main = name;
  }
  return [...families.values()];
}

/** Families tuned as one: the follower's main colour moves with the leader's until the pair is split. */
export const LINKS: { leader: string; follower: string; label: string }[] = [{ leader: "--color-gap", follower: "--color-wrong", label: "red" }];

export type Proposal = {
  /** Colours set directly, by token. A shade set here no longer follows its main. */
  colors: Record<string, Oklch>;
  /** Linked followers split from their leader. */
  split: string[];
  /** Non-colour tokens (lengths, angles) by token. */
  values: Record<string, string>;
};

export const EMPTY_PROPOSAL: Proposal = { colors: {}, split: [], values: {} };

/** How a colour moved from its file value: hue shift, chroma ratio, lightness shift. */
function moved(from: Oklch, to: Oklch, withLightness: boolean, base: Oklch): Oklch {
  const hue = from.c < 0.01 ? base.h : base.h + (to.h - from.h);
  const c = from.c < 0.01 ? base.c + (to.c - from.c) : base.c * (to.c / from.c);
  return { l: withLightness ? base.l + (to.l - from.l) : base.l, c, h: ((hue % 360) + 360) % 360 };
}

/** Every colour token's OKLCH under the proposal. */
export function proposedColors(tokens: Token[], proposal: Proposal): Record<string, Oklch> {
  const file = Object.fromEntries(tokens.map((t) => [t.name, hexToOklch(t.value)]).filter(([, v]) => v)) as Record<string, Oklch>;
  const shadeOf = new Map<string, string>();
  for (const f of colorFamilies(tokens)) if (f.main) for (const s of f.shades) shadeOf.set(s, f.main);
  const memo: Record<string, Oklch> = {};
  const resolve = (name: string): Oklch => {
    if (memo[name]) return memo[name];
    let value = proposal.colors[name] ?? file[name];
    if (!proposal.colors[name]) {
      const link = LINKS.find((k) => k.follower === name && !proposal.split.includes(name) && file[k.leader]);
      const main = shadeOf.get(name);
      if (link) value = moved(file[link.leader], resolve(link.leader), true, file[name]);
      else if (main) value = moved(file[main], resolve(main), /-(deep|dark)$/.test(name), file[name]);
    }
    return (memo[name] = value);
  };
  return Object.fromEntries(Object.keys(file).map((name) => [name, resolve(name)]));
}

/** The tokens whose proposed value differs from the file, as the file would spell them. */
export function changedValues(tokens: Token[], proposal: Proposal): Record<string, string> {
  const colors = proposedColors(tokens, proposal);
  const out: Record<string, string> = {};
  for (const t of tokens) {
    const next = colors[t.name] ? oklchToHex(colors[t.name]) : proposal.values[t.name];
    if (next !== undefined && next.toLowerCase() !== t.value.toLowerCase()) out[t.name] = next;
  }
  return out;
}

/** Tailwind's corner steps the Corners slider scales together. */
export const CORNER_TOKENS = ["--radius-sm", "--radius-md", "--radius-lg", "--radius-xl", "--radius-2xl", "--radius-3xl"];

/**
 * The Classroom's box borders the Borders section tunes, one kind each (ticket 321): width and style are `:root` tokens,
 * the colour a `--color-*` token the section edits in place of a Colours row.
 */
export const BORDER_KINDS = [
  { key: "set", label: "Problem set cards", width: "--set-card-border-width", style: "--set-card-border-style", color: "--color-set-border" },
  { key: "hw", label: "Homework cells", width: "--hw-card-border-width", style: "--hw-card-border-style", color: "--color-hw-border" },
] as const;

export const BORDER_STYLES = ["solid", "dashed", "dotted"] as const;

/** The widest border the width slider reaches, in px: the line is drawn inward over the padding, and the thinnest box (Sam's homework cell) has 8px of it. */
export const BORDER_MAX_PX = 4;

/** A `rem` or `px` length times k, in the same unit, to 4 decimals. */
export function scaleLength(value: string, k: number): string {
  const m = /^(-?[\d.]+)(rem|px|%)$/.exec(value.trim());
  if (!m) return value;
  return `${Number((parseFloat(m[1]) * k).toFixed(4))}${m[2]}`;
}
