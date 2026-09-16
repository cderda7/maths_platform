import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import type { Pathway, Problem } from "@/data/types";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, pathwayOf, type ClassroomAction, type ClassroomState } from "./classroom";
import { classStages, stageDone } from "./classStage";
import { lessonDecision } from "./decision";
import { answerMoved, movedToClassReview, type DecisionAnswer } from "./decisionState";
import { DEMO_PATHWAY, demoSend } from "./demo";
import { liveGroupPlan } from "./group";
import { gridOf } from "./groupGrid";
import { REVIEW_ORDER } from "./pathway";
import { liveLocks, type PathwayLocks } from "./pathwayChange";
import { outcomeOf, recordReviews } from "./report";
import { reworkedSession, type StudentSession } from "./session";
import { belowHalf, dueSplit, everyGroupEmpty, halfOrMore, listWords, moveAnswer, moveConfirmSentence, movedInSetOrder, splitEvidence, splitSuggestion, talliesAfterCorrections, talliesSoFar, type QuestionTally } from "./splitReview";
import { groupsAt, sittingOut, standingsAt } from "./standings";

const now = 1_700_000_000_000;
const OPEN: PathwayLocks = { individual: false, group: false, "whole-class": false };
const bundle = (c: ClassroomState) => assignmentBundle(ASSIGNMENT.id, c)!;
const tally = (label: string, correct: number, present = 19): QuestionTally => ({ problem: label.toLowerCase(), label, correct, present });

/** Problem Set 6 sent under `pathway`, an hour ago, with Sam's corrections in and his arrival at the gate at `now`. */
function correcting(pathway: Pathway = DEMO_PATHWAY): { c: ClassroomState; s: StudentSession } {
  let c = classroomReducer(INITIAL_CLASSROOM, demoSend(pathway, now, now - 3_600_000));
  const s: StudentSession = { ...reworkedSession(), stage: "class-wait", handedInAt: now - 5 * 60_000, reworkedAt: now };
  c = classroomReducer(c, { type: "class/arrive", student: DEMO_STUDENT.id, at: now });
  return { c, s };
}

/** The demo class `ms` after Sam reached the gate: its classmates arrive over about a minute (`data/arrivals.ts`). */
const at = (ms: number) => now + ms;

describe("the suggestion", () => {
  it("counts how many of the room have each question right once corrections are in, and names the two fewest have", () => {
    const { c, s } = correcting();
    const tallies = talliesAfterCorrections(bundle(c), c, s, at(30_000));
    expect(tallies.every((t) => t.present === 19)).toBe(true);
    expect(Object.fromEntries(tallies.map((t) => [t.label, t.correct]))).toEqual({ Q1: 17, Q2: 14, Q3: 17, Q4: 16, Q5: 15, Q6: 17, Q7: 5, Q8: 10, Q9: 10, Q10: 8 });
    const suggestion = splitSuggestion(tallies);
    expect(suggestion.suggested.map((t) => t.label)).toEqual(["Q7", "Q10"]);
    // Nothing else is below half of nineteen (Q9's ten is not), so everything else sits behind "all questions".
    expect(suggestion.often).toEqual([]);
    expect(suggestion.rest.map((t) => t.label)).toEqual(["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q8", "Q9"]);
  });

  it("offers every other question fewer than half have right, in set order, and keeps the rest behind", () => {
    const tallies = [tally("Q1", 18), tally("Q2", 4), tally("Q3", 9), tally("Q4", 12), tally("Q5", 2), tally("Q6", 8)];
    const { suggested, often, rest } = splitSuggestion(tallies);
    expect(suggested.map((t) => t.label)).toEqual(["Q5", "Q2"]);
    expect(often.map((t) => t.label)).toEqual(["Q3", "Q6"]);
    expect(rest.map((t) => t.label)).toEqual(["Q1", "Q4"]);
    expect(often.every(belowHalf)).toBe(true);
    expect(rest.some(belowHalf)).toBe(false);
  });

  it("breaks a tie on the later question of the set", () => {
    const { suggested } = splitSuggestion([tally("Q1", 3), tally("Q2", 7), tally("Q3", 3), tally("Q4", 3)]);
    expect(suggested.map((t) => t.label)).toEqual(["Q4", "Q3"]);
  });

  it("suggests one question when only one is below half, and none when everyone is right", () => {
    expect(splitSuggestion([tally("Q1", 18), tally("Q2", 3), tally("Q3", 14)]).suggested.map((t) => t.label)).toEqual(["Q2"]);
    const right = splitSuggestion([tally("Q1", 19), tally("Q2", 18), tally("Q3", 10)]);
    expect(right.suggested).toEqual([]);
    expect(right.often).toEqual([]);
    expect(right.rest.map((t) => t.label)).toEqual(["Q1", "Q2", "Q3"]);
  });

  it("counts first submissions so far on a pathway without individual review", () => {
    const { c, s } = correcting(["group", "whole-class"]);
    const working = { ...s, stage: "working" as const };
    const tallies = talliesSoFar(bundle(c), working, now - 3_600_000 + 8 * 60_000);
    expect(tallies.every((t) => t.present === 19)).toBe(true);
    // Eight minutes in, the class has not reached the last questions, so nobody has them right yet.
    expect(tallies[0].correct).toBeGreaterThan(tallies[9].correct);
    expect(splitSuggestion(tallies).suggested.length).toBe(2);
    expect(splitEvidence(c, bundle(c), working, now).afterCorrections).toBe(false);
  });

  it("counts first submissions while the class is still working, even on a pathway with individual review", () => {
    const { c } = correcting(["individual", "whole-class"]);
    const working = { ...reworkedSession(), stage: "working" as const };
    const evidence = splitEvidence(c, bundle(c), working, now);
    expect(evidence.afterCorrections).toBe(false);
    expect(evidence.tallies).toEqual(talliesSoFar(bundle(c), working, now));
  });
});

