import { describe, expect, it } from "vitest";
import { DEFAULT_GROUPS, GROUP_COLOURS } from "./groups";
import { STORY_REVIEW } from "./story";
import { PS1_REVIEW } from "./pset1/review";
import { PS2_REVIEW } from "./pset2/review";
import { PS3_REVIEW } from "./pset3/review";
import { PS4_REVIEW } from "./pset4/review";
import { PS5_REVIEW } from "./pset5/review";
import { evaluateLine } from "@/lib/evaluate";
import { FINISHED_SETS } from "@/lib/finishedSets";
import { columnsOf, recordReviews } from "@/lib/report";
import { afterIndividual, reviewByRule } from "@/lib/reviewRule";
import { fixedInIndividualReview, recordWork, toReview, unionOfMembers } from "@/lib/reviewUnion";
import { recordScore } from "@/lib/setScore";

/**
 * Problem Sets 1–5 under ticket 332's group rule (ticket 338): every group version is on a question in its group's union
 * after individual review, a group with nothing left sits out, each set keeps a question nobody at a table could explain,
 * and nothing here moves a set score (first submissions only).
 */

const REVIEWS = [PS1_REVIEW, PS2_REVIEW, PS3_REVIEW, PS4_REVIEW, PS5_REVIEW];
const sets = FINISHED_SETS.map((f, i) => ({ n: i + 1, f, everyone: [f.sam, ...f.classmates], seating: f.groups ?? DEFAULT_GROUPS, review: REVIEWS[i] }));

