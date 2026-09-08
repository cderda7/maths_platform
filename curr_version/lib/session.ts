import type { Confidence, Stage, SubskillId } from "@/data/types";
import { afterUndo, type RevealedLine } from "./recognition";
import { evaluateLine } from "./evaluate";
import { INITIAL_ESCALATION, recordMistake, requestHelp, type EscalationState } from "./escalation";
import { RECOGNITION } from "@/data/recognition";

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
    case "star/toggle":
      return { ...s, stars: s.stars.includes(a.problem) ? s.stars.filter((p) => p !== a.problem) : [...s.stars, a.problem] };
    case "goto":
      return { ...s, stage: a.stage };
    case "reset":
      return INITIAL_SESSION;
  }
}

const ORDER: Stage[] = ["overview", "practice", "confidence", "working", "feedback", "rework", "group-pass", "group-discuss", "report"];

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

/** Builds a session already at `stage`, for deep links, with plausible earlier answers filled in. */
export function sessionAt(stage: Stage): StudentSession {
  const i = ORDER.indexOf(stage);
  if (i < 0) return INITIAL_SESSION;
  if (i >= ORDER.indexOf("feedback")) return { ...scriptedSession(), stage };
  return {
    ...INITIAL_SESSION,
    stage,
    practice: i >= ORDER.indexOf("confidence") ? "declined" : i === ORDER.indexOf("practice") ? "taken" : null,
    confidence: i >= ORDER.indexOf("working") ? { level: "low-when", subskill: "factoring" } : null,
  };
}
