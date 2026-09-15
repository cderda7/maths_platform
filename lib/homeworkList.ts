import type { FigureId, Problem } from "@/data/types";
import type { SimilarProblem } from "@/data/homework";
import { SAM_HOMEWORK_STORY, type HomeworkDef, type HomeworkRecord } from "@/data/homeworks";
import type { LeafId } from "@/data/taxonomy";
import { activeAssignment } from "./assignment";
import { assignmentBundle, LIVE_ASSIGNMENT_ID } from "./assignments";
import type { ClassroomState } from "./classroom";
import { dayLabel, DEMO_TODAY, dueOrder } from "./dueDate";
import { everWrong, similarFor } from "./homework";
import { classHomeworks, homeworkSets, homeworkStatus, openHomeworksFor } from "./homeworks";
import { primarySkill } from "./problemSkill";
import { recordReviews, sessionReviews, type Reviews } from "./report";
import type { StudentSession } from "./session";

/**
 * What Sam's homework holds, as its screen lists it (ticket 293; DECISION_LOG.md 2026-09-15): first **his own problems**, every
 * problem he ever got wrong on the sets the homework covers (ticket 256's `everWrong`), each as its similar problem, grouped by
 * the set it came from, newest set first; then **Everyone**, the teacher's ten as Refine left them.
 *
 * A pipeline of small steps:
 *
 *   ownSets (the homework's own sets, newest first)  +  missedBefore → leftovers (ticket 294: the missed homework before it)
 *     → ownProblems (each set's ever-wrong problems with their similar problems and their one skill, in group order)
 *     → carryOver (ticket 294: a leftover whose skill his own problems here already have is dropped, the newer kept)
 *     → groupBySet (own sets then the missed homework's, newest first; empty groups omitted)
 *   everyone (the sent homework's questions)
 *
 * Ticket 294 (DECISION_LOG.md 2026-09-15): a missed homework's undone **own** problems join the next homework when it opens;
 * its teacher's ten never do. "They're already penalised by the missing assignment": a leftover whose skill (`primarySkill`) one
 * of this homework's own problems already has is a duplicate and stays out, and so is a second leftover on a skill an earlier
 * (newer set's) leftover already carries. This homework's own problems never knock each other out, and the teacher's ten are
 * never compared. Carried problems sit under their own set's name like any other, with no mark of where they came from.
 *
 * Where his reviews come from, as his report on the set reads them (`lib/studentReport.ts`): a finished set's handed-in record
 * (`AssignmentBundle.sam`), the live set's (Problem Set 6's) session. The session is read as it stands: a homework opens only
 * once every covered set's lesson is over, and from then on no stage writes a first submission or a rework, so it is the session
 * the homework froze with. Pure: the classroom and the session come in.
 */

/** One set his own problems come from. */
export interface OwnSet {
  id: string;
  /** "Problem Set 6". */
  name: string;
  due: string;
}

/** A problem he ever got wrong, with the similar problem the homework gives him in its place. */
export interface OwnProblem {
  setId: string;
  problem: Problem;
  similar: SimilarProblem;
  /** The problem's one skill (`primarySkill`), what a duplicate is judged by; undefined for a problem no set names. */
  skill: LeafId | undefined;
}

/** One question as the homework screen shows it: the whole question (stem, then expression), never an original's. */
export interface HomeworkItem {
  /** Unique on the screen: `own-<problem id>` or `everyone-<question id>`. */
  key: string;
  /** Its number in the homework, counting on from his own problems into Everyone: the order he does them in. */
  n: number;
  /** The words, with any inline maths between `$` signs (a typed question's stem). */
  stem: string;
  /** The expression after the words; null when the question is words alone. */
  tex: string | null;
  figure?: FigureId;
  /** A diagram cut from a file the teacher uploaded (a data URL). */
  figureUrl?: string;
}

export interface HomeworkGroup {
  setId: string;
  name: string;
  items: HomeworkItem[];
}

export interface HomeworkList {
  id: string;
  name: string;
  due: string;
  /** "From your mistakes": one group per set with something in it, newest set first. */
  own: HomeworkGroup[];
  /** "Everyone": the teacher's questions. */
  everyone: HomeworkItem[];
}

/** The sets a homework's own problems come from, newest due first: the sets it froze at opening. */
export function ownSets(homeworkId: string, c: ClassroomState | null | undefined): OwnSet[] {
  const hw = classHomeworks(c).find((h) => h.id === homeworkId);
  if (!hw?.setIds) return [];
  const sets = homeworkSets(c);
  return hw.setIds
    .flatMap((id) => sets.filter((s) => s.id === id))
    .map(({ id, name, due }) => ({ id, name, due }))
    .sort((a, b) => dueOrder(b.due) - dueOrder(a.due));
}

/** A set's problems and Sam's reviews on them: the live set's from his session, a finished set's from his handed-in record. */
function samOn(setId: string, c: ClassroomState | null | undefined, session: StudentSession): { problems: Problem[]; reviews: Reviews } | null {
  if (setId === LIVE_ASSIGNMENT_ID) {
    const problems = assignmentBundle(setId, c)?.problems ?? activeAssignment(c).problems;
    return { problems, reviews: sessionReviews(session, null, problems) };
  }
  const set = assignmentBundle(setId, c);
  return set?.sam ? { problems: set.problems, reviews: recordReviews(set.sam, set.problems) } : null;
}

