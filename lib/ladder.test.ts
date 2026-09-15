import { describe, expect, it } from "vitest";
import questionWorking from "../scripts/question-working.json";
import { PROBLEM_MAP, PROBLEMS } from "@/data/assignment";
import { PAIR_MAP, QUESTION_PAIRS } from "@/data/pairs";
import { QUESTION_HELP } from "@/data/questionHelp";
import type { LeafId } from "@/data/taxonomy";
import { chatOn, findPractice, helpChatSystem, parseHelpChatRequest } from "./helpChat";
import { problemLeaves } from "./hierarchy";
import { asPractice, completionScript, completionState, completionWorking, LADDER_SLIPS, ladderFor, MARK_RULES, markLine, questionPractice, TRIES_BEFORE_FILL } from "./ladder";
import { blankSteps } from "./pairs";
import { nextLine, type RevealedLine } from "./recognition";
import { hydrateSession, INITIAL_RUN, ladderCompletion, ladderEntry, runFirst, sessionAt, sessionReducer, type StudentSession } from "./session";
import { sessionScore } from "./setScore";
import { practiceFor } from "./warmup";

const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const MONIC: LeafId = "algebra.expand-factor.monic";
const Q2SS = PAIR_MAP.q2.completion;
const lines = (...texs: string[]): RevealedLine[] => texs.map((tex, i) => ({ tex, strokeCount: (i + 1) * 3 }));

describe("which questions help runs on", () => {
  it("every set question has Q*, Q** and at least one blank for every skill the picker offers; Q back on itself has its own help", () => {
    for (const q of PROBLEMS) {
      for (const leaf of problemLeaves(q).filter((l) => practiceFor(l) !== null)) {
        const l = ladderFor(q.id, leaf)!;
        expect(l.worked.id, q.id).toBe(`${q.id}-star`);
        expect(l.completion.id, q.id).toBe(`${q.id}-star-star`);
        expect(l.blanks, `${q.id} ${leaf}`).toEqual(blankSteps(l.completion.solution, leaf));
        expect(l.blanks.length, `${q.id} ${leaf}`).toBeGreaterThan(0);
      }
      const p = questionPractice(q, MONIC)!;
      expect(p.steps, q.id).toBe(q.solution);
      expect(p.hints, q.id).toBe(QUESTION_HELP[q.id].hints);
    }
    expect(ladderFor("q-unpaired", MONIC)).toBeNull();
  });

  it("the hint-box sweep's copy of each question's working is the set's own, so the sweep writes every point back on the question", () => {
    expect(questionWorking).toEqual(Object.fromEntries(PROBLEMS.map((q) => [q.id, q.solution.map((s) => s.tex)])));
  });

  it("Q back on itself has a hint for every point of its working, one each, in order", () => {
    for (const q of PROBLEMS) expect(QUESTION_HELP[q.id].hints.map((h) => h.at), q.id).toEqual(q.solution.map((_, k) => [k]));
    expect(Object.keys(QUESTION_HELP).sort()).toEqual(PROBLEMS.map((p) => p.id).sort());
  });

  it("a question reads as the pad's problem with the named skill", () => {
    const p = asPractice(Q2SS, NONMONIC);
    expect(p).toMatchObject({ id: "q2-star-star", leaf: NONMONIC, stem: Q2SS.stem, tex: Q2SS.tex, steps: Q2SS.solution, hints: Q2SS.hints, approaches: Q2SS.approaches });
    expect(asPractice(PAIR_MAP.q2.worked, NONMONIC).hints).toEqual([]);
  });
});

