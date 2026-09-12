import { describe, expect, it } from "vitest";
import { ARRIVAL_OFFSETS_MS, CLASS_SIZE, classReadiness, LAST_ARRIVAL_MS } from "./readiness";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM } from "./classroom";

describe("the gate into group review", () => {
  const t0 = 1_000_000;
  const arrived = classroomReducer(INITIAL_CLASSROOM, { type: "class/arrive", student: "sam", at: t0 });

  it("counts nobody until the demo student arrives, then the scripted classmates as their offsets pass", () => {
    expect(CLASS_SIZE).toBe(20);
    expect(classReadiness(INITIAL_CLASSROOM, t0)).toEqual({ handedIn: 0, total: 20, started: false, reason: null });
    expect(classReadiness(arrived, t0).handedIn).toBe(1);
    const offsets = Object.values(ARRIVAL_OFFSETS_MS).sort((a, b) => a - b);
    expect(classReadiness(arrived, t0 + offsets[0]).handedIn).toBe(2);
    expect(classReadiness(arrived, t0 + offsets[9]).handedIn).toBe(11);
    expect(classReadiness(arrived, t0 + LAST_ARRIVAL_MS - 1).started).toBe(false);
    expect(classReadiness(arrived, t0 + LAST_ARRIVAL_MS)).toEqual({ handedIn: 20, total: 20, started: true, reason: "everyone" });
    expect(LAST_ARRIVAL_MS).toBeLessThan(30_000);
  });

  it("an arrival is recorded once", () => {
    const again = classroomReducer(arrived, { type: "class/arrive", student: "sam", at: t0 + 5000 });
    expect(again).toBe(arrived);
  });

  it("the teacher's force submit on individual review opens the gate once its grace has passed, whoever is in", () => {
    // Sam arrived a moment ago, so only a few classmates are in when the grace ends: it is the teacher's force that opens the gate.
    const forced = classroomReducer(arrived, { type: "advance/start", kind: "force-review", at: t0 - GRACE_MS + 5000 });
    expect(classReadiness(forced, t0 + 4999).started).toBe(false);
    expect(classReadiness(forced, t0 + 5000)).toMatchObject({ started: true, reason: "teacher" });
    expect(classReadiness(forced, t0 + 5000).handedIn).toBeLessThan(20);
    const other = classroomReducer(arrived, { type: "advance/start", kind: "force-submit", at: t0 - GRACE_MS + 5000 });
    expect(classReadiness(other, t0 + 5000).started).toBe(false);
  });
});
