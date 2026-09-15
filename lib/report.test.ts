import { describe, expect, it } from "vitest";
import type { Confidence } from "@/data/types";
import { skipFixture, teacherSkip } from "./demo";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { assignmentBundle, assignmentStages } from "./assignments";
import { CLASSMATE_MAP, CLASSMATES } from "@/data/classmates";
import { columnsOf, holds, labelSentence, liveClassReview, notAttempted, notAttemptedNote, outcomeColumns, outcomeOf, problemOutcome, recordedClassReview, recordReviews, reportFacts, reportPathway, reviewStagesOver, sessionReviews, shownVersions, type Reviews } from "./report";
import { FINISHED_SETS, finishedSetById } from "./finishedSets";
import { classroomReducer, pathwayOf } from "./classroom";
import { boardExamples } from "./examples";
import { INITIAL_SESSION, sessionAt, sessionReducer } from "./session";

const labels = (cols: ReturnType<typeof outcomeColumns>) => Object.fromEntries(cols.map((c) => [c.id, c.problems.map((p) => p.label)]));

describe("problem outcomes", () => {
  const reworked = sessionAt("report");

  it("puts each problem in exactly one column, in set order", () => {
    const cols = outcomeColumns(reworked, ["individual", "group"], null);
    expect(cols.map((c) => c.id)).toEqual(["first", "individual", "group", "wrong"]);
    expect(cols.flatMap((c) => c.problems).length).toBe(10);
    expect(cols.map((c) => c.label)).toEqual(["Correct first try", "Correct after individual review", "Correct after group review", "Incorrect"]);
  });

  it("reads the demo's reworked run: four right first try, four right after individual review, Q7 still wrong and Q9 unfinished (ticket 282)", () => {
    const by = labels(outcomeColumns(reworked, ["individual"], null));
    expect(by.first).toEqual(["Q4", "Q5", "Q6", "Q8"]);
    expect(by.individual).toEqual(["Q1", "Q2", "Q3", "Q10"]);
    expect(by.wrong).toEqual(["Q7", "Q9"]);
  });

  it("counts a problem the group's rework checked as correct after group review, once group review is in the pathway; one the group closed unsolved stays incorrect", () => {
    const { session, classroom } = skipFixture("report", 1_000_000);
    // Q7: slipped again in the student's own rework, and the group never solved it (ticket 222).
    expect(session.rework.q7?.length).toBeGreaterThan(0);
    expect(classroom.group?.resolved).not.toContain("q7");
    expect(classroom.group?.unsolved).toEqual(["q7"]);
    const with_ = labels(outcomeColumns(session, ["individual", "group"], classroom.group));
    expect(with_.individual).toEqual(["Q1", "Q2", "Q3", "Q10"]);
    // Q9, left unfinished, is the group's once its rework checked (ticket 282).
    expect(with_.group).toEqual(["Q9"]);
    expect(with_.wrong).toEqual(["Q7"]);
    // Had the group's rework checked, Q7 would sit in the group column.
    const solved = { ...classroom.group!, resolved: [...classroom.group!.resolved, "q7"], unsolved: [] };
    const withSolved = labels(outcomeColumns(session, ["individual", "group"], solved));
    expect(withSolved.group).toEqual(["Q7", "Q9"]);
    expect(withSolved.wrong).toEqual([]);
    const without = labels(outcomeColumns(session, ["individual"], classroom.group));
    expect(without.group).toBeUndefined();
    expect(without.wrong).toEqual(["Q7", "Q9"]);
    const noRun = labels(outcomeColumns(session, ["individual", "group"], null));
    expect(noRun.group).toEqual([]);
    expect(noRun.wrong).toEqual(["Q7", "Q9"]);
  });

  it("shows only the columns the pathway allows", () => {
    expect(outcomeColumns(reworked, [], null).map((c) => c.id)).toEqual(["first", "wrong"]);
    expect(outcomeColumns(reworked, ["group"], null).map((c) => c.id)).toEqual(["first", "group", "wrong"]);
    expect(outcomeColumns(reworked, ["whole-class"], null).map((c) => c.id)).toEqual(["first", "covered", "wrong"]);
    expect(outcomeColumns(reworked, ["individual", "group", "whole-class"], null).map((c) => c.id)).toEqual(["first", "individual", "group", "covered", "wrong"]);
  });

  it("ignores a rework when individual review is not in the pathway, and a run when group review is not", () => {
    const { session, classroom } = skipFixture("report", 1_000_000);
    expect(problemOutcome(session, "q1", [], classroom.group)).toBe("wrong");
    expect(problemOutcome(session, "q1", ["individual"], classroom.group)).toBe("individual");
    expect(problemOutcome(session, "q1", ["group"], classroom.group)).toBe("group");
    expect(problemOutcome(session, "q1", ["whole-class"], classroom.group)).toBe("wrong");
    expect(problemOutcome(session, "q4", [], null)).toBe("first");
  });

  it("calls an unattempted problem incorrect", () => {
    expect(problemOutcome(INITIAL_SESSION, "q1", ["individual", "group"], null)).toBe("wrong");
    expect(labels(outcomeColumns(INITIAL_SESSION, [], null)).wrong.length).toBe(10);
  });

  it("puts every problem of a strong run in the first column", () => {
    const by = labels(outcomeColumns(sessionAt("report", "strong"), ["individual", "group"], null));
    expect(by.first.length).toBe(10);
    expect(by.wrong).toEqual([]);
  });
});

