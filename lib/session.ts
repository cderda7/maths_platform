import { BEFORE_HAND_IN_STAGES, type ChatMessage, type Confidence, type Pathway, type PracticeProblem, type Stage, type Stroke } from "@/data/types";
import { pickHint, stalledHint } from "./hint";
import { groupOf, groupWord, resolveLeaf, type LeafId } from "@/data/taxonomy";
import { PRACTICES } from "@/data/practice";
import { byEase, concernsAnswered, focusLeaves, practiceFor, warmupSequence, type WarmupMessage } from "./warmup";
import type { DebriefNote } from "./debrief";
import type { AdvanceKind } from "./classroom";
import { DEFAULT_PATHWAY, nextStage } from "./pathway";
import { guardFor, trippedProblems } from "./guard";
import { feedbackSummary } from "./feedback";
import { afterUndo, type RevealedLine } from "./recognition";
import { evaluateLine } from "./evaluate";
import { INITIAL_ESCALATION, practiceTaken, recordMistake, requestHelp, type EscalationState } from "./escalation";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { asPractice, completionState, completionWorking, ladderFor, nextPhase, phaseOf, questionPractice, warmupLadder, type LadderStep, type PhaseTimes, type WarmupPhase } from "./ladder";

/**
 * The student's session: everything the closed loop needs to remember about one run. Pure data
 * plus a reducer, so the flow can be unit-tested and, from ticket 05, mirrored to the teacher tab.
 */
export interface PracticePrompt {
  leaf: LeafId;
  /** detected: a second (or, after "Not now", later) mistake on a group. help: the student asked. */
  reason: "detected" | "help";
}

export interface PracticeEntry extends PracticePrompt {
  accepted: boolean;
  /** Problem the student was on. */
  problem: string;
  /**
   * Help from a question in three steps (ticket 312): when each step the student reached began (ms since epoch; 0 =
   * unknown), Q* worked, Q** finished, back on the question. How far they got is which are set: "Back to Qn" from Q* has
   * `worked` and `back`. Absent on a declined offer and on the older isolated practice (a question with no Q* and Q**).
   */
  steps?: Partial<Record<LadderStep, number>>;
}

/** Help from a question open over the working screen (ticket 312): Q* worked, Q** being finished, or Q*'s worked example opened again from back on the question. */
export interface LadderView {
  problem: string;
  step: "worked" | "completion" | "again";
}

/**
 * One run of practice on the pad: a problem, optionally its follow-up, with the help taken. Its
 * lines and ink are kept apart from the marked `lines`/`ink` so nothing written here is
 * evaluated, counted or shown to the teacher as work on the set. The warm-up and the mid-set
 * isolated practice are both runs.
 */
export interface PracticeRun {
  /** "first": the run's problem. "second": its follow-up, with the first's worked example in view. */
  problem: "first" | "second";
  /** True while the worked example for the current problem is playing in place of the pad. */
  example: boolean;
  /** Steps of the current problem's worked example revealed so far. */
  exampleShown: number;
  /** Hints shown so far per practice problem id, as indices into the problem's hints in the order shown; each ask picks by where the lines have got (`pickHint`). */
  hinted: Record<string, number[]>;
  /** Ids of the warm-up problems whose worked example has been seen in full. */
  exampled: string[];
  /** Recognised lines and the ink behind them, per practice problem id. */
  lines: Record<string, RevealedLine[]>;
  ink: Record<string, Stroke[]>;
  /** The help chat per practice problem id, oldest first; the tutor's fixed opener is not stored. */
  chat: Record<string, ChatMessage[]>;
}

export const INITIAL_RUN: PracticeRun = { problem: "first", example: false, exampleShown: 0, hinted: {}, exampled: [], lines: {}, ink: {}, chat: {} };

/**
 * What one student wrote on one class review question's Q** (ticket 344): the lines the pad read, in order, and the ink
 * behind them. Kept apart from the set's marked `lines`/`ink`, like a practice run's, so nothing written in class review
 * is evaluated into a version, counted or scored; the marks the student sees are derived (`turnFor` in `lib/classReview.ts`).
 */
export interface ClassReviewWork {
  lines: RevealedLine[];
  ink: Stroke[];
}

const NO_CLASS_WORK: ClassReviewWork = { lines: [], ink: [] };

/** What this student has written on class review question `problemId`; empty before they write. */
export const classWorkOf = (s: Pick<StudentSession, "classReview">, problemId: string): ClassReviewWork => s.classReview?.[problemId] ?? NO_CLASS_WORK;

/** Which run an action is about: the warm-up before the set, the practice over it (Q* and Q** since ticket 312), or the hints and chat on a set question once back on it after practice. */
export type RunKey = "warmup" | "overlay" | "question";

/** The warm-up's slice: a run plus the concerns chat's answers and the sequence position. */
export interface WarmupState extends PracticeRun {
  /** The student's answers in the concerns chat, oldest first, one per question. The questions are derived (`concernTranscript`). */
  messages: WarmupMessage[];
  /** Index into the warm-up sequence (one skill each, easiest first): the skill being warmed up. */
  step: number;
  /** Ids of the warm-up problems the student has been through, in the order they left them: by "Next skill" or a tap on another chip, finished or not. */
  done: string[];
  /**
   * Each skill's three steps (ticket 313), by its practice problem's id: when the worked example, the completion problem
   * and the problem alone began (ms since epoch; 0 = unknown). The step a skill is on is the furthest set (`phaseOf`), so a
   * chip back to a skill reopens the step it was left on.
   */
  phases: Record<string, PhaseTimes>;
}

export const INITIAL_WARMUP: WarmupState = { ...INITIAL_RUN, messages: [], step: 0, done: [], phases: {} };

