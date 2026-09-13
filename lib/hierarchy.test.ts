import { describe, expect, it } from "vitest";
import { leafStatus, rollUp } from "./hierarchy";

describe("leaf status and roll-up", () => {
  it("is proportional over attempted lines, on five levels", () => {
    expect(leafStatus(0, 0)).toBe("unseen");
    expect(leafStatus(4, 4)).toBe("secure");
    expect(leafStatus(4, 5)).toBe("solid");
    expect(leafStatus(3, 4)).toBe("developing");
    expect(leafStatus(2, 4)).toBe("gap");
    expect(leafStatus(1, 4)).toBe("gap");
  });

  it("rolls up worst-first and treats an all-unseen parent as unseen", () => {
    expect(rollUp(["secure", "solid", "gap", "unseen"])).toBe("gap");
    expect(rollUp(["secure", "developing"])).toBe("developing");
    expect(rollUp(["secure", "solid"])).toBe("solid");
    expect(rollUp(["secure", "unseen"])).toBe("secure");
    expect(rollUp(["unseen", "unseen"])).toBe("unseen");
    expect(rollUp([])).toBe("unseen");
  });
});

import { CLASSMATES } from "@/data/classmates";
import { isolatable, PRACTICES } from "@/data/practice";
import { practiceLeaf } from "./session";
import { EVALUATION } from "@/data/evaluation";
import { PROBLEMS } from "@/data/assignment";
import { isLeafId, type LeafId } from "@/data/taxonomy";
import { evaluateLine } from "./evaluate";
import { categoriesTouched, classmateEvidence, classmateHierarchy, hierarchyFor, leavesTouched, sessionHierarchy } from "./hierarchy";
import { scriptedSession, sessionAt, sessionReducer } from "./session";

describe("the scripted run through the hierarchy", () => {
  it("lights six of the seven categories, in canonical order, with Stats absent", () => {
    expect(categoriesTouched()).toEqual(["algebra", "functions", "graphing", "communication", "reasoning", "new"]);
  });

  it("ends with Algebra developing, Communication solid and Reasoning a gap, the rest secure or solid", () => {
    const h = sessionHierarchy({ ...scriptedSession(), stage: "feedback" });
    expect(h.categories.algebra).toBe("developing");
    expect(h.categories.communication).toBe("solid");
    expect(h.categories.reasoning).toBe("gap");
    expect(["secure", "solid"]).toContain(h.categories.functions);
    expect(["secure", "solid"]).toContain(h.categories.graphing);
    expect(["secure", "solid"]).toContain(h.categories.new);
    expect(h.leaves["algebra.number.fractions"]).toBe("developing");
    expect(h.leaves["algebra.expand-factor.monic"]).toBe("developing");
    expect(h.leaves["reasoning.justify.formal"]).toBe("gap");
    expect(h.leaves["communication.process.working"]).toBe("solid");
    expect(h.half.categories).toEqual([]);
  });

  it("worst-first propagates at both hops: one gap leaf makes its group and category a gap", () => {
    const h = sessionHierarchy({ ...scriptedSession(), stage: "feedback" });
    expect(h.groups["reasoning.justify"]).toBe("gap");
    expect(h.groups["reasoning.interpret"]).toBe("secure");
    expect(h.categories.reasoning).toBe("gap");
  });

  it("a caution on a group forces its leaves to gap, whatever the evidence says", () => {
    const s = { ...scriptedSession(), stage: "feedback" as const };
    const base = sessionHierarchy(s);
    expect(base.leaves["algebra.equations.discriminant"]).toBe("secure");
    const cautioned = hierarchyFor({ ...sessionEvidenceOf(s), caution: ["algebra.equations"] });
    expect(cautioned.leaves["algebra.equations.discriminant"]).toBe("gap");
    // The discriminant is new on Problem Set 6: its gap shows under New skills.
    expect(cautioned.categories.new).toBe("gap");
  });

  it("half dots appear only after submit and only where problems were skipped; colour ignores the skipped problems", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "x^2 - 5x + 6 = 0", strokeCount: 1 } });
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "(x-2)(x-3) = 0", strokeCount: 2 } });
    const working = sessionHierarchy(s);
    expect(working.half.leaves).toEqual([]);
    expect(working.leaves["algebra.expand-factor.monic"]).toBe("secure");
    const submitted = sessionHierarchy({ ...s, stage: "feedback" });
    expect(submitted.half.leaves).toContain("algebra.expand-factor.nonmonic");
    expect(submitted.half.categories).toContain("algebra");
    expect(submitted.leaves["algebra.expand-factor.monic"]).toBe("secure");
    expect(submitted.leaves["algebra.expand-factor.nonmonic"]).toBe("unseen");
  });
});

function sessionEvidenceOf(s: ReturnType<typeof scriptedSession>) {
  const lines: Record<string, string[]> = {};
  for (const [pid, ls] of Object.entries(s.lines)) lines[pid] = ls.map((l) => l.tex);
  return { lines, submitted: true, caution: [] as never[] };
}

