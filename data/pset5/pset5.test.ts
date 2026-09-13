import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "../assignment";
import { CLASSMATES } from "../classmates";
import { DEFAULT_GROUPS } from "../groups";
import { PS5 } from ".";
import { PS5_ASSIGNMENT, PS5_PROBLEMS } from "./assignment";
import { PS5_CLASSMATES, PS5_SAM } from "./classmates";
import { assignmentBundle, assignmentIds, assignmentReportHref, assignmentStages, landingTab, rosterProgress, studentRecord, submittedCount } from "@/lib/assignments";
import { evaluateLine } from "@/lib/evaluate";
import { categoriesTouched } from "@/lib/hierarchy";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";
import { commentaryFor } from "@/lib/commentary";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { CLASS_SIZE } from "@/lib/readiness";
import { sessionAt } from "@/lib/session";
import { skipFixture } from "@/lib/demo";
import { assignmentCard, topGap } from "@/lib/classroomCards";

const now = 1_700_000_000_000;
const everyone = [PS5_SAM, ...PS5_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));

describe("Problem Set 5's data (ticket 187)", () => {
  it("touches the same categories as Problem Set 6, so the class view's columns line up", () => {
    expect(categoriesTouched(PS5_ASSIGNMENT)).toEqual(categoriesTouched(ASSIGNMENT));
  });

  it("Liam O'Connell handed nothing in; Priya got everything right; Chloe, missing on Problem Set 6, handed this one in", () => {
    expect(byId.liam).toMatchObject({ done: 0, wrong: [], attempts: {} });
    expect(byId.liam.clarification).toBeUndefined();
    expect(everyone.filter((c) => c.done === 0).map((c) => c.id)).toEqual(["liam"]);
    expect(byId.priya).toMatchObject({ done: 10, wrong: [] });
    expect(byId.chloe.done).toBe(10);
    expect(CLASSMATES.find((c) => c.id === "chloe")!.done).toBe(0);
  });

  it("Sam's answers are fixed and finished: all ten reached, three careless slips", () => {
    expect(PS5_SAM.done).toBe(10);
    expect(PS5_SAM.wrong).toEqual(["ps5-q4", "ps5-q6", "ps5-q9"]);
  });

  it("the habits Problem Set 6 catches start here: Mia and Jordan guess non-monic pairs, Tomas flips signs and fractions", () => {
    const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.name] : [])));
    expect(names("mia")).toContain("guessed pair, not expanded back");
    expect(names("jordan")).toEqual(["guessed pair, not expanded back", "guessed pair, not expanded back"]);
    expect(names("tomas")).toEqual(["intercepts with signs flipped", "turning point sign flipped", "fraction flipped solving a factor", "axis without the minus"]);
  });
});