export interface StudentSession {
  stage: Stage;
  /** null until the warm-up offer is answered ("confident" skips the offer: declined). */
  practice: "taken" | "declined" | null;
  confidence: Confidence | null;
  warmup: WarmupState;
  /** Index into the assignment's problems while working. */
  problemIndex: number;
  /** Recognised lines per problem id, in the order they appeared. */
  lines: Record<string, RevealedLine[]>;
  /** The handwriting behind `lines`, per problem: one entry per stroke, in pad coordinates. */
  ink: Record<string, Stroke[]>;
  escalation: EscalationState;
  /** Keys (`problem#lineIndex`) of wrong lines already counted, so undo + re-reveal can't double count. */
  counted: string[];
  /** The isolated-practice prompt currently showing, if any. */
  prompt: PracticePrompt | null;
  /** The isolated practice the student is in, if any. */
  overlay: LeafId | null;
  /** That practice on the pad: fresh each time a prompt is accepted. Q*'s worked example and Q**'s lines, hints and chat live here (ticket 312). */
  overlayRun: PracticeRun;
  /** While `overlay` is open on a question with Q* and Q** (ticket 312): which step shows. null with the older isolated practice. */
  ladder: LadderView | null;
  /** Hints and chat on a set question once the student is back on it after practice (ticket 312), per problem id. The lines it reads are the set's own `lines`. */
  questionRun: PracticeRun;
  /** Every prompt and how it was answered, oldest first. */
  practices: PracticeEntry[];
  /** Problems the student got right but wasn't sure about. */
  stars: string[];
  /** The final answer typed as a sentence under the working, per problem: only the worded problems ask for one (ticket 114). */
  answers: Record<string, string>;
  /**
   * The independent rework: a second version of the working per problem. `lines` is the
   * original and is never changed after hand-in, so both versions are preserved.
   */
  rework: Record<string, RevealedLine[]>;
  /** The handwriting behind `rework`, per problem. */
  reworkInk: Record<string, Stroke[]>;
  /** The problem open on the individual review screen: an index into the set's problems (ticket 318). */
  reworkIndex: number;
  /**
   * When the student last opened a problem in individual review, by choosing it or by writing on the one showing (ms since
   * epoch; 0 until they do): the teacher's Where students are reads it as their row entry (ticket 318).
   */
  reworkOpenedAt: number;
  /** The 2–3 sentence reflection on the final report. */
  reflection: string;
  /** True once the reflection has been sent to the teacher. */
  reportSent: boolean;
  /** When the report was sent (ms since epoch; 0 = unknown, read as long ago): the homework screen's sequence runs from it (ticket 256). */
  homeworkAt: number;
  /** When the student came to the check-in, the set's first screen of work (ms since epoch; 0 = unknown): a hand-in's "took" counts from it (ticket 327). */
  checkInAt: number;
  /** When the set was handed in and when the rework finished (ms since epoch; 0 = unknown). */
  handedInAt: number;
  reworkedAt: number;
  /** A one-line notice shown over the next screen until dismissed (post-rework sentence, teacher advances). */
  notice: string | null;
  /** Problems with no lines when the set was handed in for the student (the teacher's force submit, or the student's own "Confirm submit" over blanks). */
  notAttempted: string[];
  /**
   * The hand-in check (ticket 115): Hand in was pressed with problems still blank. "open" while
   * the pop-up offers a way back to them or "Confirm submit"; "returning" once the student went
   * back, when the footer offers Hand in on every problem with a jump to the next blank one.
   * null before, and again after the set is handed in.
   */
  handInCheck: "open" | "returning" | null;
  /**
   * What the student wrote on each class review question's Q** (ticket 344), by the set question the board was on. The
   * lines are marked as they are read (`turnFor` in `lib/classReview.ts`, which any live view of the class calls per
   * student) but never become a version, and nothing here reaches the report or the set score.
   */
  classReview: Record<string, ClassReviewWork>;
  /** The debrief after each group rework: whether the student has moved on (Next). */
  debrief: Record<string, DebriefNote>;
  /** Ids of teacher advances this session has already applied, so tabs and reloads converge. */
  appliedAdvances: string[];
}

export type SessionAction =
  /** Hand in. With a problem still blank it opens the hand-in check instead (`hand-in/confirm` goes through regardless). */
  | { type: "hand-in"; at?: number }
  /** "Confirm submit" on the hand-in check: hands in as it stands, the blank problems recorded as not attempted. */
  | { type: "hand-in/confirm"; at?: number }
  /** "Return to Qn" on the hand-in check: the pop-up closes and the pad shows that problem. */
  | { type: "hand-in/return"; index: number }
  /** A teacher advance whose grace has run out. Idempotent by id. */
  | { type: "advance/apply"; id: string; kind: AdvanceKind; at?: number }
  /** CONTINUE on the overview: on to the teacher's goal when there is one, else the confidence question. */
  | { type: "overview/start"; at?: number }
  /** CONTINUE on the goal screen: on to the confidence question. */
  | { type: "goal/continue"; at?: number }
  /** The confidence answer. "confident" opens Q1; either not-confident answer stays on the screen with the warm-up offered. */
  | { type: "confidence/set"; confidence: Confidence }
  /** The offer after a not-confident answer: "Warm up" opens the concerns chat, "Start the set" opens Q1. */
  | { type: "warmup/accept" }
  | { type: "warmup/decline" }
  | { type: "practice/finish" }
  /** The concerns chat: answer the current question. Ignored once every question has its answer. */
  | { type: "warmup/say"; text: string }
  /** After the closing bubble: on to the warm-up's first skill, its worked example. Only once every question has its answer. */
  | { type: "warmup/begin"; at?: number }
  /** The warm-up skill's next step (ticket 313): "Your turn" once its worked example has been seen in full, "On your own" once its completion problem is finished. `force` (ticket 353) skips that readiness check, for a student who confirmed moving on before the step was done. */
  | { type: "warmup/next"; at?: number; force?: boolean }
  /** Practice on the pad, for either run: the warm-up or the mid-set overlay. */
  | { type: "run/reveal"; run: RunKey; problem: string; line: RevealedLine }
  | { type: "run/stroke"; run: RunKey; problem: string; stroke: Stroke }
  | { type: "run/undo"; run: RunKey; problem: string; strokeCount?: number }
  | { type: "run/clear"; run: RunKey; problem: string }
  /** The help menu's "hint": the current problem's hint stays under the problem. */
  | { type: "run/hint"; run: RunKey }
  /** Back on a set question after practice (ticket 312): its next hint, picked by the set's own lines. */
  | { type: "question/hint"; problem: string }
  /** Q*'s worked example seen in full: on to Q** (ticket 312). */
  | { type: "ladder/next"; at?: number }
  /** "see the example again" back on a question: Q*'s worked example opens over it (ticket 312). */
  | { type: "ladder/again"; problem: string }
  /** The help menu's "worked example": plays in place of the pad. */
  | { type: "run/example"; run: RunKey }
  | { type: "run/example-step"; run: RunKey }
  /** After the first problem's worked example: the follow-up, with that example still in view. */
  | { type: "run/next"; run: RunKey }
  /** The help menu's "chat": one line of it, the student's or the tutor's, on the problem it was said on (a reply can land after a move to the follow-up). */
  | { type: "run/chat"; run: RunKey; problem: string; message: ChatMessage }
  /** The current skill is finished: on to the next not yet done (wrapping round), or the set once every skill is. */
  | { type: "warmup/skill-done"; at?: number }
  /** A tap on a skill chip: that step of the sequence, done or not. */
  | { type: "warmup/goto"; step: number; at?: number }
  | { type: "problem/goto"; index: number }
  | { type: "line/reveal"; problem: string; line: RevealedLine }
  | { type: "ink/stroke"; problem: string; stroke: Stroke }
  /** Pops the last stroke and withdraws any line revealed after the survivors. `strokeCount` forces the count instead. */
  | { type: "lines/undo"; problem: string; strokeCount?: number }
  | { type: "lines/clear"; problem: string }
  /** "I need help", the skill picked. `at` is when (ticket 312 records each step's start). */
  | { type: "help/request"; leaf: LeafId; problem: string; at?: number }
  | { type: "prompt/accept"; problem: string; at?: number }
  | { type: "prompt/decline"; problem: string }
  /** "Back to Qn" from any step of the practice. */
  | { type: "overlay/done"; at?: number }
  | { type: "star/toggle"; problem: string }
  /** The sentence typed in the answer field under the pad, as typed (kept through undo and clear). */
  | { type: "answer/set"; problem: string; text: string }
  | { type: "rework/goto"; index: number; at?: number }
  | { type: "rework/reveal"; problem: string; line: RevealedLine }
  | { type: "rework/stroke"; problem: string; stroke: Stroke; at?: number }
  | { type: "rework/undo"; problem: string; strokeCount?: number }
  | { type: "rework/clear"; problem: string }
  /** Refused while the guard is tripped on any problem, unless `force` (a teacher advance). */
  | { type: "rework/done"; at?: number; force?: boolean }
  | { type: "notice/dismiss" }
  /** Class review's students' turn (ticket 344): the student's own pad on Q**, by the set question the board is on. */
  | { type: "class-review/reveal"; problem: string; line: RevealedLine }
  | { type: "class-review/stroke"; problem: string; stroke: Stroke }
  | { type: "class-review/undo"; problem: string; strokeCount?: number }
  | { type: "class-review/clear"; problem: string }
  /** Whole-class review: everyone is frozen on the board's problem; released to the report when it ends. */
  | { type: "freeze" }
  | { type: "release" }
  /** The gate opened: everyone is in, or the teacher started group review. */
  /** Through the gate into group review; `nothingToReview`: the student's group has nothing left after corrections and sits out (ticket 332). */
  | { type: "group/start"; nothingToReview?: boolean }
  /** The debrief: moving on once the marks' hold is over. */
  | { type: "debrief/done"; problem: string }
  | { type: "group/done"; nothingToReview?: boolean }
  | { type: "reflection/set"; text: string }
  /** Send on the report: with a reflection written, the report goes and the homework screen opens (ticket 256). */
  | { type: "report/send"; at?: number }
  | { type: "peers/open" }
  | { type: "peers/close" }
  | { type: "goto"; stage: Stage; at?: number }
  | { type: "history/open" }
  | { type: "history/close" }
  | { type: "reset" };

