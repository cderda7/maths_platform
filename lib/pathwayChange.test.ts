import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import type { Pathway, ReviewStage, Stage } from "@/data/types";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, pathwayOf, type ClassroomAction, type ClassroomState } from "./classroom";
import { pathwayStages } from "./classStage";
import { lessonDecision } from "./decision";
import { answerPathway } from "./decisionState";
import { DEMO_PATHWAY, demoSend, skipFixture } from "./demo";
import { groupPlan, liveGroupPlan } from "./group";
import { allPathways, REVIEW_ORDER } from "./pathway";
import { changedPathway, liveLocks, pathwayLocks, presentPlaces, samePathway, stagePlace, switchStage, type LinePlace, type PathwayLocks } from "./pathwayChange";
import { scriptedSession, sessionReducer, reworkedSession, type SessionAction, type StudentSession } from "./session";
import { scheduleFor } from "./stream";
import { CLASSMATES } from "@/data/classmates";

const now = 1_700_000_000_000;
const OPEN: PathwayLocks = { individual: false, group: false, "whole-class": false };
const PLACE: Record<ReviewStage, LinePlace> = { individual: 1, group: 2, "whole-class": 3 };

/** Problem Set 6 sent under `pathway`, live from `now`. */
const sentWith = (pathway: Pathway): ClassroomState => classroomReducer(INITIAL_CLASSROOM, demoSend(pathway, now, now));
const bundle = (c: ClassroomState) => assignmentBundle(ASSIGNMENT.id, c)!;
const locksAt = (c: ClassroomState, s: StudentSession | null, t: number) => liveLocks(c, bundle(c), s, t);
/** Sam on the set with his scripted working, not yet handed in. */
const samWorking: StudentSession = { ...scriptedSession(), stage: "working" };
/** Sam's session after an action under the classroom's pathway as it is now, as the student tab dispatches it (`lib/store.ts`). */
const step = (c: ClassroomState, s: StudentSession, a: SessionAction) => sessionReducer(s, a, { pathway: pathwayOf(c), goal: ASSIGNMENT.goal });
/** The decision card's Done: the choice resolved against the locks at the press, answered as change (or keep when unchanged). */
function done(c: ClassroomState, s: StudentSession | null, t: number, choice: Pathway): ClassroomState {
  const planned = pathwayOf(c);
  const pathway = changedPathway(planned, choice, locksAt(c, s, t));
  const action: ClassroomAction = { type: "decision/answer", due: { kind: "close-to-finishing", stage: "working", at: t }, answer: samePathway(pathway, planned) ? { kind: "keep" } : { kind: "change", pathway }, at: t };
  return classroomReducer(c, action);
}
const firstHandIn = Math.min(...CLASSMATES.map((m) => scheduleFor(m, ASSIGNMENT.problems).submitAt ?? Infinity));

describe("where a student is on the line", () => {
  it("places every student stage", () => {
    const expected: Record<Stage, LinePlace> = { overview: 0, goal: 0, confidence: 0, "warmup-chat": 0, practice: 0, working: 0, feedback: 1, "class-wait": 2, group: 2, waiting: 3, frozen: 3, report: 4, peers: 4, history: 4, homework: 4 };
    for (const [stage, place] of Object.entries(expected)) expect(stagePlace(stage as Stage)).toBe(place);
  });
});

describe("the change rule", () => {
  for (const stage of REVIEW_ORDER) {
    it(`locks ${stage} review exactly when it is on the pathway and a student in the room is at it or past it`, () => {
      for (const pathway of allPathways()) {
        for (const furthest of [0, 1, 2, 3, 4] as LinePlace[]) {
          const places: LinePlace[] = [0, 0, furthest, 0];
          const locks = pathwayLocks(pathway, places);
          expect(locks[stage]).toBe(pathway.includes(stage) && furthest >= PLACE[stage]);
        }
        // Nobody in the room: nothing locked.
        expect(pathwayLocks(pathway, [])[stage]).toBe(false);
      }
    });
  }

  it("switches a free stage on or off in the fixed order, and refuses a locked one", () => {
    expect(switchStage(["individual", "whole-class"], "group", OPEN)).toEqual(["individual", "group", "whole-class"]);
    expect(switchStage(["individual", "group"], "whole-class", OPEN)).toEqual(["individual", "group", "whole-class"]);
    expect(switchStage(["individual", "group", "whole-class"], "individual", OPEN)).toEqual(["group", "whole-class"]);
    expect(switchStage(["individual"], "individual", OPEN)).toEqual([]);
    const lockedIndividual = { ...OPEN, individual: true };
    expect(switchStage(["individual", "group"], "individual", lockedIndividual)).toEqual(["individual", "group"]);
  });

  it("resolves a choice against the locks at the press: a locked stage keeps its place, every free one is as chosen", () => {
    const locks = { ...OPEN, individual: true };
    expect(changedPathway(["individual", "group"], ["group", "whole-class"], locks)).toEqual(["individual", "group", "whole-class"]);
    expect(changedPathway(["individual", "group", "whole-class"], [], { individual: true, group: true, "whole-class": false })).toEqual(["individual", "group"]);
    expect(changedPathway(["group"], ["individual", "group"], OPEN)).toEqual(["individual", "group"]);
  });
});