describe("Problem Set 5 in the registry (ticket 187)", () => {
  const b = assignmentBundle("pset-5", INITIAL_CLASSROOM)!;

  it("is Features of a parabola, due Mon 7 Sep, on the default seating, and does not wait for Problem Set 6 to be created (ticket 188); the shared suite in data/finishedSets.test.ts checks the rest", () => {
    expect(b).toMatchObject({ id: "pset-5", kind: "finished", title: "PROBLEM SET 5 — FEATURES OF A PARABOLA", due: "Mon 7 Sep", pathway: ["individual", "group"] });
    expect(PS5.fixture).toBe(PS5_ASSIGNMENT);
    expect(b.groups).toEqual(DEFAULT_GROUPS);
    expect(assignmentIds(INITIAL_CLASSROOM)).toContain("pset-5");
    expect(assignmentBundle("pset-6", skipFixture("working", now).classroom)!.sam).toBeNull();
  });

  it("nineteen handed in, Liam missing, every stage over, and it lands on Class", () => {
    const p = rosterProgress(b, sessionAt("working"), now);
    expect(p.liam).toEqual({ kind: "not-started" });
    expect(p[DEMO_STUDENT.id]).toEqual({ kind: "submitted" });
    expect(submittedCount(b, null, now)).toEqual({ submitted: 19, total: 20 });
    const stages = assignmentStages(b, INITIAL_CLASSROOM, null, now);
    expect(stages.map((s) => [s.id, s.state])).toEqual([["working", "over"], ["individual", "over"], ["group", "over"]]);
    expect(landingTab(b, INITIAL_CLASSROOM, sessionAt("working"), now)).toBe("class");
  });

  it("Sam's live session never reaches Problem Set 5's mistakes: his record does", () => {
    const withSession = mistakesByProblem(sessionAt("report"), { ...b, sam: b.sam });
    expect(withSession.flatMap((m) => m.rows).every((r) => !r.live)).toBe(true);
  });

  it("the Mistakes tab has all ten problems, correct and skipped counts adding up to the class of twenty", () => {
    const ms = mistakesByProblem(null, b);
    expect(ms.map((m) => m.problem.label)).toEqual(PS5_PROBLEMS.map((p) => p.label));
    for (const m of ms) {
      const reached = everyone.filter((c) => PS5_PROBLEMS.indexOf(m.problem) < c.done).length;
      expect(m.right + m.rows.length, m.problem.id).toBe(reached);
      expect(CLASS_SIZE - m.right - m.rows.length, m.problem.id).toBeGreaterThanOrEqual(1); // Liam at least
      for (const r of m.rows) expect(r.slips.length, `${m.problem.id} ${r.id}`).toBeGreaterThan(0);
    }
    expect(ms[3].rows.map((r) => r.id)).toEqual(["sam", "jordan", "tomas", "zara", "mia", "chloe", "oliver", "finn", "sofia"]);
    expect(ms[0].right).toBe(18);
  });

  it("has a clear top gap: the guessed non-monic pair, on more students than any other mistake", () => {
    const byName = new Map<string, Set<string>>();
    const byCluster: { key: string; students: number }[] = [];
    for (const m of mistakesByProblem(null, b)) {
      for (const g of groupBySlip(m.rows)) for (const mg of g.mistakes) byCluster.push({ key: `${m.problem.label} ${mg.key}`, students: mg.rows.length });
      for (const r of m.rows) for (const l of r.lines) if (l.verdict.verdict === "wrong") byName.set(l.verdict.name!, (byName.get(l.verdict.name!) ?? new Set()).add(r.id));
    }
    const names = [...byName.entries()].map(([n, s]) => [n, s.size] as const).sort((x, y) => y[1] - x[1]);
    expect(names[0]).toEqual(["guessed pair, not expanded back", 6]);
    expect(names[1][1]).toBeLessThan(6);
    const clusters = byCluster.sort((x, y) => y.students - x.students);
    expect(clusters[0]).toEqual({ key: "Q4 (3x - 4)(x + 2) = 0", students: 5 });
    expect(clusters[1].students).toBeLessThan(5);
  });

  it("the Classroom's PAST card: done, 19/20 submitted, top gap graph features on nine students, non-monic factorising next on seven", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id: "pset-5", name: "Problem Set 5 — Features of a parabola", due: "Mon 7 Sep", section: "past", status: "done", submitted: 19, total: 20, mistakes: 47 });
    // Ticket 210: the axis given as the height is a graph feature, as on Problem Set 6's Q9, so the sign readers and the height readers make one cluster.
    expect(card.topGap).toEqual({ slips: ["graphing.quadratics.features"], name: "graph features", students: 9 });
    const rest = mistakesByProblem(null, b).map((m) => ({ ...m, rows: m.rows.filter((r) => !r.slips.includes("graphing.quadratics.features")) }));
    expect(topGap(rest)).toEqual({ slips: ["algebra.expand-factor.nonmonic"], name: "non-monic factorising", students: 7 });
  });

  it("a name opens that student's own record: report link, commentary and words", () => {
    expect(assignmentReportHref("pset-5", "mia")).toBe("/teacher/a/pset-5/report?student=mia");
    expect(assignmentReportHref("pset-6")).toBe("/teacher/a/pset-6/report");
    expect(studentRecord(b, "sam")).toBe(PS5_SAM);
    expect(studentRecord(b, "mia")!.wrong).toContain("ps5-q8");
    const c = commentaryFor("sam", sessionAt("report"), studentRecord(b, "sam"));
    expect(c.ideas.map((i) => i.problems)).toEqual([["ps5-q4"], ["ps5-q6"], ["ps5-q9"]]);
    expect(c.clarification).toMatch(/wrong bracket/);
  });
});

// The two sets' history (ticket 187) is tested over the registry in lib/setHistory.test.ts (ticket 215).