describe("a line written into a blank, marked", () => {
  const split = Q2SS.solution[4];
  it("goes through the line check: right, wrong with its misconception, wrong with none, unreadable", () => {
    expect(markLine(split, "(x + 5)(2x - 3) = 0")).toEqual({ kind: "right" });
    expect(markLine(split, "(2x + 3)(x - 5) = 0")).toEqual({ kind: "wrong", misconception: "pair-signs-swapped" });
    expect(markLine(Q2SS.solution[3], "2x(x+5) + 3(x+5) = 0")).toEqual({ kind: "wrong" });
    expect(markLine(split, "(2x - 3")).toEqual({ kind: "unreadable" });
  });

  it("right fills the blank; wrong counts towards filling it in; unreadable does neither", () => {
    expect(MARK_RULES).toEqual({ right: { fills: true, tries: false }, wrong: { fills: false, tries: true }, unreadable: { fills: false, tries: false } });
    expect(TRIES_BEFORE_FILL).toBe(2);
  });
});

describe("Q** line by line", () => {
  const blanks = blankSteps(Q2SS.solution, NONMONIC);
  const S = Q2SS.solution.map((s) => s.tex);

  it("non-monic on Q2** leaves the split, the pair, the grouping and the factors blank", () => {
    expect(blanks).toEqual([1, 2, 3, 4]);
  });

  it("before anything is written: the given line and the first blank, nothing after it", () => {
    const st = completionState(Q2SS.solution, blanks, []);
    expect(st).toMatchObject({ current: 1, shown: 2, done: false });
    expect(completionWorking(Q2SS.solution, st)).toEqual([S[0]]);
  });

  it("a right line moves on and shows the next blank; a line after a blank shows only once that blank is done", () => {
    const st = completionState(Q2SS.solution, blanks, lines(S[1], S[2], S[3]));
    expect(st.blanks.map((b) => b.status)).toEqual(["right", "right", "right", "open"]);
    expect(st).toMatchObject({ current: 4, shown: 5, done: false });
    // The null factor law line would show the factors: it is not on screen until the factors are.
    expect(st.shown).toBeLessThanOrEqual(5);
    expect(completionWorking(Q2SS.solution, st)).toEqual(S.slice(0, 4));
  });

  it("a wrong line stays in place, marked, and the blank stays open; a right line after it finishes the working", () => {
    const wrong = completionState(Q2SS.solution, blanks, lines(S[1], S[2], S[3], "(2x + 3)(x - 5) = 0"));
    expect(wrong.blanks[3]).toMatchObject({ status: "open", written: [{ tex: "(2x + 3)(x - 5) = 0", mark: { kind: "wrong", misconception: "pair-signs-swapped" }, index: 3 }] });
    expect(wrong.current).toBe(4);
    const fixed = completionState(Q2SS.solution, blanks, lines(S[1], S[2], S[3], "(2x + 3)(x - 5) = 0", S[4]));
    expect(fixed.blanks[3].status).toBe("right");
    expect(fixed).toMatchObject({ current: null, shown: 6, done: true });
  });

  it("two wrong lines on one blank fill it in and the student carries on; an unreadable line does not count", () => {
    const st = completionState(Q2SS.solution, blanks, lines("(2x", "ac = -30,\\quad 3 + (-10) = 7", "ac = 30,\\quad 10 + 3 = 13"));
    expect(st.blanks[0].written.map((w) => w.mark.kind)).toEqual(["unreadable", "wrong", "wrong"]);
    expect(st.blanks[0].status).toBe("filled");
    expect(st.current).toBe(2);
    expect(completionWorking(Q2SS.solution, st)).toEqual(S.slice(0, 2));
  });

  it("lines read after the last blank are not part of it; undo takes a line's mark with it", () => {
    const all = lines(S[1], S[2], S[3], S[4], "x = 1");
    expect(completionState(Q2SS.solution, blanks, all).blanks.flatMap((b) => b.written)).toHaveLength(4);
    expect(completionState(Q2SS.solution, blanks, all.slice(0, 3)).current).toBe(4);
  });

  it("every Q**, for every skill the picker offers, completes from its own blank lines in order", () => {
    for (const pair of QUESTION_PAIRS) {
      const q = PROBLEM_MAP[pair.problemId];
      for (const leaf of problemLeaves(q).filter((l) => practiceFor(l) !== null)) {
        const b = blankSteps(pair.completion.solution, leaf);
        const st = completionState(pair.completion.solution, b, lines(...b.map((i) => pair.completion.solution[i].tex)));
        expect(st.done, `${pair.completion.id} ${leaf}`).toBe(true);
        expect(st.blanks.every((x) => x.status === "right"), `${pair.completion.id} ${leaf}`).toBe(true);
      }
    }
  });

  it("the demo script writes Sam's slip on the factors, marked with its misconception, then the right line", () => {
    const script = completionScript(Q2SS, blanks);
    expect(script).toEqual([S[1], S[2], S[3], "(2x + 3)(x - 5) = 0", S[4]]);
    let read: RevealedLine[] = [];
    for (let n = 1; n <= script.length; n++) read = [...read, nextLine(script, read, n * 4)!];
    const st = completionState(Q2SS.solution, blanks, read);
    expect(st.blanks[3].written.map((w) => w.mark)).toEqual([{ kind: "wrong", misconception: "pair-signs-swapped" }, { kind: "right" }]);
    expect(st.done).toBe(true);
    // A slip for a step that is not blank for the skill named does not show.
    expect(completionScript(Q2SS, [5])).toEqual([S[5]]);
    // Every authored slip is wrong against its own step.
    for (const [id, slips] of Object.entries(LADDER_SLIPS)) {
      const q = QUESTION_PAIRS.find((p) => p.completion.id === id)!.completion;
      for (const [step, texs] of Object.entries(slips)) for (const t of texs) expect(markLine(q.solution[Number(step)], t).kind, t).toBe("wrong");
    }
  });
});