describe("when the split comes due", () => {
  it("waits for half or more of the room to have handed their corrections in", () => {
    expect(halfOrMore(10, 19)).toBe(true);
    expect(halfOrMore(9, 19)).toBe(false);
    expect(halfOrMore(10, 20)).toBe(true);
    expect(halfOrMore(0, 0)).toBe(false);
    const { c, s } = correcting();
    // The demo class: Sam alone done at his own arrival (ticket 347: Priya now has Q8 to fix too), ten of nineteen thirty seconds later, everyone in at the gate.
    expect(splitEvidence(c, bundle(c), s, now).handedIn).toBe(1);
    expect(dueSplit(c, bundle(c), s, now)).toBeNull();
    expect(dueSplit(c, bundle(c), s, at(25_000))).toBeNull();
    const due = dueSplit(c, bundle(c), s, at(30_000));
    expect(due).toMatchObject({ kind: "split-review", stage: "individual" });
    expect(due!.evidence.handedIn).toBe(10);
    expect(due!.evidence.suggestion.suggested.map((t) => t.label)).toEqual(["Q7", "Q10"]);
  });

  it("never comes on a pathway without individual review or without group review, nor once the gate has opened", () => {
    const withoutIndividual = correcting(["group", "whole-class"]);
    expect(dueSplit(withoutIndividual.c, bundle(withoutIndividual.c), withoutIndividual.s, at(30_000))).toBeNull();
    const withoutGroup = correcting(["individual", "whole-class"]);
    expect(dueSplit(withoutGroup.c, bundle(withoutGroup.c), withoutGroup.s, at(30_000))).toBeNull();
    const { c, s } = correcting();
    // Everyone in: the class is in group review, so the moment to split has passed.
    expect(dueSplit(c, bundle(c), s, at(90_000))).toBeNull();
  });

  it("does not come when no question is below half", () => {
    const { c } = correcting();
    const set = bundle(c);
    const s = { ...reworkedSession(), stage: "class-wait" as const, handedInAt: now - 5 * 60_000, reworkedAt: now };
    // A class of one: Sam alone, whose corrections leave nothing below half of one.
    const alone = { ...set, classmates: [] as Classmate[], absent: CLASSMATES.map((m) => m.id) };
    expect(dueSplit(c, alone, { ...s, stage: "feedback" }, at(30_000))).toBeNull();
  });
});

