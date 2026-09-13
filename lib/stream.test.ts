import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, CLASSMATES } from "@/data/classmates";
import { STREAM_PACES, WARM_UP_IDS } from "@/data/stream";
import { assignmentBundle, landingTab, rosterProgress, submittedCount } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { assignmentCard } from "./classroomCards";
import { SKIP_STARTED_AGO_MS, skipFixture } from "./demo";
import { mistakesByProblem } from "./mistakes";
import { progressTag } from "./progress";
import { CLASS_SIZE } from "./readiness";
import { sessionAt } from "./session";
import { classmatesAt, jitter, recordAt, scheduleFor, stateAt, streamEndMs, streamEvents } from "./stream";

const P = ASSIGNMENT.problems;
const T0 = 1_700_000_000_000;
const S = 1000;
const MIN = 60 * S;
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: T0 });
const LIVE = assignmentBundle("pset-6", CREATED)!;
const END = streamEndMs(CLASSMATES, P);
const tags = (now: number, session = null) => Object.fromEntries(Object.entries(rosterProgress(LIVE, session, now)).map(([id, p]) => [id, progressTag(p) ?? p.kind]));
const events = streamEvents(CLASSMATES, P);

describe("the schedule (ticket 189)", () => {
  it("every classmate but Chloe has an authored pace; the jitter stays within 15%", () => {
    for (const m of CLASSMATES) expect(!!STREAM_PACES[m.id], m.id).toBe(m.done > 0);
    for (const m of CLASSMATES) for (let i = 0; i < 10; i++) expect(Math.abs(jitter(m.id, i) - 1)).toBeLessThanOrEqual(0.15);
    expect(jitter("mia", 3)).toBe(jitter("mia", 3));
  });

  it("each student's events are in order: warm-up, one answer per problem in assignment order, then the hand-in", () => {
    for (const m of CLASSMATES) {
      const s = scheduleFor(m, P);
      const times = [...(s.warmUpEnd === null ? [] : [s.warmUpEnd]), ...s.answeredAt, ...(s.submitAt === null ? [] : [s.submitAt])];
      for (let i = 1; i < times.length; i++) expect(times[i], `${m.id} #${i}`).toBeGreaterThan(times[i - 1]);
      expect(s.answeredAt, m.id).toHaveLength(Math.min(m.done, P.length));
    }
    for (let i = 1; i < events.length; i++) expect(events[i].at).toBeGreaterThanOrEqual(events[i - 1].at);
  });

  it("the answered count is each record's done: Liam 2, Grace 4, Harper 6, Tomas and Oliver 7, Ethan 8, Noah 9, Jordan 7", () => {
    const answered = (id: string) => events.filter((e) => e.student === id && e.kind === "answered").map((e) => e.kind === "answered" && e.problem);
    expect(answered("liam")).toEqual(["q1", "q2"]);
    expect(answered("grace")).toHaveLength(4);
    expect(answered("harper")).toHaveLength(6);
    expect(answered("tomas")).toHaveLength(7);
    expect(answered("oliver")).toHaveLength(7);
    expect(answered("ethan")).toHaveLength(8);
    expect(answered("noah")).toHaveLength(9);
    expect(answered("jordan")).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7"]);
  });

  it("the first submission lands within ten seconds, and it is a mistake (Ethan's Q1), so Mistakes shows it", () => {
    const first = events.find((e) => e.kind === "answered")!;
    expect(first.at).toBeLessThanOrEqual(10 * S);
    expect(first).toMatchObject({ student: "ethan", problem: "q1" });
    expect(CLASSMATE_MAP.ethan.wrong).toContain("q1");
    expect(mistakesByProblem(null, LIVE, T0 + first.at - 1)).toEqual([]);
    expect(mistakesByProblem(null, LIVE, T0 + first.at).map((p) => [p.problem.id, p.rows.map((r) => r.id)])).toEqual([["q1", ["ethan"]]]);
  });

  it("the five warm up first; three then keep an average pace, Jordan and Tomas are slow throughout", () => {
    const warm = CLASSMATES.filter((m) => scheduleFor(m, P).warmUpEnd !== null).map((m) => m.id);
    expect([...warm].sort()).toEqual([...WARM_UP_IDS].sort());
    const perUnit = (id: string) => STREAM_PACES[id].paceMs;
    const others = CLASSMATES.filter((m) => m.done > 0 && !WARM_UP_IDS.includes(m.id as (typeof WARM_UP_IDS)[number])).map((m) => perUnit(m.id));
    const average = others.reduce((a, b) => a + b, 0) / others.length;
    for (const id of ["amelia", "mia", "oliver"]) expect(Math.abs(perUnit(id) - average), id).toBeLessThanOrEqual(3 * S);
    for (const id of ["jordan", "tomas"]) {
      expect(perUnit(id)).toBeGreaterThan(Math.max(...others));
      for (const quick of ["amelia", "mia", "oliver"]) expect(scheduleFor(CLASSMATE_MAP[id], P).warmUpEnd!).toBeGreaterThan(scheduleFor(CLASSMATE_MAP[quick], P).warmUpEnd!);
    }
  });

  it("exactly the five read low confidence: Jordan on non-monic factorising; Ethan, Lucas and Sofia confident", () => {
    expect(CLASSMATES.filter((m) => m.confidence !== "confident").map((m) => m.id).sort()).toEqual([...WARM_UP_IDS].sort());
    expect(CLASSMATE_MAP.jordan.confidence).toBe("low: non-monic factorising");
    for (const id of ["ethan", "lucas", "sofia"]) expect(CLASSMATE_MAP[id].confidence).toBe("confident");
  });

  it("most who hand in finish four to six minutes in; nobody hands in before the last answer", () => {
    const submits = events.filter((e) => e.kind === "submitted");
    expect(submits).toHaveLength(17);
    const inWindow = submits.filter((e) => e.at >= 4 * MIN && e.at <= 6 * MIN);
    expect(inWindow.length).toBeGreaterThanOrEqual(13);
    expect(END).toBeLessThan(8 * MIN);
  });
});

