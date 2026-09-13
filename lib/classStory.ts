import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, type Classmate } from "@/data/classmates";
import { STORY, STORY_CATEGORIES, storySet, type StoryCategory, type StorySet } from "@/data/story";
import { categoryName, leafName } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { classmateHierarchy, classmateLines, columnOf, type SetScope } from "./hierarchy";

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

/* ---------- the markdown sheet ---------- */

const WORD: Record<string, string> = { gap: "gap", developing: "developing", solid: "solid", secure: "secure", unseen: "not seen", none: "—", live: "live" };
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
  out.push("- **Statuses**: gap (red), developing (orange), solid (light green), secure (dark green). *not seen*: the set assesses the category but the student has nothing on it (missing, or never reached those problems). *—*: the set does not assess the category. *live*: Sam on Set 6.");
  out.push("- **One step**: in each category, a student's neighbouring results (skipping *—* and *not seen*) differ by at most one step, gap ↔ developing ↔ solid ↔ secure. Variation, never a jump.");
  out.push("- **How a status comes out** (`lib/hierarchy.ts`): a leaf is held lines ÷ attempted lines tagged with it (1 secure, ≥ 0.8 solid, ≥ 0.6 developing, else gap); a group and a category take their worst leaf. So one slip on a leaf the student wrote on five or more times reads solid, on three or four times developing, on one or two a gap. Communication is the share of lines that skip no step. A set's New skills count under New skills on that set, not under their home.");
  out.push("- **Priya** is secure in every category on every set. **Sam** is the demo student.");
  out.push("");
  out.push("## The sets");
  out.push("");
  out.push("| Set | Due | New skills | Pathway | Assesses | Missing | Did not finish | Top gap | Data |");
  out.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const s of sets) {
    const i = s.n - 1;
    const missing = Object.entries(STORY).filter(([, r]) => r.done[i] === 0).map(([id]) => id);
    const partial = Object.entries(STORY).filter(([, r]) => r.done[i] !== null && r.done[i]! > 0 && r.done[i]! < 10).map(([id, r]) => `${id} ${r.done[i]}`);
    out.push(`| ${s.name} | ${s.due} | ${s.newSkills.map((l) => leafName(l).short).join(", ")} | ${s.pathway.join(" → ")} | ${s.categories.map((c) => categoryName(c).short).join(", ")} | ${missing.join(", ") || "nobody"} | ${partial.join(", ") || "nobody"} | ${s.topGap} | ${s.source} |`);
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
      const d = row.done[i];
      out.push(`| ${id} | ${d === null ? "live" : d === 0 ? "missing" : `${d}/10`} | ${s.categories.map((c) => WORD[row.cells[c][i].status]).join(" | ")} |`);
    }
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
    out.push(`| handed in | ${row.done.map((d) => (d === null ? "live" : d === 0 ? "missing" : `${d}/10`)).join(" | ")} |`);
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