describe("the session: Q*, Q**, back on Q", () => {
  const T = 1_700_000_000_000;
  const onQ2 = (): StudentSession => sessionReducer(sessionAt("working"), { type: "problem/goto", index: 1 });
  const seeAll = (s: StudentSession) => {
    for (let i = 0; i < PAIR_MAP.q2.worked.solution.length; i++) s = sessionReducer(s, { type: "run/example-step", run: "overlay" });
    return s;
  };
  const write = (s: StudentSession, ...texs: string[]) => {
    for (const tex of texs) s = sessionReducer(s, { type: "run/reveal", run: "overlay", problem: "q2-star-star", line: { tex, strokeCount: (s.overlayRun.lines["q2-star-star"]?.length ?? 0) * 3 + 3 } });
    return s;
  };

  it("I need help opens Q*'s worked example at its first step and records when; Q** opens only once every step has been seen", () => {
    let s = sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T });
    expect(s.overlay).toBe(NONMONIC);
    expect(s.ladder).toEqual({ problem: "q2", step: "worked" });
    expect(s.overlayRun).toEqual({ ...INITIAL_RUN, example: true });
    expect(runFirst(s, "overlay")?.id).toBe("q2-star");
    expect(s.practices).toEqual([{ leaf: NONMONIC, reason: "help", accepted: true, problem: "q2", steps: { worked: T } }]);
    expect(sessionReducer(s, { type: "ladder/next", at: T + 1 })).toBe(s);
    s = seeAll(s);
    s = sessionReducer(s, { type: "ladder/next", at: T + 30_000 });
    expect(s.ladder).toEqual({ problem: "q2", step: "completion" });
    expect(runFirst(s, "overlay")?.id).toBe("q2-star-star");
    expect(s.practices[0].steps).toEqual({ worked: T, completion: T + 30_000 });
  });

  it("Q**'s hint is the one for the blank being written, and nothing written in Q* or Q** reaches the set", () => {
    let s = sessionReducer(seeAll(sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T })), { type: "ladder/next", at: T });
    s = sessionReducer(s, { type: "run/hint", run: "overlay" });
    expect(s.overlayRun.hinted["q2-star-star"]).toEqual([1]);
    s = write(s, Q2SS.solution[1].tex, Q2SS.solution[2].tex, "(2x + 3)(x - 5) = 0");
    expect(ladderCompletion(s)!.state.current).toBe(3);
    s = sessionReducer(s, { type: "run/hint", run: "overlay" });
    // The working on screen is past the first hint's point (a wrong line counts for nothing), so the next ask gives the hint for the grouping.
    expect(s.overlayRun.hinted["q2-star-star"]).toEqual([1, 3]);
    expect(s.lines).toEqual(onQ2().lines);
    expect(s.counted).toEqual(onQ2().counted);
    expect(s.escalation.counts).toEqual(sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2" }).escalation.counts);
    expect(sessionScore(s, PROBLEMS)).toBe(sessionScore(onQ2(), PROBLEMS));
  });

  it("Back to Qn from any step returns to the question with its lines untouched and records the third step once", () => {
    const withLines = sessionReducer(onQ2(), { type: "line/reveal", problem: "q2", line: { tex: "2x^2 + 7x - 4 = 0", strokeCount: 4 } });
    const opened = sessionReducer(withLines, { type: "help/request", leaf: NONMONIC, problem: "q2", at: T });
    const fromStar = sessionReducer(opened, { type: "overlay/done", at: T + 5 });
    expect(fromStar).toMatchObject({ overlay: null, ladder: null, problemIndex: 1 });
    expect(fromStar.lines).toEqual(withLines.lines);
    expect(fromStar.practices[0].steps).toEqual({ worked: T, back: T + 5 });
    const fromStarStar = sessionReducer(sessionReducer(seeAll(opened), { type: "ladder/next", at: T + 7 }), { type: "overlay/done", at: T + 9 });
    expect(fromStarStar.lines).toEqual(withLines.lines);
    expect(fromStarStar.practices[0].steps).toEqual({ worked: T, completion: T + 7, back: T + 9 });
    // The example opened again from back on the question: Q*'s worked example, and closing it records nothing.
    const again = sessionReducer(fromStarStar, { type: "ladder/again", problem: "q2" });
    expect(again).toMatchObject({ overlay: NONMONIC, ladder: { problem: "q2", step: "again" } });
    expect(runFirst(again, "overlay")?.id).toBe("q2-star");
    const closed = sessionReducer(again, { type: "overlay/done", at: T + 99 });
    expect(closed.practices).toEqual(fromStarStar.practices);
    expect(closed.overlayRun).toEqual(fromStarStar.overlayRun);
    // Not on a question with no practice taken.
    expect(sessionReducer(fromStarStar, { type: "ladder/again", problem: "q3" })).toBe(fromStarStar);
    expect(ladderEntry(fromStarStar, "q3")).toBeUndefined();
  });

  it("a reload lands on the same step: the stored session reads back whole", () => {
    let s = sessionReducer(seeAll(sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T })), { type: "ladder/next", at: T });
    s = write(s, Q2SS.solution[1].tex, "(2x");
    const back = hydrateSession(JSON.parse(JSON.stringify(s)));
    expect(back).toEqual(s);
    expect(ladderCompletion(back)!.state).toEqual(ladderCompletion(s)!.state);
    // A session saved before ticket 312 has no ladder and no question run.
    const old = JSON.parse(JSON.stringify(s));
    delete old.ladder;
    delete old.questionRun;
    expect(hydrateSession(old)).toMatchObject({ ladder: null, questionRun: INITIAL_RUN });
  });

  it("back on the question: its own hint picked by the set's lines, and its chat, kept apart from the practice", () => {
    let s = sessionReducer(onQ2(), { type: "question/hint", problem: "q2" });
    expect(s.questionRun).toEqual(INITIAL_RUN);
    s = sessionReducer(sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T }), { type: "overlay/done", at: T });
    s = sessionReducer(s, { type: "line/reveal", problem: "q2", line: { tex: "2x^2 + 7x - 4 = 0", strokeCount: 4 } });
    s = sessionReducer(s, { type: "question/hint", problem: "q2" });
    expect(s.questionRun.hinted).toEqual({ q2: [1] });
    s = sessionReducer(s, { type: "run/chat", run: "question", problem: "q2", message: { from: "student", text: "which pair?" } });
    expect(s.questionRun.chat).toEqual({ q2: [{ from: "student", text: "which pair?" }] });
    expect(s.overlayRun.chat).toEqual({});
  });

  it("the repeated-slip offer on Q2 is on the skill of the slip, and Yes opens the same three steps", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "(x + 2)(x + 3) = 0", strokeCount: 3 } });
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = sessionReducer(s, { type: "line/reveal", problem: "q2", line: { tex: "(2x + 4)(x - 1) = 0", strokeCount: 3 } });
    expect(s.prompt).toEqual({ leaf: NONMONIC, reason: "detected" });
    s = sessionReducer(s, { type: "prompt/accept", problem: "q2", at: T });
    expect(s).toMatchObject({ prompt: null, overlay: NONMONIC, ladder: { problem: "q2", step: "worked" } });
    expect(s.practices).toEqual([{ leaf: NONMONIC, reason: "detected", accepted: true, problem: "q2", steps: { worked: T } }]);
  });

  it("the teacher advances that close the practice close its step too", () => {
    const s = sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T });
    expect(sessionReducer(s, { type: "freeze" })).toMatchObject({ overlay: null, ladder: null });
    expect(sessionReducer(s, { type: "advance/apply", id: "a", kind: "force-submit", at: T })).toMatchObject({ overlay: null, ladder: null });
    expect(sessionReducer(s, { type: "advance/apply", id: "b", kind: "end-lesson", at: T })).toMatchObject({ overlay: null, ladder: null });
    expect(sessionReducer(s, { type: "advance/apply", id: "c", kind: "whole-class-start", at: T })).toMatchObject({ overlay: null, ladder: null });
  });
});

