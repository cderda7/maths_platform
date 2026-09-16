import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, CLASSMATES, type Classmate as ClassmateType } from "@/data/classmates";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { stageDone } from "./classStage";
import { ARRIVAL_OFFSETS_MS } from "./readiness";
import { correctionRight, recordToFix, reviewDoneCount, reviewPlaces, reviewRows, reworkScript, sessionToFix, type ReviewStudent } from "./reviewPlaces";
import { sessionAt, sessionReducer, type StudentSession } from "./session";

const P = ASSIGNMENT.problems;
const T0 = 1_700_000_000_000;
const S = 1000;
const MIN = 60 * S;
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: T0 - 40 * MIN });
const LIVE = assignmentBundle("pset-6", CREATED)!;
/** Sam on the individual review screen, having handed in at T0. */
const SAM: StudentSession = { ...sessionAt("feedback"), handedInAt: T0 };
const ENV = { pathway: ["individual", "group", "whole-class"] as const, goal: ASSIGNMENT.goal };
const act = (s: StudentSession, a: Parameters<typeof sessionReducer>[1]) => sessionReducer(s, a, { pathway: [...ENV.pathway], goal: ENV.goal });
const arrived = (at: number): ClassroomState => ({ ...CREATED, arrivals: { [DEMO_STUDENT.id]: at } });
const at = (ms: number, c: ClassroomState = CREATED, session: StudentSession | null = SAM) => reviewPlaces(LIVE, c, session, T0 + ms);
const of = (list: readonly ReviewStudent[], id: string) => list.find((s) => s.id === id)!;
const solution = (id: string) => P.find((p) => p.id === id)!.solution.map((l) => l.tex);

describe("a correction that holds (ticket 318)", () => {
  it("needs lines, none wrong, and an answer", () => {
    expect(correctionRight("q1", solution("q1"))).toBe(true);
    expect(correctionRight("q1", [])).toBe(false);
    expect(correctionRight("q1", CLASSMATE_MAP.oliver.attempts.q1)).toBe(false);
    // The first line of the model solution alone holds but reaches no answer yet: not fixed.
    expect(correctionRight("q1", solution("q1").slice(0, 1))).toBe(false);
  });
});

describe("what each student has to fix", () => {
  it("a classmate: every problem not right first time, in set order", () => {
    expect(recordToFix(CLASSMATE_MAP.priya, P)).toEqual(["q8"]); // ticket 347
    expect(recordToFix(CLASSMATE_MAP.aiden, P)).toEqual(["q7", "q8"]);
    expect(recordToFix(CLASSMATE_MAP.tomas, P)).toEqual(["q3", "q4", "q5", "q7", "q8", "q9", "q10"]);
    expect(recordToFix(CLASSMATE_MAP.grace, P)).toEqual(["q5", "q6", "q7", "q8", "q9", "q10"]);
  });

  it("Sam: a wrong line or not finished on the first submission, whatever his rework says", () => {
    const toFix = sessionToFix(SAM, P);
    expect(toFix.length).toBeGreaterThan(0);
    const reworked = sessionAt("class-wait");
    expect(sessionToFix(reworked, P)).toEqual(toFix);
  });
});