describe("past sets' review after individual review (ticket 338)", () => {
  it("every set's pathway has individual review, so every set's union is taken once corrections are in", () => {
    expect(sets.map(({ n }) => afterIndividual(n))).toEqual([true, true, true, true, true]);
  });

  it("each group's versions are exactly its union after individual review; amber sits out Problem Sets 1 and 2", () => {
    const sittingOut: string[] = [];
    for (const { n, f, everyone, seating, review } of sets) {
      for (const colour of GROUP_COLOURS) {
        const members = seating[colour].map((id) => everyone.find((r) => r.id === id)!);
        const union = unionOfMembers(f.fixture.problems, members.map((m) => toReview(f.fixture.problems, (pid) => recordWork(m, f.fixture.problems, pid), true)));
        expect(Object.keys(review.groups[colour] ?? {}), `PS${n} ${colour}`).toEqual(union);
        if (union.length === 0) sittingOut.push(`PS${n} ${colour}`);
        // Every member's record carries a group version only on the union.
        for (const m of members) for (const [pid, r] of Object.entries(m.review ?? {})) if (r.group) expect(union, `PS${n} ${m.id} ${pid}`).toContain(pid);
      }
    }
    expect(sittingOut).toEqual(["PS1 amber", "PS2 amber"]);
  });

  it("a student whose group sat out shows no group version and no Fixed in group review on their report", () => {
    for (const { n, f, everyone, seating, review } of sets) {
      for (const colour of GROUP_COLOURS.filter((c) => !review.groups[c])) {
        for (const id of seating[colour]) {
          const r = everyone.find((m) => m.id === id)!;
          const reviews = recordReviews(r, f.fixture.problems);
          expect(Object.values(reviews).some((v) => v.group), `PS${n} ${id}`).toBe(false);
          expect(columnsOf(reviews, f.pathway, f.fixture.problems).find((c) => c.id === "group")!.problems, `PS${n} ${id}`).toEqual([]);
        }
      }
    }
  });

  it("the outcome counts per set (own rework, group, still wrong), next to ticket 278's", () => {
    const counts = STORY_REVIEW.map((review) => (["individual", "group", "wrong"] as const).map((o) => Object.values(review).reduce((k, rows) => k + rows.filter((c) => c.outcome === o).length, 0)));
    // Before ticket 338: [13, 12, 3], [25, 18, 2], [22, 28, 2], [25, 45, 3], [29, 28, 6].
    expect(counts.slice(0, 5)).toEqual([[12, 12, 4], [23, 18, 4], [20, 28, 4], [24, 45, 4], [28, 31, 4]]);
  });

  it("each set keeps a question nobody at a table could explain: violet's Q10 on Set 1, mint's Q10 on Sets 2–5", () => {
    const unsolved = sets.map(({ n, f, everyone, seating }) => reviewByRule(f.fixture, n, everyone, seating).groups.filter((g) => !g.solved).map((g) => `${g.colour} Q${g.q}`));
    expect(unsolved).toEqual([["violet Q10"], ["mint Q10"], ["mint Q10"], ["mint Q10"], ["mint Q10"]]);
  });

  it("the second submissions that slipped again (ticket 338) have a wrong line and copy nobody's first submission, and every other second submission holds", () => {
    const again: string[] = [];
    for (const { n, f, everyone, review } of sets) {
      for (const [id, byProblem] of Object.entries(review.second)) {
        for (const [pid, lines] of Object.entries(byProblem)) {
          for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `PS${n} ${id} ${pid}: ${tex}`).not.toBe("unclear");
          if (fixedInIndividualReview(pid, { rightFirstTime: false, second: lines })) continue;
          again.push(`PS${n} ${id} Q${f.fixture.problems.findIndex((p) => p.id === pid) + 1}`);
          // A rewrite that slips again is the student's own new working, never anyone's first submission reused.
          for (const r of everyone) expect(JSON.stringify(r.attempts[pid] ?? null), `PS${n} ${id} ${pid} copies ${r.id}`).not.toBe(JSON.stringify(lines));
        }
      }
    }
    expect(again).toEqual(["PS1 oliver Q10", "PS2 isla Q10", "PS2 lucas Q10", "PS3 isla Q10", "PS3 lucas Q10", "PS4 lucas Q10", "PS5 harper Q10"]);
  });

  it("set scores are unchanged: right on the first submission only", () => {
    const scores = sets.map(({ f, everyone }) => Object.fromEntries(everyone.map((r) => [r.id, recordScore(r, f.fixture.problems)])));
    expect(scores).toEqual([
      { sam: 10, priya: 10, jordan: 10, amelia: 8, tomas: 7, zara: 10, liam: 2, aiden: 9, mia: 10, noah: 10, chloe: 8, ethan: 10, isla: 9, lucas: 10, grace: 8, harper: 10, oliver: 8, ruby: 7, finn: 8, sofia: 8 },
      { sam: 8, priya: 10, jordan: 9, amelia: 6, tomas: 5, zara: 8, liam: 2, aiden: 9, mia: 9, noah: 9, chloe: 8, ethan: 9, isla: 8, lucas: 8, grace: 7, harper: 7, oliver: 8, ruby: 9, finn: 9, sofia: 7 },
      { sam: 9, priya: 10, jordan: 6, amelia: 6, tomas: 5, zara: 9, liam: 3, aiden: 7, mia: 8, noah: 8, chloe: 9, ethan: 8, isla: 7, lucas: 8, grace: 9, harper: 6, oliver: 5, ruby: 8, finn: 8, sofia: 9 },
      { sam: 5, priya: 10, jordan: 5, amelia: 7, tomas: 4, zara: 6, liam: 0, aiden: 9, mia: 7, noah: 9, chloe: 7, ethan: 5, isla: 7, lucas: 6, grace: 6, harper: 7, oliver: 5, ruby: 7, finn: 7, sofia: 8 },
      { sam: 7, priya: 10, jordan: 6, amelia: 7, tomas: 3, zara: 7, liam: 3, aiden: 9, mia: 7, noah: 9, chloe: 7, ethan: 7, isla: 7, lucas: 6, grace: 7, harper: 7, oliver: 6, ruby: 7, finn: 7, sofia: 8 },
    ]);
  });
});
