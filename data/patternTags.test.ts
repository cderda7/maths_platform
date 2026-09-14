import { describe, expect, it } from "vitest";
import { PATTERN_TAGS, patternTagLabel } from "./patternTags";
import { STORY, STORY_CATEGORIES, type StoryCategory } from "./story";

/** The tile tags' authored labels (ticket 252) against the class story sheet they label. */

/** The sets (1 … 6) a text shows on for a student in a category. */
const setsOf = (student: string, category: StoryCategory, text: string): number[] => STORY[student].cells[category].flatMap((cell, i) => (cell.patterns.some((h) => h.text === text) ? [i + 1] : []));

describe("pattern tags (ticket 252)", () => {
  it("label only the twenty, in the sheet's categories", () => {
    for (const [student, byCategory] of Object.entries(PATTERN_TAGS)) {
      expect(Object.hasOwn(STORY, student), student).toBe(true);
      for (const c of Object.keys(byCategory)) expect(STORY_CATEGORIES as readonly string[], `${student} ${c}`).toContain(c);
    }
  });

  it("every text is that student's pattern in that category, exactly as the sheet words it", () => {
    for (const [student, byCategory] of Object.entries(PATTERN_TAGS))
      for (const [c, tags] of Object.entries(byCategory) as [StoryCategory, (typeof byCategory)[StoryCategory]][])
        for (const t of tags!) for (const text of t.texts) expect(setsOf(student, c, text), `${student} ${c}: "${text}"`).not.toEqual([]);
  });

  it("each tag gathers a pattern on two or more sets, a text in one tag only, one label per tag in a category", () => {
    for (const [student, byCategory] of Object.entries(PATTERN_TAGS))
      for (const [c, tags] of Object.entries(byCategory) as [StoryCategory, (typeof byCategory)[StoryCategory]][]) {
        const texts = tags!.flatMap((t) => t.texts);
        expect(new Set(texts).size, `${student} ${c}`).toBe(texts.length);
        expect(new Set(tags!.map((t) => t.label)).size, `${student} ${c}`).toBe(tags!.length);
        for (const t of tags!) {
          const sets = new Set(t.texts.flatMap((text) => setsOf(student, c, text)));
          expect(sets.size, `${student} ${c}: ${t.label}`).toBeGreaterThanOrEqual(2);
          // Two wordings or more: a tag for words that already agree on every set is not needed.
          expect(t.texts.length, `${student} ${c}: ${t.label}`).toBeGreaterThanOrEqual(2);
        }
      }
  });

  it("a pattern reads its label, and a pattern without an entry its own words", () => {
    expect(patternTagLabel("sam", "algebra", "right split, signs in the wrong brackets")).toBe("signs in the wrong brackets");
    expect(patternTagLabel("sam", "algebra", "right split, the signs put into the wrong brackets")).toBe("signs in the wrong brackets");
    expect(patternTagLabel("sam", "graphing", "turning point read with the sign flipped")).toBe("turning point read with the sign flipped");
    // Labels are per category: the same words elsewhere are not relabelled.
    expect(patternTagLabel("sam", "new", "right split, signs in the wrong brackets")).toBe("right split, signs in the wrong brackets");
  });
});