describe("classmates through the same evidence path", () => {
  it("no classmate has a line the evaluator can't follow", () => {
    for (const c of CLASSMATES) {
      const ev = classmateEvidence(c);
      for (const [pid, lines] of Object.entries(ev.lines)) for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${c.id} ${pid} ${tex}`).not.toBe("unclear");
    }
  });

  it("their statuses match their fixture notes", () => {
    const tomas = classmateHierarchy(CLASSMATES.find((c) => c.id === "tomas")!);
    expect(tomas.leaves["algebra.number.fractions"]).toBe("gap");
    expect(tomas.half.categories.length).toBeGreaterThan(0); // stopped at Q7
    const priya = classmateHierarchy(CLASSMATES.find((c) => c.id === "priya")!);
    expect(Object.values(priya.categories).every((s) => s === "secure")).toBe(true);
    expect(priya.half.leaves).toEqual([]);
    const liam = classmateHierarchy(CLASSMATES.find((c) => c.id === "liam")!);
    expect(liam.categories.algebra).toBe("gap");
    expect(liam.half.categories).toContain("graphing");
  });
});

describe("taxonomy coverage in the fixture", () => {
  it("every tag anywhere in the fixture resolves", () => {
    for (const p of PROBLEMS) for (const st of p.solution) for (const t of st.tags) expect(isLeafId(t.leaf), t.leaf).toBe(true);
    for (const table of Object.values(EVALUATION)) for (const v of Object.values(table)) for (const t of v.tags) expect(isLeafId(t.leaf), t.leaf).toBe(true);
  });

  it("every move with an authored wrong verdict has a practice problem, so rework can't dead-end; a whole-task leaf never prompts", () => {
    const wrongLeaves = new Set<LeafId>();
    for (const table of Object.values(EVALUATION)) for (const v of Object.values(table)) if (v.verdict === "wrong") wrongLeaves.add(v.tags[0].leaf);
    for (const l of wrongLeaves) {
      if (isolatable(l)) expect(PRACTICES[l], l).toBeDefined();
      else expect(practiceLeaf(l), l).toBeNull();
    }
    expect(wrongLeaves.has("algebra.equations.quadratic")).toBe(true);
    expect(leavesTouched().length).toBeGreaterThan(10);
  });
});

describe("the set's most relevant skills", () => {
  it("are the seven moves most problems lean on, most common first, never the whole-task leaf or communication", async () => {
    const { relevantSkills } = await import("./hierarchy");
    const top = relevantSkills();
    expect(top).toHaveLength(7);
    expect(top[0]).toBe("functions.zeros.nfl");
    expect(top).toContain("algebra.expand-factor.monic");
    expect(top).toContain("algebra.number.fractions");
    expect(top).not.toContain("algebra.equations.quadratic");
    expect(top.some((l) => l.startsWith("communication."))).toBe(false);
    expect(relevantSkills(undefined, 3)).toEqual(top.slice(0, 3));
  });
});

describe("restricting a result to a comment's skills", () => {
  it("colours only the kept leaves and rolls groups and categories up from them alone", async () => {
    const { classmateHierarchy, leavesBehind, restrictTo, classmateEvidence } = await import("./hierarchy");
    const amelia = CLASSMATES.find((c) => c.id === "amelia")!;
    const full = classmateHierarchy(amelia);
    const keep = leavesBehind(["q10"], classmateEvidence(amelia).lines);
    expect(keep).toContain("reasoning.justify.conclusions");
    expect(keep).toContain("algebra.equations.discriminant");
    const r = restrictTo(full, keep);
    expect(r.leaves["reasoning.justify.conclusions"]).toBe("gap");
    expect(r.groups["reasoning.justify"]).toBe("gap");
    expect(r.categories.reasoning).toBe("gap");
    expect(r.leaves["algebra.equations.discriminant"]).toBe("developing");
    expect(r.categories.new).toBe("developing");
    expect(r.leaves["algebra.expand-factor.monic"]).toBe("unseen");
    expect(r.categories.algebra).toBe("unseen");
    expect(r.categories.functions).toBe("unseen");
    expect(r.categories.graphing).toBe("secure"); // Q10's "in context" step is also a sketching step
  });
});

describe("a classmate with nothing done", () => {
  it("has not submitted, so no problem reads as skipped and every dot is unseen", async () => {
    const { classmateEvidence, hierarchyFor } = await import("./hierarchy");
    const { CLASSMATE_MAP } = await import("@/data/classmates");
    const chloe = CLASSMATE_MAP.chloe;
    expect(chloe.done).toBe(0);
    const ev = classmateEvidence(chloe);
    expect(ev.submitted).toBe(false);
    expect(Object.keys(ev.lines)).toEqual([]);
    const h = hierarchyFor(ev);
    expect(h.half.categories).toEqual([]);
    expect(Object.values(h.categories).every((s) => s === "unseen")).toBe(true);
  });
});

describe("New skills per set (ticket 209)", () => {
  it("routes a listed skill's evidence to New skills on that set and to its home on a set that does not list it, never both", async () => {
    const { ASSIGNMENT } = await import("@/data/assignment");
    const { PS5_ASSIGNMENT } = await import("@/data/pset5/assignment");
    const { PS5_CLASSMATES } = await import("@/data/pset5/classmates");
    const { classmateHierarchy, homeLeaves } = await import("./hierarchy");
    const { groupsOf, leavesOf } = await import("@/data/taxonomy");
    type Set = { problems: typeof ASSIGNMENT.problems; newSkills: readonly LeafId[] };
    const sets: [string, Set, readonly { id: string }[]][] = [
      ["Problem Set 6", ASSIGNMENT, CLASSMATES],
      ["Problem Set 5", PS5_ASSIGNMENT, PS5_CLASSMATES],
    ];
    expect([...ASSIGNMENT.newSkills].sort()).toEqual(["algebra.equations.discriminant", "functions.zeros.nfl"]);
    expect([...PS5_ASSIGNMENT.newSkills].sort()).toEqual(["algebra.expand-factor.binomial", "functions.zeros.nfl"]);
    for (const [name, set, classmates] of sets) {
      // Every listed skill is tagged in the set's problems.
      for (const l of set.newSkills) expect(leavesTouched(set.problems), `${name}: ${l}`).toContain(l);
      for (const c of classmates as typeof CLASSMATES) {
        const h = classmateHierarchy(c, set);
        expect(h.newSkills).toEqual(set.newSkills.filter((l) => l in h.leaves));
        // No evidence counted twice: a leaf is under exactly one of the columns' groups, or New skills.
        for (const l of Object.keys(h.leaves) as LeafId[]) {
          const inNew = h.newSkills.includes(l);
          const inHome = h.columns.some((col) => col !== "new" && groupsOf(col).some((g) => homeLeaves(g, h.newSkills).includes(l)));
          expect(inNew !== inHome, `${name} · ${c.id} · ${l}`).toBe(true);
        }
        // The New skills pill is the worst of the listed skills alone.
        const worst = h.newSkills.map((l) => h.leaves[l]!);
        expect(h.categories.new, `${name} · ${c.id}`).toBe(worst.length ? rollUp(worst) : undefined);
        // A home group's status never reads a New skill.
        for (const g of Object.keys(h.groups) as (keyof typeof h.groups)[]) {
          const own = leavesOf(g).filter((l) => l in h.leaves && !h.newSkills.includes(l)).map((l) => h.leaves[l]!);
          expect(h.groups[g], `${name} · ${c.id} · ${g}`).toBe(rollUp(own));
        }
      }
    }
  });

  it("on Problem Set 6 binomial-identity evidence sits under Algebra, and the null factor law under New skills, not Functions", () => {
    const amelia = CLASSMATES.find((c) => c.id === "amelia")!;
    const h = classmateHierarchy(amelia);
    expect(h.columns).toContain("new");
    expect(h.newSkills).toContain("functions.zeros.nfl");
    expect(h.groups["functions.zeros"]).toBe(h.leaves["functions.zeros.zero-finding"]);
    expect(h.newSkills).not.toContain("algebra.expand-factor.binomial");
    expect(h.leaves["algebra.expand-factor.binomial"]).toBeDefined();
    expect(h.groups["algebra.expand-factor"]).toBeDefined();
    // The same classmate record read with nothing new: everything goes home, and New skills is gone.
    const home = classmateHierarchy(amelia, { problems: PROBLEMS, newSkills: [] });
    expect(home.columns).not.toContain("new");
    expect(home.categories.new).toBeUndefined();
    const zeros = (["functions.zeros.zero-finding", "functions.zeros.nfl"] as LeafId[]).map((l) => home.leaves[l]!);
    expect(home.groups["functions.zeros"]).toBe(rollUp(zeros));
    // Listing a skill moves it: binomial identity new on a set drops it from Expanding & factorising.
    const moved = classmateHierarchy(amelia, { problems: PROBLEMS, newSkills: ["algebra.expand-factor.binomial"] });
    expect(moved.categories.new).toBe(moved.leaves["algebra.expand-factor.binomial"]);
    expect(moved.categories.new).toBe(home.leaves["algebra.expand-factor.binomial"]);
  });

  it("restricting keeps New skills apart from home groups", async () => {
    const { restrictTo } = await import("./hierarchy");
    const amelia = CLASSMATES.find((c) => c.id === "amelia")!;
    const full = classmateHierarchy(amelia);
    const r = restrictTo(full, ["functions.zeros.nfl"]);
    expect(r.categories.new).toBe(full.leaves["functions.zeros.nfl"]);
    expect(r.groups["functions.zeros"]).toBe("unseen");
    expect(r.categories.functions).toBe("unseen");
  });
});
