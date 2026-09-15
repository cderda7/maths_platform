import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { classmateTimeline, classPlaces, rowKey, type Place, type StudentPlace } from "./place";
import { sessionAt } from "./session";
import { scheduleFor, streamEndMs } from "./stream";
import { carryPlaces, checkIns, classmatesEntered, duration, emptyQuestionRuns, placeDetail, placeTone, whereRows, type SeenPlace } from "./whereStudents";

const P = ASSIGNMENT.problems;
const T0 = 1_700_000_000_000;
const S = 1000;
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: T0 });
const LIVE = assignmentBundle("pset-6", CREATED)!;
const END = streamEndMs(CLASSMATES, P);
const q = (problem: string, detail: Extract<Place, { kind: "question" }>["detail"] = null): Place => ({ kind: "question", problem, label: P.find((p) => p.id === problem)!.label, detail });
const MONIC = "algebra.expand-factor.monic" as const;

/** The column at a moment of the stream, as the screen reads it (no carried state). */
const rowsAt = (ms: number) => {
  const now = T0 + ms;
  const places = classPlaces(LIVE, null, now, LIVE.absent);
  const entered = classmatesEntered(LIVE, null, now);
  return whereRows(carryPlaces([], places, now, entered), P, LIVE.classmates, now, checkIns(LIVE, null, now));
};

describe("a span of time (ticket 315)", () => {
  it("reads seconds under a minute and whole minutes from a minute, never negative", () => {
    expect(duration(0)).toBe("0 s");
    expect(duration(999)).toBe("0 s");
    expect(duration(40 * S)).toBe("40 s");
    expect(duration(59_999)).toBe("59 s");
    expect(duration(60 * S)).toBe("1 min");
    expect(duration(6 * 60 * S + 59 * S)).toBe("6 min");
    expect(duration(-5 * S)).toBe("0 s");
  });
});

describe("a pill's words and tone", () => {
  it("names what the student is doing where the row's label does not", () => {
    expect(placeDetail({ kind: "not-started" })).toBe("not started");
    expect(placeDetail({ kind: "confidence" })).toBeNull();
    expect(placeDetail({ kind: "warmup-chat" })).toBe("chat");
    expect(placeDetail({ kind: "warmup", leaf: MONIC, step: 2 })).toBe("monic factorising");
    expect(placeDetail(q("q4"))).toBeNull();
    expect(placeDetail(q("q4", { kind: "hint", hint: 2 }))).toBe("hint 2");
    expect(placeDetail(q("q1", { kind: "practice", leaf: MONIC, step: 1 }))).toBe("practice · monic factorising");
    expect(placeDetail(q("q2", { kind: "practice", leaf: MONIC, step: 3 }))).toBe("back on Q2");
    expect(placeDetail({ kind: "handed-in" })).toBeNull();
  });

  it("warm-up is accent, practice from a question standout, everything else plain", () => {
    expect(placeTone({ kind: "warmup-chat" })).toBe("warmup");
    expect(placeTone({ kind: "warmup", leaf: MONIC, step: 1 })).toBe("warmup");
    expect(placeTone(q("q1", { kind: "practice", leaf: MONIC, step: 3 }))).toBe("practice");
    expect(placeTone(q("q1", { kind: "hint", hint: 1 }))).toBe("plain");
    for (const kind of ["not-started", "confidence", "handed-in"] as const) expect(placeTone({ kind })).toBe("plain");
  });
});