describe("the rule on the demo class", () => {
  const full = sentWith(DEMO_PATHWAY);
  const cardUp = now + 3 * 60_000 + 40_000;

  it("locks nothing while the room is still working, when the card comes due", () => {
    const b = bundle(full);
    expect(lessonDecision(full, b, samWorking, cardUp)?.shown).toBe("card");
    expect(presentPlaces(full, b, samWorking, cardUp).every((p) => p === 0)).toBe(true);
    expect(locksAt(full, samWorking, cardUp)).toEqual(OPEN);
  });

  it("locks individual review once the first classmate in the room hands in, unless they are marked absent", () => {
    const t = now + firstHandIn + 500;
    expect(locksAt(full, samWorking, t)).toEqual({ ...OPEN, individual: true });
    const first = CLASSMATES.find((m) => scheduleFor(m, ASSIGNMENT.problems).submitAt === firstHandIn)!;
    const away = classroomReducer(full, { type: "absence/set", assignment: ASSIGNMENT.id, student: first.id, absent: true });
    expect(locksAt(away, samWorking, t)).toEqual(OPEN);
  });

  it("on a pathway without individual review, a classmate's hand-in is at the gate: group review locks", () => {
    const c = sentWith(["group", "whole-class"]);
    expect(locksAt(c, samWorking, now + firstHandIn + 500)).toEqual({ individual: false, group: true, "whole-class": false });
    const noGroup = sentWith(["whole-class"]);
    expect(locksAt(noGroup, samWorking, now + firstHandIn + 500)).toEqual({ individual: false, group: false, "whole-class": true });
  });

  it("follows the class through every stage of the presenter's run", () => {
    const at = (target: Parameters<typeof skipFixture>[0]) => {
      const f = skipFixture(target, now);
      return locksAt(f.classroom, f.session, now + 1000);
    };
    // Priya has nothing to fix, so she is done reviewing from Sam's hand-in (Where students are, ticket 318): at the gate already.
    expect(at("indiv review")).toEqual({ individual: true, group: true, "whole-class": false });
    const f = skipFixture("indiv review", now);
    const noPriya = classroomReducer(f.classroom, { type: "absence/set", assignment: ASSIGNMENT.id, student: "priya", absent: true });
    expect(locksAt(noPriya, f.session, now + 1000)).toEqual({ individual: true, group: false, "whole-class": false });
    expect(at("class wait")).toEqual({ individual: true, group: true, "whole-class": false });
    expect(at("group review")).toEqual({ individual: true, group: true, "whole-class": false });
    expect(at("class review")).toEqual({ individual: true, group: true, "whole-class": true });
    // Sam on his report has been through every stage of the pathway.
    expect(at("report")).toEqual({ individual: true, group: true, "whole-class": true });
  });

  it("locks every stage on the pathway once the lesson is over, Sam absent or not", () => {
    const over = classroomReducer(full, { type: "lesson/end", at: now });
    expect(locksAt(over, samWorking, now)).toEqual({ individual: true, group: true, "whole-class": true });
  });

  it("counts a group that sits out as past group review: at class review's wait (ticket 332)", () => {
    const f = skipFixture("group review", now);
    const places = presentPlaces(f.classroom, bundle(f.classroom), f.session, now + 1000);
    expect(places.length).toBe(19);
    expect(Math.max(...places)).toBe(2);
    // Priya had all ten right; with the rest of coral away her group has nothing to review and she goes on to class review's wait.
    const away = ["amelia", "tomas", "aiden"].reduce((c, student) => classroomReducer(c, { type: "absence/set", assignment: ASSIGNMENT.id, student, absent: true }), f.classroom);
    expect(Math.max(...presentPlaces(away, bundle(away), f.session, now + 1000))).toBe(3);
    expect(locksAt(away, f.session, now + 1000)["whole-class"]).toBe(true);
  });
});

