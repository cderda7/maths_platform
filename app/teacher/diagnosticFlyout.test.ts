import { beforeEach, describe, expect, it } from "vitest";
import { getFlyout, resetFlyout, sentFrom, setFlyoutOpen, toggleStep } from "./diagnosticFlyout";

describe("the Mistakes flyout's state outside React (ticket 260)", () => {
  beforeEach(() => resetFlyout());

  it("one flyout open at a time; closing another problem's flyout leaves the open one open", () => {
    setFlyoutOpen("q1", true);
    expect(getFlyout().open).toBe("q1");
    setFlyoutOpen("q2", false);
    expect(getFlyout().open).toBe("q1");
    setFlyoutOpen("q2", true);
    expect(getFlyout().open).toBe("q2");
    setFlyoutOpen("q2", false);
    expect(getFlyout().open).toBeNull();
  });

  it("an unchanged open or close writes nothing, so its subscribers are not woken", () => {
    setFlyoutOpen("q1", true);
    const s = getFlyout();
    setFlyoutOpen("q1", true);
    setFlyoutOpen("q3", false);
    expect(getFlyout()).toBe(s);
  });

  it("selection per problem, in click order; a second click clears; it survives the flyout closing", () => {
    toggleStep("q1", "d-q1-zeros");
    toggleStep("q1", "d-q1-pair");
    toggleStep("q2", "d-q2-split");
    expect(getFlyout().selected).toEqual({ q1: ["d-q1-zeros", "d-q1-pair"], q2: ["d-q2-split"] });
    toggleStep("q1", "d-q1-zeros");
    setFlyoutOpen("q1", true);
    setFlyoutOpen("q1", false);
    expect(getFlyout().selected.q1).toEqual(["d-q1-pair"]);
  });

  it("the store is the same object whoever reads it: a remounted flyout reads it as it was", () => {
    setFlyoutOpen("q1", true);
    toggleStep("q1", "d-q1-pair");
    const again = getFlyout();
    expect(again).toEqual({ open: "q1", selected: { q1: ["d-q1-pair"] } });
  });

  it("sending closes that problem's flyout and clears its selection, and nothing else", () => {
    toggleStep("q2", "d-q2-split");
    setFlyoutOpen("q1", true);
    toggleStep("q1", "d-q1-pair");
    sentFrom("q1");
    expect(getFlyout()).toEqual({ open: null, selected: { q1: [], q2: ["d-q2-split"] } });
    setFlyoutOpen("q2", true);
    sentFrom("q1");
    expect(getFlyout().open).toBe("q2");
  });
});
