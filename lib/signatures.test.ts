import { describe, expect, it } from "vitest";
import { STORY } from "@/data/story";
import { PATTERN_TAGS } from "@/data/patternTags";
import { familyOf } from "@/data/signatures";
import { INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { holisticView, type HolisticNow } from "./holistic";
import { holisticTile } from "./holisticTiles";
import { signaturesOf, type SignatureInput } from "./signatures";

/** Error signatures across sets (ticket 303). */

const now = 1_700_000_000_000;
const fresh: HolisticNow = { classroom: INITIAL_CLASSROOM, session: null, now };
const report = skipFixture("report", now);
const over: HolisticNow = { classroom: report.classroom, session: report.session, now };
const everyone = Object.keys(STORY);
const SETS = [1, 2, 3, 4, 5, 6].map((n) => ({ id: `pset-${n}`, label: `PS${n}` }));
const ref = (n: number) => ({ set: `pset-${n}`, label: `PS${n}` });
const p = (category: SignatureInput["category"], text: string, misconception: SignatureInput["misconception"], ...sets: number[]): SignatureInput => ({ category, text, tag: text, misconception, refs: sets.map(ref) });

describe("signaturesOf", () => {
  it("gathers one family across categories and sets, and needs it on two sets", () => {
    const s = signaturesOf(
      [p("algebra", "signs swapped", "pair-signs-swapped", 4, 5), p("graphing", "turning point sign", "root-vertex-sign", 5), p("new", "halves", "halving-wrong", 4), p("algebra", "halves again", "halving-wrong", 4)],
      SETS,
    );
    expect(s.map((x) => [x.family, x.sets.map((y) => y.label), x.patterns.length])).toEqual([["minus-signs", ["PS4", "PS5"], 2]]);
    expect(s[0].cells).toEqual([
      { set: "pset-4", category: "algebra" },
      { set: "pset-5", category: "algebra" },
      { set: "pset-5", category: "graphing" },
    ]);
  });

  it("puts communication patterns in steps, and orders most sets, then most patterns, then the families' order", () => {
    const s = signaturesOf([p("algebra", "a", "brackets-dont-expand", 3, 4), p("communication", "one line", null, 1, 2, 3), p("algebra", "b", "product-sign", 2), p("new", "c", "square-sign", 3)], SETS);
    expect(s.map((x) => x.family)).toEqual(["steps", "minus-signs", "factor-pairs"]);
  });
});

describe("the holistic view's signatures", () => {
  it("Sam: minus signs wrong across algebra, graphing and New skills on PS2–PS5; his conjugate pattern (a surds misconception) is not in it", () => {
    for (const at of [fresh, over]) {
      const [minus, ...rest] = holisticView("sam", at)!.signatures;
      expect(rest).toEqual([]);
      expect(minus.name).toBe("Minus signs wrong");
      expect(minus.sets.map((x) => x.label)).toEqual(["PS2", "PS3", "PS4", "PS5"]);
      expect([...new Set(minus.patterns.map((x) => x.category))]).toEqual(["algebra", "graphing", "new"]);
      expect(minus.patterns.map((x) => x.text)).not.toContain("the conjugate's sign wrong");
    }
  });

  it("Priya has none; Aiden's parts-only scaling and Grace's steps run every set", () => {
    expect(holisticView("priya", over)!.signatures).toEqual([]);
    expect(holisticView("aiden", over)!.signatures.map((s) => [s.name, s.sets.length])).toEqual([["Terms missed", 6]]);
    expect(holisticView("grace", over)!.signatures.map((s) => [s.name, s.sets.length])).toEqual([["Steps missing", 6]]);
  });

  it("every signature is on two sets or more, and names only patterns, sets and cells the page shows", () => {
    for (const at of [fresh, over])
      for (const id of everyone) {
        const v = holisticView(id, at)!;
        for (const s of v.signatures) {
          expect(s.sets.length, `${id} ${s.family}`).toBeGreaterThanOrEqual(2);
          for (const x of s.patterns) expect(v.patterns.find((g) => g.category === x.category)?.patterns.some((h) => h.text === x.text), `${id} ${x.text}`).toBe(true);
          for (const c of s.cells) {
            const j = v.sets.findIndex((set) => set.id === c.set);
            expect(j, `${id} ${c.set}`).toBeGreaterThanOrEqual(0);
            expect(["gap", "developing", "solid"], `${id} ${c.category} ${c.set}`).toContain(v.categories.find((r) => r.category === c.category)!.cells[j]);
          }
        }
        // A family on two sets or more that the page surfaces is always a signature.
        const families = new Map<string, Set<string>>();
        for (const g of v.patterns) for (const h of g.patterns) for (const r of h.refs) families.set(familyOf(h.misconception), (families.get(familyOf(h.misconception)) ?? new Set()).add(r.set));
        expect(v.signatures.map((s) => s.family).sort(), id).toEqual([...families].filter(([, sets]) => sets.size >= 2).map(([f]) => f).sort());
      }
  });
});

describe("tiles with signatures", () => {
  it("lead with the signatures and list a pattern once: under its signature or under its category, never both", () => {
    for (const at of [fresh, over])
      for (const id of everyone) {
        const v = holisticView(id, at)!;
        const tile = holisticTile(id, at)!;
        expect(tile.signatures, id).toEqual(v.signatures.map((s) => ({ label: s.name, sets: s.sets.map((x) => x.label) })));
        const covered = new Set(v.signatures.flatMap((s) => s.patterns.map((x) => x.tag)));
        for (const g of tile.patterns) for (const t of g.tags) expect(covered.has(t.label), `${id} ${t.label}`).toBe(false);
      }
  });

  it("a tag's wordings are one family, so a tag is never split between a signature and its category", () => {
    for (const [id, byCategory] of Object.entries(PATTERN_TAGS))
      for (const [c, tags] of Object.entries(byCategory))
        for (const t of tags ?? []) {
          const families = new Set(t.texts.map((text) => STORY[id].cells[c as keyof typeof byCategory].flatMap((cell) => cell.patterns).find((h) => h.text === text)!.misconception).map(familyOf));
          expect(families.size, `${id} ${c} ${t.label}`).toBe(1);
        }
  });
});
