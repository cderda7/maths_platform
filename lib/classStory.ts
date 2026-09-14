import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, type Classmate } from "@/data/classmates";
import { DEFAULT_GROUPS, GROUP_COLOURS, type GroupColour, type SeatingGroups } from "@/data/groups";
import type { ClassReview } from "@/data/recordReview";
import { STORY, STORY_CATEGORIES, STORY_CLASS_REVIEW, STORY_REVIEW, storyAbsent, storySet, type ReviewOutcome, type StoryCategory, type StoryRow, type StorySet } from "@/data/story";
import { categoryName, leafName } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { classmateHierarchy, classmateLines, columnOf, type SetScope } from "./hierarchy";
import { outcomeOf, recordReviews } from "./report";
import { groupProblemsOf, reviewByRule, wrongOnOneLine, type RuleOptions } from "./reviewRule";

/**
 * Reading real records against the class story sheet (ticket 210), and writing the sheet out as markdown.
 * Pure; the tests (`data/story.test.ts`, `data/finishedSets.test.ts`) and `specs/class-story.md` use it.
 */

/** A record's status in one of the sheet's categories on a set, as the Class View computes it. */
export const recordStatus = (record: Classmate, set: SetScope, category: StoryCategory): Status => classmateHierarchy(record, set).categories[category] ?? "unseen";

/**
 * The problems (by number, Q1 = 1) where a record's lines miss something in a category: a wrong line tagged
 * with a leaf that counts there on this set, or, for communication, a line that skips a step.
 */
export function missedProblems(record: Classmate, set: SetScope, category: StoryCategory): number[] {
  return set.problems.flatMap((p, i) => {
    const lines = classmateLines(record, p, i) ?? [];
    const misses = lines.some((tex) => {
      const v = evaluateLine(p.id, tex);
      if (v.verdict === "unclear") return false;
      if (category === "communication") return !!v.compounds;
      return v.verdict === "wrong" && v.tags.some((t) => columnOf(t.leaf, set.newSkills) === category);
    });
    return misses ? [i + 1] : [];
  });
}

/* ---------- the review part (tickets 244, 281) ---------- */

/** Every finished set's review stages that sort a record's tiles: individual review, then group review. */
const REVIEWED = ["individual", "group"] as const;

/** Where a record's review left each problem it brought to its group, as the teacher's report sorts it (`first` would mean a problem it had right after all). */
export function recordOutcomes(record: Classmate, set: SetScope): { q: number; outcome: ReviewOutcome | "first" }[] {
  const reviews = recordReviews(record, set.problems);
  return groupProblemsOf(record, set).map((pid) => ({ q: set.problems.findIndex((p) => p.id === pid) + 1, outcome: outcomeOf(pid, reviews[pid], REVIEWED) }));
}

const holdsAll = (pid: string, lines: readonly string[]) => lines.length > 0 && lines.every((tex) => evaluateLine(pid, tex).verdict === "ok");
const hasWrong = (pid: string, lines: readonly string[]) => lines.some((tex) => evaluateLine(pid, tex).verdict === "wrong");
const wrongNames = (pid: string, lines: readonly string[]) => lines.flatMap((tex) => {
  const v = evaluateLine(pid, tex);
  return v.verdict === "wrong" ? [v.name ?? ""] : [];
});

/**
 * Every way a set's records disagree with the sheet's review part or the agreed rules (empty when they agree). Each present
 * record's group problems (a mistake, incomplete, not attempted; ticket 278) are the sheet's, in order, with the sheet's
 * outcomes, and the sheet's outcomes are the rules' (`reviewByRule`). A second submission sits exactly where the student
 * fixed the problem alone, every line in the set's table and holding. Every group problem carries its group's one version,
 * the same for every member who brought it: holding line by line when solved; when not, a wrong line that shares a real
 * slip (one a member at the table made on it, or one the class made when nobody at the table wrote on it), and never
 * anyone's first submission (ticket 281). The exception, when the set used it, qualifies. `options.fixed`: a group whose run
 * is scripted (the live set's demo group), whose last try is its script's.
 */
