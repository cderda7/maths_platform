import type { Confidence, Stage, SubskillId } from "@/data/types";
import { afterUndo, type RevealedLine } from "./recognition";
import { evaluateLine } from "./evaluate";
import { INITIAL_ESCALATION, recordMistake, requestHelp, type EscalationState } from "./escalation";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { ASSIGNMENT } from "@/data/assignment";

/**
 * The student's session: everything the closed loop needs to remember about one run. Pure data
 * plus a reducer, so the flow can be unit-tested and, from ticket 05, mirrored to the teacher tab.
 */
export interface PracticePrompt {
  subskill: SubskillId;
  /** detected: the counter triggered it. help: the student asked. */
  reason: "detected" | "help";
}

export interface PracticeEntry extends PracticePrompt {
  accepted: boolean;
  /** Problem the student was on. */
  problem: string;
}

export interface StudentSession {
  stage: Stage;
  /** null until the offer is answered. */
  practice: "taken" | "declined" | null;
  confidence: Confidence | null;
  /** Index into the assignment's problems while working. */
  problemIndex: number;
  /** Recognised lines per problem id, in the order they appeared. */
  lines: Record<string, RevealedLine[]>;
  escalation: EscalationState;
  /** Keys (`problem#lineIndex`) of wrong lines already counted, so undo + re-reveal can't double count. */
  counted: string[];
  /** The isolated-practice prompt currently showing, if any. */
  prompt: PracticePrompt | null;
  /** The isolated practice the student is in, if any. */
  overlay: SubskillId | null;
  /** Every prompt and how it was answered, oldest first. */
  practices: PracticeEntry[];
  /** Problems the student got right but wasn't sure about. */
  stars: string[];
  /**
   * The independent rework: a second version of the working per problem. `lines` is the
   * original and is never changed after hand-in, so both versions are preserved.
   */
  rework: Record<string, RevealedLine[]>;
  /** Index into the problems being reworked (those with a slip). */
  reworkIndex: number;
  /** Discussion problems the group has talked through. */
  talked: string[];
  /** The 2–3 sentence reflection on the final report. */
  reflection: string;
  /** True once the reflection has been sent to the teacher. */
  reportSent: boolean;
}

export type SessionAction =
  | { type: "practice/accept" }
  | { type: "practice/decline" }
  | { type: "practice/finish" }
  | { type: "confidence/set"; confidence: Confidence }
  | { type: "problem/goto"; index: number }
  | { type: "line/reveal"; problem: string; line: RevealedLine }
  | { type: "lines/undo"; problem: string; strokeCount: number }
  | { type: "lines/clear"; problem: string }
  | { type: "help/request"; subskill: SubskillId; problem: string }
  | { type: "prompt/accept"; problem: string }
  | { type: "prompt/decline"; problem: string }
  | { type: "overlay/done" }
  | { type: "star/toggle"; problem: string }
  | { type: "rework/goto"; index: number }
  | { type: "rework/reveal"; problem: string; line: RevealedLine }
  | { type: "rework/undo"; problem: string; strokeCount: number }
  | { type: "rework/clear"; problem: string }
  | { type: "rework/done" }
  | { type: "group/discuss" }
  | { type: "group/talked"; problem: string }
  | { type: "group/done" }
  | { type: "reflection/set"; text: string }
  | { type: "report/send" }
  | { type: "peers/open" }
  | { type: "peers/close" }
  | { type: "goto"; stage: Stage }
  | { type: "reset" };

export const INITIAL_SESSION: StudentSession = {
  stage: "overview",
  practice: null,
  confidence: null,
  problemIndex: 0,
  lines: {},
  escalation: INITIAL_ESCALATION,
  counted: [],
  prompt: null,
  overlay: null,
  practices: [],
  stars: [],
  rework: {},
  reworkIndex: 0,
  talked: [],
  reflection: "",
  reportSent: false,
};