/** True while the warm-up offer is open: a not-confident answer is in and the student has not yet chosen. */
export const warmupOffered = (s: StudentSession): boolean => s.stage === "confidence" && s.confidence !== null && s.confidence.level !== "confident" && s.practice === null;

/** The set's problems with nothing written on them yet, in set order: what the hand-in check asks about, and what a hand-in over them records as not attempted. */
export const blankProblems = (s: Pick<StudentSession, "lines">): string[] => ASSIGNMENT.problems.map((p) => p.id).filter((id) => (s.lines[id]?.length ?? 0) === 0);

export const INITIAL_SESSION: StudentSession = {
  stage: "overview",
  practice: null,
  confidence: null,
  warmup: INITIAL_WARMUP,
  problemIndex: 0,
  lines: {},
  ink: {},
  escalation: INITIAL_ESCALATION,
  counted: [],
  prompt: null,
  overlay: null,
  overlayRun: INITIAL_RUN,
  ladder: null,
  questionRun: INITIAL_RUN,
  practices: [],
  stars: [],
  answers: {},
  rework: {},
  reworkInk: {},
  reworkIndex: 0,
  reworkOpenedAt: 0,
  reflection: "",
  reportSent: false,
  homeworkAt: 0,
  checkInAt: 0,
  handedInAt: 0,
  reworkedAt: 0,
  notice: null,
  notAttempted: [],
  handInCheck: null,
  classReview: {},
  debrief: {},
  appliedAdvances: [],
};

/**
 * A stored snapshot brought up to the current shape: fields added since it was written fall back to
 * their initial value, one level down as well (a warm-up saved before the concerns chat had no
 * `messages` or `done`). Anything unreadable is ignored.
 */
export function hydrateSession(raw: unknown): StudentSession {
  const snap = (raw && typeof raw === "object" ? raw : {}) as Partial<StudentSession>;
  const warmup = snap.warmup && typeof snap.warmup === "object" ? snap.warmup : {};
  const overlayRun = snap.overlayRun && typeof snap.overlayRun === "object" ? snap.overlayRun : {};
  const questionRun = snap.questionRun && typeof snap.questionRun === "object" ? snap.questionRun : {};
  // A "low-when" answer saved as a category (before skills were listed) keeps its level with no skills named.
  const c = snap.confidence as ({ level: string; leaves?: unknown } | null | undefined);
  const stored: Confidence | null = c && c.level === "low-when" && !Array.isArray(c.leaves) ? { level: "low-when", leaves: [] } : ((c ?? null) as Confidence | null);
  // Leaf ids stored under an older taxonomy (the Unit Focus leaves before ticket 209) read as their new homes.
  const leaves = (ls: readonly string[]): LeafId[] => ls.flatMap((l) => resolveLeaf(l) ?? []);
  const confidence: Confidence | null = stored?.level === "low-when" ? { level: "low-when", leaves: leaves(stored.leaves) } : stored;
  const prompt = snap.prompt ? resolveLeaf(snap.prompt.leaf) : null;
  return {
    ...INITIAL_SESSION,
    ...snap,
    confidence,
    ...(snap.prompt ? { prompt: prompt ? { ...snap.prompt, leaf: prompt } : null } : {}),
    ...(snap.overlay ? { overlay: resolveLeaf(snap.overlay) } : {}),
    ...(Array.isArray(snap.practices) ? { practices: snap.practices.flatMap((p) => { const l = resolveLeaf(p.leaf); return l ? [{ ...p, leaf: l }] : []; }) } : {}),
    warmup: { ...INITIAL_WARMUP, ...warmup, hinted: hydrateHinted(warmup) },
    overlayRun: { ...INITIAL_RUN, ...overlayRun, hinted: hydrateHinted(overlayRun) },
    questionRun: { ...INITIAL_RUN, ...questionRun, hinted: hydrateHinted(questionRun) },
  };
}

/**
 * A run's `hinted` in its earlier shapes: a list of problem ids (one hint each, before ticket 78),
 * a count per id (hints in order, ticket 78), or the current indices per id (ticket 80).
 */
function hydrateHinted(run: { hinted?: unknown }): Record<string, number[]> {
  const h = run.hinted;
  if (Array.isArray(h)) return Object.fromEntries(h.filter((id): id is string => typeof id === "string").map((id) => [id, [0]]));
  if (!h || typeof h !== "object") return {};
  return Object.fromEntries(
    Object.entries(h as Record<string, unknown>).flatMap(([id, v]) => {
      if (typeof v === "number") return [[id, Array.from({ length: v }, (_, i) => i)]];
      if (Array.isArray(v)) return [[id, v.filter((i): i is number => typeof i === "number")]];
      return [];
    }),
  );
}