describe("the card", () => {
  const raise = (c: ClassroomState, s: StudentSession, t: number): ClassroomState => {
    const view = lessonDecision(c, bundle(c), s, t)!;
    return classroomReducer(c, { type: "decision/raise", due: view.due });
  };

  it("replaces an unanswered close-to-finishing card and carries its pathway", () => {
    const { c, s } = correcting();
    // The close-to-finishing card was raised while the class was working and never answered.
    const withClose = classroomReducer(c, { type: "decision/raise", due: { kind: "close-to-finishing", stage: "working", at: now - 6 * 60_000 } });
    const view = lessonDecision(withClose, bundle(withClose), s, at(30_000))!;
    expect(view.kind).toBe("split-review");
    expect(view.shown).toBe("card");
    expect(view.carriesPathway).toBe(true);
    expect(view.split!.suggestion.suggested.map((t) => t.label)).toEqual(["Q7", "Q10"]);
    // Answered before it came due: no pathway line on the split card.
    const answered = classroomReducer(withClose, { type: "decision/answer", due: { kind: "close-to-finishing", stage: "working", at: now - 6 * 60_000 }, answer: { kind: "keep" }, at: now - 5 * 60_000 });
    expect(lessonDecision(answered, bundle(answered), s, at(30_000))!.carriesPathway).toBe(false);
  });

  it("freezes its counts and ticks at the moment it came due, and a reload reads the same card", () => {
    const { c, s } = correcting();
    const raised = raise(c, s, at(30_000));
    const view = lessonDecision(raised, bundle(raised), s, at(45_000))!;
    expect(view.dueAt).toBe(at(30_000));
    expect(view.split!.handedIn).toBe(10);
    const reloaded = migrateClassroom(JSON.parse(JSON.stringify(raised)));
    expect(lessonDecision(reloaded, bundle(reloaded), s, at(45_000))).toEqual(view);
  });

  it("tucks into a dot, opens again, and lapses when the gate opens", () => {
    const { c, s } = correcting();
    const raised = raise(c, s, at(30_000));
    const due = lessonDecision(raised, bundle(raised), s, at(30_000))!.due;
    const tucked = classroomReducer(raised, { type: "decision/tuck", due });
    expect(lessonDecision(tucked, bundle(tucked), s, at(40_000))!.shown).toBe("dot");
    const open = classroomReducer(tucked, { type: "decision/reopen", due });
    expect(lessonDecision(open, bundle(open), s, at(40_000))!.shown).toBe("card");
    const lapsed = lessonDecision(open, bundle(open), s, at(90_000))!;
    expect(lapsed.lapsed).toBe(true);
    expect(lapsed.shown).toBeNull();
  });

  it("stays up after a move with its moved questions, until Close", () => {
    const { c, s } = correcting();
    const raised = raise(c, s, at(30_000));
    const due = lessonDecision(raised, bundle(raised), s, at(30_000))!.due;
    const answered = classroomReducer(raised, { type: "decision/answer", due, answer: { kind: "move", moved: ["q7", "q10"] }, at: at(31_000) });
    const view = lessonDecision(answered, bundle(answered), s, at(32_000))!;
    expect(view.status).toBe("answered");
    expect(view.shown).toBe("card");
    expect(answerMoved(view.answer!)).toEqual(["q7", "q10"]);
    const closed = classroomReducer(answered, { type: "decision/dismiss", due });
    expect(lessonDecision(closed, bundle(closed), s, at(33_000))!.shown).toBeNull();
    // Keeping everything answers it outright: no card is left.
    const kept = classroomReducer(raised, { type: "decision/answer", due, answer: { kind: "keep" }, at: at(31_000) });
    expect(lessonDecision(kept, bundle(kept), s, at(32_000))!.shown).toBeNull();
  });
});