export function sessionReducer(s: StudentSession, a: SessionAction): StudentSession {
  switch (a.type) {
    case "practice/accept":
      return { ...s, practice: "taken", stage: "practice" };
    case "practice/decline":
      return { ...s, practice: "declined", stage: "confidence" };
    case "practice/finish":
      return { ...s, stage: "confidence" };
    case "confidence/set":
      return { ...s, confidence: a.confidence, stage: "working" };
    case "problem/goto":
      return { ...s, problemIndex: a.index };
    case "line/reveal": {
      const prev = s.lines[a.problem] ?? [];
      const next: StudentSession = { ...s, lines: { ...s.lines, [a.problem]: [...prev, a.line] } };
      const v = evaluateLine(a.problem, a.line.tex);
      const key = `${a.problem}#${prev.length}`;
      if (v.verdict !== "wrong" || s.counted.includes(key)) return next;
      const r = recordMistake(s.escalation, v.subskill);
      return {
        ...next,
        escalation: r.state,
        counted: [...s.counted, key],
        prompt: r.trigger ? { subskill: v.subskill, reason: "detected" } : s.prompt,
      };
    }
    case "lines/undo":
      return { ...s, lines: { ...s.lines, [a.problem]: afterUndo(s.lines[a.problem] ?? [], a.strokeCount) } };
    case "lines/clear":
      return { ...s, lines: { ...s.lines, [a.problem]: [] } };
    case "help/request": {
      const r = requestHelp(s.escalation, a.subskill);
      return { ...s, escalation: r.state, prompt: { subskill: a.subskill, reason: "help" } };
    }
    case "prompt/accept":
      if (!s.prompt) return s;
      return { ...s, prompt: null, overlay: s.prompt.subskill, practices: [...s.practices, { ...s.prompt, accepted: true, problem: a.problem }] };
    case "prompt/decline":
      if (!s.prompt) return s;
      return { ...s, prompt: null, practices: [...s.practices, { ...s.prompt, accepted: false, problem: a.problem }] };
    case "overlay/done":
      return { ...s, overlay: null };
    case "rework/goto":
      return { ...s, reworkIndex: a.index };
    case "rework/reveal":
      return { ...s, rework: { ...s.rework, [a.problem]: [...(s.rework[a.problem] ?? []), a.line] } };
    case "rework/undo":
      return { ...s, rework: { ...s.rework, [a.problem]: afterUndo(s.rework[a.problem] ?? [], a.strokeCount) } };
    case "rework/clear":
      return { ...s, rework: { ...s.rework, [a.problem]: [] } };
    case "rework/done":
      return { ...s, stage: "group-pass" };
    case "group/discuss":
      return { ...s, stage: "group-discuss" };
    case "group/talked":
      return { ...s, talked: s.talked.includes(a.problem) ? s.talked.filter((p) => p !== a.problem) : [...s.talked, a.problem] };
    case "group/done":
      return { ...s, stage: "report" };
    case "reflection/set":
      return { ...s, reflection: a.text };
    case "report/send":
      return { ...s, reportSent: true };
    case "peers/open":
      return { ...s, stage: "peers" };
    case "peers/close":
      return { ...s, stage: "report" };
    case "star/toggle":
      return { ...s, stars: s.stars.includes(a.problem) ? s.stars.filter((p) => p !== a.problem) : [...s.stars, a.problem] };
    case "goto":
      return { ...s, stage: a.stage };
    case "reset":
      return INITIAL_SESSION;
  }
}

const ORDER: Stage[] = ["overview", "practice", "confidence", "working", "feedback", "rework", "group-pass", "group-discuss", "report", "peers"];

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
  let s: StudentSession = { ...INITIAL_SESSION, stage: "working", practice: "declined", confidence: { level: "low-when", subskill: "factoring" } };
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
  return s;
}

/** The scripted run plus the corrected rework of every problem that slipped, Q4 starred. */
export function reworkedSession(): StudentSession {
  let s = { ...scriptedSession(), stage: "rework" as Stage, stars: ["q4"] };
  for (const [pid, lines] of Object.entries(RECOGNITION_REWORK)) {
    lines.forEach((tex, n) => {
      s = sessionReducer(s, { type: "rework/reveal", problem: pid, line: { tex, strokeCount: (n + 1) * 5 } });
    });
  }
  return s;
}

/** Builds a session already at `stage`, for deep links, with plausible earlier answers filled in. */
export function sessionAt(stage: Stage, run: RunKindParam = "weak"): StudentSession {
  const i = ORDER.indexOf(stage);
  if (i < 0) return INITIAL_SESSION;
  if (run === "strong" && i >= ORDER.indexOf("feedback")) return { ...strongSession(), stage, stars: [] };
  if (i >= ORDER.indexOf("group-pass")) return { ...reworkedSession(), stage };
  if (i >= ORDER.indexOf("feedback")) return { ...scriptedSession(), stage };
  return {
    ...INITIAL_SESSION,
    stage,
    practice: i >= ORDER.indexOf("confidence") ? "declined" : i === ORDER.indexOf("practice") ? "taken" : null,
    confidence: i >= ORDER.indexOf("working") ? { level: "low-when", subskill: "factoring" } : null,
  };
}