export function reviewMismatches(everyone: readonly Classmate[], set: SetScope, n: number, seating: SeatingGroups = DEFAULT_GROUPS, options: RuleOptions = {}): string[] {
  const sheet = STORY_REVIEW[n - 1];
  const out: string[] = [];
  const absent = options.absent ?? [];
  const pidOf = (q: number) => set.problems[q - 1].id;
  const { cases, groups } = reviewByRule(set, n, everyone, seating, options);
  for (const id of Object.keys(sheet)) if (!everyone.some((r) => r.id === id && !absent.includes(id))) out.push(`the sheet has ${id}, who has no record in the room on the set`);
  if (options.exception) {
    const { colour, problem, member } = options.exception;
    const call = groups.find((g) => g.colour === colour && pidOf(g.q) === problem);
    const r = everyone.find((m) => m.id === member);
    if (!call || !call.solved || call.helpers.length > 0) out.push(`the exception on ${colour} ${problem} is not a solved problem nobody at the table had right`);
    if (!r || !seating[colour].includes(member) || !wrongOnOneLine(r, set, problem)) out.push(`the exception's ${member} did not go wrong on one line of ${problem} at ${colour}`);
  }
  for (const r of everyone) {
    if (absent.includes(r.id)) {
      if (r.review) out.push(`${r.id}: away for the set, with review`);
      continue;
    }
    const rows = sheet[r.id] ?? [];
    const real = recordOutcomes(r, set);
    if (JSON.stringify(rows.map((c) => c.q)) !== JSON.stringify(real.map((c) => c.q))) out.push(`${r.id}: brings ${real.map((c) => `Q${c.q}`).join(", ") || "nothing"} to the group, the sheet reviews ${rows.map((c) => `Q${c.q}`).join(", ") || "nothing"}`);
    const colour = GROUP_COLOURS.find((c) => seating[c].includes(r.id))!;
    for (const row of rows) {
      const where = `${r.id} Q${row.q}`;
      const pid = pidOf(row.q);
      const got = real.find((c) => c.q === row.q)?.outcome;
      if (got !== undefined && got !== row.outcome) out.push(`${where}: the record reads ${got}, the sheet says ${row.outcome}`);
      const rule = cases.find((c) => c.student === r.id && c.q === row.q);
      if (!rule) out.push(`${where}: the rules find no group problem`);
      else if (rule.outcome !== row.outcome) out.push(`${where}: the rules say ${rule.outcome} (${rule.basis}), the sheet says ${row.outcome}`);
      if (row.why.length < 30) out.push(`${where}: no reasoning`);
      const later = r.review?.[pid];
      const second = later?.second ?? [];
      if ((row.outcome === "individual") !== second.length > 0) out.push(`${where}: ${second.length > 0 ? "a second submission" : "no second submission"} for ${row.outcome}`);
      if (second.length > 0 && !holdsAll(pid, second)) out.push(`${where}: the second submission does not hold line by line`);
      const g = later?.group;
      if (!g) {
        out.push(`${where}: no group version`);
        continue;
      }
      for (const tex of [...second, ...g.lines]) if (evaluateLine(pid, tex).verdict === "unclear") out.push(`${where}: "${tex}" is not in the set's table`);
      if (row.outcome === "group" && !g.solved) out.push(`${where}: solved in group review, the group's version unsolved`);
      if (row.outcome === "wrong" && g.solved) out.push(`${where}: still wrong, the group's version solved`);
      if (g.solved && !holdsAll(pid, g.lines)) out.push(`${where}: the group's rework does not hold line by line`);
      const call = groups.find((c) => c.colour === colour && c.q === row.q);
      if (call && call.solved !== g.solved) out.push(`${where}: the rules say the ${colour} group ${call.solved ? "solved" : "did not solve"} it`);
      if (!g.solved) {
        if (!hasWrong(pid, g.lines)) out.push(`${where}: the group's last try has no wrong line`);
        const reused = everyone.find((m) => JSON.stringify(m.attempts[pid] ?? null) === JSON.stringify(g.lines));
        if (reused) out.push(`${where}: the group's last try is ${reused.id}'s first submission`);
        if (!call?.scripted) {
          const table = everyone.filter((m) => seating[colour].includes(m.id) && !absent.includes(m.id)).flatMap((m) => wrongNames(pid, m.attempts[pid] ?? []));
          const real = table.length > 0 ? table : everyone.flatMap((m) => wrongNames(pid, m.attempts[pid] ?? []));
          if (!wrongNames(pid, g.lines).some((name) => real.includes(name))) out.push(`${where}: the group's last try shares no slip ${table.length > 0 ? "a member at the table" : "the class"} made`);
        }
      }
      for (const m of everyone.filter((o) => o.id !== r.id && seating[colour].includes(o.id) && !absent.includes(o.id) && groupProblemsOf(o, set).includes(pid))) {
        if (JSON.stringify(m.review?.[pid]?.group) !== JSON.stringify(g)) out.push(`${where}: ${m.id}, in the same group, carries another version`);
      }
    }
    for (const pid of Object.keys(r.review ?? {})) if (!groupProblemsOf(r, set).includes(pid)) out.push(`${r.id}: review on ${pid}, which they had right first time`);
  }
  return out;
}