describe("versions on the teacher's report (ticket 243)", () => {
  const PATH = ["individual", "group"] as const;
  const { session, classroom } = skipFixture("report", 1_000_000);
  const reviews = sessionReviews(session, classroom.group);
  const kinds = (id: string, pathway: readonly ("individual" | "group")[] = PATH, r = reviews) => shownVersions(id, r[id], pathway).map((v) => v.kind);

  it("reads a live session: its lines, its rework, and the group's version once the run closed the problem", () => {
    expect(reviews.q1.first).toEqual(session.lines.q1.map((l) => l.tex));
    expect(reviews.q1.second).toEqual(session.rework.q1.map((l) => l.tex));
    // The group fixed Q1 too (a groupmate's mistake), but Sam had it right on his own rework: the group's version is not his story.
    expect(reviews.q1.group?.solved).toBe(true);
    // Q6 is on the board only because Liam never reached it (tickets 278, 281): the group's version is there, Sam's story is his first submission.
    expect(reviews.q6.group?.solved).toBe(true);
    expect(kinds("q6")).toEqual(["first"]);
    // Q4 left the board once Liam handed it in right (ticket 281): no group version.
    expect(reviews.q4.group).toBeUndefined();
    expect(reviews.q7.group?.solved).toBe(false);
    expect(reviews.q7.group?.lines.length).toBeGreaterThan(0);
    // The same columns the student's own report shows.
    expect(labels(columnsOf(reviews, PATH))).toEqual(labels(outcomeColumns(session, PATH, classroom.group)));
  });

  it("shows only what tells the problem's story", () => {
    expect(kinds("q4")).toEqual(["first"]);
    expect(kinds("q1")).toEqual(["first", "second"]);
    expect(kinds("q7")).toEqual(["first", "second", "group-last"]);
    expect(shownVersions("q7", reviews.q7, PATH).map((v) => v.label)).toEqual(["First submission", "Second submission", "Group's last try"]);
    // Right after the group's rework: all three; with no individual review on the pathway, first and the group's.
    const solved: Reviews = { ...reviews, q7: { ...reviews.q7, group: { lines: reviews.q7.group!.lines, solved: true } } };
    expect(outcomeOf("q7", solved.q7, PATH)).toBe("group");
    expect(kinds("q7", PATH, solved)).toEqual(["first", "second", "group"]);
    expect(kinds("q7", ["group"], solved)).toEqual(["first", "group"]);
    // Still wrong with no review stage at all: the first submission alone.
    expect(kinds("q7", [])).toEqual(["first"]);
  });

  it("reads a set record: the Class View's lines, and review only where the record has it", () => {
    // Mia without the review ticket 244 gave her record.
    const mia = { ...CLASSMATE_MAP.mia, review: undefined };
    const plain = recordReviews(mia);
    const wrong = mia.wrong[0];
    expect(plain[wrong].first).toEqual(mia.attempts[wrong]);
    expect(plain[wrong].second).toEqual([]);
    expect(columnsOf(plain, PATH).find((c) => c.id === "individual")!.problems).toEqual([]);
    expect(kinds(wrong, PATH, plain)).toEqual(["first"]);
    const fixed = recordReviews({ ...mia, review: { [wrong]: { second: PROBLEM_MAP[wrong].solution.map((s) => s.tex) } } });
    expect(outcomeOf(wrong, fixed[wrong], PATH)).toBe("individual");
    expect(kinds(wrong, PATH, fixed)).toEqual(["first", "second"]);
  });

  it("shows a live record's review only once the class has finished that stage (ticket 244): Incorrect until then, the columns never moving", () => {
    // Ethan fixes Q1 on his own rework; Isla's group closes Q10 unsolved; Oliver's group puts his Q1 right.
    const ethan = CLASSMATE_MAP.ethan;
    const oliver = CLASSMATE_MAP.oliver;
    const isla = CLASSMATE_MAP.isla;
    const cols = (r: typeof ethan, over: readonly ("individual" | "group" | "whole-class")[]) => labels(columnsOf(recordReviews(r, undefined, over), PATH));
    // While individual review runs: nothing past the first submission, every unfixed problem in Incorrect.
    expect(recordReviews(ethan, undefined, []).q1).toEqual({ first: ethan.attempts.q1, finished: true, second: [] });
    expect(cols(ethan, []).individual).toEqual([]);
    expect(cols(ethan, []).wrong).toContain("Q1");
    expect(cols(oliver, []).group).toEqual([]);
    // Individual review over: the second submission shows, the group's version not yet.
    expect(cols(ethan, ["individual"]).individual).toContain("Q1");
    expect(recordReviews(oliver, undefined, ["individual"]).q1.group).toBeUndefined();
    expect(cols(oliver, ["individual"]).wrong).toContain("Q1");
    // Group review over: the group's rework and last try, on the problems Oliver never reached too (ticket 281).
    expect(cols(oliver, ["individual", "group"]).group).toEqual(["Q1", "Q2", "Q8", "Q9", "Q10"]);
    expect(recordReviews(isla, undefined, ["individual", "group"]).q10.group?.solved).toBe(false);
    expect(cols(isla, ["individual", "group"]).wrong).toContain("Q10");
    // The same four columns at every stage, and the same ten tiles.
    for (const over of [[], ["individual"], ["individual", "group"]] as const) {
      const c = columnsOf(recordReviews(oliver, undefined, over), PATH);
      expect(c.map((x) => x.id)).toEqual(["first", "individual", "group", "wrong"]);
      expect(c.flatMap((x) => x.problems)).toHaveLength(10);
    }
    // A finished set (the default) shows everything.
    expect(recordReviews(oliver)).toEqual(recordReviews(oliver, undefined, ["individual", "group", "whole-class"]));
  });

  it("reads the review stages the live class has finished, skip by skip (ticket 244)", () => {
    const now = 5_000_000_000;
    const over = (t: Parameters<typeof skipFixture>[0], at = now) => {
      const { session, classroom } = skipFixture(t, now);
      return reviewStagesOver(assignmentStages(assignmentBundle(ASSIGNMENT.id, classroom)!, classroom, session, at));
    };
    expect(over("working")).toEqual([]);
    expect(over("indiv review")).toEqual([]);
    // Group review under way: individual review is behind the class, the groups are still working.
    expect(over("group review")).toEqual(["individual"]);
    expect(over("group review", now + 600_000)).toEqual(["individual"]);
    // Every group done (group review still the current stage until class review starts), then class review.
    expect(over("report")).toEqual(["individual", "group"]);
    expect(over("class review")).toEqual(["individual", "group"]);
    // A finished set: every stage over.
    expect(reviewStagesOver([{ id: "working", state: "over", done: null, total: 20 }, { id: "individual", state: "over", done: null, total: 20 }, { id: "group", state: "over", done: null, total: 20 }])).toEqual(["individual", "group"]);
    expect(reviewStagesOver([{ id: "working", state: "over", done: null, total: 20 }, { id: "individual", state: "over", done: null, total: 20 }, { id: "group", state: "current", done: 19, total: 20 }])).toEqual(["individual"]);
  });

  it("words a record's confidence label as the live report does", () => {
    expect(labelSentence("confident")).toBe("Confident before starting");
    expect(labelSentence("low")).toBe("Confidence low before starting");
    expect(labelSentence("low: fractions, discriminant")).toBe("Confidence low when fractions, discriminant comes up");
  });
});

