import type { Confidence, Pathway, Stage, Stroke } from "@/data/types";
import { groupOf, type LeafId } from "@/data/taxonomy";
import { PRACTICES } from "@/data/practice";
import { byEase, focusLeaves, practiceFor, tutorReply, warmupSequence, type WarmupMessage } from "./warmup";
import type { AdvanceKind } from "./classroom";
import type { Diagnostic } from "@/data/diagnostic";
import { DEFAULT_PATHWAY, nextStage } from "./pathway";
import { guardFor, trippedProblems } from "./guard";
import { feedbackSummary } from "./feedback";
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
  leaf: LeafId;
  /** detected: a second mistake. confidence: a first mistake where the student said they are not confident. help: the student asked. */
  reason: "detected" | "confidence" | "help";
}

export interface PracticeEntry extends PracticePrompt {
  accepted: boolean;
  /** Problem the student was on. */
  problem: string;
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
  /** Ids of the warm-up problems whose hint has been asked for. */
  hinted: string[];
  /** Ids of the warm-up problems whose worked example has been seen in full. */
  exampled: string[];
  /** Recognised lines and the ink behind them, per practice problem id. */
  lines: Record<string, RevealedLine[]>;
  ink: Record<string, Stroke[]>;
}

export const INITIAL_RUN: PracticeRun = { problem: "first", example: false, exampleShown: 0, hinted: [], exampled: [], lines: {}, ink: {} };

/** Which run an action is about: the warm-up before the set, or the isolated practice over it. */
export type RunKey = "warmup" | "overlay";

/** The warm-up's slice: a run plus the chooser's answers and the sequence position. */
export interface WarmupState extends PracticeRun {
  /** Problems the student marked as ones they don't feel confident in. */
  selected: string[];
  /** The chooser's chat, oldest first: the student's words and the tutor's replies. */
  messages: WarmupMessage[];
  /** Index into the warm-up sequence (one skill each, easiest first): the skill being warmed up. */
  step: number;
}

export const INITIAL_WARMUP: WarmupState = { ...INITIAL_RUN, selected: [], messages: [], step: 0 };

export interface StudentSession {
  stage: Stage;
  /** null until the offer is answered. */
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
  /** That practice on the pad: fresh each time a prompt is accepted. */
  overlayRun: PracticeRun;
  /** Every prompt and how it was answered, oldest first. */
  practices: PracticeEntry[];
  /** Problems the student got right but wasn't sure about. */
  stars: string[];
  /**
   * The independent rework: a second version of the working per problem. `lines` is the
   * original and is never changed after hand-in, so both versions are preserved.
   */
  rework: Record<string, RevealedLine[]>;
  /** The handwriting behind `rework`, per problem. */
  reworkInk: Record<string, Stroke[]>;
  /** Index into the problems being reworked (those with a slip). */
  reworkIndex: number;
  /** Discussion problems the group has talked through. */
  talked: string[];
  /** The 2–3 sentence reflection on the final report. */
  reflection: string;
  /** True once the reflection has been sent to the teacher. */
  reportSent: boolean;
  /** When the set was handed in and when the rework finished (ms since epoch; 0 = unknown). */
  handedInAt: number;
  reworkedAt: number;
  /** A one-line notice shown over the next screen until dismissed (post-rework sentence, teacher advances). */
  notice: string | null;
  /** Problems with no lines when the teacher handed in for the class. */
  notAttempted: string[];
  /** Ids of teacher advances this session has already applied, so tabs and reloads converge. */
  appliedAdvances: string[];
  /** A diagnostic the teacher has pushed and the student hasn't answered yet. A teacher-written question travels inline. */
  diagnostic: { questionId: string; recorded: boolean; question?: Diagnostic } | null;
  /** Answered diagnostics, oldest first. */
  diagnosticAnswers: { questionId: string; option: string; recorded: boolean; question?: Diagnostic }[];
}