describe("a classmate's rework script", () => {
  it("is the same every read, reading first, one problem after another, each landing inside its own time", () => {
    const i = CLASSMATES.findIndex((m) => m.id === "tomas");
    const a = reworkScript(CLASSMATE_MAP.tomas, i, P);
    expect(reworkScript(CLASSMATE_MAP.tomas, i, P)).toEqual(a);
    expect(a.map((s) => s.problem).sort()).toEqual(recordToFix(CLASSMATE_MAP.tomas, P).sort());
    expect(a[0].opens).toBeGreaterThanOrEqual(15 * S);
    a.forEach((s, k) => {
      expect(s.lands).toBeGreaterThan(s.opens);
      if (k > 0) expect(s.opens).toBeGreaterThan(a[k - 1].lands);
    });
  });

  it("a correction is right exactly when the second submission holds", () => {
    for (const [index, m] of CLASSMATES.entries()) {
      for (const s of reworkScript(m, index, P)) expect(s.right, `${m.id} ${s.problem}`).toBe(correctionRight(s.problem, m.review?.[s.problem]?.second ?? []));
    }
    const tomas = reworkScript(CLASSMATE_MAP.tomas, CLASSMATES.indexOf(CLASSMATE_MAP.tomas), P);
    expect(tomas.filter((s) => s.right).map((s) => s.problem)).toEqual(["q3"]);
  });

  it("an odd roster position opens the wrong problems before the unfinished ones", () => {
    const odd = CLASSMATES.findIndex((m, i) => i % 2 === 1 && recordToFix(m, P).some((p) => !m.wrong.includes(p)) && m.wrong.length > 0);
    const m = CLASSMATES[odd];
    const order = reworkScript(m, odd, P).map((s) => s.problem);
    const firstUnfinished = order.findIndex((p) => !m.wrong.includes(p));
    expect(order.slice(firstUnfinished).every((p) => !m.wrong.includes(p))).toBe(true);
  });
});

describe("where the class is in individual review", () => {
  it("before Sam hands in, nobody has started", () => {
    const list = reviewPlaces(LIVE, CREATED, sessionAt("working"), T0);
    expect(list.filter((s) => s.place.kind !== "absent").every((s) => s.place.kind === "not-started")).toBe(true);
  });

  it("at the start: since ticket 347 every classmate has something to fix (Priya's Q8 among them), so all read not-started; Chloe is absent", () => {
    const list = at(S);
    expect(of(list, "chloe").place.kind).toBe("absent");
    expect(list.filter((s) => s.id !== "chloe").every((s) => s.place.kind === "not-started")).toBe(true);
  });

  it("a classmate with nothing to fix reads done from the start", () => {
    const nothingToFix: ClassmateType = { ...CLASSMATE_MAP.priya, wrong: [] };
    const list = reviewPlaces({ ...LIVE, classmates: LIVE.classmates.map((m) => (m.id === "priya" ? nothingToFix : m)) }, CREATED, SAM, T0 + S);
    expect(of(list, "priya").place.kind).toBe("done");
  });

  it("partway, a classmate is on one of their own problems, came into it before now, and has fixed only right ones", () => {
    const list = at(3 * MIN);
    const on = list.filter((s) => s.place.kind === "problem" && s.id !== DEMO_STUDENT.id);
    expect(on.length).toBeGreaterThan(10);
    for (const s of on) {
      const place = s.place as { problem: string };
      expect(s.toFix).toContain(place.problem);
      expect(s.entered!).toBeLessThanOrEqual(T0 + 3 * MIN);
      for (const p of s.fixed) expect(correctionRight(p, CLASSMATE_MAP[s.id].review?.[p]?.second ?? [])).toBe(true);
    }
  });

  it("nobody with something to fix is done before Sam reaches the gate; they stay on their last problem", () => {
    const list = at(90 * MIN);
    for (const s of list.filter((x) => x.toFix.length > 0 && x.id !== DEMO_STUDENT.id && x.place.kind !== "absent")) expect(s.place.kind, s.id).toBe("problem");
  });

  it("once Sam reaches the gate each classmate is done at their arrival, every right correction landed", () => {
    const A = T0 + 4 * MIN;
    const c = arrived(A);
    const before = reviewPlaces(LIVE, c, SAM, A + ARRIVAL_OFFSETS_MS.tomas - 1);
    const after = reviewPlaces(LIVE, c, SAM, A + ARRIVAL_OFFSETS_MS.tomas);
    expect(of(before, "tomas").place.kind).not.toBe("done");
    expect(of(after, "tomas").place.kind).toBe("done");
    expect(of(after, "tomas").fixed).toEqual(["q3"]);
    expect(of(after, "tomas").entered).toBe(A + ARRIVAL_OFFSETS_MS.tomas);
  });

  it("Sam: not started until he opens a problem, then on it from that moment, done once he hands in", () => {
    expect(of(at(S), DEMO_STUDENT.id).place.kind).toBe("not-started");
    const opened = act(SAM, { type: "rework/goto", index: 2, at: T0 + 30 * S });
    const list = at(MIN, CREATED, opened);
    expect(of(list, DEMO_STUDENT.id).place).toEqual({ kind: "problem", problem: "q3" });
    expect(of(list, DEMO_STUDENT.id).entered).toBe(T0 + 30 * S);
    const wrote = act(SAM, { type: "rework/stroke", problem: "q1", stroke: [{ x: 0, y: 0 }, { x: 1, y: 1 }] as never, at: T0 + 20 * S });
    expect(of(at(MIN, CREATED, wrote), DEMO_STUDENT.id).place).toEqual({ kind: "problem", problem: "q1" });
    const done = act(opened, { type: "rework/done", at: T0 + 2 * MIN });
    expect(of(at(3 * MIN, arrived(T0 + 2 * MIN), done), DEMO_STUDENT.id).place.kind).toBe("done");
  });
});

