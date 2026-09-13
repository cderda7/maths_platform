import type { Pathway, Stroke } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import type { Diagnostic } from "@/data/diagnostic";
import { ASSIGNMENT } from "@/data/assignment";
import { DEFAULT_GROUPS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { assignmentGroupsOf, moveStudent, seatingOf } from "./seating";
import { attemptsOn, beginRun, checkBoard, currentVisit, isClosed, leaving, visitsOf, type GroupRun, type TurnEvent } from "./groupReview";
import type { ExampleRef } from "./examples";
import { DEFAULT_PATHWAY } from "./pathway";
import type { ReviewedQuestion, ReviewState } from "./review";
import { currentSetId, currentSetTitle } from "./renamedSets";

/**
 * Teacher-owned state shared by every tab: the created assignment and, from later tickets, the
 * pending class advance and the whole-class session. Separate from the student session because
 * the writer and the lifetime differ (the teacher writes once per lesson; the student on every
 * stroke). Pure data plus a reducer, mirrored across tabs by `classroom-store.ts`.
 */
export interface CreatedAssignment {
  title: string;
  /** Ordered ids from the problem bank. */
  problemIds: string[];
  pathway: Pathway;
  /**
   * The skills new on this set (ticket 209), as Create stored them: inferred from the class's last two
   * sets, or as the teacher changed them in the review. Absent in assignments stored before it (and in
   * the student side's own create and the presenter skips): the fixture's list stands (`activeAssignment`).
   * Assignments stored before 209 also carry a `unit` number, no longer read.
   */
  newSkills?: LeafId[];
  createdAt: number;
  /**
   * When the set went live (ticket 188): Create stamps it, a presenter skip past creation sets it
   * well in the past. The classmates' stream counts from it (ticket 189). Absent in assignments
   * stored before it; read through `liveStartedAt` (`lib/assignments`), which falls back to `createdAt`.
   */
  startedAt?: number;
  /** The teacher's goal for the class (ticket 154), as written; absent in assignments stored before it. */
  goal?: string;
  /**
   * The finalised set as the teacher typed and reviewed it (ticket 120), every question whether
   * or not the bank holds it; `problemIds` is the part of it the student side can run.
   */
  questions?: ReviewedQuestion[];
}

/**
 * A teacher-driven move of the whole class, applied by every student tab when the deadline passes.
 * The three `force-*` kinds are the Pathway card's "force submit" for the stage the class is on
 * (ticket 145): the set handed in as it stands, the corrections handed in as they stand (which
 * opens the gate into group review when one is ahead), group review ended where it stands.
 */
export type AdvanceKind = "force-submit" | "force-review" | "force-group" | "whole-class-start";
export interface PendingAdvance {
  id: string;
  kind: AdvanceKind;
  /** ms since epoch; the grace runs until then. */
  deadline: number;
}

/** The universal grace between a teacher advance and its effect. */
export const GRACE_MS = 60_000;
/** An advance whose deadline passed longer ago than this is ignored by a tab that never saw it. */
export const STALE_MS = 60_000;

/** The whole-class review session: chosen problems, chosen examples, and where the board is. */
export type BoardView = "unmarked" | "marked";
/** What a student's pad does during whole-class review: mirror the teacher's writing, or take the student's own. */
export type FollowMode = "frozen" | "write-with-me";
export const FOLLOW_MODE_WORD: Record<FollowMode, string> = { frozen: "screens frozen", "write-with-me": "write with me" };
export interface WholeClassSession {
  problems: string[];
  examples: Record<string, ExampleRef[]>;
  slide: number;
  view: BoardView;
  status: "setup" | "active" | "ended";
  /** The mode per projected problem, seeded from the setup choice; the board can change one at a time. */
  modes: Record<string, FollowMode>;
  /** The teacher's writing per problem, mirrored onto frozen students' pads. */
  ink: Record<string, Stroke[]>;
}

/**
 * One question the teacher typed on the create screen (ticket 119). `text` is what they typed;
 * `stem` and `tex` are the same text read by `parseQuestion` (`lib/mathInput`) into the shape of
 * the student's card: prose with inline maths as `$…$`, and the centred expression or null.
 */
export interface DraftQuestion {
  id: string;
  text: string;
  stem: string;
  tex: string | null;
  /** Read out of a dropped, pasted or uploaded file rather than typed (ticket 171). */
  uploaded?: true;
  /** An uploaded question the teacher has not yet kept: tinted on the create screen with keep and discard; Continue keeps everything. */
  confirmed?: boolean;
  /** The file it was read from: its id in the browser's source store (`lib/sources`), its name, a small thumbnail (a data URL), the page and the sheet's own numbering when the model saw them. */
  sourceId?: string;
  name?: string;
  thumb?: string;
  page?: number;
  label?: string;
  /** A diagram cut from the file (ticket 173): the full crop's id in the source store, and a small copy the tile shows. */
  figureId?: string;
  figureUrl?: string;
}

/** The most a goal for the class can be: one or two sentences, so it fits the student's bubble. */
export const GOAL_MAX = 280;

/** The assignment being created: the create screen writes it, the review screen reads it. */
export interface AssignmentDraft {
  title: string;
  /** The goal for the class as typed, at most `GOAL_MAX` characters; absent in drafts stored before ticket 154. */
  goal?: string;
  questions: DraftQuestion[];
  updatedAt: number;
  /**
   * Set once the teacher pressed "Generate simulated assignment" on the blank create screen
   * (ticket 188); absent, the screen is the blank start. A draft stored before the flag existed
   * opens blank too.
   */
  generated?: true;
}

/**
 * One live diagnostic (ticket 137): pushed from the mistake view to every student's screen, never
 * to the board while it is open. The demo student answers for real; the classmates' answers are
 * a function of the question and the time since the push (`lib/diagnostic`). The run is open
 * until the demo student answers; a withdrawn run is dropped. `board` is the teacher's hand on
 * the projector: "shown" before everyone is in, "cleared" after; unset, the board shows the run
 * on its own once all twenty have answered.
 */
export interface DiagnosticRun {
  questionId: string;
  /** A teacher-written question travels with the push; a fixture is found by id. */
  question?: Diagnostic;
  pushedAt: number;
  /** The demo student's option, once they have answered. */
  answer?: string;
  board?: "shown" | "cleared";
}

export interface ClassroomState {
  assignment: CreatedAssignment | null;
  /** The teacher's draft on the create screen; kept across reloads, cleared by reset. */
  draft?: AssignmentDraft | null;
  /** The review step's decisions about the draft (ticket 120): labels, answers, pathway, the step reached. */
  review?: ReviewState | null;
  advance: PendingAdvance | null;
  wholeClass: WholeClassSession | null;
  /** The class's default seating groups, edited at `/teacher/groups`; absent in older stored state (read through `seatingOf`). */
  groups?: SeatingGroups;
  /**
   * Each assignment's own copy of the groups, by assignment id (ticket 185): frozen from the class
   * defaults when the assignment is created, then edited on that assignment's Groups tab only. An
   * assignment with no entry reads its fixture copy (`assignmentGroupsOf`). Always present once
   * read through `migrateClassroom`; its absence marks a state stored before ticket 185.
   */
  assignmentGroups?: Record<string, SeatingGroups>;
  /** When each student arrived at the gate into group review (ms since epoch); the demo student's anchors the classmates' scripted arrivals. */
  arrivals?: Record<string, number>;
  /** The demo student's group on the shared whiteboard, once group review has begun. */
  group?: GroupRun | null;
  /** Every diagnostic pushed this lesson, oldest first; the last is the current one (open, or the latest result). */
  diagnostics?: DiagnosticRun[];
}

export type ClassroomAction =
  /**
   * `id` names the assignment (Problem Set 6 when absent); its groups are frozen from `groups` or, absent, the class defaults.
   * `at` is the moment of creation (the store stamps it); `startedAt`, when the set went live, is `at` unless given (a skip sets it in the past).
   */
  | { type: "assignment/create"; id?: string; groups?: SeatingGroups; title: string; problemIds: string[]; pathway: Pathway; newSkills?: LeafId[]; goal?: string; questions?: ReviewedQuestion[]; at?: number; startedAt?: number }
  /** The create screen's draft as typed; null clears it. */
  | { type: "draft/set"; draft: AssignmentDraft | null }
  /** The review step's decisions; null clears them. */
  | { type: "review/set"; review: ReviewState | null }
  /** A Groups page: move one student to a colour, in an assignment's own groups when `assignment` is set, else in the class defaults. */
  | { type: "groups/move"; student: string; to: GroupColour; assignment?: string }
  /** Back to the fixture: the class defaults, or with `assignment` that assignment's frozen fixture copy. */
  | { type: "groups/reset"; assignment?: string }
  /** A student reached the gate into group review. Idempotent per student. */
  | { type: "class/arrive"; student: string; at: number }
  /** A link that names the gate or the board starts group review over (ticket 226): no run, and this student not yet arrived, so the intro is read again. */
  | { type: "group/restart"; student: string }
  /** The shared whiteboard. `group/begin` is idempotent: a run already begun is kept. */
  | { type: "group/begin"; members: string[]; problems: string[]; at: number; /** Simulation only: fixed pens by problem (ticket 228). */ pens?: Record<string, string> }
  | { type: "group/stroke"; stroke: Stroke }
  | { type: "group/undo" }
  | { type: "group/clear" }
  /** A line read from the board (kept hidden until the check). */
  | { type: "group/line"; tex: string }
  /** The pen-holder's check; `at` is the moment the standings count from (the store stamps it). */
  | { type: "group/check"; at?: number }
  /** After a problem closes (a correct check, or unsolved on its return): the next visit, or done after the last. */
  | { type: "group/next"; at: number }
  /** After a third wrong check and its pause: leave the problem for now, guarded by the visit's index so two tabs leave once (ticket 222). */
  | { type: "group/leave"; index: number; at: number }
  /** A peer's scripted event, applied once by index. */
  | { type: "group/scripted"; index: number; event: TurnEvent; at?: number }
  /** The teacher ended group review (ticket 145): the run is done where it stands and the race holds at `at`. Idempotent. */
  | { type: "group/end"; at: number }
  | { type: "advance/start"; kind: AdvanceKind; at?: number }
  | { type: "advance/clear" }
  | { type: "wc/setup"; problems: string[]; examples: Record<string, ExampleRef[]>; mode?: FollowMode }
  /** Switch one projected problem's mode from the board. */
  | { type: "wc/mode"; problem: string; mode: FollowMode }
  /** The teacher's pad on the board. */
  | { type: "wc/stroke"; problem: string; stroke: Stroke }
  | { type: "wc/ink-undo"; problem: string }
  | { type: "wc/ink-clear"; problem: string }
  /** Activates the session and starts the whole-class-start grace in one step, so no tab can see one without the other. */
  | { type: "wc/project"; at?: number }
  | { type: "wc/next" }
  | { type: "wc/prev" }
  | { type: "wc/marks"; on: boolean }
  | { type: "wc/end" }
  /** A diagnostic to every student's screen; refused while one is still open. The store stamps `at`. */
  | { type: "diagnostic/push"; questionId: string; question?: Diagnostic; at?: number }
  /** The demo student's answer to the open run. */
  | { type: "diagnostic/answer"; option: string }
  /** Drops the open run: nothing to show anywhere. */
  | { type: "diagnostic/withdraw" }
  /** The teacher's hand on the projector for the latest run: show it now, or clear it. */
  | { type: "diagnostic/board"; on: boolean }
  | { type: "reset" };

export const INITIAL_CLASSROOM: ClassroomState = { assignment: null, advance: null, wholeClass: null, groups: DEFAULT_GROUPS, assignmentGroups: {} };

/**
 * A classroom as stored, read tolerantly. A state saved before assignments kept their own groups
 * (ticket 185) had one set of groups doing both jobs, so Problem Set 6 inherits that set as its
 * frozen copy and it stays the class default too. A state saved before the sets were renamed
 * (ticket 208) names them by their old ids and titles: the groups keyed `pset-2` move to `pset-6`
 * (`pset-1` is Problem Set 1's own id since ticket 211), and the created set and the draft take the new seeded title
 * (`lib/renamedSets.ts`); a title the teacher typed stays theirs. Anything unreadable is a fresh
 * classroom. A state with nothing to change comes back as it is.
 */
export function migrateClassroom(raw: unknown): ClassroomState {
  if (!raw || typeof raw !== "object") return INITIAL_CLASSROOM;
  const stored = raw as ClassroomState;
  const c = stored.assignmentGroups && typeof stored.assignmentGroups === "object" ? stored : { ...stored, assignmentGroups: stored.groups ? { [ASSIGNMENT.id]: stored.groups } : {} };
  return renameSets(c);
}

/** Ticket 208's rename applied to a stored classroom; the same object when it names nothing old. */
function renameSets(c: ClassroomState): ClassroomState {
  const groups = c.assignmentGroups ?? {};
  const oldKeys = Object.keys(groups).filter((id) => currentSetId(id) !== id);
  const title = c.assignment && typeof c.assignment.title === "string" ? currentSetTitle(c.assignment.title) : null;
  const draftTitle = c.draft && typeof c.draft.title === "string" ? currentSetTitle(c.draft.title) : null;
  const assignmentRenamed = c.assignment && title !== null && title !== c.assignment.title;
  const draftRenamed = c.draft && draftTitle !== null && draftTitle !== c.draft.title;
  if (oldKeys.length === 0 && !assignmentRenamed && !draftRenamed) return c;
  // A group copy already under the new id (written after the rename) wins over the old one.
  const renamedGroups = Object.fromEntries(Object.entries(groups).map(([id, g]) => [currentSetId(id), g]));
  for (const [id, g] of Object.entries(groups)) if (currentSetId(id) === id) renamedGroups[id] = g;
  return {
    ...c,
    assignmentGroups: renamedGroups,
    ...(assignmentRenamed && c.assignment ? { assignment: { ...c.assignment, title: title! } } : {}),
    ...(draftRenamed && c.draft ? { draft: { ...c.draft, title: draftTitle! } } : {}),
  };
}

export function classroomReducer(c: ClassroomState, a: ClassroomAction): ClassroomState {
  switch (a.type) {
    case "draft/set":
      return { ...c, draft: a.draft };
    case "review/set":
      return { ...c, review: a.review };
    case "assignment/create":
      return { ...c, assignmentGroups: { ...(c.assignmentGroups ?? {}), [a.id ?? ASSIGNMENT.id]: a.groups ?? seatingOf(c.groups) }, assignment: { title: a.title, problemIds: [...a.problemIds], pathway: [...a.pathway], ...(a.newSkills ? { newSkills: [...a.newSkills] } : {}), createdAt: a.at ?? 0, startedAt: a.startedAt ?? a.at ?? 0, ...(a.goal !== undefined ? { goal: a.goal } : {}), ...(a.questions ? { questions: a.questions.map((q) => ({ ...q })) } : {}) } };
    case "advance/start": {
      const at = a.at ?? 0;
      return { ...c, advance: { id: `${a.kind}@${at}`, kind: a.kind, deadline: at + GRACE_MS } };
    }
    case "advance/clear":
      return { ...c, advance: null };
    case "groups/move":
      if (a.assignment === undefined) return { ...c, groups: moveStudent(seatingOf(c.groups), a.student, a.to) };
      return { ...c, assignmentGroups: { ...(c.assignmentGroups ?? {}), [a.assignment]: moveStudent(assignmentGroupsOf(c, a.assignment), a.student, a.to) } };
    case "groups/reset": {
      if (a.assignment === undefined) return { ...c, groups: DEFAULT_GROUPS };
      const rest = { ...(c.assignmentGroups ?? {}) };
      delete rest[a.assignment];
      return { ...c, assignmentGroups: rest };
    }
    case "class/arrive":
      return c.arrivals?.[a.student] !== undefined ? c : { ...c, arrivals: { ...(c.arrivals ?? {}), [a.student]: a.at } };
    case "group/restart": {
      const arrivals = { ...(c.arrivals ?? {}) };
      delete arrivals[a.student];
      return { ...c, group: null, arrivals };
    }
    case "group/begin":
      return c.group ? c : { ...c, group: beginRun(a.members, a.problems, a.at, undefined, a.pens) };
    case "group/stroke":
    case "group/undo":
    case "group/clear":
    case "group/line":
    case "group/check":
    case "group/next":
    case "group/leave": {
      if (!c.group || c.group.done) return c;
      const next = groupReducer(c.group, a);
      return next === c.group ? c : { ...c, group: next };
    }
    case "group/end":
      return !c.group || c.group.done ? c : { ...c, group: { ...c.group, done: true, endedAt: a.at } };
    case "group/scripted": {
      const g = c.group;
      if (!g || a.index !== g.scriptDone) return c;
      const e = a.event;
      const applied =
        e.kind === "stroke" ? groupReducer(g, { type: "group/stroke", stroke: e.stroke }) : e.kind === "line" ? groupReducer(g, { type: "group/line", tex: e.tex }) : e.kind === "clear" ? groupReducer(g, { type: "group/clear" }) : groupReducer(g, { type: "group/check", at: a.at });
      return { ...c, group: { ...applied, scriptDone: g.scriptDone + 1 } };
    }
    case "wc/setup": {
      const mode = a.mode ?? "frozen";
      return { ...c, wholeClass: { problems: [...a.problems], examples: a.examples, slide: 0, view: "unmarked", status: "setup", modes: Object.fromEntries(a.problems.map((id) => [id, mode])), ink: {} } };
    }
    case "wc/mode":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, modes: { ...(c.wholeClass.modes ?? {}), [a.problem]: a.mode } } } : c;
    case "wc/stroke": {
      const w = c.wholeClass;
      if (!w) return c;
      return { ...c, wholeClass: { ...w, ink: { ...(w.ink ?? {}), [a.problem]: [...(w.ink?.[a.problem] ?? []), a.stroke] } } };
    }
    case "wc/ink-undo": {
      const w = c.wholeClass;
      if (!w) return c;
      return { ...c, wholeClass: { ...w, ink: { ...(w.ink ?? {}), [a.problem]: (w.ink?.[a.problem] ?? []).slice(0, -1) } } };
    }
    case "wc/ink-clear":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, ink: { ...(c.wholeClass.ink ?? {}), [a.problem]: [] } } } : c;
    case "wc/project": {
      if (!c.wholeClass) return c;
      const at = a.at ?? 0;
      return { ...c, wholeClass: { ...c.wholeClass, status: "active", slide: 0, view: "unmarked" }, advance: { id: `whole-class-start@${at}`, kind: "whole-class-start", deadline: at + GRACE_MS } };
    }
    case "wc/next": {
      const w = c.wholeClass;
      if (!w) return c;
      if (w.slide >= w.problems.length - 1) return c;
      return { ...c, wholeClass: { ...w, slide: w.slide + 1, view: "unmarked" } };
    }
    case "wc/prev": {
      const w = c.wholeClass;
      if (!w) return c;
      if (w.view === "marked") return { ...c, wholeClass: { ...w, view: "unmarked" } };
      if (w.slide === 0) return c;
      return { ...c, wholeClass: { ...w, slide: w.slide - 1, view: "marked" } };
    }
    case "wc/marks":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, view: a.on ? "marked" : "unmarked" } } : c;
    case "wc/end":
      return c.wholeClass ? { ...c, wholeClass: { ...c.wholeClass, status: "ended" }, advance: null } : c;
    case "diagnostic/push": {
      const runs = c.diagnostics ?? [];
      if (openDiagnostic(c)) return c;
      const run: DiagnosticRun = { questionId: a.questionId, pushedAt: a.at ?? 0 };
      return { ...c, diagnostics: [...runs, a.question ? { ...run, question: a.question } : run] };
    }
    case "diagnostic/answer": {
      const runs = c.diagnostics ?? [];
      if (!openDiagnostic(c)) return c;
      return { ...c, diagnostics: [...runs.slice(0, -1), { ...runs[runs.length - 1], answer: a.option }] };
    }
    case "diagnostic/withdraw":
      return openDiagnostic(c) ? { ...c, diagnostics: (c.diagnostics ?? []).slice(0, -1) } : c;
    case "diagnostic/board": {
      const runs = c.diagnostics ?? [];
      if (runs.length === 0) return c;
      return { ...c, diagnostics: [...runs.slice(0, -1), { ...runs[runs.length - 1], board: a.on ? "shown" : "cleared" }] };
    }
    case "reset":
      return INITIAL_CLASSROOM;
  }
}