/** What the reducer needs from outside the session: the pathway in force. */
export interface SessionEnv {
  pathway: Pathway;
  /** The teacher's goal for the class; blank means the goal screen is skipped. */
  goal: string;
}
export const DEFAULT_ENV: SessionEnv = { pathway: DEFAULT_PATHWAY, goal: ASSIGNMENT.goal };

export function sessionReducer(s: StudentSession, a: SessionAction, env: SessionEnv = DEFAULT_ENV): StudentSession {
  switch (a.type) {
    case "hand-in":
      // A blank problem: ask first (the pop-up on the working screen) rather than hand in past it.
      if (blankProblems(s).length > 0) return { ...s, handInCheck: "open" };
      return { ...s, stage: nextStage(env.pathway, "handed-in"), handedInAt: a.at ?? s.handedInAt, handInCheck: null };
    case "hand-in/confirm":
      return { ...s, stage: nextStage(env.pathway, "handed-in"), handedInAt: a.at ?? s.handedInAt, notAttempted: blankProblems(s), handInCheck: null };
    case "hand-in/return":
      return { ...s, problemIndex: a.index, handInCheck: "returning" };
    case "advance/apply": {
      if (s.appliedAdvances.includes(a.id)) return s;
      const applied = { ...s, appliedAdvances: [...s.appliedAdvances, a.id] };
      if (a.kind === "whole-class-start") return applied.stage === "frozen" ? applied : { ...applied, stage: "frozen", prompt: null, overlay: null, ladder: null };
      if (a.kind === "force-review") {
        // The teacher ended individual review (ticket 145): a student waiting at the gate goes into group review (the gate opens
        // at the same deadline); one still correcting hands in as it stands and moves on, straight onto the board when the gate is next.
        if (applied.stage === "class-wait") return { ...applied, stage: "group" };
        if (applied.stage !== "feedback") return applied;
        const next = nextStage(env.pathway, "reworked");
        return { ...applied, stage: next === "class-wait" ? "group" : next, reworkedAt: a.at ?? s.reworkedAt, notice: reworkNotice(s) };
      }
      if (a.kind === "force-group") {
        // The teacher ended group review (ticket 145): a student on the board moves on; the classroom's run is ended by the same tab.
        return applied.stage === "group" ? { ...applied, stage: nextStage(env.pathway, "group-done") } : applied;
      }
      if (a.kind === "end-lesson") {
        // The teacher ended the lesson (ticket 273): a student still in it lands on their report with the work as it stands (a set
        // not handed in is handed in, blanks not attempted; corrections under way are handed in); one past it stays where they are.
        if (!IN_LESSON.includes(s.stage)) return applied;
        const handIn = BEFORE_HAND_IN.includes(s.stage) ? { handedInAt: a.at ?? s.handedInAt, notAttempted: blankProblems(s) } : {};
        const rework = s.stage === "feedback" ? { reworkedAt: a.at ?? s.reworkedAt } : {};
        return { ...applied, ...handIn, ...rework, stage: "report", handInCheck: null, prompt: null, overlay: null, ladder: null, notice: ENDED_LESSON_TEXT };
      }
      if (a.kind === "force-submit") {
        if (!BEFORE_HAND_IN.includes(s.stage)) return applied;
        return {
          ...applied,
          stage: nextStage(env.pathway, "handed-in"),
          handedInAt: a.at ?? s.handedInAt,
          notAttempted: blankProblems(s),
          handInCheck: null,
          prompt: null,
          overlay: null,
          ladder: null,
          notice: FORCED_HAND_IN_TEXT,
        };
      }
      return applied;
    }
    case "overview/start":
      if (s.stage !== "overview") return s;
      return env.goal.trim() ? { ...s, stage: "goal" } : { ...s, stage: "confidence", checkInAt: a.at ?? s.checkInAt };
    case "goal/continue":
      return s.stage === "goal" ? { ...s, stage: "confidence", checkInAt: a.at ?? s.checkInAt } : s;
    case "confidence/set":
      if (s.stage !== "confidence" || s.confidence) return s;
      return a.confidence.level === "confident" ? { ...s, confidence: a.confidence, practice: "declined", stage: "working" } : { ...s, confidence: a.confidence };
    case "warmup/accept":
      return warmupOffered(s) ? { ...s, practice: "taken", stage: "warmup-chat" } : s;
    case "warmup/decline":
      return warmupOffered(s) ? { ...s, practice: "declined", stage: "working" } : s;
    case "practice/finish":
      return { ...s, stage: "working" };
    case "warmup/say": {
      const text = a.text.trim();
      if (!text || s.stage !== "warmup-chat" || concernsAnswered(warmupSeed(s), s.warmup.messages)) return s;
      return warm(s, { messages: [...s.warmup.messages, { from: "student", text }] });
    }
    case "warmup/begin":
      return s.stage === "warmup-chat" && concernsAnswered(warmupSeed(s), s.warmup.messages) ? openSkill({ ...s, stage: "practice" }, {}, a.at) : s;
    case "warmup/next": {
      if (s.stage !== "practice") return s;
      const ladder = warmupLadder(warmupStep(s));
      const phase = warmupPhase(s);
      const next = nextPhase(phase);
      if (!ladder || !next) return s;
      // The worked example seen in full before "Your turn"; the completion problem finished before "On your own" — unless the student confirmed moving on early.
      if (!a.force) {
        if (phase === "worked" && !s.warmup.exampled.includes(ladder.worked.id)) return s;
        if (phase === "completion" && !warmupCompletion(s)?.state.done) return s;
      }
      return warm(s, { example: false, exampleShown: 0, phases: stampPhase(s.warmup.phases, ladder.worked.id, next, a.at) });
    }
    case "run/reveal":
    case "run/stroke":
    case "run/undo":
    case "run/clear":
    case "run/hint":
    case "run/example":
    case "run/example-step":
    case "run/next":
    case "run/chat": {
      const base = runOf(s, a.run);
      // A warm-up skill on its worked example is playing it, whatever an older or deep-linked snapshot says.
      const run = a.run === "warmup" && !base.example && warmupPhase(s) === "worked" ? { ...base, example: true } : base;
      const first = runFirst(s, a.run);
      if (!first) return s;
      // The warm-up's steps move by warmup/next alone (ticket 313): the older follow-up and the menu's example do not apply to it.
      if (a.run === "warmup" && (a.type === "run/next" || a.type === "run/example")) return s;
      // Q**'s hints (and the warm-up completion problem's) are picked by the working on screen (the given lines and the blanks done), not by the lines written into it.
      const working = a.run === "overlay" && s.ladder?.step === "completion" ? ladderWorking(s) : a.run === "warmup" ? warmupWorking(s) : undefined;
      const next = runReducer(run, a, first, working);
      return next === run ? s : a.run === "warmup" ? { ...s, warmup: { ...s.warmup, ...next } } : a.run === "overlay" ? { ...s, overlayRun: next } : { ...s, questionRun: next };
    }
    case "question/hint": {
      const entry = ladderEntry(s, a.problem);
      const q = PROBLEM_MAP[a.problem];
      const p = entry && q ? questionPractice(q, entry.leaf) : null;
      if (!p) return s;
      const next = runReducer(s.questionRun, { type: "run/hint", run: "question" }, p, (s.lines[q.id] ?? []).map((l) => l.tex));
      return next === s.questionRun ? s : { ...s, questionRun: next };
    }
    case "ladder/next": {
      const first = runFirst(s, "overlay");
      if (s.ladder?.step !== "worked" || !first || !s.overlayRun.exampled.includes(first.id)) return s;
      return { ...s, ladder: { ...s.ladder, step: "completion" }, overlayRun: { ...s.overlayRun, example: false, exampleShown: 0 }, practices: stampStep(s.practices, s.ladder.problem, "completion", a.at) };
    }
    case "ladder/again": {
      const entry = ladderEntry(s, a.problem);
      if (s.overlay || !entry) return s;
      return { ...s, overlay: entry.leaf, ladder: { problem: a.problem, step: "again" } };
    }
    case "warmup/skill-done": {
      if (s.stage !== "practice") return s;
      const seq = warmupSequence(warmupFocus(s));
      const done = leaveSkill(s);
      // The next skill never opened, looking past the current one and wrapping round to any jumped over; the set once every skill has been.
      const next = seq.map((_, i) => (s.warmup.step + 1 + i) % seq.length).find((i) => !done.includes(seq[i].id));
      if (next === undefined) return { ...s, stage: "working", warmup: { ...s.warmup, done } };
      return openSkill(s, { done, step: next }, a.at);
    }
    case "warmup/goto": {
      if (s.stage !== "practice" || a.step === s.warmup.step || a.step < 0 || a.step >= warmupSequence(warmupFocus(s)).length) return s;
      return openSkill(s, { done: leaveSkill(s), step: a.step }, a.at);
    }
    case "problem/goto":
      // A tile pressed under the open hand-in check is a way back too.
      return { ...s, problemIndex: a.index, handInCheck: s.handInCheck === "open" ? "returning" : s.handInCheck };
    case "line/reveal": {
      const prev = s.lines[a.problem] ?? [];
      const next: StudentSession = { ...s, lines: { ...s.lines, [a.problem]: [...prev, a.line] } };
      const v = evaluateLine(a.problem, a.line.tex);
      const key = `${a.problem}#${prev.length}`;
      if (v.verdict !== "wrong" || s.counted.includes(key)) return next;
      const slipped = v.tags[0].leaf;
      const r = recordMistake(s.escalation, groupOf(slipped), slipped);
      // On a question with Q* and Q** the offer is on the skill of this slip, the one its three steps practise (ticket 312); elsewhere the most fundamental slipped on.
      const leaf = r.trigger ? (ladderFor(a.problem, slipped) && practiceFor(slipped) ? slipped : fundamentalLeaf(r.slipped)) : null;
      return {
        ...next,
        escalation: r.state,
        counted: [...s.counted, key],
        prompt: leaf ? { leaf, reason: "detected" } : s.prompt,
      };
    }
    case "ink/stroke":
      // Writing on under the open hand-in check answers it: the student is going on with the set.
      return { ...s, ink: { ...s.ink, [a.problem]: [...(s.ink[a.problem] ?? []), roundStroke(a.stroke)] }, handInCheck: s.handInCheck === "open" ? "returning" : s.handInCheck };
    case "lines/undo": {
      const strokes = s.ink[a.problem] ?? [];
      const count = a.strokeCount ?? Math.max(0, strokes.length - 1);
      return {
        ...s,
        ink: { ...s.ink, [a.problem]: strokes.slice(0, count) },
        lines: { ...s.lines, [a.problem]: afterUndo(s.lines[a.problem] ?? [], count) },
      };
    }
    case "lines/clear":
      return { ...s, ink: { ...s.ink, [a.problem]: [] }, lines: { ...s.lines, [a.problem]: [] } };
    case "help/request": {
      // The student asked and chose the skill: straight onto Q* (or the older isolated practice), no prompt in between.
      const r = requestHelp(s.escalation, groupOf(a.leaf));
      const leaf = ladderFor(a.problem, a.leaf) ? a.leaf : practiceLeaf(a.leaf);
      if (!leaf) return { ...s, escalation: r.state };
      return { ...s, escalation: r.state, ...openHelp(s, { leaf, reason: "help", problem: a.problem }, a.at) };
    }
    case "prompt/accept":
      if (!s.prompt) return s;
      return { ...s, escalation: practiceTaken(s.escalation, groupOf(s.prompt.leaf)), ...openHelp(s, { ...s.prompt, problem: a.problem }, a.at) };
    case "prompt/decline":
      if (!s.prompt) return s;
      return { ...s, prompt: null, practices: [...s.practices, { ...s.prompt, accepted: false, problem: a.problem }] };
    case "overlay/done":
      // Back on the question from Q* or Q** is the third step; closing the example opened again from there records nothing new.
      if (s.overlay && (s.ladder?.step === "worked" || s.ladder?.step === "completion")) return { ...s, overlay: null, ladder: null, practices: stampStep(s.practices, s.ladder.problem, "back", a.at) };
      return { ...s, overlay: null, ladder: null };
    case "rework/goto":
      return { ...s, reworkIndex: a.index, reworkOpenedAt: a.at ?? s.reworkOpenedAt };
    case "rework/reveal":
      return { ...s, rework: { ...s.rework, [a.problem]: [...(s.rework[a.problem] ?? []), a.line] } };
    case "rework/stroke":
      return { ...s, ...(s.reworkOpenedAt === 0 && a.at ? { reworkOpenedAt: a.at } : {}), reworkInk: { ...s.reworkInk, [a.problem]: [...(s.reworkInk[a.problem] ?? []), roundStroke(a.stroke)] } };
    case "rework/undo": {
      const strokes = s.reworkInk[a.problem] ?? [];
      const count = a.strokeCount ?? Math.max(0, strokes.length - 1);
      return {
        ...s,
        reworkInk: { ...s.reworkInk, [a.problem]: strokes.slice(0, count) },
        rework: { ...s.rework, [a.problem]: afterUndo(s.rework[a.problem] ?? [], count) },
      };
    }
    case "rework/clear":
      return { ...s, reworkInk: { ...s.reworkInk, [a.problem]: [] }, rework: { ...s.rework, [a.problem]: [] } };
    case "rework/done": {
      if (!a.force && trippedProblems(s).length > 0) return s;
      return { ...s, stage: nextStage(env.pathway, "reworked"), reworkedAt: a.at ?? s.reworkedAt, notice: reworkNotice(s) };
    }
    case "notice/dismiss":
      return { ...s, notice: null };
    case "class-review/reveal": {
      const w = classWorkOf(s, a.problem);
      return { ...s, classReview: { ...s.classReview, [a.problem]: { ...w, lines: [...w.lines, a.line] } } };
    }
    case "class-review/stroke": {
      const w = classWorkOf(s, a.problem);
      return { ...s, classReview: { ...s.classReview, [a.problem]: { ...w, ink: [...w.ink, roundStroke(a.stroke)] } } };
    }
    case "class-review/undo": {
      const w = classWorkOf(s, a.problem);
      const count = a.strokeCount ?? Math.max(0, w.ink.length - 1);
      return { ...s, classReview: { ...s.classReview, [a.problem]: { ink: w.ink.slice(0, count), lines: afterUndo(w.lines, count) } } };
    }
    case "class-review/clear":
      return { ...s, classReview: { ...s.classReview, [a.problem]: NO_CLASS_WORK } };
    case "freeze":
      return s.stage === "frozen" ? s : { ...s, stage: "frozen", prompt: null, overlay: null, ladder: null };
    case "release":
      return s.stage === "frozen" ? { ...s, stage: "report" } : s;
    case "group/start":
      if (s.stage !== "class-wait") return s;
      return a.nothingToReview ? { ...s, stage: nextStage(env.pathway, "group-done"), notice: NOTHING_TO_REVIEW_TEXT } : { ...s, stage: "group" };
    case "debrief/done":
      return s.debrief[a.problem]?.done ? s : { ...s, debrief: { ...s.debrief, [a.problem]: { done: true } } };
    case "group/done":
      return { ...s, stage: nextStage(env.pathway, "group-done"), ...(a.nothingToReview ? { notice: NOTHING_TO_REVIEW_TEXT } : {}) };
    case "reflection/set":
      return { ...s, reflection: a.text };
    case "report/send":
      // A report goes with a reflection or not at all: the button stays disabled until something is written. Once it has gone,
      // the problems the student ever got wrong go into their homework (ticket 256).
      return s.reflection.trim() === "" ? s : { ...s, reportSent: true, stage: "homework", homeworkAt: a.at ?? s.homeworkAt };
    case "peers/open":
      return { ...s, stage: "peers" };
    case "peers/close":
      return { ...s, stage: "report" };
    case "star/toggle":
      return { ...s, stars: s.stars.includes(a.problem) ? s.stars.filter((p) => p !== a.problem) : [...s.stars, a.problem] };
    case "answer/set":
      return { ...s, answers: { ...s.answers, [a.problem]: a.text } };
    case "goto":
      return { ...s, stage: a.stage, handedInAt: a.stage === "feedback" && a.at ? a.at : s.handedInAt };
    case "history/open":
      return { ...s, stage: "history" };
    case "history/close":
      return { ...s, stage: "report" };
    case "reset":
      return INITIAL_SESSION;
  }
}