/** The problems Sam ever got wrong on a set, in set order. */
export function everWrongOn(setId: string, c: ClassroomState | null | undefined, session: StudentSession): Problem[] {
  const on = samOn(setId, c, session);
  return on ? on.problems.filter((p) => everWrong(p.id, on.reviews[p.id])) : [];
}

/** Every set's ever-wrong problems with their similar problems, sets in the order given, problems in set order. A problem without a similar one is left out (a test keeps Sam's covered). */
export function ownProblems(sets: readonly OwnSet[], c: ClassroomState | null | undefined, session: StudentSession): OwnProblem[] {
  return sets.flatMap((s) =>
    everWrongOn(s.id, c, session).flatMap((problem) => {
      const similar = similarFor(problem.id);
      return similar ? [{ setId: s.id, problem, similar, skill: primarySkill(problem.id) }] : [];
    }),
  );
}

/** The homework just before this one, when Sam missed it (ticket 290's `homeworkStatus`); null when he did it or there is none. */
export function missedBefore(homeworkId: string, c: ClassroomState | null | undefined, records: Readonly<Record<string, HomeworkRecord>> = SAM_HOMEWORK_STORY, today: string = dayLabel(DEMO_TODAY)): HomeworkDef | null {
  const list = classHomeworks(c);
  const before = list[list.findIndex((h) => h.id === homeworkId) - 1];
  return before && homeworkStatus(before, records[before.id], today) === "missed" ? before : null;
}

/**
 * A missed homework's leftovers (ticket 294): its own problems he never did, each with its similar problem, newest set first.
 * The record keeps no problem-by-problem progress, only the day it was all done: a homework finished late (missed, all done)
 * leaves nothing, one never finished leaves all of its own problems. Its teacher's ten are never among them.
 */
export function leftovers(missed: HomeworkDef, c: ClassroomState | null | undefined, session: StudentSession, records: Readonly<Record<string, HomeworkRecord>> = SAM_HOMEWORK_STORY): { sets: OwnSet[]; problems: OwnProblem[] } {
  if (records[missed.id]?.finishedOn) return { sets: [], problems: [] };
  const sets = ownSets(missed.id, c);
  return { sets, problems: ownProblems(sets, c, session) };
}

/**
 * The leftovers that carry (ticket 294), in their order: each whose skill neither this homework's own problems nor an earlier
 * leftover already has. Leftovers come newest set first, so on a skill two share the newer set's stays. A leftover with no skill
 * named is never a duplicate. Pure.
 */
export function carryOver(left: readonly OwnProblem[], own: readonly OwnProblem[]): OwnProblem[] {
  const held = new Set(own.flatMap((p) => (p.skill ? [p.skill] : [])));
  return left.filter((p) => {
    if (!p.skill) return true;
    if (held.has(p.skill)) return false;
    held.add(p.skill);
    return true;
  });
}

/** His own problems under their sets, in the sets' order, a set with none left out; numbered from `from`. */
export function groupBySet(sets: readonly OwnSet[], problems: readonly OwnProblem[], from = 1): HomeworkGroup[] {
  let n = from;
  return sets.flatMap((s) => {
    const items = problems.filter((p) => p.setId === s.id).map(({ problem, similar }): HomeworkItem => ({ key: `own-${problem.id}`, n: n++, stem: similar.stem, tex: similar.tex, ...(similar.figure ? { figure: similar.figure } : {}) }));
    return items.length ? [{ setId: s.id, name: s.name, items }] : [];
  });
}

/**
 * Sam's list on an open homework, or null when the homework is not open for him (not sent, still in the Future panel, completed
 * or missed): only an open homework has a screen.
 */
export function homeworkList(homeworkId: string, c: ClassroomState | null | undefined, session: StudentSession, records: Readonly<Record<string, HomeworkRecord>> = SAM_HOMEWORK_STORY, today: string = dayLabel(DEMO_TODAY)): HomeworkList | null {
  const hw = openHomeworksFor(c, records, today).find((h) => h.id === homeworkId);
  if (!hw) return null;
  const sets = ownSets(hw.id, c);
  const mine = ownProblems(sets, c, session);
  const missed = missedBefore(hw.id, c, records, today);
  const left = missed ? leftovers(missed, c, session, records) : { sets: [], problems: [] };
  const own = groupBySet([...sets, ...left.sets], [...mine, ...carryOver(left.problems, mine)]);
  let n = own.reduce((k, g) => k + g.items.length, 0) + 1;
  const questions = c?.homeworks?.find((h) => h.id === hw.id)?.questions ?? [];
  const everyone = questions.map((q): HomeworkItem => ({ key: `everyone-${q.id}`, n: n++, stem: q.stem, tex: q.tex, ...(q.figureUrl ? { figureUrl: q.figureUrl } : {}) }));
  return { id: hw.id, name: hw.name, due: hw.due, own, everyone };
}