export type SessionAction =
  | { type: "hand-in"; at?: number }
  /** A teacher advance whose grace has run out. Idempotent by id. */
  | { type: "advance/apply"; id: string; kind: AdvanceKind; at?: number }
  | { type: "practice/accept" }
  | { type: "practice/decline" }
  | { type: "practice/finish" }
  | { type: "confidence/set"; confidence: Confidence }
  /** The chooser: toggle a problem, send a message (the tutor answers at once), begin the warm-up. */
  | { type: "warmup/select"; problem: string }
  | { type: "warmup/say"; text: string }
  | { type: "warmup/begin" }
  /** Practice on the pad, for either run: the warm-up or the mid-set overlay. */
  | { type: "run/reveal"; run: RunKey; problem: string; line: RevealedLine }
  | { type: "run/stroke"; run: RunKey; problem: string; stroke: Stroke }
  | { type: "run/undo"; run: RunKey; problem: string; strokeCount?: number }
  | { type: "run/clear"; run: RunKey; problem: string }
  /** The help menu's "hint": the current problem's hint stays under the problem. */
  | { type: "run/hint"; run: RunKey }
  /** The help menu's "worked example": plays in place of the pad. */
  | { type: "run/example"; run: RunKey }
  | { type: "run/example-step"; run: RunKey }
  /** After the first problem's worked example: the follow-up, with that example still in view. */
  | { type: "run/next"; run: RunKey }
  /** The current skill is finished: on to the next in the sequence, or the set after the last. */
  | { type: "warmup/skill-done" }
  | { type: "problem/goto"; index: number }
  | { type: "line/reveal"; problem: string; line: RevealedLine }
  | { type: "ink/stroke"; problem: string; stroke: Stroke }
  /** Pops the last stroke and withdraws any line revealed after the survivors. `strokeCount` forces the count instead. */
  | { type: "lines/undo"; problem: string; strokeCount?: number }
  | { type: "lines/clear"; problem: string }
  | { type: "help/request"; leaf: LeafId; problem: string }
  | { type: "prompt/accept"; problem: string }
  | { type: "prompt/decline"; problem: string }
  | { type: "overlay/done" }
  | { type: "star/toggle"; problem: string }
  | { type: "rework/goto"; index: number }
  | { type: "rework/reveal"; problem: string; line: RevealedLine }
  | { type: "rework/stroke"; problem: string; stroke: Stroke }
  | { type: "rework/undo"; problem: string; strokeCount?: number }
  | { type: "rework/clear"; problem: string }
  /** Refused while the guard is tripped on any problem, unless `force` (a teacher advance). */
  | { type: "rework/done"; at?: number; force?: boolean }
  | { type: "notice/dismiss" }
  /** Whole-class review: everyone is frozen on the board's problem; released to the report when it ends. */
  | { type: "freeze" }
  | { type: "release" }
  | { type: "group/discuss" }
  | { type: "group/talked"; problem: string }
  | { type: "group/done" }
  | { type: "reflection/set"; text: string }
  | { type: "report/send" }
  | { type: "peers/open" }
  | { type: "peers/close" }
  | { type: "goto"; stage: Stage; at?: number }
  | { type: "history/open" }
  | { type: "history/close" }
  | { type: "diagnostic/push"; questionId: string; recorded: boolean; question?: Diagnostic }
  | { type: "diagnostic/answer"; option: string }
  | { type: "diagnostic/withdraw" }
  | { type: "reset" };

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
  practices: [],
  stars: [],
  rework: {},
  reworkInk: {},
  reworkIndex: 0,
  talked: [],
  reflection: "",
  reportSent: false,
  handedInAt: 0,
  reworkedAt: 0,
  notice: null,
  notAttempted: [],
  appliedAdvances: [],
  diagnostic: null,
  diagnosticAnswers: [],
};

/**
 * A stored snapshot brought up to the current shape: fields added since it was written fall back to
 * their initial value, one level down as well (a warm-up saved before the chooser had no
 * `selected` or `messages`). Anything unreadable is ignored.
 */
export function hydrateSession(raw: unknown): StudentSession {
  const snap = (raw && typeof raw === "object" ? raw : {}) as Partial<StudentSession>;
  const warmup = snap.warmup && typeof snap.warmup === "object" ? snap.warmup : {};
  const overlayRun = snap.overlayRun && typeof snap.overlayRun === "object" ? snap.overlayRun : {};
  // A "low-when" answer saved as a category (before skills were listed) keeps its level with no skills named.
  const c = snap.confidence as ({ level: string; leaves?: unknown } | null | undefined);
  const confidence: Confidence | null = c && c.level === "low-when" && !Array.isArray(c.leaves) ? { level: "low-when", leaves: [] } : ((c ?? null) as Confidence | null);
  return { ...INITIAL_SESSION, ...snap, confidence, warmup: { ...INITIAL_WARMUP, ...warmup }, overlayRun: { ...INITIAL_RUN, ...overlayRun } };
}

