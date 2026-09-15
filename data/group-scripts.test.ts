import { describe, expect, it } from "vitest";
import { DEMO_STUDENT } from "./assignment";
import { CLASSMATE_MAP } from "./classmates";
import { SET6_REVIEW } from "./classmates-review";
import { DEMO_PENS, GROUP_SCRIPTS } from "./group-scripts";
import { evaluateLine } from "@/lib/evaluate";
import { explainableAt, groupPlan, recordReviewProblems, reviewProblemsOf } from "@/lib/group";
import { beginRun, boardHint, checkBoard, HINT_AFTER_WRONG, LEAVE_AFTER_WRONG, ownAttemptScript } from "@/lib/groupReview";
import { skipFixture } from "@/lib/demo";
import { liveAbsent } from "@/lib/absence";
import { sessionAt, sessionReducer } from "@/lib/session";

/**
 * The demo group's scripted board against the group rule (tickets 278, 332): the union is every question a present member
 * still has after individual review, each has a script and a pen, and each script's outcome is the rule's.
 */
const session = sessionAt("group");
const absent = liveAbsent(skipFixture("group review", 0).classroom);
const plan = groupPlan(session, absent, true);
const members = plan.members.map((m) => m.id);
const union = plan.discussion.problems.map((p) => p.id);

/** A member's questions for the union after individual review, and the lines they handed in on a problem. */
const problemsOf = (id: string) => (id === DEMO_STUDENT.id ? reviewProblemsOf(session, true) : recordReviewProblems(CLASSMATE_MAP[id], true));
const firstLines = (id: string, pid: string): string[] => (id === DEMO_STUDENT.id ? (session.lines[pid] ?? []).map((l) => l.tex) : (CLASSMATE_MAP[id].attempts[pid] ?? []));
const wrongLines = (pid: string, lines: string[]) => lines.filter((tex) => evaluateLine(pid, tex).verdict === "wrong");
const correct = (pid: string, lines: string[]) => checkBoard(pid, lines).correct;
/** A wrong line's mistake name and clue (a line the table does not know has neither). */
const slipOf = (pid: string, tex: string): { name?: string; clue?: string } => {
  const v = evaluateLine(pid, tex);
  return v.verdict === "wrong" ? v : {};
};

