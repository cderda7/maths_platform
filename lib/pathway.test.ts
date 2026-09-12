import { describe, expect, it } from "vitest";
import { allPathways, DEFAULT_PATHWAY, isValidPathway, nextStage, parsePathway, pathwayChip, pathwaySentence, successors } from "./pathway";

describe("pathway rules", () => {
  it("eight pathways exist, including submit-only, and every one is valid", () => {
    const all = allPathways();
    expect(all).toHaveLength(8);
    expect(all[0]).toEqual([]);
    for (const p of all) expect(isValidPathway(p)).toBe(true);
    expect(all).toContainEqual(DEFAULT_PATHWAY);
    expect(all).toContainEqual(["individual", "group", "whole-class"]);
  });

  it("rejects out-of-order and repeated stages", () => {
    expect(isValidPathway(["group", "individual"])).toBe(false);
    expect(isValidPathway(["whole-class", "group"])).toBe(false);
    expect(isValidPathway(["individual", "individual"])).toBe(false);
    expect(isValidPathway(["group", "group", "whole-class"])).toBe(false);
  });

  it("offers only later stages as successors", () => {
    expect(successors([])).toEqual(["individual", "group", "whole-class"]);
    expect(successors(["individual"])).toEqual(["group", "whole-class"]);
    expect(successors(["group"])).toEqual(["whole-class"]);
    expect(successors(["whole-class"])).toEqual([]);
    expect(successors(["individual", "group"])).toEqual(["whole-class"]);
  });
});

describe("next stage under a pathway", () => {
  it("routes hand-in by the first stage", () => {
    expect(nextStage([], "handed-in")).toBe("report");
    expect(nextStage(["individual"], "handed-in")).toBe("feedback");
    expect(nextStage(["group"], "handed-in")).toBe("class-wait"); // group review is entered through the class gate
    expect(nextStage(["whole-class"], "handed-in")).toBe("waiting");
    expect(nextStage(["group", "whole-class"], "handed-in")).toBe("class-wait");
  });

  it("routes rework and group completion by what follows them", () => {
    expect(nextStage(["individual"], "reworked")).toBe("report");
    expect(nextStage(["individual", "group"], "reworked")).toBe("class-wait");
    expect(nextStage(["individual", "whole-class"], "reworked")).toBe("waiting");
    expect(nextStage(["individual", "group", "whole-class"], "reworked")).toBe("class-wait");
    expect(nextStage(["individual", "group"], "group-done")).toBe("report");
    expect(nextStage(["group", "whole-class"], "group-done")).toBe("waiting");
    expect(nextStage(["individual", "group", "whole-class"], "group-done")).toBe("waiting");
  });
});

describe("pathway words and deep links", () => {
  it("reads the pathway in words", () => {
    expect(pathwaySentence([])).toBe("student submission → done");
    expect(pathwaySentence(["individual", "group"])).toBe("student submission → individual review → group review → done");
    expect(pathwayChip(["group", "whole-class"])).toBe("indiv working → group review → class review");
  });

  it("parses deep-link forms and rejects invalid ones", () => {
    expect(parsePathway("indiv,group")).toEqual(["individual", "group"]);
    expect(parsePathway("wc")).toEqual(["whole-class"]);
    expect(parsePathway("group,wc")).toEqual(["group", "whole-class"]);
    expect(parsePathway("none")).toEqual([]);
    expect(parsePathway("group,indiv")).toBeNull();
    expect(parsePathway("bogus")).toBeNull();
    expect(parsePathway(undefined)).toBeNull();
  });
});