/** What the reducer needs from outside the session: the pathway in force. */
export interface SessionEnv {
  pathway: Pathway;
}
export const DEFAULT_ENV: SessionEnv = { pathway: DEFAULT_PATHWAY };

export function sessionReducer(s: StudentSession, a: SessionAction, env: SessionEnv = DEFAULT_ENV): StudentSession {
  switch (a.type) {
    case "hand-in":
      return { ...s, stage: nextStage(env.pathway, "handed-in"), handedInAt: a.at ?? s.handedInAt };
    case "advance/apply": {
      if (s.appliedAdvances.includes(a.id)) return s;
      const applied = { ...s, appliedAdvances: [...s.appliedAdvances, a.id] };
      if (a.kind === "whole-class-start") return applied.stage === "frozen" ? applied : { ...applied, stage: "frozen", prompt: null, overlay: null };
      if (a.kind === "force-submit") {
        if (!BEFORE_HAND_IN.includes(s.stage)) return applied;
        const notAttempted = ASSIGNMENT.problems.map((p) => p.id).filter((id) => (s.lines[id]?.length ?? 0) === 0);
        return {
          ...applied,
          stage: nextStage(env.pathway, "handed-in"),
          handedInAt: a.at ?? s.handedInAt,
          notAttempted,
          prompt: null,
          overlay: null,
          notice: FORCED_HAND_IN_TEXT,
        };
      }
      return applied;
    }
    case "practice/accept":
      return { ...s, practice: "taken", stage: "confidence" };
    case "practice/decline":
      return { ...s, practice: "declined", stage: "confidence" };
    case "confidence/set":
      return { ...s, confidence: a.confidence, stage: s.practice === "taken" ? "warmup-pick" : "working" };
    case "practice/finish":
      return { ...s, stage: "working" };
    case "warmup/select": {
      const on = s.warmup.selected.includes(a.problem);
      return warm(s, { selected: on ? s.warmup.selected.filter((p) => p !== a.problem) : [...s.warmup.selected, a.problem] });
    }
    case "warmup/say": {
      const text = a.text.trim();
      if (!text) return s;
      const messages: WarmupMessage[] = [...s.warmup.messages, { from: "student", text }];
      const reply = tutorReply(text, focusLeaves(s.warmup.selected, messages));
      return warm(s, { messages: [...messages, { from: "tutor", text: reply }] });
    }
    case "warmup/begin":
      return warmupFocus(s).length === 0 ? s : { ...s, stage: "practice" };
    case "run/reveal":
    case "run/stroke":
    case "run/undo":
    case "run/clear":
    case "run/hint":
    case "run/example":
    case "run/example-step":
    case "run/next": {
      const run = runOf(s, a.run);
      const first = runFirst(s, a.run);
      if (!first) return s;
      const next = runReducer(run, a, first);
      return next === run ? s : a.run === "warmup" ? { ...s, warmup: { ...s.warmup, ...next } } : { ...s, overlayRun: next };
    }
    case "warmup/skill-done": {
      if (s.stage !== "practice") return s;
      const last = warmupSequence(warmupFocus(s)).length - 1;
      if (s.warmup.step >= last) return { ...s, stage: "working", warmup: { ...s.warmup, step: last + 1 } };
      return warm(s, { step: s.warmup.step + 1, problem: "first", example: false, exampleShown: 0 });
    }
    case "problem/goto":
      return { ...s, problemIndex: a.index };
    case "line/reveal": {
      const prev = s.lines[a.problem] ?? [];
      const next: StudentSession = { ...s, lines: { ...s.lines, [a.problem]: [...prev, a.line] } };
      const v = evaluateLine(a.problem, a.line.tex);
      const key = `${a.problem}#${prev.length}`;
      if (v.verdict !== "wrong" || s.counted.includes(key)) return next;
      const slipped = v.tags[0].leaf;
      const unsure = notConfidentIn(s.confidence, slipped);
      const r = recordMistake(s.escalation, groupOf(slipped), slipped, unsure ? 1 : 2);
      const leaf = r.trigger ? fundamentalLeaf(r.slipped) : null;
      return {
        ...next,
        escalation: r.state,
        counted: [...s.counted, key],
        prompt: leaf ? { leaf, reason: unsure ? "confidence" : "detected" } : s.prompt,
      };
    }
    case "ink/stroke":
      return { ...s, ink: { ...s.ink, [a.problem]: [...(s.ink[a.problem] ?? []), roundStroke(a.stroke)] } };
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
      // The student asked and chose the skill: straight onto the pad, no prompt in between.
      const r = requestHelp(s.escalation, groupOf(a.leaf));
      const leaf = practiceLeaf(a.leaf);
      if (!leaf) return { ...s, escalation: r.state };
      return { ...s, escalation: r.state, prompt: null, overlay: leaf, overlayRun: INITIAL_RUN, practices: [...s.practices, { leaf, reason: "help", accepted: true, problem: a.problem }] };
    }
    case "prompt/accept":
      if (!s.prompt) return s;
      return { ...s, prompt: null, overlay: s.prompt.leaf, overlayRun: INITIAL_RUN, practices: [...s.practices, { ...s.prompt, accepted: true, problem: a.problem }] };
    case "prompt/decline":
      if (!s.prompt) return s;
      return { ...s, prompt: null, practices: [...s.practices, { ...s.prompt, accepted: false, problem: a.problem }] };
    case "overlay/done":
      return { ...s, overlay: null };
    case "rework/goto":
      return { ...s, reworkIndex: a.index };
    case "rework/reveal":
      return { ...s, rework: { ...s.rework, [a.problem]: [...(s.rework[a.problem] ?? []), a.line] } };
    case "rework/stroke":
      return { ...s, reworkInk: { ...s.reworkInk, [a.problem]: [...(s.reworkInk[a.problem] ?? []), roundStroke(a.stroke)] } };
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
      return { ...s, stage: nextStage(env.pathway, "reworked"), reworkedAt: a.at ?? s.reworkedAt, notice: feedbackSummary(s, "final").sentence };
    }
    case "notice/dismiss":
      return { ...s, notice: null };
    case "freeze":
      return s.stage === "frozen" ? s : { ...s, stage: "frozen", prompt: null, overlay: null };
    case "release":
      return s.stage === "frozen" ? { ...s, stage: "report" } : s;
    case "group/discuss":
      return { ...s, stage: "group-discuss" };
    case "group/talked":
      return { ...s, talked: s.talked.includes(a.problem) ? s.talked.filter((p) => p !== a.problem) : [...s.talked, a.problem] };
    case "group/done":
      return { ...s, stage: nextStage(env.pathway, "group-done") };
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
      return { ...s, stage: a.stage, handedInAt: a.stage === "feedback" && a.at ? a.at : s.handedInAt };
    case "diagnostic/push":
      return { ...s, diagnostic: a.question ? { questionId: a.questionId, recorded: a.recorded, question: a.question } : { questionId: a.questionId, recorded: a.recorded } };
    case "diagnostic/answer":
      if (!s.diagnostic) return s;
      return { ...s, diagnostic: null, diagnosticAnswers: [...s.diagnosticAnswers, { ...s.diagnostic, option: a.option }] };
    case "diagnostic/withdraw":
      return { ...s, diagnostic: null };
    case "history/open":
      return { ...s, stage: "history" };
    case "history/close":
      return { ...s, stage: "report" };
    case "reset":
      return INITIAL_SESSION;
  }
}

