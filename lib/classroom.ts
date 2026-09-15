import type { Pathway, Stroke } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { DEFAULT_GROUPS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { assignmentGroupsOf, moveStudent, seatingOf } from "./seating";
import { beginRun, groupReducer, type BoardAction, type GroupRun, type TurnEvent } from "./groupReview";
import type { ExampleRef } from "./examples";
import { isMarkup, type Markup, type WholeClassInk } from "./markup";
import { DEFAULT_PATHWAY, isValidPathway } from "./pathway";
import type { ReviewedQuestion, ReviewState } from "./review";
import { currentSetId, currentSetTitle } from "./renamedSets";
import { chainReducer, latestRun, liveRun, migrateRun, type ChainAction, type DiagnosticRun } from "./diagnosticChain";
import { absentOf, liveAbsent, withAbsence } from "./absence";
import type { IsoDay } from "./dueDate";
import type { CreateKind } from "./createPipeline";
import { answerPathway, decisionsReducer, type DecisionAction, type LessonDecision } from "./decisionState";

export type { DiagnosticRun } from "./diagnosticChain";

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
  /** The review pathway: chosen at Create, and changed from the decision card during the lesson (ticket 336), which rewrites it here. */
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
  /**
   * The day the set is due (ticket 289), as the teacher picked it beside the title on Questions. Absent when a presenter
   * skip or a deep link sent the set (and in assignments stored before it): the fixture's day stands (`activeAssignment`).
   */
  due?: IsoDay;
}

/**
 * A homework the teacher created and sent (ticket 291): the ten problems everyone does, as Refine left them, and its due
 * date. It joins the class's homeworks after the fixtures' Homework 1 and 2 (`classHomeworks` in `lib/homeworks.ts`), so
 * the sets it covers follow from its due date by the same rule. Sending it starts no lesson and touches no set's run.
 */
export interface SentHomework {
  /** `hw-<n>`, as the fixtures' ids. */
  id: string;
  /** Its number in the class's run of homeworks: 3 for the first one sent after the fixtures'. */
  n: number;
  /** As the teacher titled it on Questions ("Homework 3"). */
  name: string;
  due: IsoDay;
  /** The teacher's ten, as Refine left them. */
  questions: ReviewedQuestion[];
  sentAt: number;
  /**
   * When it opened to the students and its contents froze (ticket 292, `openHomeworks` in `lib/homeworks.ts`): the moment
   * the last lesson among its sets ended (the lesson's `lessonEndedAt`, never before `sentAt`), so every tab stamps the same.
   * Absent while it waits in Sam's Future panel; a set due inside an open homework's window goes to the next one.
   */
  openedAt?: number;
  /** The sets it covers, frozen with `openedAt`, oldest due first. */
  setIds?: string[];
}

/**
 * A teacher-driven move of the whole class, applied by every student tab when the deadline passes.
 * The three `force-*` kinds are the pathway strip's "force submit" (ticket 334) for the stage the class is on
 * (ticket 145): the set handed in as it stands, the corrections handed in as they stand (which
 * opens the gate into group review when one is ahead), group review ended where it stands.
 * `end-lesson` is the card's "end lesson" on a last stage that is not class review (ticket 273): every student still in
 * the lesson lands on their report with their work as it stands, and the lesson ends (`lesson/end`).
 */
export type AdvanceKind = "force-submit" | "force-review" | "force-group" | "whole-class-start" | "end-lesson";
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
  /** The teacher's writing per problem in drawing order: pad strokes, mirrored onto frozen students' pads, and marks pinned over the slide (ticket 330), shown on every student's. */
  ink: Record<string, WholeClassInk[]>;
  /**
   * The furthest slide the board has shown (ticket 282): 0 once projected, raised by every Next. Absent until the session is
   * projected (and in sessions stored before it). What class review covered is `problems` up to it (`boardCovered`).
   */
  reached?: number;
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
  /** The due date picked beside the title (ticket 289); absent, the picker starts at the kind's default (`DUE_DEFAULT`). */
  due?: IsoDay;
}

