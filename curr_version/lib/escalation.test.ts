import { describe, expect, it } from "vitest";
import { INITIAL_ESCALATION, recordMistake, requestHelp } from "./escalation";

describe("subskill-instance counter", () => {
  it("1st instance is a no-op", () => {
    const r = recordMistake(INITIAL_ESCALATION, "factoring");
    expect(r.trigger).toBe(false);
    expect(r.cautioned).toBe(false);
    expect(r.state.counts.factoring).toBe(1);
    expect(r.state.caution).toEqual([]);
  });

  it("2nd instance triggers practice and resets the count", () => {
    const first = recordMistake(INITIAL_ESCALATION, "factoring").state;
    const r = recordMistake(first, "factoring");
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(false);
    expect(r.state.counts.factoring).toBe(0);
    expect(r.state.entries.factoring).toBe(1);
    expect(r.state.caution).toEqual([]);
  });

  it("a repeat 2nd instance after the reset triggers again and raises caution", () => {
    let s = INITIAL_ESCALATION;
    s = recordMistake(s, "factoring").state;
    s = recordMistake(s, "factoring").state; // practice #1
    s = recordMistake(s, "factoring").state; // 1st after reset: no-op
    const r = recordMistake(s, "factoring"); // 2nd after reset
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(true);
    expect(r.state.caution).toEqual(["factoring"]);
    expect(r.state.entries.factoring).toBe(2);
  });

  it("caution is raised once, not on every later trigger", () => {
    let s = INITIAL_ESCALATION;
    for (let i = 0; i < 4; i++) s = recordMistake(s, "factoring").state;
    expect(s.caution).toEqual(["factoring"]);
    s = recordMistake(s, "factoring").state;
    const r = recordMistake(s, "factoring");
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(false);
    expect(r.state.caution).toEqual(["factoring"]);
  });

  it("'I need help' runs the identical flow: a detected practice then a help request cautions", () => {
    let s = INITIAL_ESCALATION;
    s = recordMistake(s, "factoring").state;
    s = recordMistake(s, "factoring").state; // practice #1, detected
    const r = requestHelp(s, "factoring"); // practice #2, self-identified
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(true);
    expect(r.state.caution).toEqual(["factoring"]);
  });

  it("help alone triggers practice without caution, and resets that subskill's count", () => {
    const s = recordMistake(INITIAL_ESCALATION, "algebra").state;
    const r = requestHelp(s, "algebra");
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(false);
    expect(r.state.counts.algebra).toBe(0);
  });

  it("subskills are counted independently", () => {
    let s = recordMistake(INITIAL_ESCALATION, "factoring").state;
    const r = recordMistake(s, "algebra");
    expect(r.trigger).toBe(false);
    s = r.state;
    expect(s.counts).toEqual({ factoring: 1, algebra: 1 });
  });
});