/** The groups that met a set's hardest problems (Q9 and Q10 when complex unfamiliar) with nobody at the table able to do them. */
export function hardestUnsolved(everyone: readonly Classmate[], set: SetScope, n: number, seating: SeatingGroups, options: RuleOptions = {}): { colour: GroupColour; q: number }[] {
  const hardest = set.problems.flatMap((p, i) => (i >= 8 && p.difficulty === "complex unfamiliar" ? [i + 1] : []));
  return reviewByRule(set, n, everyone, seating, options).groups.filter((g) => !g.solved && hardest.includes(g.q)).map((g) => ({ colour: g.colour, q: g.q }));
}

/**
 * Every way a set's class review disagrees with its pathway, the sheet's class review part and the rules (ticket 281): it
 * runs exactly on a pathway with class review; it covers exactly the problems some group left unsolved, in set order; each
 * has one or two examples, each a different student's real first submission on it, with a wrong line, and the sheet names
 * the same students with its reasoning.
 */
export function classReviewMismatches(classReview: ClassReview | undefined, pathway: readonly string[], everyone: readonly Classmate[], set: SetScope, n: number, seating: SeatingGroups, options: RuleOptions = {}): string[] {
  const out: string[] = [];
  const sheet = STORY_CLASS_REVIEW[n - 1];
  const runs = pathway.includes("whole-class");
  if (runs !== (classReview !== undefined)) out.push(runs ? "the pathway has class review and the set records none" : "class review recorded on a pathway without it");
  if (runs !== (sheet !== null)) out.push(runs ? "the sheet has no class review part for the set" : "the sheet has a class review part for a set without it");
  if (!classReview || !sheet) return out;
  const unsolved = [...new Set(reviewByRule(set, n, everyone, seating, options).groups.filter((g) => !g.solved).map((g) => g.q))].sort((a, b) => a - b);
  const covered = classReview.map((c) => set.problems.findIndex((p) => p.id === c.problem) + 1);
  if (JSON.stringify(covered) !== JSON.stringify(unsolved)) out.push(`class review covers ${covered.map((q) => `Q${q}`).join(", ") || "nothing"}, the groups left ${unsolved.map((q) => `Q${q}`).join(", ") || "nothing"} unsolved`);
  if (JSON.stringify(sheet.map((c) => c.q)) !== JSON.stringify(covered)) out.push(`the sheet's class review covers ${sheet.map((c) => `Q${c.q}`).join(", ")}, the record ${covered.map((q) => `Q${q}`).join(", ")}`);
  for (const c of classReview) {
    const q = set.problems.findIndex((p) => p.id === c.problem) + 1;
    if (c.examples.length < 1 || c.examples.length > 2) out.push(`Q${q}: ${c.examples.length} examples`);
    if (new Set(c.examples.map((e) => e.student)).size !== c.examples.length) out.push(`Q${q}: one student shown twice`);
    for (const e of c.examples) {
      const r = everyone.find((m) => m.id === e.student);
      if (!r || !r.wrong.includes(c.problem) || JSON.stringify(r.attempts[c.problem]) !== JSON.stringify(e.lines)) out.push(`Q${q}: ${e.student}'s example is not their first submission on it`);
      else if (!hasWrong(c.problem, e.lines)) out.push(`Q${q}: ${e.student}'s example has no wrong line`);
    }
    const row = sheet.find((x) => x.q === q);
    if (row && JSON.stringify(row.examples) !== JSON.stringify(c.examples.map((e) => e.student))) out.push(`Q${q}: the sheet shows ${row.examples.join(", ")}, the record ${c.examples.map((e) => e.student).join(", ")}`);
    if (row && row.why.length < 30) out.push(`Q${q}: no reasoning`);
  }
  return out;
}

/* ---------- the markdown sheet ---------- */

const WORD: Record<string, string> = { gap: "gap", developing: "developing", solid: "solid", secure: "secure", unseen: "not seen", absent: "absent", none: "—", live: "live" };
/** A row's "handed in" on the set at `i`: live, absent (ticket 250), missing, or the count. */
const handedIn = (row: StoryRow, i: number): string => {
  const d = row.done[i];
  return d === null ? "live" : storyAbsent(row, i) ? "absent" : d === 0 ? "missing" : `${d}/10`;
};
const setLabel = (s: StorySet) => `PS${s.n}`;
const qs = (problems: readonly number[]) => problems.map((n) => `Q${n}`).join(", ");