export interface ClassroomState {
  assignment: CreatedAssignment | null;
  /** The teacher's draft on the create screen; kept across reloads, cleared by reset. */
  draft?: AssignmentDraft | null;
  /** The review step's decisions about the draft (ticket 120): labels, answers, pathway, the step reached. */
  review?: ReviewState | null;
  /** +Homework's draft and its review (ticket 291), kept apart from the in-class set's so either can be under way while the other is. */
  homeworkDraft?: AssignmentDraft | null;
  homeworkReview?: ReviewState | null;
  /** The homeworks the teacher has sent (ticket 291), oldest first; absent until the first. Reset demo clears them. */
  homeworks?: SentHomework[];
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
  /** Every diagnostic chain sent this lesson (ticket 241), oldest first; the last is the one out, if any is (`lib/diagnosticChain`). */
  diagnostics?: DiagnosticRun[];
  /**
   * The students marked absent, by assignment id (ticket 250), in the order marked. An assignment with no entry reads the
   * demo's list (`absentOf`, `data/absences.ts`: Chloe on Problem Set 6), so unmarking her stores an empty list.
   */
  absences?: Record<string, readonly string[]>;
  /**
   * When the lesson was brought to its end whatever its pathway (ticket 263): every stage over, none current (`lessonOver`).
   * The teacher's "end lesson" stamps it when its grace runs out (`lesson/end`, ticket 273), on a pathway whose last stage is
   * not class review; the presenter's "activity completed" stamps it too. Class review's own End still ends a lesson through
   * `wholeClass.status`. Absent until then; a new set sent (`assignment/create`) clears it.
   */
  lessonEndedAt?: number;
  /**
   * Simulation only (ticket 295): when the teacher first pressed +Homework in this demo. From then on the presenter's skip lists
   * offer "send homework" and "homework open" (`homeworkSkipsShown` in `lib/demo.ts`); absent on a fresh demo, cleared by Reset
   * demo, kept by everything else (a new lesson, "send assignment", Sam's skips).
   */
  homeworkStartedAt?: number;
  /**
   * What the teacher did about the lesson's decisions (ticket 335, `lib/decisionState.ts`), in the order they came due: the
   * decision card kept, tucked into its dot, or answered. Which decision is due is derived (`lessonDecision` in `lib/decision.ts`).
   * Absent until the first comes due; a new lesson starts without them.
   */
  decisions?: readonly LessonDecision[];
}

/** The lesson's own state, which a newly sent set starts without (ticket 263): the gate, the whiteboard, the chains, class review, the end, the decisions (ticket 335). */
const LESSON_KEYS = ["arrivals", "group", "diagnostics", "lessonEndedAt", "decisions"] as const;

/** The classroom as a new lesson starts it: the lesson's own state gone, the class's (seating, absences, the draft) kept. */
function newLesson(c: ClassroomState): ClassroomState {
  const next: ClassroomState = { ...c, advance: null, wholeClass: null };
  for (const k of LESSON_KEYS) delete next[k];
  return next;
}

/**
 * The classroom with no set out and no lesson under way (ticket 272), the class's own state (seating, absences) kept.
 * Simulation only: nothing in the product takes a sent set back; the presenter's "send assignment" puts the demo back
 * before its Create so the moment of sending can be shown again (`teacherSkip` in `lib/demo.ts`).
 */
export const unsent = (c: ClassroomState): ClassroomState => ({ ...newLesson(c), assignment: null });

