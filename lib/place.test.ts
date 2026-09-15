import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, CLASSMATES } from "@/data/classmates";
import { PRACTICES } from "@/data/practice";
import { CONFIDENCE_CHECK_MS, STREAM_PACES, WARM_UP_IDS, type StreamPace } from "@/data/stream";
import { leafName, type LeafId } from "@/data/taxonomy";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { FACTORISING_KINDS } from "./confidence";
import { skipFixture } from "./demo";
import { evaluateLine } from "./evaluate";
import { carrySince, classmateTimeline, classPlaces, placeKey, placeRows, placeStep, rowKey, segmentAt, sessionPlace, type Place, type StudentPlace } from "./place";
import { classmateProgress } from "./progress";
import { INITIAL_SESSION, INITIAL_WARMUP, sessionAt, sessionReducer, type StudentSession } from "./session";
import { byEase } from "./warmup";
import { scheduleFor, stateAt, streamEndMs } from "./stream";

const P = ASSIGNMENT.problems;
const T0 = 1_700_000_000_000;
const S = 1000;
const MIN = 60 * S;
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: T0 });
const LIVE = assignmentBundle("pset-6", CREATED)!;
const END = streamEndMs(CLASSMATES, P);

const placesAt = (now: number, session: StudentSession | null = null, set = LIVE) => classPlaces(set, session, now, set.absent);
const who = (id: string, now: number, session: StudentSession | null = null, set = LIVE): StudentPlace => placesAt(now, session, set).find((p) => p.id === id)!;
const timeline = (id: string) => classmateTimeline(CLASSMATE_MAP[id], P);
/** The moment a classmate first reaches a place, on the stream's clock. */
const when = (id: string, match: (p: Place) => boolean) => timeline(id).find((s) => match(s.place))!.at;
const q = (problem: string, detail: Extract<Place, { kind: "question" }>["detail"] = null): Place => ({ kind: "question", problem, label: P.find((p) => p.id === problem)!.label, detail });
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const FRACTIONS: LeafId = "algebra.number.fractions";