const BEFORE_HAND_IN = BEFORE_HAND_IN_STAGES;
/** The stages of the lesson itself, before the report: the set, the review stages and their waits. */
const IN_LESSON: readonly Stage[] = [...BEFORE_HAND_IN_STAGES, "feedback", "waiting", "class-wait", "group"];

/** The leaf to practise for a mistake: its own practice, else another leaf in the same group that has one; never a whole-task leaf. */
export function practiceLeaf(leaf: LeafId): LeafId | null {
  return practiceFor(leaf)?.leaf ?? null;
}

/**
 * Of the leaves slipped on in a group, the most fundamental that can be practised: a monic slip
 * then a non-monic slip sends the student to monic, the skill the second one leans on.
 */
export function fundamentalLeaf(slipped: LeafId[]): LeafId | null {
  for (const l of byEase(slipped)) {
    const p = practiceLeaf(l);
    if (p) return p;
  }
  return null;
}

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];

/** The practice offer's line: which mistake on the topic this is. A declined offer stays armed, so a re-offer reads third, fourth… (ticket 297). */
export function promptSentence(s: StudentSession): string | null {
  if (!s.prompt) return null;
  const group = groupOf(s.prompt.leaf);
  // A session saved before ticket 297 reset the count on the offer: read it as the second.
  const n = Math.max(2, s.escalation.counts[group] ?? 0);
  const nth = ORDINALS[n - 1];
  return nth ? `This is your ${nth} mistake on ${groupWord(group)}.` : `This is another mistake on ${groupWord(group)}.`;
}