describe("not attempted and covered in class review (ticket 282)", () => {
  const set = (n: number) => finishedSetById(`pset-${n}`)!;
  const recordOf = (n: number, id: string) => [set(n).sam, ...set(n).classmates].find((r) => r.id === id)!;
  // A finished set's report, as the teacher's report reads it: the recorded class review, its column where the pathway has one.
  const report = (n: number, id: string) => {
    const s = set(n);
    const classReview = recordedClassReview(s.classReview);
    const pathway = reportPathway(s.pathway, classReview);
    const reviews = recordReviews(recordOf(n, id), s.fixture.problems, undefined, classReview);
    const cols = columnsOf(reviews, pathway, s.fixture.problems);
    const pid = (label: string) => s.fixture.problems.find((p) => p.label === label)!.id;
    return { cols, by: labels(cols), notes: Object.fromEntries(cols.map((c) => [c.id, notAttemptedNote(c)])), kinds: (label: string) => shownVersions(pid(label), reviews[pid(label)], pathway), reviews, pid };
  };

  it("adds Covered in class review after group review and before Incorrect, only on a set whose pathway has class review", () => {
    const withClass = ["first", "individual", "group", "covered", "wrong"];
    const without = ["first", "individual", "group", "wrong"];
    for (let n = 1; n <= 5; n++) expect(report(n, "sam").cols.map((c) => c.id), `PS${n}`).toEqual(n === 1 || n === 3 ? withClass : without);
    expect(report(1, "sam").cols.find((c) => c.id === "covered")!.label).toBe("Covered in class review");
    // Class review on the pathway but not happened yet: no column, so nothing moves until it has.
    expect(reportPathway(["individual", "group", "whole-class"], null)).toEqual(["individual", "group"]);
    expect(reportPathway(["individual", "group", "whole-class"], [])).toEqual(["individual", "group", "whole-class"]);
    expect(reportPathway(["individual", "group"], [])).toEqual(["individual", "group"]);
  });

  it("moves a problem the group left unsolved that class review covered out of Incorrect; Incorrect keeps what it never covered", () => {
    // PS1: violet left Q10 unsolved and class review covered it (Ruby, Finn); PS3: mint's Q10 (Grace, Harper).
    expect(report(1, "ruby").by).toMatchObject({ covered: ["Q10"], wrong: [] });
    expect(report(1, "finn").by).toMatchObject({ covered: ["Q10"], wrong: [] });
    expect(report(3, "harper").by).toMatchObject({ covered: ["Q10"], wrong: [] });
    // PS2, PS4, PS5 have no class review: mint's unsolved Q10 stays Incorrect.
    expect(report(2, "harper").by.wrong).toContain("Q10");
    expect(report(2, "harper").by.covered).toBeUndefined();
    // A problem class review covered but the student's group never took on unsolved stays where it was.
    const q10 = report(1, "ruby").reviews[report(1, "ruby").pid("Q10")];
    expect(outcomeOf(report(1, "ruby").pid("Q10"), { ...q10, group: undefined }, ["individual", "group", "whole-class"])).toBe("wrong");
    expect(outcomeOf(report(1, "ruby").pid("Q10"), { ...q10, classReview: undefined }, ["individual", "group", "whole-class"])).toBe("wrong");
    // With no group review on the pathway, a problem still wrong that class review showed is covered.
    expect(outcomeOf(report(1, "ruby").pid("Q10"), { ...q10, group: undefined }, ["individual", "whole-class"])).toBe("covered");
    // Every record on every set: covered only on PS1 and PS3, and only a group-unsolved problem class review covered.
    for (const s of FINISHED_SETS) {
      const n = Number(s.fixture.id.split("-")[1]);
      for (const r of [s.sam, ...s.classmates]) {
        const { cols, reviews } = report(n, r.id);
        for (const p of cols.find((c) => c.id === "covered")?.problems ?? []) {
          expect(reviews[p.id].group?.solved, `${s.fixture.id} ${r.id} ${p.label}`).toBe(false);
          expect(s.classReview?.some((c) => c.problem === p.id), `${s.fixture.id} ${r.id} ${p.label}`).toBe(true);
        }
        for (const p of cols.find((c) => c.id === "wrong")!.problems) expect(!!reviews[p.id].classReview && reviews[p.id].group?.solved === false, `${s.fixture.id} ${r.id} ${p.label}`).toBe(false);
      }
    }
  });

  it("puts a problem not attempted that the group solved under Correct after group review, its first pane reading not attempted", () => {
    const liam = report(1, "liam");
    expect(liam.by.group).toEqual(["Q6", "Q7", "Q8", "Q9", "Q10"]);
    expect(liam.kinds("Q6").map((v) => [v.kind, v.lines.length])).toEqual([["first", 0], ["group", liam.reviews[liam.pid("Q6")].group!.lines.length]]);
    expect(notAttempted(liam.reviews[liam.pid("Q6")])).toBe(true);
    expect(notAttempted(liam.reviews[liam.pid("Q1")])).toBe(false);
  });

  it("names the problems not attempted under whichever column holds them, Incorrect and Covered included", () => {
    expect(report(1, "liam").notes).toEqual({ first: null, individual: null, group: "Q6, Q7, Q8, Q9, Q10 not attempted", covered: null, wrong: null });
    expect(report(1, "tomas").notes.group).toBe("Q10 not attempted");
    expect(report(5, "grace").notes).toEqual({ first: null, individual: null, group: "Q8 not attempted", wrong: "Q9, Q10 not attempted" });
    expect(report(3, "grace").notes).toEqual({ first: null, individual: null, group: null, covered: "Q10 not attempted", wrong: null });
    expect(report(1, "ruby").notes).toEqual({ first: null, individual: null, group: null, covered: null, wrong: null });
  });

  it("the old not-solved-in-group-review note and tag are gone", async () => {
    const mod = await import("./report");
    expect("unsolvedOf" in mod || "unsolvedInGroup" in mod).toBe(false);
  });

  it("never calls an unfinished first submission right first time: it lands where its later versions put it", () => {
    const { session, classroom } = skipFixture("report", 1_000_000);
    const reviews = sessionReviews(session, classroom.group);
    // Sam stopped Q9 before the height: nothing wrong in it, and no answer.
    expect(reviews.q9.first.length).toBeGreaterThan(0);
    expect(holds("q9", reviews.q9.first)).toBe(true);
    expect(reviews.q9.finished).toBe(false);
    expect(outcomeOf("q9", reviews.q9, [])).toBe("wrong");
    expect(outcomeOf("q9", reviews.q9, ["individual", "group"])).toBe("group");
    expect(shownVersions("q9", reviews.q9, ["individual", "group"]).map((v) => v.kind)).toEqual(["first", "group"]);
    // Finished, the same lines would be right first time.
    expect(outcomeOf("q9", { ...reviews.q9, finished: true }, [])).toBe("first");
    // A record: working at or past `done` is not finished, however right its lines.
    const q1 = ASSIGNMENT.problems[0];
    const unfinished = { ...CLASSMATE_MAP.priya, done: 0, wrong: [], attempts: { [q1.id]: q1.solution.map((s) => s.tex) }, review: undefined };
    expect(recordReviews(unfinished).q1.finished).toBe(false);
    expect(outcomeOf("q1", recordReviews(unfinished).q1, [])).toBe("wrong");
    expect(outcomeOf("q1", recordReviews({ ...unfinished, done: 1 }).q1, [])).toBe("first");
  });

  it("shows each outcome's versions, the covered problem's ending in the Class review pane with the board's examples, anonymous", () => {
    const ruby = report(1, "ruby");
    const q10 = ruby.kinds("Q10");
    expect(q10.map((v) => v.kind)).toEqual(["first", "group-last", "class"]);
    expect(q10.map((v) => v.label)).toEqual(["First submission", "Group's last try", "Class review"]);
    // The pane's examples are the recorded picks' first submissions, in order (PS1 Q10: Finn, Oliver), and carry no names.
    const picks = set(1).classReview!.find((c) => c.problem === ruby.pid("Q10"))!.examples;
    expect(q10[2].examples).toEqual(picks.map((e) => e.lines));
    expect(picks.map((e) => e.student)).toEqual(["finn", "oliver"]);
    const text = JSON.stringify(q10);
    for (const r of [set(1).sam, ...set(1).classmates]) expect(text.includes(`"${r.id}"`) || text.includes(r.name), r.id).toBe(false);
    // With a second submission, it sits between the first and the group's last try.
    const withSecond = { ...ruby.reviews[ruby.pid("Q10")], second: ruby.reviews[ruby.pid("Q10")].first };
    expect(shownVersions(ruby.pid("Q10"), withSecond, ["individual", "group", "whole-class"]).map((v) => v.kind)).toEqual(["first", "second", "group-last", "class"]);
    // A not-attempted covered problem: its first pane empty, then the group's last try and class review.
    expect(report(3, "grace").kinds("Q10").map((v) => [v.kind, v.lines.length])).toEqual([["first", 0], ["group-last", report(3, "grace").reviews[report(3, "grace").pid("Q10")].group!.lines.length], ["class", 0]]);
    // Still wrong without class review: no class pane.
    expect(report(2, "harper").kinds("Q10").map((v) => v.kind)).not.toContain("class");
  });

  it("reads the live set's covered problems from the board once class review is over, examples as the board shows them", () => {
    const now = 5_000_000_000;
    // The teacher's jumps to group review done, then class review set up with one problem, Q7, which Sam's group left unsolved.
    let demo = { classroom: skipFixture("working", now).classroom, session: sessionAt("working") };
    for (let i = 0; i < 3; i++) demo = teacherSkip("done", demo.classroom, demo.session, now);
    const { session: sam, classroom: before } = demo;
    expect(before.wholeClass?.status).toBe("active");
    const oneProblem = classroomReducer(classroomReducer({ ...before, wholeClass: null }, { type: "wc/setup", problems: ["q7"], examples: { q7: before.wholeClass!.examples.q7 } }), { type: "wc/project", at: now });
    const pathway = pathwayOf(oneProblem);
    const cols = (c: typeof oneProblem) => {
      const cr = liveClassReview(c, sam);
      return labels(columnsOf(sessionReviews(sam, c.group, ASSIGNMENT.problems, cr), reportPathway(pathway, cr)));
    };
    // Projected, not over: no column yet, Q7 in Incorrect.
    expect(liveClassReview(oneProblem, sam)).toBeNull();
    expect(cols(oneProblem).covered).toBeUndefined();
    expect(cols(oneProblem).wrong).toContain("Q7");
    // Ended: the column holds exactly what the board showed.
    const ended = classroomReducer(oneProblem, { type: "wc/end" });
    const cr = liveClassReview(ended, sam)!;
    expect(cr.map((c) => c.problem)).toEqual(["q7"]);
    expect(cr[0].examples).toEqual(boardExamples(ended.wholeClass!.examples.q7, "q7", sam).map((e) => e.lines));
    expect(cols(ended).covered).toEqual(["Q7"]);
    expect(cols(ended).wrong).not.toContain("Q7");
    // Every other tile stays in its column.
    const { covered, wrong, ...rest } = cols(ended);
    const { wrong: wrongBefore, ...restBefore } = cols(oneProblem);
    expect(rest).toEqual(restBefore);
    expect([...covered, ...wrong].sort()).toEqual([...wrongBefore].sort());
    // A classmate's record reads the same board: every one still wrong on Q7 after a group that left it unsolved is covered, and no one else moves.
    const moved = CLASSMATES.filter((r) => {
      const plain = recordReviews(r, ASSIGNMENT.problems, ["individual", "group"]);
      const withBoard = recordReviews(r, ASSIGNMENT.problems, ["individual", "group"], cr);
      const after = outcomeOf("q7", withBoard.q7, reportPathway(pathway, cr));
      const was = outcomeOf("q7", plain.q7, ["individual", "group"]);
      if (after !== was) expect([was, after, plain.q7.group?.solved], r.id).toEqual(["wrong", "covered", false]);
      return after !== was;
    });
    expect(moved.length).toBeGreaterThan(0);
  });
});