describe("the answer", () => {
  it("adds class review when it was not planned, and keeps the pathway when it was", () => {
    expect(moveAnswer(DEMO_PATHWAY, DEMO_PATHWAY, ["q7"], OPEN)).toEqual({ kind: "move", moved: ["q7"] });
    expect(moveAnswer(["individual", "group"], ["individual", "group"], ["q7", "q10"], OPEN)).toEqual({ kind: "move", moved: ["q7", "q10"], pathway: ["individual", "group", "whole-class"] });
    // Nothing ticked: the pathway as chosen, or keep.
    expect(moveAnswer(DEMO_PATHWAY, DEMO_PATHWAY, [], OPEN)).toEqual({ kind: "keep" });
    expect(moveAnswer(["individual", "group"], ["group"], [], { ...OPEN })).toEqual({ kind: "change", pathway: ["group"] });
    // A change made on the card comes with the move, and a locked stage stays as it is.
    expect(moveAnswer(["individual", "group"], ["group"], ["q7"], { ...OPEN, individual: true })).toEqual({ kind: "move", moved: ["q7"], pathway: ["individual", "group", "whole-class"] });
    // Skipping group review (every group would sit out) still carries the questions to class review.
    expect(moveAnswer(DEMO_PATHWAY, ["individual", "whole-class"], ["q7"], OPEN)).toEqual({ kind: "move", moved: ["q7"], pathway: ["individual", "whole-class"] });
  });

  it("writes the pathway and the moved questions in one step, and only before the boards open", () => {
    const { c } = correcting(["individual", "group"]);
    const due = { kind: "split-review" as const, stage: "individual" as const, at: at(30_000) };
    const answer: DecisionAnswer = { kind: "move", moved: ["q7", "q10"], pathway: ["individual", "group", "whole-class"] };
    const moved = classroomReducer(c, { type: "decision/answer", due, answer, at: at(31_000) });
    expect(pathwayOf(moved)).toEqual(["individual", "group", "whole-class"]);
    expect(movedToClassReview(moved)).toEqual(["q7", "q10"]);
    expect(movedInSetOrder(moved, ASSIGNMENT.problems)).toEqual(["q7", "q10"]);
    // A reload keeps it.
    expect(movedToClassReview(migrateClassroom(JSON.parse(JSON.stringify(moved))))).toEqual(["q7", "q10"]);
    // The first answer stands.
    const again = classroomReducer(moved, { type: "decision/answer", due, answer: { kind: "keep" }, at: at(40_000) });
    expect(movedToClassReview(again)).toEqual(["q7", "q10"]);
    // Once a board has opened the questions are fixed: the answer changes nothing.
    const running = classroomReducer(c, { type: "group/begin", members: [DEMO_STUDENT.id], problems: ["q1"], at: at(60_000) } as ClassroomAction);
    expect(movedToClassReview(classroomReducer(running, { type: "decision/answer", due, answer, at: at(61_000) }))).toEqual([]);
    // Nothing moved on a class with no decisions.
    expect(movedToClassReview(c)).toEqual([]);
  });
});

describe("the groups after a move", () => {
  const moveOn = (c: ClassroomState, moved: string[], pathway?: Pathway): ClassroomState =>
    classroomReducer(c, { type: "decision/answer", due: { kind: "split-review", stage: "individual", at: at(30_000) }, answer: { kind: "move", moved, ...(pathway ? { pathway } : {}) }, at: at(31_000) });

  it("takes the moved questions out of every group's list, live and simulated", () => {
    const { c, s } = correcting();
    const before = Object.fromEntries(groupsAt(c, s, at(30_000)).map((g) => [g.colour, g.union]));
    expect(before.sky).toContain("q7");
    expect(before.mint).toContain("q10");
    const moved = moveOn(c, ["q7", "q10"]);
    const after = groupsAt(moved, s, at(30_000));
    expect(after.every((g) => !g.union.includes("q7") && !g.union.includes("q10"))).toBe(true);
    expect(Object.fromEntries(after.map((g) => [g.colour, g.union]))).toEqual({
      coral: ["q4", "q5", "q8", "q9"],
      amber: ["q2", "q9"],
      mint: ["q3", "q5", "q6", "q8", "q9"],
      sky: ["q1", "q2", "q3", "q5", "q6", "q8", "q9"],
      violet: ["q1", "q2", "q4", "q8", "q9"],
    });
    // Sam's own board, the standings and the stage's count read the same lists.
    expect(liveGroupPlan(moved, s).discussion.problems.map((p) => p.id)).toEqual(after.find((g) => g.colour === "sky")!.union);
    expect(standingsAt(moved, s, at(30_000)).map((g) => g.union)).toEqual(after.map((g) => g.union));
    expect(sittingOut(moved, s)).toEqual([]);
    // The teacher's group grid (ticket 319) shows a moved question as a grey band across every group.
    const grid = gridOf(after, ASSIGNMENT.problems, movedInSetOrder(moved, ASSIGNMENT.problems));
    expect(grid.length).toBe(5);
    for (const column of grid) expect(column.cells.filter((cell) => cell.tone === "class-review").map((cell) => cell.problem)).toEqual(["q7", "q10"]);
  });

  it("leaves a group with nothing to review sitting out", () => {
    const { c, s } = correcting();
    // Amber's four questions, less two: the table still has Q9; less all four, it sits out.
    const some = moveOn(c, ["q2", "q7"]);
    expect(groupsAt(some, s, at(30_000)).map((g) => g.colour)).toContain("amber");
    const all = moveOn(c, ["q2", "q7", "q9", "q10"]);
    expect(groupsAt(all, s, at(30_000)).map((g) => g.colour)).not.toContain("amber");
    expect(sittingOut(all, s).map((g) => g.colour)).toEqual(["amber"]);
    // Its members count as done with group review (ticket 332).
    expect(stageDone("group", all, s, at(30_000), bundle(all))).toBe(3);
  });

  it("knows when no group would have anything left, so the card offers to skip group review", () => {
    const { c, s } = correcting();
    expect(everyGroupEmpty(c, s, ["q7", "q10"])).toBe(false);
    const every = groupsAt(c, s, at(30_000)).flatMap((g) => g.union);
    expect(everyGroupEmpty(c, s, [...new Set(every)])).toBe(true);
    const skipped = moveOn(c, [...new Set(every)], ["individual", "whole-class"]);
    expect(pathwayOf(skipped)).toEqual(["individual", "whole-class"]);
    expect(groupsAt(skipped, s, at(30_000))).toEqual([]);
    expect(classStages(skipped, s, at(30_000), bundle(skipped)).map((st) => st.id)).toEqual(["working", "individual", "whole-class"]);
  });

  it("gives class review the moved questions on the report: no group worked them", () => {
    const record = CLASSMATES.find((m) => m.id === "isla")!;
    const problems: Problem[] = ASSIGNMENT.problems;
    const classReview = [{ problem: "q10", examples: [["\\tfrac{1}{3}(x + 2)(x + 4)"]] }];
    const worked = recordReviews(record, problems, REVIEW_ORDER, classReview);
    expect(worked["q10"].group).toBeDefined();
    const moved = recordReviews(record, problems, REVIEW_ORDER, classReview, ["q10"]);
    expect(moved["q10"].group).toBeUndefined();
    expect(moved["q10"].movedToClass).toBe(true);
    expect(outcomeOf("q10", moved["q10"], DEMO_PATHWAY)).toBe("covered");
  });
});