describe("the class at a moment", () => {
  it("at the start the five are warming up, Chloe has not started, everyone else is on Q1", () => {
    const t = tags(T0);
    for (const id of WARM_UP_IDS) expect(t[id], id).toBe("warming up");
    expect(t.chloe).toBe("not-started");
    for (const m of CLASSMATES.filter((m) => m.done > 0 && !WARM_UP_IDS.includes(m.id as (typeof WARM_UP_IDS)[number]))) expect(t[m.id], m.id).toBe("Q1 in progress");
    expect(submittedCount(LIVE, null, T0).submitted).toBe(0);
  });

  it("before going live (a clock behind the start, or the first tick at 0) reads as the start", () => {
    expect(tags(T0 - 5 * S)).toEqual(tags(T0));
    expect(tags(0)).toEqual(tags(T0));
  });

  it("names the next unanswered problem, and the dots wait for the hand-in", () => {
    const liam = scheduleFor(CLASSMATE_MAP.liam, P);
    expect(tags(T0 + liam.answeredAt[1])).toMatchObject({ liam: "Q3 in progress" });
    expect(tags(T0 + liam.submitAt! - 1)).toMatchObject({ liam: "Q3 in progress" });
    expect(tags(T0 + liam.submitAt!)).toMatchObject({ liam: "submitted" });
    const mid = classmatesAt(LIVE, null, T0 + liam.answeredAt[1]).find((m) => m.record.id === "liam")!;
    expect(mid.record).toMatchObject({ done: 2, wrong: ["q1", "q2"], clarification: undefined });
    expect(Object.keys(mid.record.attempts).sort()).toEqual(["q1", "q2"]);
  });

  it("Jordan answers Q1–Q7, then stays on Q8 for good; Chloe never starts", () => {
    const jordan = scheduleFor(CLASSMATE_MAP.jordan, P);
    expect(tags(T0 + jordan.answeredAt[6] - 1).jordan).toBe("Q7 in progress");
    for (const later of [jordan.answeredAt[6], END, END + 60 * MIN, T0]) expect(tags(T0 + later).jordan).toBe("Q8 in progress");
    const end = classmatesAt(LIVE, null, T0 + END).find((m) => m.record.id === "jordan")!;
    expect(end.state).toEqual({ started: true, warmingUp: false, answered: 7, submitted: false });
    expect(end.record.wrong).toEqual(["q2", "q7"]);
    expect(tags(T0 + END).chloe).toBe("not-started");
  });

  it("the end state: 17 of 20 handed in (Sam not), still individual working, so the set lands on Mistakes", () => {
    expect(submittedCount(LIVE, null, T0 + END)).toEqual({ submitted: 17, total: CLASS_SIZE });
    const lastSubmit = events.filter((e) => e.kind === "submitted").at(-1)!;
    expect(submittedCount(LIVE, null, T0 + lastSubmit.at - 1).submitted).toBe(16);
    expect(landingTab(LIVE, CREATED, null, T0 + END)).toBe("mistakes");
    const card = assignmentCard(LIVE, CREATED, sessionAt("working"), T0 + END);
    expect(card).toMatchObject({ section: "live", status: "live", submitted: 17, total: 20 });
    // At the end the Mistakes view is the fixture's (every wrong answer in), Jordan included.
    expect(card.mistakes).toBe(CLASSMATES.reduce((n, c) => n + c.wrong.length, 0) + mistakesByProblem(sessionAt("working")).filter((p) => p.rows.some((r) => r.live)).length);
  });

  it("a pure function of the start and now: the same moment reads the same, whenever it is asked (a reload continues)", () => {
    for (const at of [5 * S, 12 * S, 90 * S, 3 * MIN, 6 * MIN]) {
      expect(tags(T0 + at)).toEqual(tags(T0 + at));
      const shifted = assignmentBundle("pset-6", classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual"], at: T0 + 7 * MIN }))!;
      expect(submittedCount(shifted, null, T0 + 7 * MIN + at)).toEqual(submittedCount(LIVE, null, T0 + at));
    }
  });

  it("the counts only grow: submitted, each problem's correct and its rows, event by event", () => {
    let last = { submitted: -1, right: {} as Record<string, number>, rows: {} as Record<string, number> };
    for (const e of events) {
      const now = T0 + e.at;
      const submitted = submittedCount(LIVE, null, now).submitted;
      const m = mistakesByProblem(null, LIVE, now);
      expect(submitted).toBeGreaterThanOrEqual(last.submitted);
      for (const p of m) {
        expect(p.rows.length).toBeGreaterThanOrEqual(last.rows[p.problem.id] ?? 0);
        expect(p.right).toBeGreaterThanOrEqual(last.right[p.problem.id] ?? 0);
        expect(p.right + p.rows.length + p.pending).toBeLessThanOrEqual(CLASS_SIZE);
      }
      last = { submitted, right: Object.fromEntries(m.map((p) => [p.problem.id, p.right])), rows: Object.fromEntries(m.map((p) => [p.problem.id, p.rows.length])) };
    }
  });

  it("unfinished work handed in with the set arrives with the hand-in, at the end of its problem's rows (Liam's Q3)", () => {
    const liam = scheduleFor(CLASSMATE_MAP.liam, P);
    expect(CLASSMATE_MAP.liam.wrong).toContain("q3");
    const q3 = (now: number) => mistakesByProblem(null, LIVE, now).find((p) => p.problem.id === "q3")?.rows ?? [];
    expect(q3(T0 + liam.submitAt! - 1).map((r) => r.id)).not.toContain("liam");
    expect(q3(T0 + liam.submitAt!).at(-1)).toMatchObject({ id: "liam", arrivedAt: T0 + liam.submitAt! });
    const rows = q3(T0 + END);
    expect(rows.map((r) => r.arrivedAt!)).toEqual([...rows.map((r) => r.arrivedAt!)].sort((a, b) => a - b));
  });

  it("an arriving name lands at the end of the problem's rows, stamped with its submission time", () => {
    for (const e of events) {
      if (e.kind !== "answered" || !CLASSMATE_MAP[e.student].wrong.includes(e.problem)) continue;
      const rows = mistakesByProblem(null, LIVE, T0 + e.at).find((p) => p.problem.id === e.problem)!.rows;
      expect(rows.at(-1)).toMatchObject({ id: e.student, arrivedAt: T0 + e.at });
    }
  });

  it("still working is neither correct nor skipped: at the start everyone is pending; at the end only Sam, Jordan past Q7 and Chloe", () => {
    const started = mistakesByProblem(null, LIVE, T0 + 9 * S).find((p) => p.problem.id === "q1")!;
    expect(started).toMatchObject({ right: 0, pending: CLASS_SIZE - 1 });
    const end = mistakesByProblem(null, LIVE, T0 + END);
    const q7 = end.find((p) => p.problem.id === "q7")!;
    const q9 = end.find((p) => p.problem.id === "q9")!;
    expect(q7.pending).toBe(2); // Sam and Chloe; Jordan answered Q7
    expect(q9.pending).toBe(3); // Sam, Chloe, Jordan
  });

  it("once Sam hands in, the class is past working: every classmate who started has handed in, Jordan's Q1–Q7 too, nothing pending", () => {
    const session = sessionAt("feedback");
    for (const at of [T0, T0 + 90 * S, T0 + END]) {
      expect(submittedCount(LIVE, session, at)).toEqual({ submitted: 19, total: CLASS_SIZE });
      const all = classmatesAt(LIVE, session, at);
      expect(all.find((m) => m.record.id === "jordan")!.record).toBe(CLASSMATE_MAP.jordan);
      expect(mistakesByProblem(session, LIVE, at).every((p) => p.pending === 0)).toBe(true);
    }
    expect(rosterProgress(LIVE, session, T0)[DEMO_STUDENT.id]).toEqual({ kind: "submitted" });
  });

  it("a presenter skip went live an hour back: the stream is at its end", () => {
    const { classroom, session } = skipFixture("working", T0);
    const b = assignmentBundle("pset-6", classroom)!;
    expect(b.startedAt).toBe(T0 - SKIP_STARTED_AGO_MS);
    expect(submittedCount(b, session, T0).submitted).toBe(17);
    expect(rosterProgress(b, session, T0).jordan).toEqual({ kind: "working", label: "Q8" });
  });

  it("a finished set has no stream: Problem Set 5's records as they are", () => {
    const ps5 = assignmentBundle("pset-5", CREATED)!;
    expect(ps5.startedAt).toBeNull();
    expect(submittedCount(ps5, null, T0)).toEqual(submittedCount(ps5, null, T0 + END));
    expect(mistakesByProblem(null, ps5, T0).every((p) => p.pending === 0 && p.rows.every((r) => r.arrivedAt === undefined))).toBe(true);
  });

  it("recordAt hides what is not answered yet and returns the record untouched once handed in", () => {
    const m = CLASSMATE_MAP.amelia;
    expect(recordAt(m, P, stateAt(scheduleFor(m, P), 0))).toMatchObject({ done: 0, wrong: [], notes: [], attempts: {} });
    expect(recordAt(m, P, { started: true, warmingUp: false, answered: 10, submitted: true })).toBe(m);
  });
});
