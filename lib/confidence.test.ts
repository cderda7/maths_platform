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
    expect(rows.find((r) => r.id === "functions.zeros.nfl")?.label).toBe("null factor law");
  });

  it("sits where the first factorising leaf ranked", () => {
    const rows = pickerRows();
    expect(rows.map((r) => r.id).indexOf(FACTORISING)).toBe(1);
  });

  it("means both kinds when the row is ticked and neither kind is", () => {
    expect(pickedLeaves(["functions.zeros.nfl", FACTORISING, "algebra.number.fractions"])).toEqual(["functions.zeros.nfl", MONIC, NONMONIC, "algebra.number.fractions"]);
  });

  it("means the ticked kinds, in their tick order, where the row sits", () => {
    expect(pickedLeaves([FACTORISING, "functions.zeros.nfl", NONMONIC])).toEqual([NONMONIC, "functions.zeros.nfl"]);
    expect(pickedLeaves([FACTORISING, NONMONIC, MONIC])).toEqual([NONMONIC, MONIC]);
  });

  it("drops a kind without its row and passes plain leaves through", () => {
    expect(pickedLeaves([MONIC, "functions.zeros.nfl"])).toEqual(["functions.zeros.nfl"]);
    expect(pickedLeaves([])).toEqual([]);
  });

  it("reads a stored answer back as rows for the locked view", () => {
    expect(pickedRows(["functions.zeros.nfl", MONIC, NONMONIC])).toEqual(["functions.zeros.nfl", FACTORISING, MONIC, NONMONIC]);
    expect(pickedRows([NONMONIC])).toEqual([FACTORISING, NONMONIC]);
    expect(pickedRows(["algebra.number.fractions"])).toEqual(["algebra.number.fractions"]);
    expect(pickedLeaves(pickedRows([NONMONIC, "functions.zeros.nfl", MONIC]))).toEqual([NONMONIC, MONIC, "functions.zeros.nfl"]);
  });
});