/** The notice when the student's group sits out group review (ticket 332): every question is right once corrections are in. */
export const NOTHING_TO_REVIEW_TEXT = "Your group has nothing left to review.";
export const FORCED_HAND_IN_TEXT = "Your teacher handed in the class's work.";
/** The notice over the report when the teacher's "end lesson" lands a student there (ticket 273). */
export const ENDED_LESSON_TEXT = "Your teacher ended the lesson.";

/**
 * The notice shown over the next screen after the rework is handed in (ticket 159): the final version's
 * summary when something still contains a mistake, nothing when every problem holds. A clean rework needs
 * no toast ("Every problem holds now." was removed at the user's request); the next screen is the news.
 */
export function reworkNotice(s: StudentSession): string | null {
  const summary = feedbackSummary(s, "final");
  return summary.count === 0 ? null : summary.sentence;
}

const warm = (s: StudentSession, patch: Partial<WarmupState>): StudentSession => ({ ...s, warmup: { ...s.warmup, ...patch } });

/**
 * Opens the warm-up skill `patch.step` names (or the current one) on the step it was left on (ticket 313): a skill never
 * opened starts on its worked example, playing from its first step, with that start recorded once.
 */
function openSkill(s: StudentSession, patch: Partial<WarmupState>, at: number | undefined): StudentSession {
  const opened = warm(s, { ...patch, problem: "first", exampleShown: 0 });
  const id = warmupStep(opened).id;
  const phases = warmupLadder(warmupStep(opened)) ? stampPhase(opened.warmup.phases, id, "worked", at) : opened.warmup.phases;
  return warm(opened, { phases, example: phaseOf(phases[id]) === "worked" });
}

/** A warm-up skill's step `phase` recorded as begun at `at`, once: a step already reached keeps its first time. */
function stampPhase(phases: Record<string, PhaseTimes>, id: string, phase: WarmupPhase, at: number | undefined): Record<string, PhaseTimes> {
  if (phases[id]?.[phase] !== undefined) return phases;
  return { ...phases, [id]: { ...phases[id], [phase]: at ?? 0 } };
}

/** The step the warm-up's current skill is on (ticket 313). */
export const warmupPhase = (s: Pick<StudentSession, "warmup" | "confidence">): WarmupPhase => phaseOf(s.warmup.phases[warmupStep(s).id]);

/** The warm-up's completion problem as it stands, with its blanks: null unless the current skill is on it. */
export function warmupCompletion(s: StudentSession) {
  const ladder = warmupLadder(warmupStep(s));
  if (!ladder || warmupPhase(s) !== "completion") return null;
  return { ...ladder, state: completionState(ladder.completion.steps, ladder.blanks, s.warmup.lines[ladder.completion.id] ?? []) };
}

