import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import type { LeafId } from "@/data/taxonomy";
import { assignmentBundle, type AssignmentBundle } from "./assignments";
import { INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { assignmentCard, classroomCards, mistakeCount, sectionCards, topGap } from "./classroomCards";
import { skipFixture } from "./demo";
import { mistakesByProblem, type MistakeRow, type ProblemMistakes } from "./mistakes";
import { CLASS_SIZE } from "./readiness";

const now = 1_700_000_000_000;
const NON_MONIC: LeafId = "algebra.expand-factor.nonmonic";
const MONIC: LeafId = "algebra.expand-factor.monic";
const SURDS: LeafId = "algebra.number.surds";

const row = (id: string, slips: LeafId[]): MistakeRow => ({ id, name: id, initials: id.slice(0, 2).toUpperCase(), live: false, lines: [], slips });
const problem = (i: number, rows: MistakeRow[]): ProblemMistakes => ({ problem: ASSIGNMENT.problems[i], rows, right: 0 });

describe("mistakes so far", () => {
  it("counts every wrong answer to a problem: one per student per problem", () => {
    expect(mistakeCount([])).toBe(0);
    expect(mistakeCount([problem(0, [row("a", [MONIC, MONIC]), row("b", [SURDS])]), problem(1, [row("a", [SURDS])])])).toBe(3);
  });

  it("on Problem Set 2 it is the number of rows on its Mistakes tab", () => {
    const b = assignmentBundle("pset-2", INITIAL_CLASSROOM)!;
    const rows = mistakesByProblem(null, b);
    expect(mistakeCount(rows)).toBe(rows.flatMap((p) => p.rows).length);
    expect(mistakeCount(rows)).toBeGreaterThan(0);
  });
});

describe("the top gap", () => {
  it("is null when nobody slipped, and ignores rows with no recognised slip", () => {
    expect(topGap([])).toBeNull();
    expect(topGap([problem(0, [row("a", [])])])).toBeNull();
  });

  it("is the cluster with the most different students across every problem, not the biggest on one problem", () => {
    const gap = topGap([
      problem(0, [row("a", [SURDS]), row("b", [SURDS]), row("c", [MONIC])]),
      problem(1, [row("c", [NON_MONIC]), row("d", [NON_MONIC])]),
      problem(2, [row("e", [NON_MONIC]), row("a", [SURDS])]),
    ]);
    expect(gap).toEqual({ slips: [NON_MONIC], name: "non-monic factorising", students: 3 });
  });

  it("counts a student once per cluster however many problems they slipped on", () => {
    const gap = topGap([problem(0, [row("a", [SURDS]), row("b", [MONIC])]), problem(1, [row("a", [SURDS]), row("c", [MONIC])]), problem(2, [row("a", [SURDS])])]);
    expect(gap?.slips).toEqual([MONIC]);
    expect(gap?.students).toBe(2);
  });

  it("breaks a tie by problem order, then row order", () => {
    expect(topGap([problem(0, [row("a", [MONIC])]), problem(1, [row("b", [SURDS]), row("c", [MONIC])]), problem(2, [row("d", [SURDS])])])?.slips).toEqual([MONIC]);
    expect(topGap([problem(0, [row("a", [SURDS]), row("b", [MONIC])])])?.slips).toEqual([SURDS]);
  });

  it("a student who slipped on two leaves in one problem is their own cluster, named by both", () => {
    expect(topGap([problem(0, [row("a", [SURDS, MONIC, SURDS])])])).toEqual({ slips: [SURDS, MONIC], name: "surds + monic factorising", students: 1 });
  });

  it("is computed from the set's work: Problem Set 2's is the biggest cluster of its Mistakes tab", () => {
    const b = assignmentBundle("pset-2", INITIAL_CLASSROOM)!;
    const gap = topGap(mistakesByProblem(null, b))!;
    expect(gap.students).toBeGreaterThan(1);
    expect(gap.name.length).toBeGreaterThan(0);
  });
});

describe("the Classroom's cards", () => {
  const live = assignmentBundle("pset-2", INITIAL_CLASSROOM)!;
  /** A finished set standing in for Problem Set 1 (ticket 187) until it is registered: the same work, every stage over. */
  const finished: AssignmentBundle = { ...live, id: "pset-1", kind: "finished", title: "PROBLEM SET 1 — FEATURES OF A PARABOLA", name: "Problem Set 1 — Features of a parabola", due: "Thu 3 Sep" };

  it("Problem Set 2 while the class works is live: submitted of twenty and its mistakes so far", () => {
    const { classroom, session } = skipFixture("working", now);
    const card = assignmentCard(assignmentBundle("pset-2", classroom)!, classroom, session, now);
    expect(card).toMatchObject({ id: "pset-2", name: "Problem Set 2 — Roots of a quadratic", href: "/teacher/a/pset-2", section: "live", status: "live", total: CLASS_SIZE, due: "Thu 10 Sep" });
    expect(card.submitted).toBe(CLASS_SIZE - 2);
    expect(card.mistakes).toBe(mistakeCount(mistakesByProblem(session, live)));
  });

  it("moves to past, in review, once the class is past individual working; done once every stage is over", () => {
    const { classroom, session } = skipFixture("indiv review", now);
    expect(assignmentCard(assignmentBundle("pset-2", classroom)!, classroom, session, now)).toMatchObject({ section: "past", status: "in review" });
    const ended: ClassroomState = { ...classroom, wholeClass: { problems: [], examples: {}, slide: 0, view: "unmarked", status: "ended", modes: {}, ink: {} } };
    expect(assignmentCard(assignmentBundle("pset-2", ended)!, ended, session, now)).toMatchObject({ section: "past", status: "done" });
  });

  it("a finished set is past and done, everyone it counts handed in, with its top gap computed from its work", () => {
    const card = assignmentCard(finished, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id: "pset-1", name: "Problem Set 1 — Features of a parabola", href: "/teacher/a/pset-1", section: "past", status: "done", total: CLASS_SIZE, due: "Thu 3 Sep" });
    expect(card.submitted).toBe(CLASS_SIZE - 1); // Sam handed in; Chloe of this stand-in never started
    expect(card.topGap).toEqual(topGap(mistakesByProblem(null, finished)));
    expect(card.topGap).not.toBeNull();
  });

  it("sections live above past, each newest first as given, for any mix including no live set", () => {
    const { classroom, session } = skipFixture("working", now);
    const liveNow = assignmentBundle("pset-2", classroom)!;
    const older: AssignmentBundle = { ...finished, id: "pset-0" };
    const s = sectionCards([liveNow, finished, older], classroom, session, now);
    expect(s.live.map((c) => c.id)).toEqual(["pset-2"]);
    expect(s.past.map((c) => c.id)).toEqual(["pset-1", "pset-0"]);
    expect(sectionCards([finished], classroom, session, now)).toMatchObject({ live: [], past: [{ id: "pset-1" }] });
    expect(sectionCards([], classroom, session, now)).toEqual({ live: [], past: [] });
  });

  it("the Classroom holds what the registry holds", () => {
    const s = classroomCards(INITIAL_CLASSROOM, null, now);
    expect([...s.live, ...s.past].map((c) => c.id)).toContain("pset-2");
  });
});
