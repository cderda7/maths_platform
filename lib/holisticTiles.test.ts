import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { habitTagLabel } from "@/data/habitTags";
import { STORY_CATEGORIES } from "@/data/story";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { holisticView, type HolisticNow } from "./holistic";
import { holisticTile, holisticTiles, RECURRING_SETS } from "./holisticTiles";

/** Holistic Assessment's tiles (ticket 252): the view model, over the holistic page's (ticket 251). */

const now = 1_700_000_000_000;
/** A fresh demo: Problem Set 6 not yet created. */
const fresh: HolisticNow = { classroom: INITIAL_CLASSROOM, session: null, now };
/** Problem Set 6 an hour live and Sam handed in: the stream is over. */
const report = skipFixture("report", now);
const over: HolisticNow = { classroom: report.classroom, session: report.session, now };
const everyone = [DEMO_STUDENT.id, ...CLASSMATES.map((c) => c.id)];
const tags = (id: string, at: HolisticNow = over) => Object.fromEntries(holisticTile(id, at)!.habits.map((g) => [g.category, g.tags.map((t) => [t.label, t.sets.join(" ")])]));
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
      expect(holisticTile("priya", at)!.habits).toEqual([]);
      expect(strengths("priya", at)).toEqual([...STORY_CATEGORIES]);
    }
    expect(holisticTile("priya", over)!.strengths.map((s) => s.name)).toEqual(["Algebra", "Functions", "Graphing", "Communication", "Reasoning", "New skills"]);
  });

  it("Liam, who hands in little: only what shows on two of the sets he handed in, and no strength where a set saw nothing of his", () => {
    // Guessed factor pairs on PS4 and PS6, worded two ways.
    expect(tags("liam")).toEqual({ algebra: [["factor pairs guessed, never expanded back", "PS4 PS6"]] });
    // Communication secure whenever he handed in, but not seen on PS3 and PS5: not a strength.
    expect(strengths("liam")).toEqual([]);
    // Before Problem Set 6 his pairs show on one set only: nothing recurring, nothing secure throughout.
    expect(holisticTile("liam", fresh)!.habits).toEqual([]);
    expect(strengths("liam", fresh)).toEqual([]);
  });

  it("a repeated habit collapses to one tag with its set count, however the sheet words it on each set", () => {
    // The ticket's example: Sam's signs, worded two ways on PS4 and PS5.
    expect(tags("sam").algebra).toEqual([["signs in the wrong brackets", "PS4 PS5"]]);
    // The same words on two sets need no label.
    expect(tags("sam").graphing).toEqual([["turning point read with the sign flipped", "PS4 PS5"]]);
    // Jordan's unchecked pairs, four wordings over four sets (two on PS6), one tag.
    expect(tags("jordan").algebra).toEqual([["factor pairs not checked by expanding back", "PS3 PS4 PS5 PS6"]]);
    // Most sets first within a category.
    expect(tags("lucas").algebra).toEqual([
      ["a sign lost", "PS2 PS4 PS5"],
      ["a pair that multiplies but doesn't add", "PS3 PS6"],
    ]);
  });

  it("a one-set habit is not a tag; every tag is on two or more of the sets the student's page shows it on", () => {
    for (const id of everyone)
      for (const at of [fresh, over]) {
        const view = holisticView(id, at)!;
        for (const g of holisticTile(id, at)!.habits)
          for (const t of g.tags) {
            expect(t.sets.length, `${id} ${t.label}`).toBeGreaterThanOrEqual(RECURRING_SETS);
            const onPage = new Set(view.habits.find((x) => x.category === g.category)!.habits.filter((h) => habitTagLabel(id, g.category, h.text) === t.label).flatMap((h) => h.refs.map((r) => r.label)));
            expect(t.sets, `${id} ${t.label}`).toEqual(view.columns.map((c) => c.label).filter((l) => onPage.has(l)));
          }
        // Every habit on two sets or more has its tag.
        for (const g of view.habits) {
          const bySets = new Map<string, Set<string>>();
          for (const h of g.habits) {
            const label = habitTagLabel(id, g.category, h.text);
            bySets.set(label, new Set([...(bySets.get(label) ?? []), ...h.refs.map((r) => r.label)]));
          }
          const recurring = [...bySets].filter(([, s]) => s.size >= 2).map(([l]) => l);
          const shown = holisticTile(id, at)!.habits.find((x) => x.category === g.category)?.tags.map((t) => t.label) ?? [];
          expect([...shown].sort(), `${id} ${g.category}`).toEqual(recurring.sort());
        }
      }
  });

  it("tiles take the live set as the student's page does: mid-stream a tag counts only the sets seen so far", () => {
    const working = skipFixture("working", now);
    const justLive = { classroom: { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } }, session: working.session, now };
    expect(tags("jordan", justLive).algebra).toEqual([["factor pairs not checked by expanding back", "PS3 PS4 PS5"]]);
  });

  it("strengths: secure on every set that assessed the student in the category, and never beside a habit of it", () => {
    // Tomas: communication secure on all six; reasoning not seen on five.
    expect(strengths("tomas")).toEqual(["communication"]);
    // Grace: functions secure on PS4 and PS5, not yet seen on the live PS6: still a strength; graphing not seen on PS4: not.
    expect(strengths("grace")).toEqual(["algebra", "functions", "new"]);
    // Chloe away for PS6 (ticket 250): the sets she sat decide.
    expect(strengths("chloe")).toEqual(["graphing", "communication", "reasoning"]);
    // The teacher marks her present on PS6: not seen on a set she sat, but the live set is still being handed in.
    const present = classroomReducer(over.classroom!, { type: "absence/set", assignment: ASSIGNMENT.id, student: "chloe", absent: false });
    expect(strengths("chloe", { ...over, classroom: present })).toEqual(["graphing", "communication", "reasoning"]);
    // Tomas marked absent on PS4: his PS4 habits leave the tiles too.
    const away = classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-4", student: "tomas", absent: true });
    expect(tags("tomas", { ...over, classroom: away }).graphing).toBeUndefined();
    for (const at of [fresh, over])
      for (const t of holisticTiles(at)) {
        const habitCats = t.habits.map((g) => g.category);
        expect(t.strengths.filter((s) => habitCats.includes(s.category)), t.student.id).toEqual([]);
        const view = holisticView(t.student.id, at)!;
        for (const s of t.strengths) expect(view.rows.find((r) => r.category === s.category)!.cells.every((c) => c === "secure" || c === "none" || c === "absent" || c === "unseen")).toBe(true);
      }
  });
});
