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
import { assignmentCard } from "@/lib/classroomCards";

const now = 1_700_000_000_000;
const everyone = [PS5_SAM, ...PS5_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));

describe("Problem Set 5's data (ticket 187)", () => {
  it("touches the same categories as Problem Set 6, so the class view's columns line up", () => {
    expect(categoriesTouched(PS5_ASSIGNMENT)).toEqual(categoriesTouched(ASSIGNMENT));
  });

  it("Liam hands in five (ticket 281; nothing before); nobody is missing; Priya got everything right; Chloe, missing on Problem Set 6, handed this one in", () => {
    expect(byId.liam).toMatchObject({ done: 5, wrong: ["ps5-q1", "ps5-q4"] });
    expect(byId.liam.clarification).toBeDefined();
    expect(everyone.filter((c) => c.done === 0).map((c) => c.id)).toEqual([]);
    expect(byId.priya).toMatchObject({ done: 10, wrong: [] });
    expect(byId.chloe.done).toBe(10);
    expect(CLASSMATES.find((c) => c.id === "chloe")!.done).toBe(0);
  });

  it("Sam's answers are fixed and finished: all ten reached, three sign slips, one pattern", () => {
    expect(PS5_SAM.done).toBe(10);
    expect(PS5_SAM.wrong).toEqual(["ps5-q4", "ps5-q6", "ps5-q9"]);
  });

  it("the patterns Problem Set 6 catches start here: Mia's and Jordan's non-monic brackets don't expand back, Tomas flips signs and fractions", () => {
    const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.misconception] : [])));
    expect(names("mia")).toContain("brackets-dont-expand");
    // Ticket 343: Jordan's Q8 (2x + 1)(x − 3) is the right numbers with both signs swapped, the narrower misconception.
    expect(names("jordan")).toEqual(["brackets-dont-expand", "pair-signs-swapped"]);
    expect(names("tomas")).toEqual(["root-vertex-sign", "root-vertex-sign", "divided-wrong-way", "minus-b-dropped"]);
  });

  it("names Q8's (2x + 1)(x − 3) signs swapped in the pair, and every writer's commentary says so beside Q4's brackets (ticket 343)", () => {
    expect(evaluateLine("ps5-q8", "y = (2x + 1)(x - 3)")).toMatchObject({ verdict: "wrong", misconception: "pair-signs-swapped" });
    expect(evaluateLine("ps5-q8", "y = (2x + 3)(x - 1)")).toMatchObject({ verdict: "wrong", misconception: "brackets-dont-expand" });
    const note = (id: string, pid: string) => byId[id].notes.filter((n) => n.problems.includes(pid)).map((n) => n.text);
    for (const id of ["jordan", "ethan", "oliver", "sofia"]) expect(note(id, "ps5-q8"), id).toEqual(["the non-monic pair's signs swapped"]);
    for (const id of ["jordan", "oliver", "sofia"]) expect(note(id, "ps5-q4"), id).toEqual(["non-monic brackets wrong"]);
    expect(note("mia", "ps5-q8")).toEqual(["non-monic brackets wrong"]);
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

  it("all twenty handed in (Liam since ticket 281), every stage over, and it lands on Class", () => {
    const p = rosterProgress(b, sessionAt("working"), now);
    expect(p.liam).toEqual({ kind: "submitted" });
    expect(p[DEMO_STUDENT.id]).toEqual({ kind: "submitted" });
    expect(submittedCount(b, null, now)).toEqual({ submitted: 20, total: 20 });
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
      expect(CLASS_SIZE - m.right - m.rows.length, m.problem.id).toBe(everyone.filter((c) => PS5_PROBLEMS.indexOf(m.problem) >= c.done).length);
      for (const r of m.rows) expect(r.misconceptions.length, `${m.problem.id} ${r.id}`).toBeGreaterThan(0);
    }
    expect(ms[3].rows.map((r) => r.id)).toEqual(["sam", "jordan", "tomas", "zara", "liam", "mia", "chloe", "oliver", "finn", "sofia"]);
    expect(ms[0].right).toBe(18);
  });

  it("has a clear top gap: non-monic brackets that don't expand back, on more students than any other mistake", () => {
    const byName = new Map<string, Set<string>>();
    const byCluster: { key: string; students: number }[] = [];
    for (const m of mistakesByProblem(null, b)) {
      for (const g of groupBySlip(m.rows)) for (const mg of g.mistakes) byCluster.push({ key: `${m.problem.label} ${mg.key}`, students: mg.rows.length });
      for (const r of m.rows) for (const l of r.lines) if (l.verdict.verdict === "wrong") byName.set(l.verdict.misconception!, (byName.get(l.verdict.misconception!) ?? new Set()).add(r.id));
    }
    const names = [...byName.entries()].map(([n, s]) => [n, s.size] as const).sort((x, y) => y[1] - x[1]);
    // Ticket 343: Q8's (2x + 1)(x − 3) moved to signs swapped in the pair, so Ethan (Q8 alone) leaves the count.
    expect(names[0]).toEqual(["brackets-dont-expand", 6]);
    expect(names[1][1]).toBeLessThan(6);
    const clusters = byCluster.sort((x, y) => y.students - x.students);
    expect(clusters[0]).toEqual({ key: "Q4 (3x - 4)(x + 2) = 0", students: 6 });
    expect(clusters[1].students).toBeLessThan(6);
  });

  it("the Classroom's PAST card: done, 20/20 submitted, top gaps brackets not expanding back on six students, then a root or vertex sign wrong under Graphing and signs swapped in the pair under Algebra on five each (tickets 299, 323, 343)", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id: "pset-5", name: "Problem Set 5 — Features of a parabola", due: "Mon 7 Sep", section: "past", status: "done", submitted: 20, total: 20, mistakes: 49 });
    // Ticket 299: the turning points' signs and the intercepts' signs read off the brackets are one misconception, and the heights given as x another (both under Graphing, ticket 323).
    expect(card.topGaps).toEqual([
      { misconception: "brackets-dont-expand", name: "brackets don't expand back", students: 6, skill: "Algebra" },
      { misconception: "root-vertex-sign", name: "root or vertex sign wrong", students: 5, skill: "Graphing" },
      { misconception: "pair-signs-swapped", name: "signs swapped in the pair", students: 5, skill: "Algebra" },
    ]);
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
