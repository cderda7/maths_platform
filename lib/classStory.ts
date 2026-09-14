import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, type Classmate } from "@/data/classmates";
import { DEFAULT_GROUPS, GROUP_COLOURS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { STORY, STORY_CATEGORIES, STORY_REVIEW, storyAbsent, storySet, type ReviewOutcome, type StoryCategory, type StoryRow, type StorySet } from "@/data/story";
import { categoryName, leafName } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { classmateHierarchy, classmateLines, columnOf, type SetScope } from "./hierarchy";
import { outcomeOf, recordReviews } from "./report";
import { reviewByRule } from "./reviewRule";

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

/* ---------- the review part (ticket 244) ---------- */

/** Every set's pathway: individual review, then group review. */
const REVIEWED = ["individual", "group"] as const;

/** Where a record's review left each problem it got wrong, as the teacher's report sorts it (`first` would mean a record that is not wrong at all). */
export function recordOutcomes(record: Classmate, set: SetScope): { q: number; outcome: ReviewOutcome | "first" }[] {
  const reviews = recordReviews(record, set.problems);
  return record.wrong.map((pid) => ({ q: set.problems.findIndex((p) => p.id === pid) + 1, outcome: outcomeOf(pid, reviews[pid], REVIEWED) }));
}

const holdsAll = (pid: string, lines: readonly string[]) => lines.length > 0 && lines.every((tex) => evaluateLine(pid, tex).verdict === "ok");
const hasWrong = (pid: string, lines: readonly string[]) => lines.some((tex) => evaluateLine(pid, tex).verdict === "wrong");

/**
 * Every way a set's records disagree with the sheet's review part or the agreed rules (empty when they agree): each
 * record's wrong problems are the sheet's, in order, with the sheet's outcomes; the sheet's outcomes are the rules'
 * (`reviewByRule`), a case where the rules disagree saying so; a second submission exactly where the student fixed
 * the problem alone, every line in the set's table and holding; every wrong problem carrying its group's version,
 * the same for every member, holding when solved and with a wrong line when not, a last try being the named
 * member's first submission. `fixed`: a group whose run is scripted (the live set's demo group).
 */
export function reviewMismatches(everyone: readonly Classmate[], set: SetScope, n: number, seating: SeatingGroups = DEFAULT_GROUPS, fixed: Partial<Record<GroupColour, Record<string, boolean>>> = {}): string[] {
  const sheet = STORY_REVIEW[n - 1];
  const out: string[] = [];
  const pidOf = (q: number) => set.problems[q - 1].id;
  const { cases, groups } = reviewByRule(set, n, everyone, seating, fixed);
  for (const id of Object.keys(sheet)) if (!everyone.some((r) => r.id === id)) out.push(`the sheet has ${id}, who has no record on the set`);
  for (const r of everyone) {
    const rows = sheet[r.id] ?? [];
    const real = recordOutcomes(r, set);
    if (JSON.stringify(rows.map((c) => c.q)) !== JSON.stringify(real.map((c) => c.q))) out.push(`${r.id}: wrong on ${real.map((c) => `Q${c.q}`).join(", ") || "nothing"}, the sheet reviews ${rows.map((c) => `Q${c.q}`).join(", ") || "nothing"}`);
    for (const row of rows) {
      const where = `${r.id} Q${row.q}`;
      const pid = pidOf(row.q);
      const got = real.find((c) => c.q === row.q)?.outcome;
      if (got !== undefined && got !== row.outcome) out.push(`${where}: the record reads ${got}, the sheet says ${row.outcome}`);
      const rule = cases.find((c) => c.student === r.id && c.q === row.q);
      if (!rule) out.push(`${where}: the rules find no slip`);
      else {
        if (rule.outcome !== row.outcome) out.push(`${where}: the rules say ${rule.outcome} (${rule.basis}), the sheet says ${row.outcome}`);
        if (rule.conflict !== row.why.includes("but the group's rework holds")) out.push(`${where}: ${rule.conflict ? "the rules disagree here and the sheet does not say so" : "the sheet says the rules disagree and they do not"}`);
      }
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
      if (row.outcome === "group" && !g.solved) out.push(`${where}: fixed in group review, the group's version unsolved`);
      if (row.outcome === "wrong" && g.solved) out.push(`${where}: still wrong, the group's version solved`);
      if (g.solved && !holdsAll(pid, g.lines)) out.push(`${where}: the group's rework does not hold line by line`);
      if (!g.solved && !hasWrong(pid, g.lines)) out.push(`${where}: the group's last try has no wrong line`);
      const colour = GROUP_COLOURS.find((c) => seating[c].includes(r.id))!;
      const call = groups.find((c) => c.colour === colour && c.q === row.q);
      if (call && call.solved !== g.solved) out.push(`${where}: the rules say the ${colour} group ${call.solved ? "solved" : "did not solve"} it`);
      if (call?.lastTryOf && JSON.stringify(g.lines) !== JSON.stringify(everyone.find((m) => m.id === call.lastTryOf)!.attempts[pid])) out.push(`${where}: the last try is not ${call.lastTryOf}'s first submission`);
      for (const m of everyone.filter((o) => o.id !== r.id && seating[colour].includes(o.id) && o.wrong.includes(pid))) {
        if (JSON.stringify(m.review?.[pid]?.group) !== JSON.stringify(g)) out.push(`${where}: ${m.id}, in the same group, carries another version`);
      }
    }
    for (const pid of Object.keys(r.review ?? {})) if (!r.wrong.includes(pid)) out.push(`${r.id}: review on ${pid}, which they did not get wrong`);
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
  out.push("The contract for the six sets in the Classroom (ticket 210). For every student and every category a set assesses, the status the Class View shows on that set and the one or two habits behind anything short of secure, with the problems that carry them. Sets 5 and 6 are read from the real data (Set 6: the classmates' end state; Sam's Set 6 is his live session). Sets 1–4 are authored to it (tickets 211–214), and `data/finishedSets.test.ts` checks every registered set equals its rows.");
  out.push("");
  out.push("## Rules");
  out.push("");
  out.push("- **Statuses**: gap (red), developing (orange), solid (light green), secure (dark green). *not seen*: the set assesses the category but the student has nothing on it (missing, or never reached those problems). *absent*: the student was away for the set (ticket 250), out of its counts. *—*: the set does not assess the category. *live*: Sam on Set 6.");
  out.push("- **One step**: in each category, a student's neighbouring results (skipping *—*, *not seen* and *absent*) differ by at most one step, gap ↔ developing ↔ solid ↔ secure. Variation, never a jump.");
  out.push("- **How a status comes out** (`lib/hierarchy.ts`): a leaf is held lines ÷ attempted lines tagged with it (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap); a group and a category take their worst leaf. So one slip on a leaf the student wrote on five or more times reads solid, on three or four times developing, on one or two a gap. Communication is the share of lines that skip no step. A set's New skills count under New skills on that set, not under their home.");
  out.push("- **Priya** is secure in every category on every set. **Sam** is the demo student.");
  out.push("- **Review** (ticket 244; every set runs individual review, then group review, and a group takes on every problem one of its members got wrong): a *one-off* slip (that mistake on one problem of the set, the habit naming only it) is fixed on the student's own rework; a *repeated* slip is fixed in group review when a groupmate handed that problem in without making it; a *habit* (a gap in the slip's category on the set) stays wrong, and the group closes the problem unsolved on the first habit-holder's working. A group's version is one: when its rework checks, every member still wrong there is fixed in group review, a habit included (the case says so); the demo group's Set 6 versions are its scripted run (`data/group-scripts.ts`). `lib/reviewRule.ts` applies the rules; each set's review below lists every case with its reasoning.");
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
    out.push(`The set's rows (each student's habits are under their name below):`);
    out.push("");
    out.push(`| Student | Handed in | ${s.categories.map((c) => categoryName(c).short).join(" | ")} |`);
    out.push(`| --- | --- | ${s.categories.map(() => "---").join(" | ")} |`);
    for (const [id, row] of Object.entries(STORY)) {
      out.push(`| ${id} | ${handedIn(row, i)} | ${s.categories.map((c) => WORD[row.cells[c][i].status]).join(" | ")} |`);
    }
    out.push("");
    const review = STORY_REVIEW[i];
    const count = (o: ReviewOutcome) => Object.values(review).reduce((k, rows) => k + rows.filter((c) => c.outcome === o).length, 0);
    out.push(`The set's review (${s.pathway.join(" → ")}): ${count("individual")} fixed on the student's own rework, ${count("group")} in group review, ${count("wrong")} still wrong (each closed unsolved by the group).`);
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
    const habits = STORY_CATEGORIES.flatMap((c) => row.cells[c].flatMap((cell, i) => cell.habits.map((hb) => `- ${setLabel(sets[i])} · ${categoryName(c).name} · ${cell.status}: ${hb.text} (${qs(hb.problems)})`)));
    if (habits.length > 0) {
      out.push(...habits);
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