describe("routing after a change", () => {
  it("adds class review: both strips show it, and Sam lands on class review's wait after group review", () => {
    const c = done(sentWith(["individual", "group"]), samWorking, now + 220_000, ["individual", "group", "whole-class"]);
    expect(c.assignment?.pathway).toEqual(["individual", "group", "whole-class"]);
    expect(c.decisions?.[0]).toMatchObject({ status: "answered", answer: { kind: "change", pathway: ["individual", "group", "whole-class"] } });
    expect(pathwayStages(c, samWorking, now).map((s) => `${s.id}:${s.state}`)).toEqual(["working:current", "individual:ahead", "group:ahead", "whole-class:ahead"]);
    const onBoard: StudentSession = { ...reworkedSession(), stage: "group" };
    expect(step(c, onBoard, { type: "group/done" }).stage).toBe("waiting");
    // Planned without it, the same press went to the report.
    expect(step(sentWith(["individual", "group"]), onBoard, { type: "group/done" }).stage).toBe("report");
  });

  it("removes individual review before anyone reached it: Sam hands in straight to group review's gate", () => {
    const c = done(sentWith(DEMO_PATHWAY), samWorking, now + 220_000, ["group", "whole-class"]);
    expect(c.assignment?.pathway).toEqual(["group", "whole-class"]);
    expect(step(c, samWorking, { type: "hand-in/confirm", at: now + 300_000 }).stage).toBe("class-wait");
    // Force submit's hand-in routes the same way.
    expect(step(c, samWorking, { type: "advance/apply", id: "force-submit@1", kind: "force-submit", at: now + 300_000 }).stage).toBe("class-wait");
  });

  it("adds group review to a set created without it: Sam's corrections go to the gate, the groups come from the set's seating, the absent left out, on ticket 332's rule", () => {
    let c = sentWith(["individual", "whole-class"]);
    c = classroomReducer(c, { type: "absence/set", assignment: ASSIGNMENT.id, student: "jordan", absent: true });
    c = done(c, samWorking, now + 220_000, ["individual", "group", "whole-class"]);
    expect(c.assignment?.pathway).toEqual(["individual", "group", "whole-class"]);
    const correcting: StudentSession = { ...reworkedSession(), stage: "feedback" };
    expect(step(c, correcting, { type: "rework/done", force: true }).stage).toBe("class-wait");
    const plan = liveGroupPlan(c, { ...correcting, stage: "class-wait" });
    expect(plan.members.map((m) => m.id)).toEqual([DEMO_STUDENT.id, "zara", "liam"]);
    // After individual review (332): the union is the corrections' union, as a planned group review would take it.
    expect(plan.discussion.problems.map((p) => p.id)).toEqual(groupPlan({ ...correcting, stage: "class-wait" }, ["chloe", "jordan"], true).discussion.problems.map((p) => p.id));
    // The set's own seating, not a fixed table: move Liam to coral on the set and he leaves Sam's board.
    const moved = classroomReducer(c, { type: "groups/move", student: "liam", to: "coral", assignment: ASSIGNMENT.id });
    expect(liveGroupPlan(moved, correcting).members.map((m) => m.id)).toEqual([DEMO_STUDENT.id, "zara"]);
  });

  it("refuses a locked stage: individual review removed after Sam handed in stays, and the answer is keep", () => {
    const handedIn: StudentSession = { ...scriptedSession(), stage: "feedback", handedInAt: now + 200_000 };
    const planned = sentWith(DEMO_PATHWAY);
    expect(locksAt(planned, handedIn, now + 210_000).individual).toBe(true);
    const c = done(planned, handedIn, now + 210_000, ["group", "whole-class"]);
    expect(c.assignment?.pathway).toEqual(DEMO_PATHWAY);
    expect(c.decisions?.[0].answer).toEqual({ kind: "keep" });
    expect(step(c, handedIn, { type: "rework/done", force: true }).stage).toBe("class-wait");
  });

  it("writes the pathway once: a later answer, an invalid pathway or no set change nothing", () => {
    const due = { kind: "close-to-finishing" as const, stage: "working" as const, at: now };
    const changed = classroomReducer(sentWith(DEMO_PATHWAY), { type: "decision/answer", due, answer: { kind: "change", pathway: ["group"] }, at: now });
    expect(changed.assignment?.pathway).toEqual(["group"]);
    expect(classroomReducer(changed, { type: "decision/answer", due, answer: { kind: "change", pathway: ["individual"] }, at: now })).toBe(changed);
    const invalid = classroomReducer(sentWith(DEMO_PATHWAY), { type: "decision/answer", due, answer: { kind: "change", pathway: ["group", "individual"] }, at: now });
    expect(invalid.assignment?.pathway).toEqual(DEMO_PATHWAY);
    expect(classroomReducer(INITIAL_CLASSROOM, { type: "decision/answer", due, answer: { kind: "change", pathway: ["group"] }, at: now }).assignment).toBeNull();
    expect(answerPathway({ kind: "keep" })).toBeNull();
  });

  it("keeps the changed pathway through a reload", () => {
    const c = done(sentWith(["individual", "group"]), samWorking, now + 220_000, ["individual", "group", "whole-class"]);
    const reloaded = migrateClassroom(JSON.parse(JSON.stringify(c)));
    expect(pathwayOf(reloaded)).toEqual(["individual", "group", "whole-class"]);
    expect(lessonDecision(reloaded, bundle(reloaded), samWorking, now + 230_000)?.shown).toBeNull();
  });
});