describe("the classmates' story follows their records (ticket 314)", () => {
  /** The skills a "low: a, b" label names, as the teacher's label spells them; "factorising" with neither kind is both. */
  const named = (label: string): LeafId[] =>
    label
      .replace(/^low:?\s*/, "")
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean)
      .flatMap((w) => (w === "factorising" ? [...FACTORISING_KINDS] : (Object.keys(PRACTICES) as LeafId[]).filter((l) => leafName(l).short === w)));

  it("exactly the five who answered not confident warm up, each on the skills they named, easiest first, every one a practice of its own", () => {
    const warm = Object.entries(STREAM_PACES).filter(([, p]) => p.warmUpSkills).map(([id]) => id);
    expect(warm.sort()).toEqual([...WARM_UP_IDS].sort());
    expect(STREAM_PACES.jordan.warmUpSkills).toEqual([NONMONIC]);
    expect(STREAM_PACES.mia.warmUpSkills).toEqual([FRACTIONS, NONMONIC]);
    expect(STREAM_PACES.oliver.warmUpSkills).toEqual([MONIC, NONMONIC]);
    expect(STREAM_PACES.tomas.warmUpSkills).toEqual([FRACTIONS]);
    for (const id of WARM_UP_IDS) {
      const skills = STREAM_PACES[id].warmUpSkills!;
      expect(STREAM_PACES[id].warmUpMs, id).toBeGreaterThan(0);
      expect(skills, id).toEqual(byEase([...skills]));
      for (const l of skills) expect(PRACTICES[l]?.leaf, `${id} ${l}`).toBe(l);
      const label = CLASSMATE_MAP[id].confidence;
      if (label !== "low") expect([...skills].sort(), id).toEqual(named(label).sort());
    }
  });

  it("Amelia named no skill: her warm-up is the discriminant, the skill her Q6 and Q10 wrong lines are tagged with", () => {
    expect(CLASSMATE_MAP.amelia.confidence).toBe("low");
    const tagged = CLASSMATE_MAP.amelia.wrong.flatMap((pid) => CLASSMATE_MAP.amelia.attempts[pid].flatMap((tex) => { const v = evaluateLine(pid, tex); return v.verdict === "wrong" ? v.tags.map((t) => t.leaf) : []; }));
    expect(STREAM_PACES.amelia.warmUpSkills).toEqual(["algebra.equations.discriminant"]);
    expect(tagged).toContain("algebra.equations.discriminant");
  });

  it("help is taken only on a question the student really slipped on, on the skill of that wrong line, a skill with its own practice", () => {
    const help = Object.entries(STREAM_PACES).flatMap(([id, p]) => (p.help ?? []).map((h) => ({ id, ...h })));
    expect(help.map((h) => `${h.id} ${h.problem}`).sort()).toEqual(["finn q5", "harper q3", "liam q1", "sofia q2"]);
    for (const h of help) {
      const m = CLASSMATE_MAP[h.id];
      expect(m.wrong, h.id).toContain(h.problem);
      expect(P.findIndex((p) => p.id === h.problem), h.id).toBeLessThan(m.done);
      const leaves = m.attempts[h.problem].flatMap((tex) => { const v = evaluateLine(h.problem, tex); return v.verdict === "wrong" ? v.tags.map((t) => t.leaf) : []; });
      expect(leaves, `${h.id} ${h.problem}`).toContain(h.leaf);
      expect(PRACTICES[h.leaf]?.leaf).toBe(h.leaf);
    }
  });

  it("a few ask for hints, on questions they reached and slipped on; everyone else works straight through", () => {
    const hints = Object.entries(STREAM_PACES).flatMap(([id, p]) => (p.hints ?? []).map((h) => ({ id, ...h })));
    expect(hints.map((h) => `${h.id} ${h.problem} ${h.count}`).sort()).toEqual(["ethan q4 1", "noah q3 2", "ruby q9 1"]);
    for (const h of hints) {
      expect(CLASSMATE_MAP[h.id].wrong).toContain(h.problem);
      expect(P.findIndex((p) => p.id === h.problem)).toBeLessThan(CLASSMATE_MAP[h.id].done);
    }
    const busy = new Set([...WARM_UP_IDS, "finn", "harper", "liam", "sofia", "ethan", "noah", "ruby"]);
    for (const m of CLASSMATES.filter((c) => !busy.has(c.id))) expect(timeline(m.id).every((s) => s.place.kind !== "warmup" && !(s.place.kind === "question" && s.place.detail)), m.id).toBe(true);
  });

  it("the new script moves no answer and no hand-in: the schedule is the one without it", () => {
    const bare = Object.fromEntries(Object.entries(STREAM_PACES).map(([id, { warmUpMs, paceMs, firstMs, submitAtMs }]): [string, StreamPace] => [id, { warmUpMs, paceMs, firstMs, submitAtMs }]));
    for (const m of CLASSMATES) expect(scheduleFor(m, P), m.id).toEqual(scheduleFor(m, P, bare));
  });
});

describe("a classmate's timeline", () => {
  it("is in time order, starts on the confidence check, keeps the warm-up inside its time and each question between the answers around it", () => {
    for (const m of CLASSMATES) {
      const t = timeline(m.id);
      const s = scheduleFor(m, P);
      for (let i = 1; i < t.length; i++) expect(t[i].at, `${m.id} #${i}`).toBeGreaterThanOrEqual(t[i - 1].at);
      if (!s.starts) {
        expect(t).toEqual([{ at: 0, place: { kind: "not-started" } }]);
        continue;
      }
      expect(t[0]).toEqual({ at: 0, place: { kind: "confidence" } });
      for (const seg of t) {
        if (seg.place.kind === "warmup" || seg.place.kind === "warmup-chat") expect(seg.at, m.id).toBeLessThan(s.warmUpEnd!);
        if (seg.place.kind === "question") {
          const problem = seg.place.problem;
          const i = P.findIndex((p) => p.id === problem);
          if (i > 0) expect(seg.at, `${m.id} ${P[i].id}`).toBeGreaterThanOrEqual(s.answeredAt[i - 1]);
          if (i < s.answeredAt.length) expect(seg.at, `${m.id} ${P[i].id}`).toBeLessThan(s.answeredAt[i]);
        }
      }
      if (s.submitAt !== null) expect(t.at(-1)).toEqual({ at: s.submitAt, place: { kind: "handed-in" } });
    }
  });

  it("agrees with the roster's pill at every moment: handed in, warming up (the check, the chat, the warm-up), or on the pill's question", () => {
    for (const m of CLASSMATES) {
      const s = scheduleFor(m, P);
      const t = timeline(m.id);
      for (let e = 0; e <= END + 30 * S; e += 1500) {
        const place = segmentAt(t, e).place;
        const pill = classmateProgress(m, P, stateAt(s, e));
        if (pill.kind === "submitted") expect(place.kind, `${m.id} ${e}`).toBe("handed-in");
        else if (pill.kind === "warming-up") expect(["confidence", "warmup-chat", "warmup"], `${m.id} ${e}`).toContain(place.kind);
        else if (pill.kind === "not-started") expect(place.kind).toBe("not-started");
        // Before the first answer a student straight onto the set is on the check for its first seconds; after it the question matches.
        else if (place.kind !== "confidence") expect(place.kind === "question" && place.label, `${m.id} ${e}`).toBe(pill.label);
        else expect(e, m.id).toBeLessThan(CONFIDENCE_CHECK_MS);
      }
    }
  });

  it("each warm-up skill runs its three steps in order; Mia's fractions before non-monic, Oliver's monic before non-monic", () => {
    for (const id of WARM_UP_IDS) {
      const steps = timeline(id).filter((s) => s.place.kind === "warmup").map((s) => s.place as Extract<Place, { kind: "warmup" }>);
      const skills = STREAM_PACES[id].warmUpSkills!;
      expect(steps.map((s) => `${s.leaf}:${s.step}`), id).toEqual(skills.flatMap((l) => [1, 2, 3].map((n) => `${l}:${n}`)));
    }
    expect(timeline("amelia").filter((s) => s.place.kind === "warmup-chat")).toHaveLength(1);
  });
});

