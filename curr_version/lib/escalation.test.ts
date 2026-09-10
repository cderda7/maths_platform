import { describe, expect, it } from "vitest";
import { INITIAL_ESCALATION, recordMistake, requestHelp } from "./escalation";

describe("subskill-instance counter", () => {
  it("1st instance is a no-op", () => {
    const r = recordMistake(INITIAL_ESCALATION, "algebra.expand-factor");
    expect(r.trigger).toBe(false);
    expect(r.cautioned).toBe(false);
    expect(r.state.counts["algebra.expand-factor"]).toBe(1);
    expect(r.state.caution).toEqual([]);
  });

  it("2nd instance triggers practice and resets the count", () => {
    const first = recordMistake(INITIAL_ESCALATION, "algebra.expand-factor").state;
    const r = recordMistake(first, "algebra.expand-factor");
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(false);
    expect(r.state.counts["algebra.expand-factor"]).toBe(0);
    expect(r.state.entries["algebra.expand-factor"]).toBe(1);
    expect(r.state.caution).toEqual([]);
  });

  it("a repeat 2nd instance after the reset triggers again and raises caution", () => {
    let s = INITIAL_ESCALATION;
    s = recordMistake(s, "algebra.expand-factor").state;
    s = recordMistake(s, "algebra.expand-factor").state; // practice #1
    s = recordMistake(s, "algebra.expand-factor").state; // 1st after reset: no-op
    const r = recordMistake(s, "algebra.expand-factor"); // 2nd after reset
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(true);
    expect(r.state.caution).toEqual(["algebra.expand-factor"]);
    expect(r.state.entries["algebra.expand-factor"]).toBe(2);
  });

  it("caution is raised once, not on every later trigger", () => {
    let s = INITIAL_ESCALATION;
    for (let i = 0; i < 4; i++) s = recordMistake(s, "algebra.expand-factor").state;
    expect(s.caution).toEqual(["algebra.expand-factor"]);
    s = recordMistake(s, "algebra.expand-factor").state;
    const r = recordMistake(s, "algebra.expand-factor");
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(false);
    expect(r.state.caution).toEqual(["algebra.expand-factor"]);
  });

  it("'I need help' runs the identical flow: a detected practice then a help request cautions", () => {
    let s = INITIAL_ESCALATION;
    s = recordMistake(s, "algebra.expand-factor").state;
    s = recordMistake(s, "algebra.expand-factor").state; // practice #1, detected
    const r = requestHelp(s, "algebra.expand-factor"); // practice #2, self-identified
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(true);
    expect(r.state.caution).toEqual(["algebra.expand-factor"]);
  });

  it("help alone triggers practice without caution, and resets that subskill's count", () => {
    const s = recordMistake(INITIAL_ESCALATION, "algebra.equations").state;
    const r = requestHelp(s, "algebra.equations");
    expect(r.trigger).toBe(true);
    expect(r.cautioned).toBe(false);
    expect(r.state.counts["algebra.equations"]).toBe(0);
  });

  it("the slipped leaves come back with the trigger and reset", () => {
    let s = recordMistake(INITIAL_ESCALATION, "algebra.expand-factor", "algebra.expand-factor.monic").state;
    expect(s.slips["algebra.expand-factor"]).toEqual(["algebra.expand-factor.monic"]);
    const second = recordMistake(s, "algebra.expand-factor", "algebra.expand-factor.nonmonic");
    expect(second.slipped).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic"]);
    s = second.state;
    expect(s.slips["algebra.expand-factor"]).toEqual([]);
  });

  it("subskills are counted independently", () => {
    let s = recordMistake(INITIAL_ESCALATION, "algebra.expand-factor").state;
    const r = recordMistake(s, "algebra.equations");
    expect(r.trigger).toBe(false);
    s = r.state;
    expect(s.counts).toEqual({ "algebra.expand-factor": 1, "algebra.equations": 1 });
  });
});