describe("the help chat on Q*, Q** and the question", () => {
  it("finds each with the named skill, and says what it is to the student", () => {
    expect(findPractice("q2-star")).toBeNull();
    expect(findPractice("q2-star", NONMONIC)).toMatchObject({ id: "q2-star", leaf: NONMONIC, tex: PAIR_MAP.q2.worked.tex });
    expect(findPractice("q2-star-star", NONMONIC)).toMatchObject({ id: "q2-star-star", hints: Q2SS.hints });
    expect(findPractice("q2", NONMONIC)).toMatchObject({ id: "q2", hints: QUESTION_HELP.q2.hints });
    expect(findPractice("w-monic")?.id).toBe("w-monic");
    expect([chatOn("w-monic"), chatOn("q2-star"), chatOn("q2-star-star"), chatOn("q2")]).toEqual(["practice", "worked", "completion", "question"]);
  });

  it("the brief keeps the tutor on the question on screen, never the set's; on the set's own question it never judges a line", () => {
    const worked = helpChatSystem(findPractice("q2-star", NONMONIC)!, [], [], 3, [], "worked");
    expect(worked).toContain("never the question from their set");
    expect(worked).toContain("2x^2 + 11x - 6 = 0");
    expect(helpChatSystem(findPractice("q2-star-star", NONMONIC)!, [], [], undefined, [], "completion")).toContain("writes the missing ones");
    expect(helpChatSystem(findPractice("q2", NONMONIC)!, [], [], undefined, [], "question")).toContain("never say whether a line of theirs is right");
    expect(helpChatSystem(findPractice("w-monic")!, [])).toContain("is doing one short practice problem on one skill");
  });

  it("the request carries the skill, and refuses one that is not a skill", () => {
    const base = { problem: "q2-star", lines: [], messages: [{ from: "student", text: "why 12?" }] };
    expect(parseHelpChatRequest({ ...base, leaf: NONMONIC })?.leaf).toBe(NONMONIC);
    expect(parseHelpChatRequest(base)?.leaf).toBeUndefined();
    expect(parseHelpChatRequest({ ...base, leaf: "not.a.leaf" })).toBeNull();
    expect(parseHelpChatRequest({ ...base, leaf: 3 })).toBeNull();
  });
});