/** The warm-up completion problem's working as far as the blank being written, for the hint picker; undefined on the other steps. */
const warmupWorking = (s: StudentSession): string[] | undefined => {
  const c = warmupCompletion(s);
  return c ? completionWorking(c.completion.steps, c.state) : undefined;
};

/** The warm-up's done list once the student leaves the skill on screen: leaving it counts, finished or not (ticket 205). */
const leaveSkill = (s: StudentSession): string[] => {
  const cur = warmupStep(s).id;
  return s.warmup.done.includes(cur) ? s.warmup.done : [...s.warmup.done, cur];
};

/** The run an action is about. */
export const runOf = (s: StudentSession, key: RunKey): PracticeRun => (key === "warmup" ? s.warmup : s.overlayRun);

/**
 * A run's first problem: the warm-up's current step; over a question, Q* (its worked example, first or again) or Q** as
 * the pad reads them, or the overlay's leaf's practice on a question without them (null when no overlay is open); back on a
 * question after practice, that question with its own hints (null before any).
 */
export function runFirst(s: StudentSession, key: RunKey): PracticeProblem | null {
  if (key === "warmup") {
    // The warm-up skill's step (ticket 313): its practice problem worked, its completion problem, its follow-up alone.
    const ladder = warmupLadder(warmupStep(s));
    return ladder ? ladder[warmupPhase(s)] : warmupStep(s);
  }
  if (key === "question") {
    const entry = [...s.practices].reverse().find((p) => p.accepted && p.steps);
    const q = entry ? PROBLEM_MAP[entry.problem] : undefined;
    return entry && q ? questionPractice(q, entry.leaf) : null;
  }
  if (!s.overlay) return null;
  const ladder = s.ladder ? ladderFor(s.ladder.problem, s.overlay) : null;
  if (s.ladder && ladder) return asPractice(s.ladder.step === "completion" ? ladder.completion : ladder.worked, s.overlay);
  return PRACTICES[s.overlay] ?? null;
}

/** The latest practice taken on `problem` as three steps (ticket 312), or undefined. */
export const ladderEntry = (s: Pick<StudentSession, "practices">, problem: string): PracticeEntry | undefined => [...s.practices].reverse().find((p) => p.accepted && p.problem === problem && p.steps);

/** Q** as it stands in the open practice (ticket 312), with its blanks: null unless Q** is showing. */
export function ladderCompletion(s: StudentSession) {
  if (!s.overlay || s.ladder?.step !== "completion") return null;
  const ladder = ladderFor(s.ladder.problem, s.overlay);
  if (!ladder) return null;
  return { ...ladder, state: completionState(ladder.completion.solution, ladder.blanks, s.overlayRun.lines[ladder.completion.id] ?? []) };
}

/** Q**'s working as far as the blank being written, for the hint picker. */
const ladderWorking = (s: StudentSession): string[] | undefined => {
  const c = ladderCompletion(s);
  return c ? completionWorking(c.completion.solution, c.state) : undefined;
};

/** Opens practice on a question for an accepted offer or a help request: Q* when the question has Q* and Q** (its start recorded), else the older isolated practice. */
function openHelp(s: StudentSession, p: PracticePrompt & { problem: string }, at: number | undefined): Partial<StudentSession> {
  const ladder = ladderFor(p.problem, p.leaf) !== null;
  return {
    prompt: null,
    overlay: p.leaf,
    ladder: ladder ? { problem: p.problem, step: "worked" } : null,
    // Q*'s worked example plays from the start, where the older practice opens on its pad.
    overlayRun: ladder ? { ...INITIAL_RUN, example: true } : INITIAL_RUN,
    practices: [...s.practices, { ...p, accepted: true, ...(ladder ? { steps: { worked: at ?? 0 } } : {}) }],
  };
}

/** The latest three-step practice on `problem` with `step`'s start recorded, once: a step already reached keeps its first time. */
function stampStep(practices: PracticeEntry[], problem: string, step: LadderStep, at: number | undefined): PracticeEntry[] {
  let i = -1;
  practices.forEach((p, k) => {
    if (p.accepted && p.problem === problem && p.steps) i = k;
  });
  if (i < 0 || practices[i].steps![step] !== undefined) return practices;
  return practices.map((p, k) => (k === i ? { ...p, steps: { ...p.steps, [step]: at ?? 0 } } : p));
}

/** The problem a run is on: its first, or the follow-up. */
export function runProblem(s: StudentSession, key: RunKey) {
  const first = runFirst(s, key);
  if (!first) return null;
  return runOf(s, key).problem === "second" && first.followUp ? first.followUp : first;
}

type RunAction = Extract<SessionAction, { run: RunKey }>;

/** The pad rules for one run, the same for the warm-up and the overlay. Returns the same object when nothing changes. */
function runReducer(r: PracticeRun, a: RunAction, first: PracticeProblem, working?: string[]): PracticeRun {
  const cur = r.problem === "second" && first.followUp ? first.followUp : first;
  switch (a.type) {
    case "run/reveal":
      return { ...r, lines: { ...r.lines, [a.problem]: [...(r.lines[a.problem] ?? []), a.line] } };
    case "run/stroke":
      return { ...r, ink: { ...r.ink, [a.problem]: [...(r.ink[a.problem] ?? []), roundStroke(a.stroke)] } };
    case "run/undo": {
      const strokes = r.ink[a.problem] ?? [];
      const count = a.strokeCount ?? Math.max(0, strokes.length - 1);
      return { ...r, ink: { ...r.ink, [a.problem]: strokes.slice(0, count) }, lines: { ...r.lines, [a.problem]: afterUndo(r.lines[a.problem] ?? [], count) } };
    }
    case "run/clear":
      return { ...r, ink: { ...r.ink, [a.problem]: [] }, lines: { ...r.lines, [a.problem]: [] } };
    case "run/hint": {
      const shown = r.hinted[cur.id] ?? [];
      const lines = working ?? (r.lines[cur.id] ?? []).map((l) => l.tex);
      // A hint the lines have not moved past blocks the next one: the pad opens the chat on it instead (stalledHint).
      if (stalledHint(cur, lines, shown) !== null) return r;
      const next = pickHint(cur, lines, shown);
      return next === null ? r : { ...r, hinted: { ...r.hinted, [cur.id]: [...shown, next] } };
    }
    case "run/example":
      return r.example ? r : { ...r, example: true, exampleShown: 0 };
    case "run/example-step": {
      if (!r.example) return r;
      const shown = Math.min(cur.steps.length, r.exampleShown + 1);
      const done = shown >= cur.steps.length && !r.exampled.includes(cur.id);
      return { ...r, exampleShown: shown, exampled: done ? [...r.exampled, cur.id] : r.exampled };
    }
    case "run/next":
      if (r.problem !== "first" || !first.followUp || !r.exampled.includes(first.id)) return r;
      return { ...r, problem: "second", example: false, exampleShown: 0 };
    case "run/chat": {
      const text = a.message.text.trim();
      if (!text) return r;
      return { ...r, chat: { ...r.chat, [a.problem]: [...(r.chat[a.problem] ?? []), { from: a.message.from, text }] } };
    }
  }
}