export type ClassroomAction =
  /**
   * `id` names the assignment (Problem Set 6 when absent); its groups are frozen from `groups` or, absent, the class defaults.
   * `at` is the moment of creation (the store stamps it); `startedAt`, when the set went live, is `at` unless given (a skip sets it in the past).
   * A set sent starts a new lesson (ticket 263): whatever an earlier lesson left (its gate, whiteboard, chains, class review, end) goes.
   */
  | { type: "assignment/create"; id?: string; groups?: SeatingGroups; title: string; problemIds: string[]; pathway: Pathway; newSkills?: LeafId[]; goal?: string; questions?: ReviewedQuestion[]; due?: IsoDay; at?: number; startedAt?: number }
  /** The create screen's draft as typed; null clears it. `kind` names whose draft (an in-class set's when absent, ticket 291). */
  | { type: "draft/set"; draft: AssignmentDraft | null; kind?: CreateKind }
  /** The review step's decisions; null clears them. `kind` as for `draft/set`. */
  | { type: "review/set"; review: ReviewState | null; kind?: CreateKind }
  /** +Homework pressed (ticket 295, simulation only): the first press is stamped; later ones change nothing. */
  | { type: "homework/start"; at: number }
  /** +Homework's Create (ticket 291): the homework joins the class's list. Idempotent by id; nothing else in the classroom changes. */
  | { type: "homework/send"; homework: SentHomework }
  /** A Groups page: move one student to a colour, in an assignment's own groups when `assignment` is set, else in the class defaults. */
  | { type: "groups/move"; student: string; to: GroupColour; assignment?: string }
  /** Back to the fixture: the class defaults, or with `assignment` that assignment's frozen fixture copy. */
  | { type: "groups/reset"; assignment?: string }
  /** A student reached the gate into group review. Idempotent per student. */
  | { type: "class/arrive"; student: string; at: number }
  /** A link that names the gate or the board starts group review over (ticket 226): no run, and this student not yet arrived, so the intro is read again. */
  | { type: "group/restart"; student: string }
  /** The shared whiteboard. `group/begin` is idempotent: a run already begun is kept. */
  | { type: "group/begin"; members: string[]; problems: string[]; at: number; /** Simulation only: fixed pens by problem (ticket 228). */ pens?: Record<string, string>; /** Simulation only: each problem's scripted tries, chosen for the table by the rule (ticket 332). */ scripts?: Record<string, string[][]> }
  | BoardAction
  /** A peer's scripted event, applied once by index. */
  | { type: "group/scripted"; index: number; event: TurnEvent; at?: number }
  /** The teacher ended group review (ticket 145): the run is done where it stands and the race holds at `at`. Idempotent. */
  | { type: "group/end"; at: number }
  | { type: "advance/start"; kind: AdvanceKind; at?: number }
  | { type: "advance/clear" }
  /**
   * The teacher's "end lesson" took effect (ticket 273): `lessonEndedAt` stamped at `at` (the grace's deadline, so every tab
   * that applies it stamps the same moment) and a group run still going ended where it stands. Idempotent: an ended lesson keeps its moment.
   */
  | { type: "lesson/end"; at: number }
  | { type: "wc/setup"; problems: string[]; examples: Record<string, ExampleRef[]>; mode?: FollowMode }
  /** Switch one projected problem's mode from the board. */
  | { type: "wc/mode"; problem: string; mode: FollowMode }
  /** The teacher's pad on the board. */
  | { type: "wc/stroke"; problem: string; stroke: WholeClassInk }
  | { type: "wc/ink-undo"; problem: string }
  | { type: "wc/ink-clear"; problem: string }
  /** Activates the session and starts the whole-class-start grace in one step, so no tab can see one without the other. */
  | { type: "wc/project"; at?: number }
  | { type: "wc/next" }
  | { type: "wc/prev" }
  | { type: "wc/marks"; on: boolean }
  | { type: "wc/end" }
  /** The Class View roster's toggle (ticket 250): a student marked absent on an assignment, or back in the room. Idempotent. */
  | { type: "absence/set"; assignment: string; student: string; absent: boolean }
  /** The live diagnostic chain (ticket 241): push, answer, force submit and cancel, next question, done, withdraw. */
  | ChainAction
  /** The decision card (ticket 335): raised, tucked into its dot, opened again, answered; an answer with a pathway changes the assignment's (ticket 336). */
  | DecisionAction
  | { type: "reset" };

export const INITIAL_CLASSROOM: ClassroomState = { assignment: null, advance: null, wholeClass: null, groups: DEFAULT_GROUPS, assignmentGroups: {} };

/**
 * A classroom as stored, read tolerantly. A state saved before assignments kept their own groups
 * (ticket 185) had one set of groups doing both jobs, so Problem Set 6 inherits that set as its
 * frozen copy and it stays the class default too. A state saved before the sets were renamed
 * (ticket 208) names them by their old titles: the created set and the draft take the new seeded title
 * (`pset-1` and `pset-2` are Problem Sets 1 and 2's own ids since tickets 211 and 212, so no group key moves)
 * (`lib/renamedSets.ts`); a title the teacher typed stays theirs. Anything unreadable is a fresh
 * classroom. A state with nothing to change comes back as it is.
 */
export function migrateClassroom(raw: unknown): ClassroomState {
  if (!raw || typeof raw !== "object") return INITIAL_CLASSROOM;
  const stored = raw as ClassroomState;
  const grouped = stored.assignmentGroups && typeof stored.assignmentGroups === "object" ? stored : { ...stored, assignmentGroups: stored.groups ? { [ASSIGNMENT.id]: stored.groups } : {} };
  return renameSets(chainRuns(grouped));
}