describe("sending the report", () => {
  it("does nothing without a reflection", () => {
    const s = sessionAt("report");
    expect(sessionReducer(s, { type: "report/send" }).reportSent).toBe(false);
    expect(sessionReducer(sessionReducer(s, { type: "reflection/set", text: "   " }), { type: "report/send" }).reportSent).toBe(false);
    expect(sessionReducer(sessionReducer(s, { type: "reflection/set", text: "I rushed." }), { type: "report/send" }).reportSent).toBe(true);
  });
});

describe("report facts", () => {
  it("describe the scripted, reworked run as facts", () => {
    const f = reportFacts(sessionAt("report"));
    expect(f.slipped).toBe(5);
    expect(f.total).toBe(10);
    expect(f.reworked).toEqual(["Q1", "Q2", "Q3", "Q7", "Q10"]);
    expect(f.practices).toEqual(["Practice · non-monic factorising · Q2 · taken"]);
    expect(f.caution).toEqual([]);
    expect(f.confidence).toBe("Confidence low when monic factorising comes up");
    expect(f.stars).toEqual(["Q4"]);
  });
});

describe("the confidence label", () => {
  it("names one or two skills, and reads as low overall from three", async () => {
    const { confidenceLabel, confidenceSentence } = await import("./report");
    const one: Confidence = { level: "low-when", leaves: ["algebra.number.fractions"] };
    const two: Confidence = { level: "low-when", leaves: ["algebra.number.fractions", "algebra.equations.discriminant"] };
    const three: Confidence = { level: "low-when", leaves: ["algebra.number.fractions", "algebra.equations.discriminant", "graphing.quadratics.sketch"] };
    expect(confidenceLabel(one)).toBe("low: fractions");
    expect(confidenceLabel(two)).toBe("low: fractions, discriminant");
    expect(confidenceLabel(three)).toBe("low");
    expect(confidenceLabel({ level: "low" })).toBe("low");
    expect(confidenceLabel({ level: "confident" })).toBe("confident");
    expect(confidenceLabel(null)).toBe("—");
    expect(confidenceSentence(two)).toBe("Confidence low when fractions, discriminant comes up");
    expect(confidenceSentence(three)).toBe("Confidence low before starting");
    expect(confidenceSentence({ level: "low-when", leaves: [] })).toBe("Confidence low before starting");
  });
});

