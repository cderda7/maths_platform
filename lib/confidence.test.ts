import { describe, expect, it } from "vitest";
import { FACTORISING, MONIC, NONMONIC, pickedLeaves, pickedRows, pickerRows } from "./confidence";

describe("the not-confident list's factorising row", () => {
  it("folds the two factorising leaves into one row with monic and non-monic under it", () => {
    const rows = pickerRows();
    const f = rows.filter((r) => r.id === FACTORISING);
    expect(f).toHaveLength(1);
    expect(f[0].label).toBe("factorising");
    expect(f[0].children).toEqual([{ id: MONIC, label: "monic" }, { id: NONMONIC, label: "non-monic" }]);
    expect(rows.map((r) => r.id)).not.toContain(MONIC);
    expect(rows.map((r) => r.id)).not.toContain(NONMONIC);
    expect(rows.every((r) => r.id === FACTORISING || !r.children)).toBe(true);
    expect(rows.find((r) => r.id === "unit.u1.nfl")?.label).toBe("null factor law");
  });

  it("sits where the first factorising leaf ranked", () => {
    const rows = pickerRows();
    expect(rows.map((r) => r.id).indexOf(FACTORISING)).toBe(1);
  });

  it("means both kinds when the row is ticked and neither kind is", () => {
    expect(pickedLeaves(["unit.u1.nfl", FACTORISING, "algebra.number.fractions"])).toEqual(["unit.u1.nfl", MONIC, NONMONIC, "algebra.number.fractions"]);
  });

  it("means the ticked kinds, in their tick order, where the row sits", () => {
    expect(pickedLeaves([FACTORISING, "unit.u1.nfl", NONMONIC])).toEqual([NONMONIC, "unit.u1.nfl"]);
    expect(pickedLeaves([FACTORISING, NONMONIC, MONIC])).toEqual([NONMONIC, MONIC]);
  });

  it("drops a kind without its row and passes plain leaves through", () => {
    expect(pickedLeaves([MONIC, "unit.u1.nfl"])).toEqual(["unit.u1.nfl"]);
    expect(pickedLeaves([])).toEqual([]);
  });

  it("reads a stored answer back as rows for the locked view", () => {
    expect(pickedRows(["unit.u1.nfl", MONIC, NONMONIC])).toEqual(["unit.u1.nfl", FACTORISING, MONIC, NONMONIC]);
    expect(pickedRows([NONMONIC])).toEqual([FACTORISING, NONMONIC]);
    expect(pickedRows(["algebra.number.fractions"])).toEqual(["algebra.number.fractions"]);
    expect(pickedLeaves(pickedRows([NONMONIC, "unit.u1.nfl", MONIC]))).toEqual([NONMONIC, MONIC, "unit.u1.nfl"]);
  });
});