describe("the class at a moment", () => {
  it("at the start everyone who starts is on the confidence check, Sam has not started, and Chloe is absent", () => {
    const at = placesAt(T0);
    expect(at[0]).toEqual({ id: DEMO_STUDENT.id, place: { kind: "not-started" }, since: null });
    expect(at.map((p) => p.id)).toEqual([DEMO_STUDENT.id, ...CLASSMATES.map((m) => m.id)]);
    for (const p of at.slice(1)) expect(p.place.kind, p.id).toBe(p.id === "chloe" ? "absent" : "confidence");
    for (const p of at.slice(1).filter((p) => p.id !== "chloe")) expect(p.since).toBe(T0);
    // A clock behind the start reads as the start.
    expect(placesAt(T0 - 5 * S)).toEqual(placesAt(T0).map((p) => ({ ...p, since: p.since === null ? null : T0 })));
  });

  it("Jordan: the check, the chat, then non-monic's worked example, finishing the steps, on his own, then Q1; and Q8 for good", () => {
    const jordan = scheduleFor(CLASSMATE_MAP.jordan, P);
    expect(who("jordan", T0 + 5 * S).place).toEqual({ kind: "confidence" });
    expect(who("jordan", T0 + 7 * S)).toEqual({ id: "jordan", place: { kind: "warmup-chat" }, since: T0 + 6 * S });
    const stepAt = (n: number) => when("jordan", (p) => p.kind === "warmup" && p.step === n);
    expect(stepAt(1)).toBe(15 * S);
    for (const n of [1, 2, 3] as const) {
      expect(who("jordan", T0 + stepAt(n) + 1).place).toEqual({ kind: "warmup", leaf: NONMONIC, step: n });
      expect(who("jordan", T0 + stepAt(n) + 1).since).toBe(T0 + stepAt(n));
    }
    expect(who("jordan", T0 + jordan.warmUpEnd!).place).toEqual(q("q1"));
    for (const later of [jordan.answeredAt[6], END, END + 60 * MIN]) expect(who("jordan", T0 + later).place, String(later)).toEqual(q("q8"));
    expect(who("jordan", T0 + END).since).toBe(T0 + jordan.answeredAt[6]);
  });

  it("Mia warms up on fractions then non-monic; Tomas on fractions; Amelia on the discriminant; Oliver on monic then non-monic", () => {
    const skillsSeen = (id: string) => {
      const seen: string[] = [];
      for (let e = 0; e < scheduleFor(CLASSMATE_MAP[id], P).warmUpEnd!; e += 500) {
        const p = who(id, T0 + e).place;
        const k = p.kind === "warmup" ? `${p.leaf.split(".")[2]} ${p.step}` : p.kind;
        if (seen.at(-1) !== k) seen.push(k);
      }
      return seen;
    };
    expect(skillsSeen("mia")).toEqual(["confidence", "warmup-chat", "fractions 1", "fractions 2", "fractions 3", "nonmonic 1", "nonmonic 2", "nonmonic 3"]);
    expect(skillsSeen("tomas")).toEqual(["confidence", "warmup-chat", "fractions 1", "fractions 2", "fractions 3"]);
    expect(skillsSeen("amelia")).toEqual(["confidence", "warmup-chat", "discriminant 1", "discriminant 2", "discriminant 3"]);
    expect(skillsSeen("oliver")).toEqual(["confidence", "warmup-chat", "monic 1", "monic 2", "monic 3", "nonmonic 1", "nonmonic 2", "nonmonic 3"]);
  });

  it("Liam takes help on Q1 in three steps inside Q1's time, then Q2 when his Q1 answer lands; Sofia, Harper and Finn likewise on their slips", () => {
    for (const [id, problem, leaf] of [["liam", "q1", MONIC], ["sofia", "q2", NONMONIC], ["harper", "q3", "algebra.expand-factor.expand"], ["finn", "q5", "graphing.quadratics.features"]] as const) {
      const s = scheduleFor(CLASSMATE_MAP[id], P);
      const i = P.findIndex((p) => p.id === problem);
      const seen: string[] = [];
      const moments: number[] = [];
      for (let e = i === 0 ? CONFIDENCE_CHECK_MS : s.answeredAt[i - 1]; e < s.answeredAt[i]; e += 250) moments.push(e);
      for (const e of [...moments, s.answeredAt[i]]) {
        const p = who(id, T0 + e).place;
        const k = p.kind === "question" ? `${p.label}${p.detail?.kind === "practice" ? ` practice ${p.detail.leaf === leaf} ${p.detail.step}` : ""}` : p.kind;
        if (seen.at(-1) !== k) seen.push(k);
      }
      const label = P[i].label;
      expect(seen, id).toEqual([label, `${label} practice true 1`, `${label} practice true 2`, `${label} practice true 3`, P[i + 1].label]);
    }
  });

  it("Noah's two hints on Q3, Ethan's one on Q4 and Ruby's on Q9 show until the question is answered", () => {
    const noah = scheduleFor(CLASSMATE_MAP.noah, P);
    const h1 = when("noah", (p) => p.kind === "question" && p.detail?.kind === "hint" && p.detail.hint === 1);
    const h2 = when("noah", (p) => p.kind === "question" && p.detail?.kind === "hint" && p.detail.hint === 2);
    expect(noah.answeredAt[1]).toBeLessThan(h1);
    expect(h1).toBeLessThan(h2);
    expect(who("noah", T0 + h1 - 1).place).toEqual(q("q3"));
    expect(who("noah", T0 + h1).place).toEqual(q("q3", { kind: "hint", hint: 1 }));
    expect(who("noah", T0 + noah.answeredAt[2] - 1)).toEqual({ id: "noah", place: q("q3", { kind: "hint", hint: 2 }), since: T0 + h2 });
    expect(who("noah", T0 + noah.answeredAt[2]).place).toEqual(q("q4"));
    expect(timeline("ethan").some((s) => placeKey(s.place) === "question:q4:hint:1")).toBe(true);
    expect(timeline("ethan").some((s) => placeKey(s.place) === "question:q4:hint:2")).toBe(false);
    expect(timeline("ruby").some((s) => placeKey(s.place) === "question:q9:hint:1")).toBe(true);
  });

  it("the end state: 17 handed in, Jordan on Q8, Sam not started, Chloe absent; a presenter skip lands there", () => {
    const end = placesAt(T0 + END);
    expect(end.filter((p) => p.place.kind === "handed-in")).toHaveLength(17);
    const { classroom, session } = skipFixture("working", T0);
    const skipped = assignmentBundle("pset-6", classroom)!;
    const atSkip = classPlaces(skipped, session, T0, skipped.absent);
    expect(atSkip.slice(1).map((p) => p.place)).toEqual(end.slice(1).map((p) => p.place));
    expect(atSkip.find((p) => p.id === "jordan")!.place).toEqual(q("q8"));
  });

  it("a pure function of the start and now: the same moment reads the same, and a later start reads the same shifted", () => {
    const later = assignmentBundle("pset-6", classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual"], at: T0 + 7 * MIN }))!;
    for (const at of [5 * S, 30 * S, 90 * S, 3 * MIN, 6 * MIN]) {
      expect(placesAt(T0 + at)).toEqual(placesAt(T0 + at));
      expect(placesAt(T0 + 7 * MIN + at, null, later)).toEqual(placesAt(T0 + at).map((p) => ({ ...p, since: p.since === null ? null : p.since + 7 * MIN })));
    }
  });

  it("a diagnostic chain stops the clock: nobody moves while it is out, and the times after it are pushed back by it", () => {
    const pushed = classroomReducer(CREATED, { type: "diagnostic/push", steps: ["d-q1-pair"], at: T0 + 20 * S });
    const out = assignmentBundle("pset-6", pushed)!;
    expect(placesAt(T0 + 3 * MIN, null, out)).toEqual(placesAt(T0 + 20 * S, null, out));
    const ended = assignmentBundle("pset-6", classroomReducer(pushed, { type: "diagnostic/withdraw", at: T0 + 80 * S }))!;
    expect(placesAt(T0 + 80 * S + 40 * S, null, ended).map((p) => p.place)).toEqual(placesAt(T0 + 60 * S).map((p) => p.place));
    const jordanStep2 = when("jordan", (p) => p.kind === "warmup" && p.step === 2);
    expect(who("jordan", T0 + 60 * S + 60 * S, null, ended).since).toBe(T0 + jordanStep2 + 60 * S);
  });

  it("once Sam hands in, every classmate who started has handed in, no later than Sam; Chloe stays absent", () => {
    const handed = { ...sessionAt("feedback"), handedInAt: T0 + 2 * MIN };
    const at = placesAt(T0 + 2 * MIN + 5 * S, handed);
    expect(at[0]).toEqual({ id: DEMO_STUDENT.id, place: { kind: "handed-in" }, since: T0 + 2 * MIN });
    for (const p of at.slice(1)) {
      expect(p.place.kind, p.id).toBe(p.id === "chloe" ? "absent" : "handed-in");
      if (p.id !== "chloe") expect(p.since!, p.id).toBeLessThanOrEqual(T0 + 2 * MIN);
    }
  });

  it("a finished set is its records: everyone with work handed in, nobody else started, no times", () => {
    const ps5 = assignmentBundle("pset-5", CREATED)!;
    const at = classPlaces(ps5, null, T0, ps5.absent);
    expect(at[0].place.kind).toBe("handed-in");
    for (const p of at) expect(p.since).toBeNull();
    expect(classPlaces(ps5, null, T0 + END, ps5.absent)).toEqual(at);
  });

  it("a student marked absent is absent wherever the stream has them", () => {
    expect(classPlaces(LIVE, null, T0 + 3 * MIN, ["liam"]).find((p) => p.id === "liam")).toEqual({ id: "liam", place: { kind: "absent" }, since: null });
  });
});

describe("Sam's place, from his session", () => {
  const W = { ...INITIAL_SESSION, stage: "working" as const, practice: "declined" as const, confidence: { level: "confident" as const } };

  it("before the set, the check, the chat and the warm-up pad", () => {
    expect(sessionPlace(null, P)).toEqual({ place: { kind: "not-started" }, since: null });
    expect(sessionPlace(INITIAL_SESSION, P).place).toEqual({ kind: "not-started" });
    expect(sessionPlace({ ...INITIAL_SESSION, stage: "goal" }, P).place).toEqual({ kind: "not-started" });
    expect(sessionPlace(sessionAt("confidence"), P).place).toEqual({ kind: "confidence" });
    expect(sessionPlace(sessionAt("warmup-chat"), P).place).toEqual({ kind: "warmup-chat" });
    const pad = sessionAt("practice");
    const first = sessionPlace(pad, P).place;
    expect(first).toMatchObject({ kind: "warmup", step: 1, leaf: FRACTIONS });
    expect(sessionPlace({ ...pad, warmup: { ...pad.warmup, problem: "second" } }, P).place).toMatchObject({ kind: "warmup", step: 3, leaf: FRACTIONS });
    expect(sessionPlace({ ...pad, warmup: { ...INITIAL_WARMUP, messages: pad.warmup.messages, step: 1 } }, P).place).toMatchObject({ kind: "warmup", step: 1 });
  });

  it("the question on screen; practice from it at step 1, its follow-up step 2, back on the question until he moves on", () => {
    expect(sessionPlace(W, P).place).toEqual(q("q1"));
    const onQ2 = sessionReducer(W, { type: "problem/goto", index: 1 });
    expect(sessionPlace(onQ2, P).place).toEqual(q("q2"));
    const help = sessionReducer(onQ2, { type: "help/request", leaf: NONMONIC, problem: "q2" });
    expect(sessionPlace(help, P).place).toEqual(q("q2", { kind: "practice", leaf: NONMONIC, step: 1 }));
    expect(sessionPlace({ ...help, overlayRun: { ...help.overlayRun, problem: "second" } }, P).place).toEqual(q("q2", { kind: "practice", leaf: NONMONIC, step: 2 }));
    const back = sessionReducer(help, { type: "overlay/done" });
    expect(sessionPlace(back, P).place).toEqual(q("q2", { kind: "practice", leaf: NONMONIC, step: 3 }));
    expect(sessionPlace(sessionReducer(back, { type: "problem/goto", index: 2 }), P).place).toEqual(q("q3"));
    // A declined offer is no practice.
    const declined = { ...onQ2, practices: [{ leaf: MONIC, reason: "detected" as const, accepted: false, problem: "q2" }] };
    expect(sessionPlace(declined, P).place).toEqual(q("q2"));
  });

  it("handed in once past working, since his hand-in", () => {
    expect(sessionPlace({ ...sessionAt("feedback"), handedInAt: T0 }, P)).toEqual({ place: { kind: "handed-in" }, since: T0 });
    expect(sessionPlace({ ...sessionAt("feedback"), handedInAt: 0 }, P).since).toBeNull();
  });

  it("carrySince keeps the time a place was first seen, and starts again when it moves", () => {
    const a: StudentPlace = { id: "sam", place: q("q2"), since: null };
    const first = carrySince(undefined, a, T0);
    expect(first.since).toBe(T0);
    expect(carrySince(first, a, T0 + 30 * S).since).toBe(T0);
    expect(carrySince(first, { ...a, place: q("q2", { kind: "practice", leaf: MONIC, step: 1 }) }, T0 + 30 * S).since).toBe(T0 + 30 * S);
    expect(carrySince(first, { ...a, since: T0 - S }, T0 + 30 * S).since).toBe(T0 - S);
  });
});

describe("rows", () => {
  it("lesson order, every row present: Starting, Warm-up, Q1 … Q10, Handed in; the absent in no row", () => {
    const { rows, absent } = placeRows(placesAt(T0 + 3 * MIN), P);
    expect(rows.map((r) => r.label)).toEqual(["Starting", "Warm-up", ...P.map((p) => p.label), "Handed in"]);
    expect(absent.map((p) => p.id)).toEqual(["chloe"]);
    expect(rows.reduce((n, r) => n + r.students.length, 0)).toBe(19);
    expect(rows[0].students.map((p) => p.id)).toEqual([DEMO_STUDENT.id]);
    expect(placeRows([], P).rows.every((r) => r.students.length === 0)).toBe(true);
  });

  it("the check sits with not started, the chat with the warm-up; a hint or practice stays in its question's row", () => {
    expect(rowKey({ kind: "confidence" })).toBe("starting");
    expect(rowKey({ kind: "warmup-chat" })).toBe("warm-up");
    expect(rowKey({ kind: "warmup", leaf: MONIC, step: 2 })).toBe("warm-up");
    expect(rowKey(q("q4", { kind: "hint", hint: 2 }))).toBe("q4");
    expect(rowKey(q("q4", { kind: "practice", leaf: MONIC, step: 3 }))).toBe("q4");
    expect(rowKey({ kind: "absent" })).toBeNull();
    expect(placeStep(q("q4", { kind: "practice", leaf: MONIC, step: 3 }))).toBe(3);
    expect(placeStep(q("q4", { kind: "hint", hint: 1 }))).toBeNull();
    expect(placeStep({ kind: "warmup", leaf: MONIC, step: 2 })).toBe(2);
  });

  it("names move down the rows and never back up while the class works", () => {
    const order = (p: Place) => ["starting", "warm-up", ...P.map((x) => x.id), "handed-in"].indexOf(rowKey(p) ?? "");
    let last = new Map<string, number>();
    for (let e = 0; e <= END; e += 2 * S) {
      const now = new Map(placesAt(T0 + e).filter((p) => p.place.kind !== "absent" && p.id !== DEMO_STUDENT.id).map((p) => [p.id, order(p.place)]));
      for (const [id, r] of now) expect(r, `${id} ${e}`).toBeGreaterThanOrEqual(last.get(id) ?? 0);
      last = now;
    }
  });
});