describe("confidenceForms", () => {
  it("gives a plain word one form", async () => {
    const { confidenceForms } = await import("./report");
    expect(confidenceForms("confident")).toEqual([{ words: ["confident"], hidden: 0 }]);
    expect(confidenceForms("low")).toEqual([{ words: ["low"], hidden: 0 }]);
    expect(confidenceForms("—")).toEqual([{ words: ["—"], hidden: 0 }]);
  });
  it("names one skill in full, then counts it", async () => {
    const { confidenceForms } = await import("./report");
    expect(confidenceForms("low: monic factorising")).toEqual([
      { words: ["low:", "monic", "factorising"], hidden: 0 },
      { words: ["low"], hidden: 1 },
    ]);
  });
  it("tries both skills, then each alone with the other counted, then none", async () => {
    const { confidenceForms } = await import("./report");
    expect(confidenceForms("low: fractions, non-monic factorising")).toEqual([
      { words: ["low:", "fractions,", "non-monic", "factorising"], hidden: 0 },
      { words: ["low:", "fractions"], hidden: 1 },
      { words: ["low:", "non-monic", "factorising"], hidden: 1 },
      { words: ["low"], hidden: 2 },
    ]);
  });
  it("reads the grid's own labels back", async () => {
    const { confidenceForms, confidenceLabel } = await import("./report");
    const label = confidenceLabel({ level: "low-when", leaves: ["algebra.equations.discriminant", "graphing.quadratics.features"] });
    expect(confidenceForms(label)[0].words).toEqual(["low:", "discriminant,", "graph", "features"]);
    expect(confidenceForms(label).at(-1)).toEqual({ words: ["low"], hidden: 2 });
  });
});
