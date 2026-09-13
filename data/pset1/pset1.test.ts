import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "../assignment";
import { CLASSMATES } from "../classmates";
import { DEFAULT_GROUPS } from "../groups";
import { isLeafId } from "../taxonomy";
import { PS1_ASSIGNMENT, PS1_PATHWAY, PS1_PROBLEMS } from "./assignment";
import { PS1_CLASSMATES, PS1_SAM } from "./classmates";
import { PS1_EVALUATION } from "./evaluation";
import { EVALUATION } from "../evaluation";
import { assignmentBundle, assignmentIds, assignmentReportHref, assignmentStages, earlierAssignmentIds, landingTab, rosterProgress, studentRecord, submittedCount } from "@/lib/assignments";
import { evaluateLine } from "@/lib/evaluate";
import { categoriesTouched, classmateHierarchy } from "@/lib/hierarchy";
import { HISTORY_DATES, historyFor } from "@/lib/history";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";
import { commentaryFor } from "@/lib/commentary";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { CLASS_SIZE } from "@/lib/readiness";
import { sessionAt } from "@/lib/session";
import { skipFixture } from "@/lib/demo";
import { categoryHistory, earlierResults } from "@/lib/setHistory";
import { assignmentCard, topGap } from "@/lib/classroomCards";

const now = 1_700_000_000_000;
const everyone = [PS1_SAM, ...PS1_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));