/** The whole of `specs/class-story.md`, from `data/story.ts`. */
export function renderClassStory(sets: readonly StorySet[]): string {
  const out: string[] = [];
  out.push("# The class story sheet: 11 Methods, Problem Sets 1–6");
  out.push("");
  out.push("<!-- Generated from data/story.ts by `npm run story:sheet`. Do not edit by hand: change data/story.ts and regenerate; `data/story.test.ts` fails while the two differ. -->");
  out.push("");
  out.push("The contract for the six sets in the Classroom (ticket 210). For every student and every category a set assesses, the status the Class View shows on that set and the one or two patterns behind anything short of secure, with the problems that carry them. Sets 5 and 6 are read from the real data (Set 6: the classmates' end state; Sam's Set 6 is his live session). Sets 1–4 are authored to it (tickets 211–214), and `data/finishedSets.test.ts` checks every registered set equals its rows.");
  out.push("");
  out.push("## Rules");
  out.push("");
  out.push("- **Statuses**: gap (red), developing (orange), solid (light green), secure (dark green). *not seen*: the set assesses the category but the student has nothing on it (missing, or never reached those problems). *absent*: the student was away for the set (ticket 250), out of its counts. *—*: the set does not assess the category. *live*: Sam on Set 6.");
  out.push("- **One step**: in each category, a student's neighbouring results (skipping *—*, *not seen* and *absent*) differ by at most one step, gap ↔ developing ↔ solid ↔ secure. Variation, never a jump.");
  out.push("- **How a status comes out** (`lib/hierarchy.ts`): a leaf is held lines ÷ attempted lines tagged with it (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap); a group and a category take their worst leaf. So one slip on a leaf the student wrote on five or more times reads solid, on three or four times developing, on one or two a gap. Communication is the share of lines that skip no step. A set's New skills count under New skills on that set, not under their home.");
  out.push("- **Priya** is secure in every category on every set. **Sam** is the demo student.");
  out.push("- **Review** (tickets 244, 278, 281; settled with the user 2026-09-14): a student brings to their seating group every problem they did not get right first time (a mistake, a problem left incomplete, one not attempted; a student away brings nothing). A *one-off* slip (that mistake on one problem of the set, the pattern naming only it, no gap in its category) is fixed on the student's own rework. Everything else is the group's: a *repeated* slip, a *pattern* (a gap in the slip's category on the set), a problem left incomplete or not attempted. The group solves it when a member at the table had it right first time, a pattern included; a problem nobody at the table had right stays unsolved, and the group's last try is its own working, still wrong, never a member's first submission. At most once a set, the *exception*: a problem nobody had right that the group solves because one member's first submission went wrong on a single line and the hint after the second wrong check named it. On every set one or two groups meet the set's hardest problem with nobody at the table able to do it. The demo group's Set 6 versions are its scripted run (`data/group-scripts.ts`). `lib/reviewRule.ts` applies the rules; each set's review below lists every case with its reasoning.");
  out.push("- **Class review** (ticket 281): on Sets 1, 3 and 6 only. It covers every problem a group left unsolved, each with one or two examples of the class's real wrong working, shown unnamed: the most common slip first, from a table that left it unsolved when one made it.");
  out.push("");
  out.push("## The sets");
  out.push("");
  out.push("| Set | Due | New skills | Pathway | Assesses | Absent | Missing | Did not finish | Top gap | Data |");
  out.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const s of sets) {
    const i = s.n - 1;
    const absent = Object.entries(STORY).filter(([, r]) => storyAbsent(r, i)).map(([id]) => id);
    const missing = Object.entries(STORY).filter(([, r]) => r.done[i] === 0 && !storyAbsent(r, i)).map(([id]) => id);
    const partial = Object.entries(STORY).filter(([, r]) => r.done[i] !== null && r.done[i]! > 0 && r.done[i]! < 10).map(([id, r]) => `${id} ${r.done[i]}`);
    out.push(`| ${s.name} | ${s.due} | ${s.newSkills.map((l) => leafName(l).short).join(", ")} | ${s.pathway.join(" → ")} | ${s.categories.map((c) => categoryName(c).short).join(", ")} | ${absent.join(", ") || "nobody"} | ${missing.join(", ") || "nobody"} | ${partial.join(", ") || "nobody"} | ${s.topGap} | ${s.source} |`);
  }
  out.push("");
  for (const s of sets) {
    out.push(`### ${s.name}`);
    out.push("");
    out.push(s.topic);
    out.push("");
    if (s.outline) {
      out.push("| Problem | Asks | Model solution carries at least |");
      out.push("| --- | --- | --- |");
      s.outline.forEach((p, k) => out.push(`| Q${k + 1} | ${p.about} | ${p.leaves.map((l) => `${leafName(l).short} (\`${l}\`)`).join(", ")} |`));
    } else {
      out.push(`Authored: ${s.source}.`);
    }
    out.push("");
    const i = s.n - 1;
    out.push(`The set's rows (each student's patterns are under their name below):`);
    out.push("");
    out.push(`| Student | Handed in | ${s.categories.map((c) => categoryName(c).short).join(" | ")} |`);
    out.push(`| --- | --- | ${s.categories.map(() => "---").join(" | ")} |`);
    for (const [id, row] of Object.entries(STORY)) {
      out.push(`| ${id} | ${handedIn(row, i)} | ${s.categories.map((c) => WORD[row.cells[c][i].status]).join(" | ")} |`);
    }
    out.push("");
    const review = STORY_REVIEW[i];
    const count = (o: ReviewOutcome) => Object.values(review).reduce((k, rows) => k + rows.filter((c) => c.outcome === o).length, 0);
    out.push(`The set's review (${s.pathway.join(" → ")}): ${count("individual")} fixed on the student's own rework, ${count("group")} solved in group review, ${count("wrong")} still wrong (each closed unsolved by the group).`);
    out.push("");
    out.push("| Student | Own rework | Group review | Still wrong |");
    out.push("| --- | --- | --- | --- |");
    const qsOf = (id: string, o: ReviewOutcome) => qs((review[id] ?? []).filter((c) => c.outcome === o).map((c) => c.q)) || "—";
    for (const [id, row] of Object.entries(STORY)) {
      if (row.done[i] === null) out.push(`| ${id} | live | live | live |`);
      else if (review[id]) out.push(`| ${id} | ${qsOf(id, "individual")} | ${qsOf(id, "group")} | ${qsOf(id, "wrong")} |`);
    }
    out.push("");
    const WHERE: Record<ReviewOutcome, string> = { individual: "own rework", group: "group review", wrong: "still wrong" };
    for (const [id, rows] of Object.entries(review)) for (const c of rows) out.push(`- ${id} Q${c.q} · ${WHERE[c.outcome]}: ${c.why}`);
    out.push("");
    const covered = STORY_CLASS_REVIEW[i];
    if (covered) {
      out.push(`Class review covered ${qs(covered.map((c) => c.q))}:`);
      out.push("");
      for (const c of covered) out.push(`- Q${c.q} · shown: ${c.examples.join(", ")}. ${c.why}`);
      out.push("");
    }
  }
  out.push("## The students");
  out.push("");
  for (const [id, row] of Object.entries(STORY)) {
    out.push(`### ${id === DEMO_STUDENT.id ? DEMO_STUDENT.name : CLASSMATE_MAP[id]?.name ?? id} (\`${id}\`)`);
    out.push("");
    out.push(row.arc);
    out.push("");
    out.push(`| Category | ${sets.map(setLabel).join(" | ")} |`);
    out.push(`| --- | ${sets.map(() => "---").join(" | ")} |`);
    out.push(`| handed in | ${row.done.map((_, i) => handedIn(row, i)).join(" | ")} |`);
    for (const c of STORY_CATEGORIES) out.push(`| ${categoryName(c).name} | ${row.cells[c].map((cell) => WORD[cell.status]).join(" | ")} |`);
    out.push("");
    const patterns = STORY_CATEGORIES.flatMap((c) => row.cells[c].flatMap((cell, i) => cell.patterns.map((pt) => `- ${setLabel(sets[i])} · ${categoryName(c).name} · ${cell.status}: ${pt.text} (${qs(pt.problems)})`)));
    if (patterns.length > 0) {
      out.push(...patterns);
      out.push("");
    }
  }
  return out.join("\n");
}

/** The sheet's set for a registered id, or throws: a finished set must have a row in the sheet. */
export function storySetOf(id: string): StorySet {
  const s = storySet(id);
  if (!s) throw new Error(`${id} has no row in the class story sheet (data/story.ts)`);
  return s;
}
