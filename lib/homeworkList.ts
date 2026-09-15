import type { FigureId, Problem } from "@/data/types";
import type { SimilarProblem } from "@/data/homework";
import { activeAssignment } from "./assignment";
import { assignmentBundle, LIVE_ASSIGNMENT_ID } from "./assignments";
import type { ClassroomState } from "./classroom";
import { dueOrder } from "./dueDate";
import { everWrong, similarFor } from "./homework";
import { classHomeworks, homeworkSets, openHomeworksFor } from "./homeworks";
import { recordReviews, sessionReviews, type Reviews } from "./report";
import type { StudentSession } from "./session";

/**
 * What Sam's homework holds, as its screen lists it (ticket 293; DECISION_LOG.md 2026-09-15): first **his own problems**, every
 * problem he ever got wrong on the sets the homework covers (ticket 256's `everWrong`), each as its similar problem, grouped by
 * the set it came from, newest set first; then **Everyone**, the teacher's ten as Refine left them.
 *
 * A pipeline of small steps, so ticket 294 can add to it without rewriting it:
 *
 *   ownSets (the sets his problems come from, newest first)   ◄ 294 adds a missed homework's sets here
 *     → ownProblems (each set's ever-wrong problems with their similar problems, in group order)
 *     → [294: dedupe by skill among his own, the newer set's kept]
 *     → groupBySet (empty groups omitted)
 *   everyone (the sent homework's questions)
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
      return similar ? [{ setId: s.id, problem, similar }] : [];
    }),
  );
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
export function homeworkList(homeworkId: string, c: ClassroomState | null | undefined, session: StudentSession): HomeworkList | null {
  const hw = openHomeworksFor(c).find((h) => h.id === homeworkId);
  if (!hw) return null;
  const sets = ownSets(hw.id, c);
  const own = groupBySet(sets, ownProblems(sets, c, session));
  let n = own.reduce((k, g) => k + g.items.length, 0) + 1;
  const questions = c?.homeworks?.find((h) => h.id === hw.id)?.questions ?? [];
  const everyone = questions.map((q): HomeworkItem => ({ key: `everyone-${q.id}`, n: n++, stem: q.stem, tex: q.tex, ...(q.figureUrl ? { figureUrl: q.figureUrl } : {}) }));
  return { id: hw.id, name: hw.name, due: hw.due, own, everyone };
}