/** The skills the student ticked under "not confident with…": what the concerns chat asks about, in that order. Empty for an overall answer. */
export const warmupSeed = (s: Pick<StudentSession, "confidence">): LeafId[] => (s.confidence?.level === "low-when" ? s.confidence.leaves : []);

/** The leaves the warm-up is about so far: the ticked skills plus anything the answers named. */
export const warmupFocus = (s: Pick<StudentSession, "confidence" | "warmup">): LeafId[] => focusLeaves(warmupSeed(s), s.warmup.messages);

/** The current skill's practice problem (the sequence's last once the warm-up is over): the skill's worked example, and the id its steps are recorded under. */
export function warmupStep(s: Pick<StudentSession, "warmup" | "confidence">) {
  const seq = warmupSequence(warmupFocus(s));
  return seq[Math.min(s.warmup.step, seq.length - 1)];
}

/** The warm-up problem the student is on: the current skill's worked example, completion problem or follow-up, by its step (ticket 313). */
export function warmupProblem(s: StudentSession) {
  return runFirst(s, "warmup") ?? warmupStep(s);
}

/** Stored to a tenth of a pad pixel: indistinguishable on screen, a third of the bytes. */
function roundStroke(s: Stroke): Stroke {
  return s.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
}

const ORDER: Stage[] = ["overview", "goal", "confidence", "warmup-chat", "practice", "working", "feedback", "waiting", "frozen", "class-wait", "group", "report", "peers", "history", "homework"];

/** The reflection behind a run that has already sent its report: the homework screen's deep link and skip (ticket 256). */
export const DEMO_REFLECTION = "I guessed factor pairs without checking the signs. Expanding back would have caught Q1 and Q2.";

/** Fixed times for deep-linked runs: handed in at 3:48 pm, rework done at 4:07 pm, today. */
const todayAt = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

/** The demo student's answer: not confident when factorising comes up. Shown to the teacher; it never changes when practice is offered. */
export const DEMO_CONFIDENCE: Confidence = { level: "low-when", leaves: ["algebra.expand-factor.monic"] };

/** The answer behind the warm-up deep links: three skills ticked, so the concerns chat and the chip strip show their shape. */
export const DEMO_WARMUP_CONFIDENCE: Confidence = { level: "low-when", leaves: ["algebra.expand-factor.monic", "algebra.number.fractions", "functions.zeros.nfl"] };

/** The demo's answers in the concerns chat, one per ticked skill: the second names Q2, which adds non-monic factorising to the warm-up. */
export const DEMO_CONCERNS: WarmupMessage[] = [
  { from: "student", text: "i mix up the signs when i factorise, and Q2 looks harder than the others" },
  { from: "student", text: "i forget which way the fraction flips when i divide" },
  { from: "student", text: "i sometimes forget to set each bracket to zero" },
];

/** Which scripted run a deep link plays: the default weak run, or a strong one (every step held). */
export type RunKindParam = "weak" | "strong";

/** A strong run: the model solution for every problem, confident, nothing to rework. */
export function strongSession(): StudentSession {
  let s: StudentSession = { ...INITIAL_SESSION, stage: "working", practice: "declined", confidence: { level: "confident" } };
  ASSIGNMENT.problems.forEach((p, index) => {
    s = sessionReducer(s, { type: "problem/goto", index });
    p.solution.forEach((st, n) => {
      s = sessionReducer(s, { type: "line/reveal", problem: p.id, line: { tex: st.tex, strokeCount: (n + 1) * 5 } });
    });
  });
  return s;
}

/**
 * The scripted run, played through the reducer so escalation state is exactly what a live run
 * produces: every recognised line for every problem, the Q2 prompt taken, no help asked.
 */
export function scriptedSession(): StudentSession {
  let s: StudentSession = { ...INITIAL_SESSION, stage: "working", practice: "declined", confidence: DEMO_CONFIDENCE };
  for (const [i, p] of Object.entries(RECOGNITION)) {
    const index = Object.keys(RECOGNITION).indexOf(i);
    s = sessionReducer(s, { type: "problem/goto", index });
    p.forEach((tex, n) => {
      s = sessionReducer(s, { type: "line/reveal", problem: i, line: { tex, strokeCount: (n + 1) * 5 } });
      if (s.prompt) {
        s = sessionReducer(s, { type: "prompt/accept", problem: i });
        s = sessionReducer(s, { type: "overlay/done" });
      }
    });
  }
  return { ...s, handedInAt: todayAt(15, 48) };
}

/**
 * The scripted run plus the corrected rework of every problem that slipped, Q4 starred. A problem
 * whose first hand-in held is left alone: Q4 (its scripted rework is the guard's demo) and Q9
 * (right as far as it went, so the deep-linked run still has it unfinished, ticket 158).
 */
export function reworkedSession(): StudentSession {
  let s = { ...scriptedSession(), stage: "feedback" as Stage, stars: ["q4"] };
  for (const [pid, lines] of Object.entries(RECOGNITION_REWORK)) {
    if (guardFor(s, pid).originalCorrect) continue;
    lines.forEach((tex, n) => {
      s = sessionReducer(s, { type: "rework/reveal", problem: pid, line: { tex, strokeCount: (n + 1) * 5 } });
    });
  }
  return { ...s, reworkedAt: todayAt(16, 7) };
}

/** Builds a session already at `stage`, for deep links, with plausible earlier answers filled in. */
export function sessionAt(stage: Stage, run: RunKindParam = "weak"): StudentSession {
  // The report already sent with a reflection, the homework sequence starting now.
  if (stage === "homework") return { ...sessionAt("report", run), stage, reflection: DEMO_REFLECTION, reportSent: true, homeworkAt: Date.now() };
  const i = ORDER.indexOf(stage);
  if (i < 0) return INITIAL_SESSION;
  if (run === "strong" && i >= ORDER.indexOf("feedback")) return { ...strongSession(), stage, stars: [], handedInAt: todayAt(15, 48) };
  if (i >= ORDER.indexOf("class-wait")) return { ...reworkedSession(), stage };
  if (i >= ORDER.indexOf("feedback")) return { ...scriptedSession(), stage };
  return {
    ...INITIAL_SESSION,
    stage,
    practice: i === ORDER.indexOf("warmup-chat") || i === ORDER.indexOf("practice") ? "taken" : i > ORDER.indexOf("confidence") ? "declined" : null,
    confidence: i === ORDER.indexOf("warmup-chat") || i === ORDER.indexOf("practice") ? DEMO_WARMUP_CONFIDENCE : i > ORDER.indexOf("practice") ? DEMO_CONFIDENCE : null,
    // A deep link straight to the pad has the chat behind it: the three answers, so the warm-up is fractions, factorising, the null factor law, then non-monic.
    warmup: i === ORDER.indexOf("practice") ? { ...INITIAL_WARMUP, messages: DEMO_CONCERNS } : INITIAL_WARMUP,
  };
}