describe("the demo group's board (tickets 278, 332)", () => {
  it("is every question a present member still has after individual review: every one but Q4, which all four handed in right (ticket 281)", () => {
    expect(members).toEqual(["sam", "jordan", "zara", "liam"]);
    expect(union).toEqual(["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(members.every((m) => !problemsOf(m).includes("q4"))).toBe(true);
    // After corrections (ticket 332): Sam's rework fixed Q1–Q3 and Q10, Jordan's Q2, Zara's Q3; the Q7 rewrites and Zara's Q9 slipped again.
    expect(Object.fromEntries(members.map((m) => [m, problemsOf(m)]))).toEqual({ sam: ["q7", "q9"], jordan: ["q7", "q8", "q9", "q10"], zara: ["q7", "q9"], liam: ["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"] });
    // The board's tries are the authored scripts: each fits the rule for this table.
    expect(plan.scripts).toEqual(Object.fromEntries(union.map((p) => [p, GROUP_SCRIPTS[p].attempts])));
  });

  it("has a script and a pen for every problem on it, and nothing else; every line is in the evaluation table", () => {
    expect(Object.keys(GROUP_SCRIPTS)).toEqual(union);
    expect(Object.keys(DEMO_PENS)).toEqual(union);
    for (const pid of union) {
      expect(members, pid).toContain(DEMO_PENS[pid]);
      for (const lines of GROUP_SCRIPTS[pid].attempts) for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${pid} ${tex}`).not.toBe("unclear");
    }
  });

  it("solves a question a present member can explain (right first time or fixed in individual review) in the 1st or 2nd round, and its first wrong go is a slip a member really made", () => {
    const explained = union.filter((p) => explainableAt(members, session, true, p));
    expect(explained).toEqual(["q1", "q2", "q3", "q5", "q6", "q8", "q10"]);
    for (const pid of explained) {
      const attempts = GROUP_SCRIPTS[pid].attempts;
      expect(attempts.length, pid).toBeLessThanOrEqual(2);
      attempts.forEach((lines, i) => expect(correct(pid, lines), `${pid} attempt ${i}`).toBe(i === attempts.length - 1));
      if (attempts.length > 1) {
        const slip = slipOf(pid, wrongLines(pid, attempts[0])[0]).name;
        const made = members.flatMap((m) => wrongLines(pid, firstLines(m, pid)).map((tex) => slipOf(pid, tex).name));
        expect(made, pid).toContain(slip);
      }
    }
  });

  it("leaves a question nobody present can explain for now after three wrong checks, and closes it unsolved on its return, save at most one the rule's exception lets through there", () => {
    const nobody = union.filter((p) => members.every((m) => problemsOf(m).includes(p)));
    expect(nobody).toEqual(["q7", "q9"]);
    const excepted: string[] = [];
    for (const pid of nobody) {
      const attempts = GROUP_SCRIPTS[pid].attempts;
      if (attempts.some((lines) => correct(pid, lines))) {
        // The exception (the user, 2026-09-14; ticket 332): one member's first submission wrong on a single line, the hint
        // after the second wrong check naming exactly that line's slip, left for now at the third, and the return holds.
        excepted.push(pid);
        expect(attempts.map((lines) => correct(pid, lines)), pid).toEqual([false, false, false, true]);
        const single = members.filter((m) => wrongLines(pid, firstLines(m, pid)).length === 1);
        expect(single.length, pid).toBeGreaterThan(0);
        const clues = single.map((m) => slipOf(pid, wrongLines(pid, firstLines(m, pid))[0]).clue);
        const run = beginRun(members, union, 0);
        const hint = boardHint({ ...run, index: union.indexOf(pid), attempts: { [pid]: attempts.slice(0, HINT_AFTER_WRONG).map((lines) => ({ lines, correct: false })) } });
        expect(clues, pid).toContain(hint?.text);
      } else {
        expect(attempts, pid).toHaveLength(LEAVE_AFTER_WRONG + 1);
      }
    }
    expect(excepted).toEqual(["q9"]);
    // The one the records declare (`SET6_REVIEW.exception`, ticket 281): at most one on the set.
    expect(SET6_REVIEW.exception).toEqual({ colour: "sky", problem: "q9", member: "zara" });
  });

  it("Q9's exception is Zara's slip: the axis given as the height, twice, the sign lost starting again, then on the return the height substituted (ticket 332)", () => {
    const [first, again, third, holds] = GROUP_SCRIPTS.q9.attempts;
    expect(first).toEqual(CLASSMATE_MAP.zara.attempts.q9);
    expect(wrongLines("q9", again)).toEqual(["h = 6"]);
    expect(wrongLines("q9", third)).toEqual(["-x(x + 6) = 0"]);
    expect(holds.at(-1)).toBe("h = -9 + 18 = 9");
    // Nobody can explain it: Zara's second submission gave the axis as the height again, and Sam's scripted rework left it unfinished.
    expect(CLASSMATE_MAP.zara.review?.q9?.second?.at(-1)).toBe("h = 6");
    expect(session.rework.q9).toBeUndefined();
  });

  it("if the presenter finishes Q9 in individual review, Sam can explain it and the board solves it in two tries instead: Zara's slip, then the working (ticket 332)", () => {
    let fixed: typeof session = { ...session, stage: "feedback" };
    fixed = sessionReducer(fixed, { type: "rework/reveal", problem: "q9", line: { tex: "h = -9 + 18 = 9", strokeCount: 5 } });
    const board = groupPlan(fixed, absent, true);
    expect(board.discussion.problems.map((p) => p.id)).toEqual(union);
    expect(board.scripts.q9.map((lines) => correct("q9", lines))).toEqual([false, true]);
    expect(board.scripts.q9[0]).toEqual(CLASSMATE_MAP.zara.attempts.q9);
    // Everything else stays as authored.
    for (const pid of union.filter((p) => p !== "q9")) expect(board.scripts[pid], pid).toEqual(GROUP_SCRIPTS[pid].attempts);
  });

  it("the problems only a not-attempting member brought hold first time, each written by someone the demo gives the pen", () => {
    for (const pid of ["q6", "q8"]) {
      expect(GROUP_SCRIPTS[pid].attempts, pid).toHaveLength(1);
      expect(correct(pid, GROUP_SCRIPTS[pid].attempts[0]), pid).toBe(true);
      expect(members.filter((m) => problemsOf(m).includes(pid) && wrongLines(pid, firstLines(m, pid)).length > 0), pid).toEqual([]);
    }
    expect({ q6: DEMO_PENS.q6, q8: DEMO_PENS.q8 }).toEqual({ q6: "zara", q8: "jordan" });
  });

  it("Q5 shows Liam's own slip first, his pen, then holds (ticket 281: he started it and read the roots with their signs flipped)", () => {
    expect(GROUP_SCRIPTS.q5.attempts[0]).toEqual(CLASSMATE_MAP.liam.attempts.q5);
    expect(GROUP_SCRIPTS.q5.attempts.map((lines) => correct("q5", lines))).toEqual([false, true]);
    expect(DEMO_PENS.q5).toBe("liam");
    expect(GROUP_SCRIPTS.q4).toBeUndefined();
    expect(DEMO_PENS.q4).toBeUndefined();
  });

  it("Sam's own pen turns read a recognition script per try: Q1 once, Q7's three and its return", () => {
    const own = union.filter((p) => DEMO_PENS[p] === DEMO_STUDENT.id);
    expect(own).toEqual(["q1", "q7"]);
    for (const pid of own) GROUP_SCRIPTS[pid].attempts.forEach((lines, i) => expect(ownAttemptScript(pid, i), `${pid} ${i}`).toEqual(lines));
  });
});
