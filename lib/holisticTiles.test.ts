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
const signatures = (id: string, at: HolisticNow = over) => holisticTile(id, at)!.signatures.map((s) => [s.label, s.sets.join(" ")]);
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

  it("Priya: strengths only, every category, save graphing once Set 6's Q8 (ticket 347) is in", () => {
    expect(holisticTile("priya", fresh)!.patterns).toEqual([]);
    expect(strengths("priya", fresh)).toEqual([...STORY_CATEGORIES]);
    expect(tags("priya", over)).toEqual({ graphing: [["gave the graph's intercepts with their signs flipped", "PS6"]] });
    expect(strengths("priya", over)).toEqual(STORY_CATEGORIES.filter((c) => c !== "graphing"));
    expect(holisticTile("priya", over)!.strengths.map((s) => s.name)).toEqual(["Algebra", "Functions", "Communication", "Reasoning", "New skills"]);
  });

  it("Liam, who hands in about half: his signatures, his one-set patterns, and communication a strength now every set saw his working (ticket 281)", () => {
    // Factor brackets on PS3–PS6 and squared brackets on PS2–PS3 read as signatures (ticket 303); his PS1 slip (√50 written as 25√2) never came back, so it is gone (ticket 276).
    expect(signatures("liam")).toEqual([
      ["Factor pairs wrong", "PS3 PS4 PS5 PS6"],
      ["Squared brackets wrong", "PS2 PS3"],
    ]);
    expect(tags("liam")).toEqual({
      algebra: [["only two of the four terms expanded", "PS2"]],
      new: [
        ["intercepts read off the factors with the signs flipped", "PS5"],
        ["null factor law on a product that isn't 0", "PS6"],
      ],
    });
    // Communication secure on every set, now he hands working in on all six: his one strength.
    expect(strengths("liam")).toEqual(["communication"]);
    // Before Problem Set 6 the window is PS1–PS5, so PS1's slip is still recent.
    expect(signatures("liam", fresh)).toEqual([
      ["Factor pairs wrong", "PS3 PS4 PS5"],
      ["Squared brackets wrong", "PS2 PS3"],
    ]);
    expect(tags("liam", fresh)).toEqual({
      algebra: [["only two of the four terms expanded", "PS2"]],
      new: [
        ["√50 written as 25√2", "PS1"],
        ["intercepts read off the factors with the signs flipped", "PS5"],
      ],
    });
    expect(strengths("liam", fresh)).toEqual(["communication"]);
  });

  it("a pattern on two sets or more reads under its signature (ticket 303), so a category's tags are one-set patterns", () => {
    // Sam's signs across algebra, graphing and New skills are one signature; his conjugate (a surds misconception) stays a tag.
    expect(signatures("sam")).toEqual([["Minus signs wrong", "PS2 PS3 PS4 PS5"]]);
    expect(tags("sam")).toEqual({ new: [["the conjugate's sign wrong", "PS2"]] });
    for (const at of [fresh, over]) for (const t of holisticTiles(at)) for (const g of t.patterns) for (const x of g.tags) expect(x.sets, `${t.student.id} ${x.label}`).toHaveLength(1);
  });

  it("a tag is a pattern the student's page surfaces, one set or many, with every set the page shows it on (ticket 276)", () => {
    const working = skipFixture("working", now);
    const justLive = { classroom: { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } }, session: working.session, now };
    for (const id of everyone)
      for (const at of [fresh, justLive, over]) {
        const view = holisticView(id, at)!;
        const tile = holisticTile(id, at)!;
        const window = recentSets(view.sets);
        // The tile's categories and tags are the page's patterns no signature covers (ticket 303), in the page's category order.
        const covered = new Set(view.signatures.flatMap((x) => x.patterns.map((p) => `${p.category}|${p.text}`)));
        const open = view.patterns.map((g) => ({ ...g, patterns: g.patterns.filter((h) => !covered.has(`${g.category}|${h.text}`)) })).filter((g) => g.patterns.length > 0);
        expect(tile.patterns.map((g) => g.category), id).toEqual(open.map((g) => g.category));
        for (const g of tile.patterns) {
          const page = open.find((x) => x.category === g.category)!.patterns;
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
    // Ticket 343: PS5 Q8's pair with its signs swapped joins PS2's middle-term sign as a second signature, which covers both patterns.
    expect(signatures("jordan", justLive)).toEqual([["Factor pairs wrong", "PS3 PS4 PS5"], ["Minus signs wrong", "PS2 PS5"]]);
    expect(tags("jordan", justLive).algebra).toBeUndefined();
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
    // Tomas marked absent on PS4: his PS4 patterns leave the tiles too, signatures included (ticket 303).
    const away = classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-4", student: "tomas", absent: true });
    expect(signatures("tomas", { ...over, classroom: away })).toEqual([
      ["Fractions upside down", "PS1 PS2 PS5"],
      ["Minus signs wrong", "PS3 PS5"],
    ]);
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
