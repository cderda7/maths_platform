import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { tag } from "@/data/types";
import { wrong } from "@/data/evaluation";
import { misconceptionName, type MisconceptionId } from "@/data/misconceptions";
import type { LeafId } from "@/data/taxonomy";
import { assignmentBundle, type AssignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { assignmentCard, classroomCards, dueOrder, gapGroups, mistakeCount, newestFirst, sectionCards, TOP_GAPS, topGaps, type TopGap } from "./classroomCards";
import { skipFixture } from "./demo";
import { mistakesByProblem, type MistakeRow, type ProblemMistakes } from "./mistakes";
import { CLASS_SIZE } from "./readiness";

const now = 1_700_000_000_000;
/** Problem Set 6 exists once created (ticket 188): the classroom as the create flow leaves it. */
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group"], goal: ASSIGNMENT.goal, at: now });
const GUESSED: MisconceptionId = "brackets-dont-expand";
const SUM: MisconceptionId = "pair-sum-wrong";
const ROOT: MisconceptionId = "root-not-taken";
const SIGN: MisconceptionId = "product-sign";
const HALF: MisconceptionId = "halving-wrong";
const SURDS: LeafId = "algebra.number.surds";
const EXPAND: LeafId = "algebra.expand-factor.expand";
const ZERO: LeafId = "functions.zeros.zero-finding";

const row = (id: string, misconceptions: MisconceptionId[]): MistakeRow => ({ id, name: id, initials: id.slice(0, 2).toUpperCase(), live: false, lines: [], misconceptions });
const problem = (i: number, rows: MistakeRow[]): ProblemMistakes => ({ problem: ASSIGNMENT.problems[i], rows, right: 0, pending: 0 });

describe("mistakes so far", () => {
  it("counts every wrong answer to a problem: one per student per problem", () => {
    expect(mistakeCount([])).toBe(0);
    expect(mistakeCount([problem(0, [row("a", [SUM, SUM]), row("b", [ROOT])]), problem(1, [row("a", [ROOT])])])).toBe(3);
  });

  it("on Problem Set 6 it is the number of rows on its Mistakes tab", () => {
    const b = assignmentBundle("pset-6", CREATED)!;
    const rows = mistakesByProblem(null, b);
    expect(mistakeCount(rows)).toBe(rows.flatMap((p) => p.rows).length);
    expect(mistakeCount(rows)).toBeGreaterThan(0);
  });
});

describe("the top gaps", () => {
  it("are empty when nobody slipped, and ignore rows with no recognised slip", () => {
    expect(topGaps([], [])).toEqual([]);
    expect(topGaps([problem(0, [row("a", [])])], [])).toEqual([]);
  });

  it("rank each misconception by how many different students slipped with it across every problem, and keep three", () => {
    const gaps = topGaps(
      [
        problem(0, [row("a", [ROOT]), row("b", [ROOT]), row("c", [SUM]), row("f", [SIGN])]),
        problem(1, [row("c", [GUESSED]), row("d", [GUESSED]), row("g", [HALF])]),
        problem(2, [row("e", [GUESSED]), row("a", [ROOT]), row("h", [SUM])]),
      ],
      [],
    );
    expect(gaps.map((g) => [g.misconception, g.students])).toEqual([[GUESSED, 3], [ROOT, 2], [SUM, 2]]);
    expect(gaps[0].name).toBe("brackets don't expand back");
    expect(TOP_GAPS).toBe(3);
  });

  it("count a student once however many problems they slipped on, and a row's two misconceptions each", () => {
    const gaps = topGaps([problem(0, [row("a", [ROOT, SUM, ROOT]), row("b", [SUM])]), problem(1, [row("a", [ROOT])])], []);
    expect(gaps.map((g) => [g.misconception, g.students])).toEqual([[SUM, 2], [ROOT, 1]]);
  });

  it("break a tie by problem order, then row order", () => {
    expect(topGaps([problem(0, [row("a", [SUM])]), problem(1, [row("b", [ROOT]), row("c", [SUM])]), problem(2, [row("d", [ROOT])])], []).map((g) => g.misconception)).toEqual([SUM, ROOT]);
    expect(topGaps([problem(0, [row("a", [ROOT]), row("b", [SUM])])], []).map((g) => g.misconception)).toEqual([ROOT, SUM]);
  });

  it("name the skill most of the gap's wrong lines are tagged with: the home category, or the skill itself when it is new on the set, never New skills", () => {
    const tagged = (id: string, m: MisconceptionId, ...leaves: LeafId[]): MistakeRow => ({ ...row(id, [m]), lines: [{ tex: id, verdict: wrong(leaves.map((l) => tag(l)), "", "", "", m) }] });
    const ps = [problem(0, [tagged("a", ROOT, SURDS), tagged("b", ROOT, SURDS, EXPAND), tagged("c", ROOT, EXPAND, ZERO), tagged("d", SUM, ZERO)])];
    expect(topGaps(ps, []).map((g) => g.skill)).toEqual(["Algebra", "Functions"]);
    expect(topGaps(ps, [SURDS]).map((g) => g.skill)).toEqual(["surds", "Functions"]);
    expect(topGaps(ps, [SURDS, ZERO]).map((g) => g.skill)).toEqual(["surds", "zero-finding"]);
    expect(topGaps([problem(0, [row("a", [ROOT])])], []).map((g) => g.skill)).toEqual([null]);
    // Only the lines carrying the gap's own misconception count toward its skill.
    const mixed: MistakeRow = { ...row("a", [ROOT, SUM]), lines: [{ tex: "1", verdict: wrong([tag(ZERO)], "", "", "", SUM) }, { tex: "2", verdict: wrong([tag(SURDS)], "", "", "", ROOT) }] };
    expect(topGaps([problem(0, [mixed])], []).map((g) => [g.misconception, g.skill])).toEqual([[ROOT, "Algebra"], [SUM, "Functions"]]);
  });

  it("group by skill for the card: a shared skill's gaps side by side in rank order, groups in the order of their best gap", () => {
    const gap = (misconception: MisconceptionId, skill: string | null): TopGap => ({ misconception, name: misconceptionName(misconception), students: 1, skill });
    const [a, b, c] = [gap(ROOT, "Algebra"), gap(SUM, "Graphing"), gap(GUESSED, "Algebra")];
    expect(gapGroups([a, b, c])).toEqual([{ skill: "Algebra", gaps: [a, c] }, { skill: "Graphing", gaps: [b] }]);
    expect(gapGroups([gap(ROOT, null), gap(SUM, null)]).map((g) => g.gaps.length)).toEqual([1, 1]);
  });

  it("are computed from the set's work: every set's card names three, each under a skill, none under New skills", () => {
    const b = assignmentBundle("pset-6", CREATED)!;
    const gaps = topGaps(mistakesByProblem(null, b), b.newSkills);
    expect(gaps).toHaveLength(3);
    for (const g of gaps) expect(g.skill).not.toBeNull();
    expect(gaps.map((g) => g.skill)).not.toContain("New skills");
  });
});

describe("the Classroom's cards", () => {
  const live = assignmentBundle("pset-6", CREATED)!;
  /** A finished set standing in for Problem Set 5 (ticket 187) until it is registered: the same work, every stage over. */
  const finished: AssignmentBundle = { ...live, id: "pset-5", kind: "finished", title: "PROBLEM SET 5 — FEATURES OF A PARABOLA", name: "Problem Set 5 — Features of a parabola", due: "Mon 7 Sep", startedAt: null, absent: [] };

  it("Problem Set 6 while the class works is live: submitted of the nineteen in the room (Chloe absent, ticket 250) and its mistakes so far", () => {
    const { classroom, session } = skipFixture("working", now);
    const card = assignmentCard(assignmentBundle("pset-6", classroom)!, classroom, session, now);
    expect(card).toMatchObject({ id: "pset-6", name: "Problem Set 6 — Roots of a quadratic", href: "/teacher/a/pset-6", section: "live", status: "live", total: CLASS_SIZE - 1, due: "Thu 10 Sep" });
    // The stream long over (the skip went live an hour back, ticket 189): everyone but Sam, Chloe and Jordan, stalled on Q8.
    expect(card.submitted).toBe(CLASS_SIZE - 3);
    expect(card.mistakes).toBe(mistakeCount(mistakesByProblem(session, live)));
    expect(card.mistakes).toBe(mistakeCount(mistakesByProblem(session, assignmentBundle("pset-6", classroom)!, now)));
  });

  it("stays live, in review, through every review stage; moves to past, done, only once class review has ended (ticket 234)", () => {
    for (const skip of ["indiv review", "class wait", "group review", "report", "class review"] as const) {
      const { classroom, session } = skipFixture(skip, now);
      expect(assignmentCard(assignmentBundle("pset-6", classroom)!, classroom, session, now), skip).toMatchObject({ section: "live", status: "in review" });
    }
    const { classroom, session } = skipFixture("class review", now);
    const ended: ClassroomState = { ...classroom, wholeClass: { problems: [], examples: {}, slide: 0, view: "unmarked", status: "ended", modes: {}, ink: {} } };
    expect(assignmentCard(assignmentBundle("pset-6", ended)!, ended, session, now)).toMatchObject({ section: "past", status: "done" });
  });

  it("a finished set is past and done, everyone it counts handed in, with its top gaps computed from its work", () => {
    const card = assignmentCard(finished, CREATED, null, now);
    expect(card).toMatchObject({ id: "pset-5", name: "Problem Set 5 — Features of a parabola", href: "/teacher/a/pset-5", section: "past", status: "done", total: CLASS_SIZE, due: "Mon 7 Sep" });
    expect(card.submitted).toBe(CLASS_SIZE - 1); // Sam handed in; Chloe of this stand-in never started
    expect(card.topGaps).toEqual(topGaps(mistakesByProblem(null, finished), finished.newSkills));
    expect(card.topGaps).toHaveLength(3);
  });

  it("sections live above past, each newest first as given, for any mix including no live set", () => {
    const { classroom, session } = skipFixture("working", now);
    const liveNow = assignmentBundle("pset-6", classroom)!;
    const older: AssignmentBundle = { ...finished, id: "pset-4" };
    const s = sectionCards([liveNow, finished, older], classroom, session, now);
    expect(s.live.map((c) => c.id)).toEqual(["pset-6"]);
    expect(s.past.map((c) => c.id)).toEqual(["pset-5", "pset-4"]);
    expect(sectionCards([finished], classroom, session, now)).toMatchObject({ live: [], past: [{ id: "pset-5" }] });
    expect(sectionCards([], classroom, session, now)).toEqual({ live: [], past: [] });
  });

  it("sorts each section newest due first whatever order the sets come in, ties keeping the given order (ticket 216)", () => {
    const due = (id: string, d: string): AssignmentBundle => ({ ...finished, id, due: d });
    const given = [due("pset-2", "Fri 28 Aug"), due("pset-4", "Fri 4 Sep"), due("pset-1", "Tue 25 Aug"), due("pset-5", "Mon 7 Sep"), due("pset-3", "Tue 1 Sep"), due("pset-3b", "Tue 1 Sep")];
    expect(sectionCards(given, CREATED, null, now).past.map((c) => c.id)).toEqual(["pset-5", "pset-4", "pset-3", "pset-3b", "pset-2", "pset-1"]);
  });

  it("reads a due date's place in the year from its day and month", () => {
    expect(dueOrder("Thu 10 Sep")).toBeGreaterThan(dueOrder("Mon 7 Sep"));
    expect(dueOrder("Tue 1 Sep")).toBeGreaterThan(dueOrder("Fri 28 Aug"));
    expect(dueOrder("Fri 28 Aug")).toBeGreaterThan(dueOrder("Tue 25 Aug"));
    expect(dueOrder("someday")).toBe(-1);
    expect(newestFirst([])).toEqual([]);
  });

  it("the Classroom holds what the registry holds: Problem Set 6 only once it is created (ticket 188)", () => {
    const before = classroomCards(INITIAL_CLASSROOM, null, now);
    expect([...before.live, ...before.past].map((c) => c.id)).not.toContain("pset-6");
    const s = classroomCards(CREATED, null, now);
    expect(s.live.map((c) => c.id)).toContain("pset-6");
  });
});