/** The latest diagnostic, open or answered; null before the first push. */
export function latestDiagnostic(c: ClassroomState | null | undefined): DiagnosticRun | null {
  const runs = c?.diagnostics ?? [];
  return runs.length > 0 ? runs[runs.length - 1] : null;
}

/** The diagnostic the demo student has yet to answer, if one is out. Only the latest run can be open. */
export function openDiagnostic(c: ClassroomState | null | undefined): DiagnosticRun | null {
  const run = latestDiagnostic(c);
  return run && run.answer === undefined ? run : null;
}

type GroupAction = Extract<ClassroomAction, { type: `group/${string}` }>;

/** The board's own rules, one problem at a time. Returns the same run when nothing changes. */
function groupReducer(g: GroupRun, a: GroupAction): GroupRun {
  const visit = currentVisit(g);
  if (!visit) return g;
  const problem = visit.problem;
  const closed = isClosed(g, problem);
  // Closed, or holding a third wrong check before leaving: the board takes nothing more on this visit.
  const shut = closed || leaving(g);
  // The next visit's turn: a clean board, and the attempts it starts from.
  const turn = (run: GroupRun, at: number): GroupRun => ({ ...run, index: g.index + 1, strokes: [], lines: [], turnStartedAt: at, scriptDone: 0, turnFrom: attemptsOn(run, visitsOf(run)[g.index + 1]?.problem ?? "").length });
  switch (a.type) {
    case "group/stroke":
      return shut ? g : { ...g, strokes: [...g.strokes, a.stroke] };
    case "group/undo":
      return shut || g.strokes.length === 0 ? g : { ...g, strokes: g.strokes.slice(0, -1), lines: g.lines.slice(0, Math.min(g.lines.length, g.strokes.length - 1)) };
    case "group/clear":
      return shut ? g : { ...g, strokes: [], lines: [] };
    case "group/line":
      return shut ? g : { ...g, lines: [...g.lines, a.tex] };
    case "group/check": {
      if (shut || g.lines.length === 0) return g;
      const { correct } = checkBoard(problem, g.lines);
      const at = a.at ?? g.turnStartedAt;
      const attempt = { lines: g.lines, correct, at };
      const attempts = { ...g.attempts, [problem]: [...(g.attempts[problem] ?? []), attempt] };
      // Wrong on the return: the problem closes unsolved (ticket 222).
      if (!correct && visit.returning) return { ...g, attempts, strokes: [], lines: [], unsolved: [...(g.unsolved ?? []), problem], unsolvedAt: { ...(g.unsolvedAt ?? {}), [problem]: at } };
      // A wrong check wipes the board (ticket 235): the Not yet card holds the attempt, the next one starts on a clean board.
      if (!correct) return { ...g, attempts, strokes: [], lines: [] };
      return { ...g, attempts, resolved: [...g.resolved, problem], resolvedAt: { ...(g.resolvedAt ?? {}), [problem]: at } };
    }
    case "group/next": {
      if (!closed) return g;
      const last = g.index >= visitsOf(g).length - 1;
      return last ? { ...g, done: true } : turn(g, a.at);
    }
    case "group/leave": {
      if (a.index !== g.index || !leaving(g)) return g;
      return turn({ ...g, left: [...(g.left ?? []), problem] }, a.at);
    }
    default:
      return g;
  }
}