describe("Problem Set 1's data (ticket 187)", () => {
  it("is Features of a parabola, due Thu 3 Sep, ten problems with their own ids, the same class and unit as Problem Set 2", () => {
    expect(PS1_ASSIGNMENT).toMatchObject({ id: "pset-1", title: "PROBLEM SET 1 — FEATURES OF A PARABOLA", due: "Thu 3 Sep", className: ASSIGNMENT.className, classCode: ASSIGNMENT.classCode, teacher: ASSIGNMENT.teacher, unit: ASSIGNMENT.unit });
    expect(PS1_ASSIGNMENT.goal.length).toBeGreaterThan(100);
    expect(PS1_PROBLEMS.map((p) => p.label)).toEqual(["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"]);
    for (const p of PS1_PROBLEMS) expect(EVALUATION[p.id], p.id).toBeUndefined();
    expect(PS1_PATHWAY).toEqual(["individual", "group"]);
  });

  it("touches the same categories as Problem Set 2, so the class view's columns line up", () => {
    expect(categoriesTouched(PS1_PROBLEMS)).toEqual(categoriesTouched(ASSIGNMENT.problems));
  });

  it("every model-solution step is tagged with real taxonomy leaves and holds in the evaluation table", () => {
    for (const p of PS1_PROBLEMS) {
      expect(p.solution.length, p.id).toBeGreaterThan(1);
      for (const st of p.solution) {
        expect(st.tags.length, `${p.id}: ${st.tex}`).toBeGreaterThan(0);
        for (const t of st.tags) expect(isLeafId(t.leaf), t.leaf).toBe(true);
        expect(evaluateLine(p.id, st.tex).verdict, `${p.id}: ${st.tex}`).toBe("ok");
      }
      // A finished problem needs an answer line: the model solution's last step is one.
      const last = evaluateLine(p.id, p.solution[p.solution.length - 1].tex);
      expect(last.verdict === "ok" && last.answer, p.id).toBe(true);
    }
  });

  it("every verdict's tags exist, and every wrong line has a clue, a note and a short name", () => {
    for (const [pid, table] of Object.entries(PS1_EVALUATION)) {
      expect(PS1_PROBLEMS.some((p) => p.id === pid)).toBe(true);
      for (const [tex, v] of Object.entries(table)) {
        for (const t of v.tags) expect(isLeafId(t.leaf), `${pid}: ${tex}`).toBe(true);
        if (v.verdict === "wrong") {
          expect(v.clue && v.note && v.name, `${pid}: ${tex}`).toBeTruthy();
          expect(v.name!.split(" ").length, v.name).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it("has all twenty students, Sam first, the classmates in Problem Set 2's order", () => {
    expect(everyone).toHaveLength(CLASS_SIZE);
    expect(PS1_SAM.id).toBe(DEMO_STUDENT.id);
    expect(PS1_CLASSMATES.map((c) => [c.id, c.name, c.initials])).toEqual(CLASSMATES.map((c) => [c.id, c.name, c.initials]));
  });

  it("every student's record is complete: answered count in range, wrong problems reached and worked, every line known, notes on their problems, words and a group line", () => {
    const ids = PS1_PROBLEMS.map((p) => p.id);
    for (const c of everyone) {
      expect(c.done, c.id).toBeGreaterThanOrEqual(0);
      expect(c.done, c.id).toBeLessThanOrEqual(10);
      expect(c.groupStatus.length, c.id).toBeGreaterThan(0);
      for (const pid of c.wrong) {
        expect(ids.indexOf(pid), `${c.id} ${pid}`).toBeGreaterThanOrEqual(0);
        expect(ids.indexOf(pid), `${c.id} ${pid} reached`).toBeLessThan(c.done);
        const lines = c.attempts[pid];
        expect(lines?.length, `${c.id} ${pid} attempts`).toBeGreaterThan(0);
        expect(lines.some((tex) => evaluateLine(pid, tex).verdict === "wrong"), `${c.id} ${pid} has a wrong line`).toBe(true);
        expect(lines.some((tex) => { const v = evaluateLine(pid, tex); return v.verdict !== "unclear" && v.answer; }), `${c.id} ${pid} finished`).toBe(true);
      }
      for (const [pid, lines] of Object.entries(c.attempts)) {
        for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${c.id} ${pid}: ${tex}`).not.toBe("unclear");
        // Working on a problem they got right holds line by line.
        if (!c.wrong.includes(pid)) expect(lines.every((tex) => evaluateLine(pid, tex).verdict === "ok"), `${c.id} ${pid}`).toBe(true);
      }
      for (const n of c.notes) for (const pid of n.problems) expect(ids, `${c.id} note`).toContain(pid);
      if (c.done > 0 && (c.wrong.length > 0 || c.notes.length > 0)) {
        expect(c.notes.length, c.id).toBeGreaterThan(0);
        expect(c.clarification?.length, c.id).toBeGreaterThan(0);
        for (const pid of c.wrong) expect(c.notes.some((n) => n.problems.includes(pid)), `${c.id} ${pid} noted`).toBe(true);
      }
    }
  });

  it("Liam O'Connell handed nothing in; Priya got everything right; Chloe, missing on Problem Set 2, handed this one in", () => {
    expect(byId.liam).toMatchObject({ done: 0, wrong: [], attempts: {} });
    expect(byId.liam.clarification).toBeUndefined();
    expect(everyone.filter((c) => c.done === 0).map((c) => c.id)).toEqual(["liam"]);
    expect(byId.priya).toMatchObject({ done: 10, wrong: [] });
    expect(byId.chloe.done).toBe(10);
    expect(CLASSMATES.find((c) => c.id === "chloe")!.done).toBe(0);
  });

  it("Sam's answers are fixed and finished: all ten reached, three careless slips", () => {
    expect(PS1_SAM.done).toBe(10);
    expect(PS1_SAM.wrong).toEqual(["ps1-q4", "ps1-q6", "ps1-q9"]);
  });

  it("the habits Problem Set 2 catches start here: Mia and Jordan guess non-monic pairs, Tomas flips signs and fractions", () => {
    const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.name] : [])));
    expect(names("mia")).toContain("guessed pair, not expanded back");
    expect(names("jordan")).toEqual(["guessed pair, not expanded back", "guessed pair, not expanded back"]);
    expect(names("tomas")).toEqual(["intercepts with signs flipped", "turning point sign flipped", "fraction flipped solving a factor", "axis without the minus"]);
  });
});

describe("Problem Set 1 in the registry (ticket 187)", () => {
  const b = assignmentBundle("pset-1", INITIAL_CLASSROOM)!;

  it("is always in the Classroom, after Problem Set 2, finished with its own pathway, classmates, Sam's record and frozen groups", () => {
    expect(assignmentIds(INITIAL_CLASSROOM)).toContain("pset-1");
    expect(assignmentIds(null)).toContain("pset-1");
    expect(b).toMatchObject({ id: "pset-1", kind: "finished", title: PS1_ASSIGNMENT.title, due: "Thu 3 Sep", unitNumber: 1, pathway: ["individual", "group"] });
    expect(b.problems).toBe(PS1_PROBLEMS);
    expect(b.classmates).toBe(PS1_CLASSMATES);
    expect(b.sam).toBe(PS1_SAM);
    expect(b.groups).toEqual(DEFAULT_GROUPS);
    // Problem Set 2 exists once created (ticket 188); Problem Set 1 does not wait for it.
    expect(assignmentIds(INITIAL_CLASSROOM)).toEqual(["pset-1"]);
    expect(assignmentBundle("pset-2", skipFixture("working", now).classroom)!.sam).toBeNull();
    expect(earlierAssignmentIds("pset-2")).toEqual(["pset-1"]);
    expect(earlierAssignmentIds("pset-1")).toEqual([]);
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

  it("Sam's live session never reaches Problem Set 1's mistakes: his record does", () => {
    const withSession = mistakesByProblem(sessionAt("report"), { ...b, sam: b.sam });
    expect(withSession.flatMap((m) => m.rows).every((r) => !r.live)).toBe(true);
  });

  it("the Mistakes tab has all ten problems, correct and skipped counts adding up to the class of twenty", () => {
    const ms = mistakesByProblem(null, b);
    expect(ms.map((m) => m.problem.label)).toEqual(PS1_PROBLEMS.map((p) => p.label));
    for (const m of ms) {
      const reached = everyone.filter((c) => PS1_PROBLEMS.indexOf(m.problem) < c.done).length;
      expect(m.right + m.rows.length, m.problem.id).toBe(reached);
      expect(CLASS_SIZE - m.right - m.rows.length, m.problem.id).toBeGreaterThanOrEqual(1); // Liam at least
      for (const r of m.rows) expect(r.slips.length, `${m.problem.id} ${r.id}`).toBeGreaterThan(0);
    }
    expect(ms[3].rows.map((r) => r.id)).toEqual(["sam", "jordan", "tomas", "mia", "chloe", "oliver", "finn", "sofia"]);
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

  it("the Classroom's PAST card: done, 19/20 submitted, top gap non-monic factorising on seven students, well clear of the next", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id: "pset-1", name: "Problem Set 1 — Features of a parabola", due: "Thu 3 Sep", section: "past", status: "done", submitted: 19, total: 20, mistakes: 45 });
    expect(card.topGap).toEqual({ slips: ["algebra.expand-factor.nonmonic"], name: "non-monic factorising", students: 7 });
    // The runners-up (graph features, evaluating) reach five.
    const rest = mistakesByProblem(null, b).map((m) => ({ ...m, rows: m.rows.filter((r) => !r.slips.includes("algebra.expand-factor.nonmonic")) }));
    expect(topGap(rest)!.students).toBe(5);
  });

  it("a name opens that student's own record: report link, commentary and words", () => {
    expect(assignmentReportHref("pset-1", "mia")).toBe("/teacher/a/pset-1/report?student=mia");
    expect(assignmentReportHref("pset-2")).toBe("/teacher/a/pset-2/report");
    expect(studentRecord(b, "sam")).toBe(PS1_SAM);
    expect(studentRecord(b, "mia")!.wrong).toContain("ps1-q8");
    const c = commentaryFor("sam", sessionAt("report"), studentRecord(b, "sam"));
    expect(c.ideas.map((i) => i.problems)).toEqual([["ps1-q4"], ["ps1-q6"], ["ps1-q9"]]);
    expect(c.clarification).toMatch(/wrong bracket/);
  });
});

describe("history across the two sets (ticket 187)", () => {
  const ps1 = assignmentBundle("pset-1", INITIAL_CLASSROOM)!;
  const columns = categoriesTouched(ASSIGNMENT.problems);

  it("on Problem Set 2 every student's newest pill in every category is their Problem Set 1 status, dated Sep 3; the four before it are simulated, dated earlier", () => {
    for (const c of everyone) {
      const ps1Status = classmateHierarchy(c, PS1_PROBLEMS).categories;
      for (const cat of columns) {
        const h = categoryHistory("pset-2", c.id, cat, "gap");
        expect(h).toHaveLength(5);
        expect(h[4], `${c.id} ${cat}`).toEqual({ date: "Sep 3", status: ps1Status[cat] ?? "unseen" });
        expect(h.slice(0, 4).map((p) => p.date)).toEqual(HISTORY_DATES.slice(1));
        expect(h.slice(0, 4).every((p) => p.status !== "unseen")).toBe(true);
      }
    }
  });

  it("Problem Set 1's own history is the five simulated results before it, and agrees with Problem Set 2's on every shared date", () => {
    for (const c of everyone) {
      for (const cat of columns) {
        const today = classmateHierarchy(c, PS1_PROBLEMS).categories[cat] ?? "unseen";
        const own = categoryHistory("pset-1", c.id, cat, today);
        expect(own.map((p) => p.date)).toEqual([...HISTORY_DATES]);
        expect(own).toEqual(historyFor(c.id, cat, today));
        expect(categoryHistory("pset-2", c.id, cat, "secure").slice(0, 4)).toEqual(own.slice(1));
      }
    }
  });

  it("reads real statuses: Priya dark green, Liam nothing seen, Mia's algebra not secure after the guessed pairs", () => {
    for (const cat of columns) {
      expect(earlierResults("pset-2", "priya", cat)).toEqual([{ date: "Sep 3", status: "secure" }]);
      expect(earlierResults("pset-2", "liam", cat)).toEqual([{ date: "Sep 3", status: "unseen" }]);
    }
    expect(earlierResults("pset-2", "mia", "algebra")[0].status).not.toBe("secure");
    expect(earlierResults("pset-2", "nobody", "algebra")).toEqual([]);
    expect(earlierResults("pset-1", "mia", "algebra")).toEqual([]);
    void ps1;
  });
});
