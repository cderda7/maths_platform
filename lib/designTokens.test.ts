import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BORDER_KINDS, BORDER_STYLES, changedValues, colorFamilies, CORNER_TOKENS, EMPTY_PROPOSAL, parseTokens, proposedColors, scaleLength, setTokenValues } from "@/lib/designTokens";
import { hexToOklch, oklchToHex, rgbToHex } from "@/lib/oklch";

const CSS = readFileSync(join(__dirname, "../app/globals.css"), "utf8");
const tokens = parseTokens(CSS);
const RED_OKLCH = { l: 0.565713, c: 0.164041, h: 27.5745 };
const value = (name: string) => tokens.find((t) => t.name === name)?.value;

describe("oklch", () => {
  it("round-trips every colour token in globals.css to the same hex", () => {
    const colors = tokens.filter((t) => /^#[0-9a-f]{6}$/i.test(t.value));
    expect(colors.length).toBeGreaterThan(30);
    for (const t of colors) expect(oklchToHex(hexToOklch(t.value)!)).toBe(t.value.toLowerCase());
  });

  it("reads the red's lightness, chroma and hue", () => {
    const red = hexToOklch("#c4453c")!;
    // Chrome's own reading: getComputedStyle of `color: oklch(from #c4453c l c h)`.
    expect(red.l).toBeCloseTo(RED_OKLCH.l, 3);
    expect(red.c).toBeCloseTo(RED_OKLCH.c, 3);
    expect(red.h).toBeCloseTo(RED_OKLCH.h, 1);
  });

  it("lowers chroma, not lightness or hue, to bring an out-of-gamut colour in", () => {
    const hex = oklchToHex({ l: 0.5, c: 0.5, h: 30 });
    const back = hexToOklch(hex)!;
    expect(back.l).toBeCloseTo(0.5, 2);
    expect(back.h).toBeCloseTo(30, 0);
    expect(back.c).toBeLessThan(0.5);
  });

  it("reads computed colours", () => {
    expect(rgbToHex("rgb(196, 69, 60)")).toBe("#c4453c");
    expect(rgbToHex("rgba(0, 0, 0, 0)")).toBeNull();
    expect(rgbToHex("oklch(0.5 0.1 30)")).toBeNull();
  });
});

describe("tokens in globals.css", () => {
  it("declares the tunable tokens", () => {
    for (const name of ["--color-gap", "--color-wrong", "--marker-pill-radius", "--marker-dot-radius", "--marker-half-angle", "--marker-half-stripe", ...CORNER_TOKENS]) expect(value(name), name).toBeDefined();
  });

  it("declares each Classroom border kind at today's look: 1px solid in line's colour (ticket 321)", () => {
    for (const k of BORDER_KINDS) {
      expect(value(k.width), k.width).toBe("1px");
      expect(value(k.style), k.style).toBe("solid");
      expect(value(k.color), k.color).toBe(value("--color-line"));
      expect(BORDER_STYLES).toContain(value(k.style));
    }
    const families = colorFamilies(tokens);
    for (const k of BORDER_KINDS) expect(families.find((f) => f.main === k.color)?.shades, k.color).toEqual([]);
  });

  it("groups colours into families, a shade under its base", () => {
    const families = colorFamilies(tokens);
    const gap = families.find((f) => f.base === "gap")!;
    expect(gap.main).toBe("--color-gap");
    expect(gap.shades).toEqual(["--color-gap-soft", "--color-gap-line"]);
    expect(families.find((f) => f.base === "line")!.shades).toEqual(["--color-line-strong"]);
    expect(families.find((f) => f.base === "covered")).toEqual({ base: "covered", main: null, shades: ["--color-covered-soft", "--color-covered-line"] });
    expect(families.find((f) => f.base === "accent")!.shades).toEqual(["--color-accent-deep", "--color-accent-dark", "--color-accent-soft", "--color-accent-line"]);
  });

  it("rewrites only the named values, the rest of the file byte for byte", () => {
    const next = setTokenValues(CSS, { "--color-gap": "#a53931", "--marker-half-angle": "45deg" });
    const a = CSS.split("\n");
    const b = next.split("\n");
    expect(b.length).toBe(a.length);
    const diff = a.flatMap((line, i) => (line === b[i] ? [] : [[line, b[i]]]));
    expect(diff).toEqual([
      ["  --color-gap: #c4453c;", "  --color-gap: #a53931;"],
      [expect.stringContaining("--marker-half-angle: 90deg;"), expect.stringContaining("--marker-half-angle: 45deg;")],
    ]);
  });

  it("refuses a name the file does not declare, or a value that could break out of its line", () => {
    expect(() => setTokenValues(CSS, { "--color-nope": "#000" })).toThrow(/Not declared/);
    expect(() => setTokenValues(CSS, { "--color-gap": "red; } body { color: red" })).toThrow(/Bad value/);
  });
});

describe("a proposal", () => {
  it("changes nothing when empty", () => {
    expect(changedValues(tokens, EMPTY_PROPOSAL)).toEqual({});
  });

  it("moves red's shades and the linked wrong family with gap", () => {
    const gap = hexToOklch(value("--color-gap")!)!;
    const deeper = { ...gap, l: gap.l - 0.08, h: gap.h - 6 };
    const changed = changedValues(tokens, { ...EMPTY_PROPOSAL, colors: { "--color-gap": deeper } });
    expect(changed["--color-gap"]).toBe(oklchToHex(deeper));
    expect(changed["--color-wrong"]).toBe(changed["--color-gap"]);
    const colors = proposedColors(tokens, { ...EMPTY_PROPOSAL, colors: { "--color-gap": deeper } });
    // A soft shade keeps its lightness and takes the hue shift; a deep shade also takes the lightness shift.
    expect(colors["--color-gap-soft"].l).toBeCloseTo(hexToOklch(value("--color-gap-soft")!)!.l, 6);
    expect(colors["--color-gap-soft"].h).toBeCloseTo(hexToOklch(value("--color-gap-soft")!)!.h - 6, 6);
    expect(colors["--color-wrong-deep"].l).toBeCloseTo(hexToOklch(value("--color-wrong-deep")!)!.l - 0.08, 6);
    expect(Object.keys(changed).some((k) => k.startsWith("--color-secure"))).toBe(false);
  });

  it("leaves wrong alone once split, and a directly set shade stays where it was set", () => {
    const gap = hexToOklch(value("--color-gap")!)!;
    const soft = { l: 0.95, c: 0.02, h: 20 };
    const changed = changedValues(tokens, { colors: { "--color-gap": { ...gap, l: 0.4 }, "--color-gap-soft": soft }, split: ["--color-wrong"], values: {} });
    expect(changed["--color-wrong"]).toBeUndefined();
    expect(changed["--color-wrong-soft"]).toBeUndefined();
    expect(changed["--color-gap-soft"]).toBe(oklchToHex(soft));
  });

  it("carries non-colour values that differ from the file", () => {
    expect(changedValues(tokens, { ...EMPTY_PROPOSAL, values: { "--marker-half-angle": "45deg", "--marker-pill-radius": value("--marker-pill-radius")! } })).toEqual({ "--marker-half-angle": "45deg" });
  });

  it("tunes each kind of Classroom border alone, width, style and colour (ticket 321)", () => {
    const [set, hw] = BORDER_KINDS;
    const proposal = { ...EMPTY_PROPOSAL, values: { [set.width]: "3px", [set.style]: "dashed" }, colors: { [set.color]: hexToOklch("#8a84b0")! } };
    expect(changedValues(tokens, proposal)).toEqual({ [set.width]: "3px", [set.style]: "dashed", [set.color]: "#8a84b0" });
    const next = setTokenValues(CSS, changedValues(tokens, proposal));
    const saved = parseTokens(next);
    expect(saved.find((t) => t.name === hw.width)?.value).toBe("1px");
    expect(saved.find((t) => t.name === "--color-line")?.value).toBe("#e7e4f1");
    expect(saved.find((t) => t.name === set.style)?.value).toBe("dashed");
  });

  it("scales a corner in its own unit", () => {
    expect(scaleLength("0.375rem", 0.5)).toBe("0.1875rem");
    expect(scaleLength("4px", 1.5)).toBe("6px");
    expect(scaleLength("auto", 2)).toBe("auto");
  });
});