const BEFORE_HAND_IN: Stage[] = ["overview", "confidence", "warmup-pick", "practice", "working"];

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

/**
 * True when the student said they are not confident overall, or named a skill in this leaf's group:
 * "Factorising" covers monic and non-monic alike, as the mistake counter does.
 */
export function notConfidentIn(c: Confidence | null, leaf: LeafId): boolean {
  if (!c) return false;
  if (c.level === "low") return true;
  return c.level === "low-when" && c.leaves.some((l) => groupOf(l) === groupOf(leaf));
}
export const FORCED_HAND_IN_TEXT = "Your teacher handed in the class's work.";

const warm = (s: StudentSession, patch: Partial<WarmupState>): StudentSession => ({ ...s, warmup: { ...s.warmup, ...patch } });

/** The run an action is about. */
export const runOf = (s: StudentSession, key: RunKey): PracticeRun => (key === "warmup" ? s.warmup : s.overlayRun);

/** A run's first problem: the warm-up's current step, or the overlay's leaf's practice (null when no overlay is open). */
export function runFirst(s: StudentSession, key: RunKey) {
  if (key === "warmup") return warmupStep(s);
  return s.overlay ? (PRACTICES[s.overlay] ?? null) : null;
}

/** The problem a run is on: its first, or the follow-up. */
export function runProblem(s: StudentSession, key: RunKey) {
  const first = runFirst(s, key);
  if (!first) return null;
  return runOf(s, key).problem === "second" && first.followUp ? first.followUp : first;
}