describe("the pathway strip at the gate without individual review (ticket 337)", () => {
  it("keeps the working current with the gate's count and a force submit that opens the gate", () => {
    const { c, s } = correcting(["group", "whole-class"]);
    const set = bundle(c);
    const gate = { ...s, stage: "class-wait" as const };
    const stages = classStages(c, gate, at(20_000), set);
    expect(stages.map((st) => `${st.id}:${st.state}`)).toEqual(["working:current", "group:ahead", "whole-class:ahead"]);
    // The count is the gate's, as "done reviewing" is on the pathway with individual review: it climbs as the class arrives.
    expect(stageDone("working", c, gate, now, set)).toBe(1);
    expect(stageDone("working", c, gate, at(20_000), set)!).toBeGreaterThan(1);
    expect(stageDone("working", c, gate, at(20_000), set)!).toBeLessThan(19);
    expect(liveLocks(c, set, gate, at(20_000)).group).toBe(true);
  });
});

describe("naming a list of moved questions", () => {
  it("reads one, two or three as a sentence would", () => {
    expect(listWords(["Q7"])).toBe("Q7");
    expect(listWords(["Q7", "Q10"])).toBe("Q7 and Q10");
    expect(listWords(["Q7", "Q10", "Q3"])).toBe("Q7, Q10 and Q3");
    expect(listWords([])).toBe("");
  });
});

describe("the move's confirm sentence (ticket 351)", () => {
  it("states the move plainly, forward-looking, when other groups still have work", () => {
    expect(moveConfirmSentence(["Q7", "Q10"], false, false)).toBe("Move Q7 and Q10 out of group review and into class review?");
  });

  it("names adding class review to the pathway in the same sentence, not as a separate note", () => {
    expect(moveConfirmSentence(["Q7"], false, true)).toBe("Move Q7 out of group review and into class review, and add class review to the pathway?");
  });

  it("never says a question was already added: the skip case stays a live question, not a stated fact", () => {
    const sentence = moveConfirmSentence(["Q7", "Q10"], true, false);
    expect(sentence).toBe("Skip group review — nothing would be left there. Q7 and Q10 got the fewest right — add any others before confirming?");
    expect(sentence).not.toMatch(/added|have been moved/i);
  });

  it("folds the class-review addition into the skip sentence too", () => {
    expect(moveConfirmSentence(["Q7", "Q10"], true, true)).toBe(
      "Skip group review — nothing would be left there; this adds class review to the pathway. Q7 and Q10 got the fewest right — add any others before confirming?",
    );
  });
});
