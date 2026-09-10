import { ASSIGNMENT } from "@/data/assignment";
import { isolatable } from "@/data/practice";
import { ALL_LEAVES, CATEGORY_ORDER, categoryOf, groupsOf, leavesOf, type CategoryId, type GroupId, type LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { evaluateLine } from "./evaluate";

/**
 * One evidence path for every student: recognised lines per problem, whether they have handed
 * in, and any groups under caution. From it, a leaf status (proportional, five levels), then
 * groups and categories rolled up worst-first, plus a half-dot marker wherever a submitted
 * student skipped a problem that invokes the node.
 */
export interface Evidence {
  /** Recognised lines per problem id (tex). */
  lines: Record<string, string[]>;
  submitted: boolean;
  /** Groups whose practice was triggered twice: every leaf beneath is a gap. */
  caution: GroupId[];
}

export interface HierarchyResult {
  leaves: Partial<Record<LeafId, Status>>;
  groups: Partial<Record<GroupId, Status>>;
  categories: Partial<Record<CategoryId, Status>>;
  half: { leaves: LeafId[]; groups: GroupId[]; categories: CategoryId[] };
  /** Categories the assignment touches, canonical order. */
  columns: CategoryId[];
}

export const STATUS_RANK: Record<Status, number> = { gap: 0, developing: 1, solid: 2, secure: 3, unseen: 4 };

/** Proportion of held lines over attempted lines tagged with the leaf. */
export function leafStatus(held: number, attempted: number): Status {
  if (attempted === 0) return "unseen";
  const r = held / attempted;
  if (r >= 1) return "secure";
  if (r >= 0.8) return "solid";
  if (r >= 0.6) return "developing";
  return "gap";
}

/** Worst-first. A parent with only unseen children is unseen. */
export function rollUp(children: Status[]): Status {
  const seen = children.filter((s) => s !== "unseen");
  if (seen.length === 0) return "unseen";
  return seen.reduce((worst, s) => (STATUS_RANK[s] < STATUS_RANK[worst] ? s : worst));
}

const WORKING: LeafId = "communication.process.working";

/** Leaves a problem invokes, from its model solution's tags. */
export function problemLeaves(p: Problem): LeafId[] {
  const out: LeafId[] = [];
  for (const st of p.solution) for (const t of st.tags) if (!out.includes(t.leaf)) out.push(t.leaf);
  return out;
}

export function leavesTouched(problems: Problem[] = ASSIGNMENT.problems): LeafId[] {
  const out: LeafId[] = [];
  for (const p of problems) for (const l of problemLeaves(p)) if (!out.includes(l)) out.push(l);
  if (problems.length > 0 && !out.includes(WORKING)) out.push(WORKING);
  return out;
}

/** Categories with at least one tagged leaf in the assignment, canonical order. */
/**
 * The set's most relevant skills for a student to name: the moves it leans on, ranked by how many
 * problems invoke each (ties in first-mention order), the top `n`. Whole-task leaves and
 * communication are not skills a student names.
 */
export function relevantSkills(problems: Problem[] = ASSIGNMENT.problems, n = 7): LeafId[] {
  const count = new Map<LeafId, number>();
  for (const p of problems) for (const l of problemLeaves(p)) if (isolatable(l)) count.set(l, (count.get(l) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([l]) => l);
}

export function categoriesTouched(problems: Problem[] = ASSIGNMENT.problems): CategoryId[] {
  const cats = new Set(leavesTouched(problems).map(categoryOf));
  return CATEGORY_ORDER.filter((c) => cats.has(c));
}

export function problemsForLeaf(leaf: LeafId, problems: Problem[] = ASSIGNMENT.problems): Problem[] {
  return problems.filter((p) => problemLeaves(p).includes(leaf));
}

export function hierarchyFor(ev: Evidence, problems: Problem[] = ASSIGNMENT.problems): HierarchyResult {
  const held: Partial<Record<LeafId, number>> = {};
  const attempted: Partial<Record<LeafId, number>> = {};
  let linesSeen = 0;
  let linesClean = 0;
  for (const p of problems) {
    for (const tex of ev.lines[p.id] ?? []) {
      const v = evaluateLine(p.id, tex);
      if (v.verdict === "unclear") continue;
      linesSeen++;
      if (!v.compounds) linesClean++;
      for (const t of v.tags) {
        attempted[t.leaf] = (attempted[t.leaf] ?? 0) + 1;
        if (v.verdict === "ok") held[t.leaf] = (held[t.leaf] ?? 0) + 1;
      }
    }
  }
  const leaves: Partial<Record<LeafId, Status>> = {};
  for (const l of leavesTouched(problems)) {
    leaves[l] = l === WORKING ? leafStatus(linesClean, linesSeen) : leafStatus(held[l] ?? 0, attempted[l] ?? 0);
  }
  for (const g of ev.caution) for (const l of leavesOf(g)) if (l in leaves) leaves[l] = "gap";

  const halfLeaves = new Set<LeafId>();
  if (ev.submitted) {
    for (const p of problems) if ((ev.lines[p.id]?.length ?? 0) === 0) for (const l of problemLeaves(p)) halfLeaves.add(l);
  }
  const groups: Partial<Record<GroupId, Status>> = {};
  const categories: Partial<Record<CategoryId, Status>> = {};
  const halfGroups = new Set<GroupId>();
  const halfCats = new Set<CategoryId>();
  const columns = categoriesTouched(problems);
  for (const c of columns) {
    const gStatuses: Status[] = [];
    for (const g of groupsOf(c)) {
      const ls = leavesOf(g).filter((l) => l in leaves);
      if (ls.length === 0) continue;
      groups[g] = rollUp(ls.map((l) => leaves[l]!));
      gStatuses.push(groups[g]!);
      if (ls.some((l) => halfLeaves.has(l))) {
        halfGroups.add(g);
        halfCats.add(c);
      }
    }
    categories[c] = rollUp(gStatuses);
  }
  return { leaves, groups, categories, half: { leaves: [...halfLeaves], groups: [...halfGroups], categories: [...halfCats] }, columns };
}

/** Leaves that ever appear in a verdict as wrong, i.e. can be a detected mistake. */
export const allLeaves = ALL_LEAVES;

/* ---------- evidence for the two kinds of student ---------- */

import type { Classmate } from "@/data/classmates";
import type { StudentSession } from "./session";

/** A classmate's transcription: their scripted attempt, or the model solution for a problem they finished correctly; null if never reached. */
export function classmateLines(c: Classmate, p: Problem, index: number): string[] | null {
  if (c.attempts[p.id]) return c.attempts[p.id];
  if (index < c.done && !c.wrong.includes(p.id)) return p.solution.map((s) => s.tex);
  return null;
}

const BEFORE_HAND_IN = ["overview", "confidence", "warmup-chat", "practice", "working"];

/** The live student's first-attempt lines, whether they have handed in, and any groups under caution. */
export function sessionEvidence(session: StudentSession): Evidence {
  const lines: Record<string, string[]> = {};
  for (const [pid, ls] of Object.entries(session.lines)) lines[pid] = ls.map((l) => l.tex);
  return { lines, submitted: !BEFORE_HAND_IN.includes(session.stage), caution: session.escalation.caution };
}

export function classmateEvidence(c: Classmate, problems: Problem[] = ASSIGNMENT.problems): Evidence {
  const lines: Record<string, string[]> = {};
  problems.forEach((p, i) => {
    const ls = classmateLines(c, p, i);
    if (ls) lines[p.id] = ls;
  });
  // A classmate with no problems done never handed anything in: no half-dots for problems "skipped".
  return { lines, submitted: c.done > 0, caution: [] };
}

export const sessionHierarchy = (session: StudentSession, problems: Problem[] = ASSIGNMENT.problems) => hierarchyFor(sessionEvidence(session), problems);
export const classmateHierarchy = (c: Classmate, problems: Problem[] = ASSIGNMENT.problems) => hierarchyFor(classmateEvidence(c, problems), problems);

/** Problems with at least one recognised line. */
export function problemsStarted(session: StudentSession): number {
  return Object.values(session.lines).filter((ls) => ls.length > 0).length;
}

/** The same result with only `keep` leaves coloured; groups and categories roll up from those alone, the rest reads as unseen. */
export function restrictTo(result: HierarchyResult, keep: LeafId[]): HierarchyResult {
  const leaves: Partial<Record<LeafId, Status>> = {};
  for (const l of Object.keys(result.leaves) as LeafId[]) leaves[l] = keep.includes(l) ? result.leaves[l] : "unseen";
  const groups: Partial<Record<GroupId, Status>> = {};
  const categories: Partial<Record<CategoryId, Status>> = {};
  for (const g of Object.keys(result.groups) as GroupId[]) groups[g] = rollUp(leavesOf(g).filter((l) => keep.includes(l)).map((l) => result.leaves[l] ?? "unseen"));
  for (const c of Object.keys(result.categories) as CategoryId[]) categories[c] = rollUp(groupsOf(c).map((g) => groups[g] ?? "unseen"));
  return { ...result, leaves, groups, categories, half: { leaves: [], groups: [], categories: [] } };
}

/** Leaves a comment is about: every leaf the named problems invoke, plus the leaf of any wrong line the student wrote on them. */
export function leavesBehind(problemIds: string[], lines: Record<string, string[]>, problems: Problem[] = ASSIGNMENT.problems): LeafId[] {
  const out = new Set<LeafId>();
  for (const pid of problemIds) {
    const p = problems.find((x) => x.id === pid);
    if (p) for (const l of problemLeaves(p)) out.add(l);
    for (const tex of lines[pid] ?? []) {
      const v = evaluateLine(pid, tex);
      if (v.verdict === "wrong") for (const t of v.tags) out.add(t.leaf);
    }
  }
  return [...out];
}