type RunAction = Extract<SessionAction, { run: RunKey }>;

/** The pad rules for one run, the same for the warm-up and the overlay. Returns the same object when nothing changes. */
function runReducer(r: PracticeRun, a: RunAction, first: { id: string; steps: unknown[]; followUp?: unknown }): PracticeRun {
  const cur = r.problem === "second" && first.followUp ? (first.followUp as { id: string; steps: unknown[] }) : first;
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
    case "run/hint":
      return r.hinted.includes(cur.id) ? r : { ...r, hinted: [...r.hinted, cur.id] };
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
  }
}

/** The leaves the chooser has settled on so far. */
export const warmupFocus = (s: StudentSession): LeafId[] => focusLeaves(s.warmup.selected, s.warmup.messages);

/** The current step's problem (the sequence's last once the warm-up is over). */
export function warmupStep(s: StudentSession) {
  const seq = warmupSequence(warmupFocus(s));
  return seq[Math.min(s.warmup.step, seq.length - 1)];
}

/** The warm-up problem the student is on: the current step's, or its follow-up. */
export function warmupProblem(s: StudentSession) {
  const first = warmupStep(s);
  return s.warmup.problem === "second" && first.followUp ? first.followUp : first;
}

/** Stored to a tenth of a pad pixel: indistinguishable on screen, a third of the bytes. */
function roundStroke(s: Stroke): Stroke {
  return s.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
}

const ORDER: Stage[] = ["overview", "confidence", "warmup-pick", "practice", "working", "feedback", "waiting", "frozen", "rework", "group-pass", "group-discuss", "report", "peers", "history"];

/** Fixed times for deep-linked runs: handed in at 3:48 pm, rework done at 4:07 pm, today. */
const todayAt = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

/** The demo student's answer: not confident when factorising comes up. */
export const DEMO_CONFIDENCE: Confidence = { level: "low-when", leaves: ["algebra.expand-factor.monic"] };

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

/** The scripted run plus the corrected rework of every problem that slipped (Q4 held, so it is left alone), Q4 starred. */
export function reworkedSession(): StudentSession {
  let s = { ...scriptedSession(), stage: "rework" as Stage, stars: ["q4"] };
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
  const i = ORDER.indexOf(stage);
  if (i < 0) return INITIAL_SESSION;
  if (run === "strong" && i >= ORDER.indexOf("feedback")) return { ...strongSession(), stage, stars: [], handedInAt: todayAt(15, 48) };
  if (i >= ORDER.indexOf("group-pass")) return { ...reworkedSession(), stage };
  if (i >= ORDER.indexOf("feedback")) return { ...scriptedSession(), stage };
  return {
    ...INITIAL_SESSION,
    stage,
    practice: i === ORDER.indexOf("warmup-pick") || i === ORDER.indexOf("practice") ? "taken" : i >= ORDER.indexOf("confidence") ? "declined" : null,
    confidence: i >= ORDER.indexOf("warmup-pick") ? DEMO_CONFIDENCE : null,
    // A deep link straight to the pad needs something to warm up on: Q2, monic factorising and fractions, the demo's own worries.
    warmup: i === ORDER.indexOf("practice") ? { ...INITIAL_WARMUP, selected: ["q2"], messages: [{ from: "student", text: "monic factorising and fractions" }] } : INITIAL_WARMUP,
  };
}