/** Diagnostic runs stored before ticket 241 (one question each) read as ended chains of one; the same object when there are none. */
function chainRuns(c: ClassroomState): ClassroomState {
  const runs = Array.isArray(c.diagnostics) ? c.diagnostics : [];
  const migrated = runs.map(migrateRun);
  return migrated.every((r, i) => r === runs[i]) ? c : { ...c, diagnostics: migrated };
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
      return a.kind === "homework" ? { ...c, homeworkDraft: a.draft } : { ...c, draft: a.draft };
    case "review/set":
      return a.kind === "homework" ? { ...c, homeworkReview: a.review } : { ...c, review: a.review };
    case "homework/start":
      return c.homeworkStartedAt !== undefined ? c : { ...c, homeworkStartedAt: a.at };
    case "homework/send":
      return c.homeworks?.some((h) => h.id === a.homework.id) ? c : { ...c, homeworks: [...(c.homeworks ?? []), { ...a.homework, questions: a.homework.questions.map((q) => ({ ...q })) }] };
    case "assignment/create":
      return { ...newLesson(c), assignmentGroups: { ...(c.assignmentGroups ?? {}), [a.id ?? ASSIGNMENT.id]: a.groups ?? seatingOf(c.groups) }, assignment: { title: a.title, problemIds: [...a.problemIds], pathway: [...a.pathway], ...(a.newSkills ? { newSkills: [...a.newSkills] } : {}), createdAt: a.at ?? 0, startedAt: a.startedAt ?? a.at ?? 0, ...(a.goal !== undefined ? { goal: a.goal } : {}), ...(a.questions ? { questions: a.questions.map((q) => ({ ...q })) } : {}), ...(a.due !== undefined ? { due: a.due } : {}) } };
    case "advance/start": {
      const at = a.at ?? 0;
      return { ...c, advance: { id: `${a.kind}@${at}`, kind: a.kind, deadline: at + GRACE_MS } };
    }
    case "advance/clear":
      return { ...c, advance: null };
    case "lesson/end": {
      if (lessonOver(c)) return c;
      const group = c.group && !c.group.done ? { ...c.group, done: true, endedAt: a.at } : c.group;
      return { ...c, lessonEndedAt: a.at, ...(group !== c.group ? { group } : {}) };
    }
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
      return c.group ? c : { ...c, group: beginRun(a.members, a.problems, a.at, undefined, a.pens, a.scripts) };
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
      return { ...c, wholeClass: { ...c.wholeClass, status: "active", slide: 0, view: "unmarked", reached: Math.max(c.wholeClass.reached ?? 0, 0) }, advance: { id: `whole-class-start@${at}`, kind: "whole-class-start", deadline: at + GRACE_MS } };
    }
    case "wc/next": {
      const w = c.wholeClass;
      if (!w) return c;
      if (w.slide >= w.problems.length - 1) return c;
      return { ...c, wholeClass: { ...w, slide: w.slide + 1, view: "unmarked", reached: Math.max(w.reached ?? w.slide, w.slide + 1) } };
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
    case "absence/set": {
      // The demo student on the live set is on his iPad, so in the room (`canMarkAbsent`).
      if (a.absent && a.assignment === ASSIGNMENT.id && a.student === DEMO_STUDENT.id) return c;
      const list = absentOf(c, a.assignment);
      const next = withAbsence(list, a.student, a.absent);
      return next === list ? c : { ...c, absences: { ...(c.absences ?? {}), [a.assignment]: next } };
    }
    case "diagnostic/push":
    case "diagnostic/answer":
    case "diagnostic/force":
    case "diagnostic/force-cancel":
    case "diagnostic/next":
    case "diagnostic/end":
    case "diagnostic/withdraw": {
      const runs = c.diagnostics ?? [];
      const next = chainReducer(runs, a, liveAbsent(c));
      return next === runs ? c : { ...c, diagnostics: next };
    }
    case "decision/raise":
    case "decision/tuck":
    case "decision/reopen":
    case "decision/answer": {
      const next = decisionsReducer(c.decisions, a);
      if (next === c.decisions) return c;
      // The answer that settles the decision writes its pathway in the same step (ticket 336): the strips, the cards and every
      // student's next transition read `pathwayOf`. A later answer to a decision already answered changed nothing above.
      const pathway = a.type === "decision/answer" ? answerPathway(a.answer) : null;
      if (!pathway || !c.assignment || !isValidPathway(pathway)) return { ...c, decisions: next };
      return { ...c, decisions: next, assignment: { ...c.assignment, pathway: [...pathway] } };
    }
    case "reset":
      return INITIAL_CLASSROOM;
  }
}

/** A kind's draft on the create flow (ticket 291): an in-class set's is `draft`, a homework's `homeworkDraft`. */
export const draftFor = (c: ClassroomState | null | undefined, kind: CreateKind): AssignmentDraft | null => (kind === "homework" ? c?.homeworkDraft : c?.draft) ?? null;

