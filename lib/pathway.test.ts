import { describe, expect, it } from "vitest";
import { allPathways, DEFAULT_PATHWAY, isValidPathway, nextStage, nextStageOnCard, parsePathway, pathwayChip, STAGE_DESCRIPTION, togglePathway } from "./pathway";

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

  it("switches one stop on the line on or off, the order kept, and the last stop off leaves the choice undecided (ticket 246)", () => {
    expect(togglePathway(null, "group")).toEqual(["group"]);
    expect(togglePathway([], "whole-class")).toEqual(["whole-class"]);
    expect(togglePathway(["whole-class"], "individual")).toEqual(["individual", "whole-class"]);
    expect(togglePathway(["individual", "whole-class"], "group")).toEqual(["individual", "group", "whole-class"]);
    expect(togglePathway(["individual", "group", "whole-class"], "group")).toEqual(["individual", "whole-class"]);
    expect(togglePathway(["group"], "group")).toBeNull();
    for (const p of allPathways()) for (const s of ["individual", "group", "whole-class"] as const) {
      const next = togglePathway(p, s);
      if (next) expect(isValidPathway(next)).toBe(true);
    }
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

describe("the decision card's next-stage line (ticket 350)", () => {
  it("names the next stage plainly when nothing is skipped", () => {
    expect(nextStageOnCard(["individual", "group", "whole-class"])).toEqual({ stage: "individual", skipIndividual: false, skipBoth: false });
    expect(nextStageOnCard(["individual", "whole-class"])).toEqual({ stage: "individual", skipIndividual: false, skipBoth: false });
  });

  it("says individual review is skipped when it's off but group review is still ahead", () => {
    expect(nextStageOnCard(["group", "whole-class"])).toEqual({ stage: "group", skipIndividual: true, skipBoth: false });
    expect(nextStageOnCard(["group"])).toEqual({ stage: "group", skipIndividual: true, skipBoth: false });
  });

  it("says both review stages are skipped when only class review is on the pathway", () => {
    expect(nextStageOnCard(["whole-class"])).toEqual({ stage: "whole-class", skipIndividual: true, skipBoth: true });
  });

  it("has nothing to say once there is no review stage left at all", () => {
    expect(nextStageOnCard([])).toEqual({ stage: null, skipIndividual: true, skipBoth: true });
  });
});

describe("pathway words and deep links", () => {
  it("reads the pathway in words", () => {
    expect(pathwayChip(["group", "whole-class"])).toBe("indiv working → group review → class review");
  });

  it("describes every review stage in a short line under its stop (tickets 239, 246)", () => {
    expect(STAGE_DESCRIPTION).toEqual({
      individual: "students find and fix their own mistakes",
      group: "groups compare answers and fix mistakes together",
      "whole-class": "you lead the class through anonymous examples on the board",
    });
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
