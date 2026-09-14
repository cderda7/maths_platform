import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { STORY_CATEGORIES } from "@/data/story";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { holisticView, recentSets, type HolisticNow } from "./holistic";
import { holisticTile, holisticTiles } from "./holisticTiles";

/** Holistic Assessment's tiles (ticket 252): the view model, over the holistic page's (ticket 251). */

const now = 1_700_000_000_000;
/** A fresh demo: Problem Set 6 not yet created. */
const fresh: HolisticNow = { classroom: INITIAL_CLASSROOM, session: null, now };
/** Problem Set 6 an hour live and Sam handed in: the stream is over. */
const report = skipFixture("report", now);
const over: HolisticNow = { classroom: report.classroom, session: report.session, now };
const everyone = [DEMO_STUDENT.id, ...CLASSMATES.map((c) => c.id)];
const tags = (id: string, at: HolisticNow = over) => Object.fromEntries(holisticTile(id, at)!.patterns.map((g) => [g.category, g.tags.map((t) => [t.label, t.sets.join(" ")])]));
const strengths = (id: string, at: HolisticNow = over) => holisticTile(id, at)!.strengths.map((s) => s.category);

describe("Holistic Assessment's tiles (ticket 252)", () => {
  it("one tile for each of the twenty, in the class order, each opening the student's page", () => {
    for (const at of [fresh, over]) {
      const tiles = holisticTiles(at);
      expect(tiles.map((t) => t.student.id)).toEqual(everyone);
      expect(tiles).toHaveLength(20);
      for (const t of tiles) {
        const view = holisticView(t.student.id, at)!;
        expect(t.student).toEqual(view.student);
        expect(t.summary).toBe(view.summary);
        expect(t.href).toBe(`/teacher/students/${t.student.id}`);
      }
    }
    expect(holisticTile("nobody", over)).toBeNull();
  });

  it("Priya: strengths only, every category", () => {
    for (const at of [fresh, over]) {
      expect(holisticTile("priya", at)!.patterns).toEqual([]);
      expect(strengths("priya", at)).toEqual([...STORY_CATEGORIES]);
    }
    expect(holisticTile("priya", over)!.strengths.map((s) => s.name)).toEqual(["Algebra", "Functions", "Graphing", "Communication", "Reasoning", "New skills"]);
  });

  it("Liam, who hands in little: his recent patterns, one-set ones too, and no strength where a set saw nothing of his", () => {
    // Guessed factor pairs on PS4 and PS6, worded two ways, first; his PS1 slip (√50 written as 25√2) never came back, so it is gone (ticket 276).
    expect(tags("liam")).toEqual({
      algebra: [
        ["factor pairs guessed, never expanded back", "PS4 PS6"],
        ["only two of the four terms expanded", "PS2"],
      ],
      new: [
        ["(√7 + 2)² squared term by term", "PS2"],
        ["null factor law on a product that isn't 0", "PS6"],
      ],
    });
    // Communication secure whenever he handed in, but not seen on PS3 and PS5: not a strength.
    expect(strengths("liam")).toEqual([]);
    // Before Problem Set 6 the window is PS1–PS5, so PS1's slip is still recent; the pairs are on one set.
    expect(tags("liam", fresh)).toEqual({
      algebra: [
        ["only two of the four terms expanded", "PS2"],
        ["factor pairs guessed, never expanded back", "PS4"],
      ],
      new: [
        ["√50 written as 25√2", "PS1"],
        ["(√7 + 2)² squared term by term", "PS2"],
      ],
    });
    expect(strengths("liam", fresh)).toEqual([]);
  });

  it("a repeated pattern collapses to one tag with its set count, however the sheet words it on each set", () => {
    // The ticket's example: Sam's signs, worded two ways on PS4 and PS5; his one-set patterns after (ticket 276).
    expect(tags("sam").algebra).toEqual([
      ["signs in the wrong brackets", "PS4 PS5"],
      ["a sign lost multiplying out a surd bracket", "PS2"],
      ["the signs of a factor pair swapped, not expanded back", "PS3"],
    ]);
    // The same words on two sets need no label.
    expect(tags("sam").graphing).toEqual([
      ["turning point read with the sign flipped", "PS4 PS5"],
      ["negative a read as concave up", "PS5"],
    ]);
    // Jordan's unchecked pairs, four wordings over four sets (two on PS6), one tag.
    expect(tags("jordan").algebra).toEqual([
      ["factor pairs not checked by expanding back", "PS3 PS4 PS5 PS6"],
      ["a bracket expanded without checking the middle terms", "PS2"],
    ]);
    // Most sets first within a category.
    expect(tags("lucas").algebra).toEqual([
      ["a sign lost", "PS2 PS4 PS5"],
      ["a pair that multiplies but doesn't add", "PS3 PS6"],
    ]);
  });

  it("a tag is a pattern the student's page surfaces, one set or many, with every set the page shows it on (ticket 276)", () => {
    const working = skipFixture("working", now);
    const justLive = { classroom: { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } }, session: working.session, now };
    for (const id of everyone)
      for (const at of [fresh, justLive, over]) {
        const view = holisticView(id, at)!;
        const tile = holisticTile(id, at)!;
        const window = recentSets(view.sets);
        // The tile's categories and tags are the page's, in the page's category order.
        expect(tile.patterns.map((g) => g.category), id).toEqual(view.patterns.map((g) => g.category));
        for (const g of tile.patterns) {
          const page = view.patterns.find((x) => x.category === g.category)!.patterns;
          expect(g.tags.map((t) => t.label).sort(), `${id} ${g.category}`).toEqual([...new Set(page.map((h) => h.tag))].sort());
          for (const t of g.tags) {
            const onPage = page.filter((h) => h.tag === t.label).flatMap((h) => h.refs);
            expect(t.sets, `${id} ${t.label}`).toEqual(view.sets.map((c) => c.label).filter((l) => onPage.some((r) => r.label === l)));
            expect(onPage.some((r) => window.has(r.set)), `${id} ${t.label}`).toBe(true);
          }
          // Most sets first.
          expect(g.tags.map((t) => t.sets.length), `${id} ${g.category}`).toEqual([...g.tags.map((t) => t.sets.length)].sort((a, b) => b - a));
        }
      }
    // One-set tags are on tiles now.
    expect(holisticTiles(over).some((t) => t.patterns.some((g) => g.tags.some((x) => x.sets.length === 1)))).toBe(true);
    // A PS1-only pattern is on no tile once PS6 is out.
    expect(holisticTiles(over).flatMap((t) => t.patterns.flatMap((g) => g.tags)).filter((x) => x.sets.join() === "PS1")).toEqual([]);
  });

  it("tiles take the live set as the student's page does: mid-stream a tag counts only the sets seen so far", () => {
    const working = skipFixture("working", now);
    const justLive = { classroom: { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } }, session: working.session, now };
    expect(tags("jordan", justLive).algebra).toEqual([
      ["factor pairs not checked by expanding back", "PS3 PS4 PS5"],
      ["a bracket expanded without checking the middle terms", "PS2"],
    ]);
  });

  it("strengths: secure on every set that assessed the student in the category, and never beside a pattern of it", () => {
    // Tomas: communication secure on all six; reasoning not seen on five.
    expect(strengths("tomas")).toEqual(["communication"]);
    // Grace: functions secure on PS4 and PS5, not yet seen on the live PS6: still a strength; graphing not seen on PS4: not.
    expect(strengths("grace")).toEqual(["algebra", "functions", "new"]);
    // Chloe away for PS6 (ticket 250): the sets she sat decide.
    expect(strengths("chloe")).toEqual(["graphing", "communication", "reasoning"]);
    // The teacher marks her present on PS6: not seen on a set she sat, but the live set is still being handed in.
    const present = classroomReducer(over.classroom!, { type: "absence/set", assignment: ASSIGNMENT.id, student: "chloe", absent: false });
    expect(strengths("chloe", { ...over, classroom: present })).toEqual(["graphing", "communication", "reasoning"]);
    // Tomas marked absent on PS4: his PS4 patterns leave the tiles too; graphing's turning point is PS5's alone.
    const away = classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-4", student: "tomas", absent: true });
    expect(tags("tomas", { ...over, classroom: away }).graphing).toEqual([["the turning point's sign copied from the bracket", "PS5"]]);
    expect(tags("tomas", { ...over, classroom: away }).functions).toBeUndefined();
    for (const at of [fresh, over])
      for (const t of holisticTiles(at)) {
        const patternCats = t.patterns.map((g) => g.category);
        expect(t.strengths.filter((s) => patternCats.includes(s.category)), t.student.id).toEqual([]);
        const view = holisticView(t.student.id, at)!;
        for (const s of t.strengths) expect(view.categories.find((r) => r.category === s.category)!.cells.every((c) => c === "secure" || c === "none" || c === "absent" || c === "unseen")).toBe(true);
      }
  });
});