/** A kind's review decisions, as stored (read them through `reviewFor` against the draft). */
export const reviewStateFor = (c: ClassroomState | null | undefined, kind: CreateKind): ReviewState | null => (kind === "homework" ? c?.homeworkReview : c?.review) ?? null;

/** The latest diagnostic chain, out or ended; null before the first push. */
export const latestDiagnostic = (c: ClassroomState | null | undefined): DiagnosticRun | null => latestRun(c?.diagnostics);

/** The diagnostic chain that is out (ticket 241), if one is: sent and neither done nor withdrawn. */
export const liveDiagnostic = (c: ClassroomState | null | undefined): DiagnosticRun | null => liveRun(c?.diagnostics);

export const isProjecting = (c: ClassroomState | null | undefined) => c?.wholeClass?.status === "active";

/** Whether the lesson is over, every stage of its pathway behind the class: class review ended, or the lesson ended outright (`lessonEndedAt`, ticket 263). */
export const lessonOver = (c: ClassroomState | null | undefined): boolean => c?.wholeClass?.status === "ended" || c?.lessonEndedAt !== undefined;
/**
 * What class review covered on the live set (ticket 282), once it is over: the problems the board actually showed, in the
 * order shown, from the first slide to the furthest the teacher reached (`reached`). Null while class review has not
 * happened: no session, still being set up or projected, or ended without ever being projected. The report's "Covered in
 * class review" column shows only then, so its tiles move out of Incorrect once, at the board's End.
 */
export function boardCovered(c: ClassroomState | null | undefined): string[] | null {
  const w = c?.wholeClass;
  if (!w || w.status !== "ended" || w.reached === undefined) return null;
  return w.problems.slice(0, w.reached + 1);
}

/** The problem id on the board right now, if projecting. */
export function currentSlide(c: ClassroomState | null | undefined): { problemId: string; view: BoardView; index: number; total: number; mode: FollowMode; teacherInk: Stroke[]; markup: Markup[]; inkCount: number } | null {
  const w = c?.wholeClass;
  if (!w || w.status !== "active") return null;
  const problemId = w.problems[w.slide];
  if (!problemId) return null;
  // Older stored sessions have no modes or ink: frozen, nothing written.
  const { pad, marks, count } = splitInk(w.ink?.[problemId] ?? NO_INK);
  return { problemId, view: w.view, index: w.slide, total: w.problems.length, mode: w.modes?.[problemId] ?? "frozen", teacherInk: pad, markup: marks, inkCount: count };
}

const NO_INK: WholeClassInk[] = [];
const SPLIT = new WeakMap<WholeClassInk[], { pad: Stroke[]; marks: Markup[]; count: number }>();

/** One problem's ink as the pad's strokes and the slide's marks; the same arrays for the same ink, so a pad or overlay that redraws on a new array only redraws on new ink. */
function splitInk(ink: WholeClassInk[]): { pad: Stroke[]; marks: Markup[]; count: number } {
  let split = SPLIT.get(ink);
  if (!split) {
    split = { pad: ink.filter((i): i is Stroke => !isMarkup(i)), marks: ink.filter(isMarkup), count: ink.length };
    SPLIT.set(ink, split);
  }
  return split;
}

/** True while an advance is counting down. */
export function isPending(c: ClassroomState | null | undefined, now: number): boolean {
  return !!c?.advance && now < c.advance.deadline;
}

/** True while the teacher's "end lesson" counts down (ticket 273). */
export const isEnding = (c: ClassroomState | null | undefined, now: number): boolean => isPending(c, now) && c?.advance?.kind === "end-lesson";

/**
 * True while an "end lesson" is still to be applied to a student's session (`applied`, its applied advance ids): counting down, or
 * due and fresh. The student tab holds back its own group done meanwhile, since the teacher's tab may end the run (`lesson/end`)
 * a tick before this tab's clock reaches the deadline, and the advance, not group done, lands the student on the report (ticket 273).
 */
export const endLessonAwaited = (c: ClassroomState | null | undefined, applied: readonly string[], now: number): boolean =>
  c?.advance?.kind === "end-lesson" && !applied.includes(c.advance.id) && now - c.advance.deadline < STALE_MS;

/** True once an advance's deadline has passed and it is still fresh enough to apply. */
export function isDue(c: ClassroomState | null | undefined, now: number): boolean {
  return !!c?.advance && now >= c.advance.deadline && now - c.advance.deadline < STALE_MS;
}

/** The pathway in force: the created assignment's, or the build's default. */
export function pathwayOf(c: ClassroomState | null | undefined): Pathway {
  return c?.assignment?.pathway ?? DEFAULT_PATHWAY;
}