export const isProjecting = (c: ClassroomState | null | undefined) => c?.wholeClass?.status === "active";
/** The problem id on the board right now, if projecting. */
export function currentSlide(c: ClassroomState | null | undefined): { problemId: string; view: BoardView; index: number; total: number; mode: FollowMode; teacherInk: Stroke[] } | null {
  const w = c?.wholeClass;
  if (!w || w.status !== "active") return null;
  const problemId = w.problems[w.slide];
  // Older stored sessions have no modes or ink: frozen, nothing written.
  return problemId ? { problemId, view: w.view, index: w.slide, total: w.problems.length, mode: w.modes?.[problemId] ?? "frozen", teacherInk: w.ink?.[problemId] ?? [] } : null;
}

/** True while an advance is counting down. */
export function isPending(c: ClassroomState | null | undefined, now: number): boolean {
  return !!c?.advance && now < c.advance.deadline;
}

/** True once an advance's deadline has passed and it is still fresh enough to apply. */
export function isDue(c: ClassroomState | null | undefined, now: number): boolean {
  return !!c?.advance && now >= c.advance.deadline && now - c.advance.deadline < STALE_MS;
}

/** The pathway in force: the created assignment's, or the build's default. */
export function pathwayOf(c: ClassroomState | null | undefined): Pathway {
  return c?.assignment?.pathway ?? DEFAULT_PATHWAY;
}