describe("the rows", () => {
  it("every row in lesson order at every moment, all twenty accounted for once: nineteen pills and Chloe named absent under Handed in", () => {
    for (let ms = 0; ms <= END + 5 * S; ms += 7 * S) {
      const rows = rowsAt(ms);
      expect(rows.map((r) => r.label)).toEqual(["Starting", "Warm-up", ...P.map((p) => p.label), "Handed in"]);
      const ids = rows.flatMap((r) => r.pills.map((p) => p.id));
      expect(ids.length, `${ms}`).toBe(19);
      expect(new Set(ids).size).toBe(19);
      expect(rows.find((r) => r.key === "handed-in")!.absent.map((a) => a.name)).toEqual(["Chloe Abara"]);
      expect(rows.filter((r) => r.key !== "handed-in").every((r) => r.absent.length === 0)).toBe(true);
    }
  });

  it("labels Starting and Warm-up with a second line; the step bar only on warm-up and practice; a time here on every classmate", () => {
    const rows = rowsAt(40 * S);
    expect(rows[0].sub).toBe("check-in");
    expect(rows[1].sub).toBe("3 steps each");
    expect(rows.slice(2).every((r) => r.sub === null)).toBe(true);
    for (const pill of rows.flatMap((r) => r.pills)) {
      expect(pill.step !== null, pill.id).toBe(pill.tone !== "plain" && pill.detail !== "chat");
      if (pill.id !== DEMO_STUDENT.id) {
        expect(pill.time?.kind, pill.id).toBe("here");
        expect(pill.time?.span, pill.id).toMatch(/^\d+ (s|min)$/);
      }
    }
  });

  it("Jordan's pill 40 s in: warm-up, non-monic factorising, its step, the seconds since he came into the warm-up row (ticket 327)", () => {
    const timeline = classmateTimeline(LIVE.classmates.find((m) => m.id === "jordan")!, P);
    const seg = [...timeline].reverse().find((s) => s.at <= 40 * S)!;
    const row = timeline.find((s) => rowKey(s.place) === "warm-up")!.at;
    expect(seg.place.kind).toBe("warmup");
    expect(seg.at).toBeGreaterThan(row);
    const jordan = rowsAt(40 * S)[1].pills.find((p) => p.id === "jordan")!;
    expect(jordan).toMatchObject({ name: "Jordan Whitlock", initials: "JW", tone: "warmup", detail: "non-monic factorising" });
    expect(jordan.time).toEqual({ kind: "here", span: `${Math.floor((40 * S - row) / S)} s` });
  });

  it("the time here runs from the row entry through a hint and practice steps, and a new row starts it again (ticket 327)", () => {
    const liam = classmateTimeline(LIVE.classmates.find((m) => m.id === "liam")!, P);
    const q1 = liam.find((s) => rowKey(s.place) === "q1")!.at;
    for (const seg of liam.filter((s) => rowKey(s.place) === "q1")) {
      const ms = seg.at + 2 * S;
      const pill = rowsAt(ms).find((r) => r.key === "q1")!.pills.find((p) => p.id === "liam")!;
      expect(pill.time, `${ms}`).toEqual({ kind: "here", span: duration(ms - q1) });
    }
    const q2 = liam.find((s) => rowKey(s.place) === "q2")!.at;
    expect(rowsAt(q2 + 3 * S).find((r) => r.key === "q2")!.pills.find((p) => p.id === "liam")!.time).toEqual({ kind: "here", span: "3 s" });
  });

  it("a handed-in pill says how long the set took, check-in to hand-in, and holds as the clock runs on (ticket 327)", () => {
    for (const ms of [END, END + 5 * S, END + 90 * 60 * S]) {
      const done = rowsAt(ms).find((r) => r.key === "handed-in")!.pills;
      expect(done.length, `${ms}`).toBeGreaterThan(0);
      for (const pill of done) {
        const s = scheduleFor(LIVE.classmates.find((m) => m.id === pill.id)!, P);
        expect(pill.time, `${pill.id} at ${ms}`).toEqual({ kind: "took", span: duration(s.submitAt!) });
      }
    }
  });

  it("Sam's hand-in took from his session's check-in, and none when the check-in is unknown", () => {
    const now = T0 + 3 * 60 * S;
    const handed = { ...sessionAt("feedback"), checkInAt: T0 + 20 * S, handedInAt: T0 + 2 * 60 * S };
    const rows = (session: typeof handed) => whereRows(carryPlaces([], classPlaces(LIVE, session, now, LIVE.absent), now), P, LIVE.classmates, now, checkIns(LIVE, session, now));
    const sam = (session: typeof handed) => rows(session).find((r) => r.key === "handed-in")!.pills.find((p) => p.id === DEMO_STUDENT.id)!;
    expect(sam(handed).time).toEqual({ kind: "took", span: "1 min" });
    expect(sam({ ...handed, checkInAt: 0 }).time).toBeNull();
    expect(checkIns(LIVE, handed, now)[DEMO_STUDENT.id]).toBe(T0 + 20 * S);
  });

  it("inside a row the pills stand in the order the students came in: a later arrival is after everyone already there", () => {
    // Read second by second as the screen does, carrying what it saw (Sam's first-seen time).
    let seen = carryPlaces([], classPlaces(LIVE, null, T0, LIVE.absent), T0, classmatesEntered(LIVE, null, T0));
    let before = whereRows(seen, P, LIVE.classmates, T0);
    for (let ms = S; ms <= END; ms += S) {
      const now = T0 + ms;
      seen = carryPlaces(seen, classPlaces(LIVE, null, now, LIVE.absent), now, classmatesEntered(LIVE, null, now));
      const rows = whereRows(seen, P, LIVE.classmates, now);
      for (const r of rows) {
        const was = before.find((b) => b.key === r.key)!.pills.map((p) => p.id);
        const stayed = r.pills.map((p) => p.id).filter((id) => was.includes(id));
        // Those already in the row keep their order and stand before anyone new.
        expect(stayed, `${r.key} at ${ms}`).toEqual(was.filter((id) => stayed.includes(id)));
        expect(r.pills.map((p) => p.id).slice(0, stayed.length), `${r.key} at ${ms}`).toEqual(stayed);
        const entered = r.pills.map((p) => p.arrivedAt ?? 0);
        expect(entered, `${r.key} at ${ms}`).toEqual([...entered].sort((a, b) => a - b));
      }
      before = rows;
    }
  });

  it("a row entry holds through a hint or practice steps in the same question: Liam's Q1 help keeps his place in Q1's row", () => {
    const liam = classmateTimeline(LIVE.classmates.find((m) => m.id === "liam")!, P);
    const q1 = liam.find((s) => rowKey(s.place) === "q1")!.at;
    const practice = liam.filter((s) => s.place.kind === "question" && s.place.detail?.kind === "practice");
    expect(practice).toHaveLength(3);
    for (const seg of practice) {
      const now = T0 + seg.at + 500;
      expect(classmatesEntered(LIVE, null, now).liam).toBe(T0 + q1);
    }
  });
});