describe("the rows", () => {
  const rows = (ms: number, c: ClassroomState = CREATED, session: StudentSession = SAM) => reviewRows(at(ms, c, session), P, LIVE.classmates, T0 + ms);

  it("are Not started, Q1–Q10, Done reviewing, every student in the room in exactly one, Chloe named under done", () => {
    for (const ms of [S, 2 * MIN, 6 * MIN]) {
      const r = rows(ms);
      expect(r.map((x) => x.label)).toEqual(["Not started", ...P.map((p) => p.label), "Done reviewing"]);
      const ids = r.flatMap((x) => x.pills.map((p) => p.id));
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBe(19);
      expect(r[r.length - 1].absent.map((a) => a.id)).toEqual(["chloe"]);
    }
  });

  it("a pill on a question says fixed n of m and how long it has been open; the other rows' pills say nothing", () => {
    const r = rows(5 * MIN);
    for (const row of r) {
      for (const p of row.pills) {
        if (row.key === "not-started" || row.key === "done") {
          expect(p.detail).toBeNull();
          expect(p.time).toBeNull();
        } else {
          expect(p.detail).toMatch(/^fixed \d+ of \d+$/);
          expect(p.time?.kind).toBe("here");
        }
      }
    }
  });

  it("a question's count is everyone still to fix it, blank at none, and never climbs", () => {
    let prev: Record<string, number> = {};
    for (let ms = 0; ms <= 12 * MIN; ms += 10 * S) {
      const c = arrived(T0 + 8 * MIN);
      const list = at(ms, c);
      const r = reviewRows(list, P, LIVE.classmates, T0 + ms);
      for (const row of r.filter((x) => P.some((p) => p.id === x.key))) {
        const n = list.filter((s) => s.place.kind !== "absent" && s.toFix.includes(row.key) && !s.fixed.includes(row.key)).length;
        expect(row.count?.n ?? 0).toBe(n);
        if (n === 0) expect(row.count).toBeNull();
        if (prev[row.key] !== undefined) expect(n).toBeLessThanOrEqual(prev[row.key]);
      }
      prev = Object.fromEntries(r.map((x) => [x.key, x.count?.n ?? 0]));
    }
  });

  it("Done reviewing counts its pills, the same number as the stage's done count", () => {
    const A = T0 + 3 * MIN;
    const c = arrived(A);
    const done = act(SAM, { type: "rework/done", at: A });
    // Before Sam reaches the gate nobody with something to fix is done yet (Priya has Q8 to fix too, ticket 347).
    expect(stageDone("individual", CREATED, SAM, T0 + S, LIVE)).toBe(0);
    for (const ms of [S, 3 * MIN + 5 * S, 3 * MIN + 12 * S, 6 * MIN]) {
      const list = at(ms, c, ms >= 3 * MIN ? done : SAM);
      const r = reviewRows(list, P, LIVE.classmates, T0 + ms);
      const row = r[r.length - 1];
      expect(row.count?.n ?? 0).toBe(row.pills.length);
      expect(stageDone("individual", c, ms >= 3 * MIN ? done : SAM, T0 + ms, LIVE)).toBe(reviewDoneCount(list));
    }
  });
});