describe("carried places", () => {
  const sam = (place: Place): StudentPlace => ({ id: "sam", place, since: null });

  it("Sam's place keeps the moment it was first seen and his row entry holds while the row does", () => {
    const a = carryPlaces([], [sam(q("q1"))], T0);
    expect(a[0]).toMatchObject({ since: T0, entered: T0 });
    const same = carryPlaces(a, [sam(q("q1"))], T0 + 5 * S);
    expect(same).toBe(a);
    const practice = carryPlaces(a, [sam(q("q1", { kind: "practice", leaf: MONIC, step: 1 }))], T0 + 9 * S);
    expect(practice[0]).toMatchObject({ since: T0 + 9 * S, entered: T0 });
    const moved = carryPlaces(practice, [sam(q("q2"))], T0 + 20 * S);
    expect(moved[0]).toMatchObject({ since: T0 + 20 * S, entered: T0 + 20 * S });
  });

  it("a classmate's own entry wins over the carried one, and once Sam has handed in every entry is the hand-in's own time", () => {
    const prev: SeenPlace[] = [{ id: "liam", place: q("q1"), since: T0, entered: T0 }];
    expect(carryPlaces(prev, [{ id: "liam", place: q("q1"), since: T0 + S }], T0 + 2 * S, { liam: T0 - S })[0].entered).toBe(T0 - S);
    const handed = { ...sessionAt("feedback"), handedInAt: T0 + 50 * S };
    const places = classPlaces(LIVE, handed, T0 + 60 * S, LIVE.absent);
    const carried = carryPlaces([], places, T0 + 60 * S, classmatesEntered(LIVE, handed, T0 + 60 * S));
    expect(classmatesEntered(LIVE, handed, T0 + 60 * S)).toEqual({});
    for (const c of carried) expect(c.entered, c.id).toBe(c.since);
  });
});

describe("empty question rows that may fold", () => {
  it("only runs of two or more neighbouring empty question rows, never Starting, Warm-up or Handed in", () => {
    expect(emptyQuestionRuns(rowsAt(0)).map((r) => r.label)).toEqual(["Q1–Q10"]);
    const end = rowsAt(END + 5 * S);
    const runs = emptyQuestionRuns(end);
    for (const run of runs) {
      expect(run.keys.length).toBeGreaterThanOrEqual(2);
      for (const key of run.keys) {
        const row = end.find((r) => r.key === key)!;
        expect(row.pills).toHaveLength(0);
        expect(["starting", "warm-up", "handed-in"]).not.toContain(key);
      }
    }
    expect(runs.map((r) => r.label)).toEqual(["Q1–Q7", "Q9–Q10"]);
  });
});
