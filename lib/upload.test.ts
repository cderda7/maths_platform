import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "./extract";
import { applyFix, applyRead, confirmAll, discardUnconfirmed, draftItem, dropNote, failureMessage, insertBefore, isPdfFile, isQuestion, isUnconfirmed, messageItem, partitionDrop, pendingItem, removeItem, replaceItem, unconfirmedCount, updateQuestion, type Item, type MessageItem, type PendingItem, type QuestionItem } from "./upload";

const png = (name: string, size = 1000) => ({ name, type: "image/png", size });
const pdf = (name: string, size = 1000) => ({ name, type: "application/pdf", size });
const q = (id: string, text = "x", extra: Partial<QuestionItem> = {}): QuestionItem => ({ id, text, ...extra });
const up = (id: string, confirmed = false): QuestionItem => q(id, "Solve.\nx=1", { uploaded: true, confirmed, sourceId: "s", name: "a.png" });
const marker: PendingItem = { kind: "pending", id: "m", text: "", sourceId: "s1", name: "sheet.png", thumb: "data:t" };

describe("partitionDrop", () => {
  it("takes images in drop order up to twenty and PDFs up to five, each cap its own, leaves the rest with a reason, never refuses the drop whole", () => {
    const files = [...Array.from({ length: 21 }, (_, i) => png(`p${i}.png`)), pdf("w.pdf"), { name: "n.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 10 }, png("big.png", MAX_FILE_BYTES + 1), { name: "j.jpg", type: "image/jpeg", size: 5 }];
    const { accepted, left } = partitionDrop(files);
    expect(accepted.map((f) => f.name)).toEqual([...Array.from({ length: 20 }, (_, i) => `p${i}.png`), "w.pdf"]);
    expect(left.map((l) => `${l.file.name}:${l.reason}`)).toEqual(["p20.png:too-many-images", "n.docx:docx", "big.png:too-large", "j.jpg:too-many-images"]);
    const six = partitionDrop([...Array.from({ length: 6 }, (_, i) => pdf(`s${i}.pdf`)), png("a.png")]);
    expect(six.accepted.map((f) => f.name)).toEqual(["s0.pdf", "s1.pdf", "s2.pdf", "s3.pdf", "s4.pdf", "a.png"]);
    expect(six.left.map((l) => `${l.file.name}:${l.reason}`)).toEqual(["s5.pdf:too-many-pdfs"]);
  });

  it("a file over the cap does not use up a slot; a PDF by extension with no type is still a PDF; a .doc is a Word file too", () => {
    const { accepted, left } = partitionDrop([png("big.png", MAX_FILE_BYTES + 1), png("ok.png"), { name: "w.pdf", type: "", size: 1 }, pdf("huge.pdf", MAX_FILE_BYTES + 1), { name: "old.doc", type: "", size: 1 }]);
    expect(accepted.map((f) => f.name)).toEqual(["ok.png", "w.pdf"]);
    expect(left.map((l) => `${l.file.name}:${l.reason}`)).toEqual(["big.png:too-large", "huge.pdf:too-large", "old.doc:docx"]);
    expect(partitionDrop([]).accepted).toEqual([]);
    expect(isPdfFile({ name: "W.PDF", type: "", size: 1 })).toBe(true);
    expect(isPdfFile(png("a.png"))).toBe(false);
  });
});

describe("dropNote", () => {
  it("names the cap once with its count and every other file by name, or says nothing", () => {
    expect(dropNote([])).toBeNull();
    const { left } = partitionDrop([...Array.from({ length: 23 }, (_, i) => png(`p${i}.png`)), ...Array.from({ length: 7 }, (_, i) => pdf(`s${i}.pdf`)), { name: "n.docx", type: "", size: 1 }, png("big.png", 11 * 1024 * 1024), { name: "a.txt", type: "text/plain", size: 1 }]);
    expect(dropNote(left)).toBe("Twenty pictures at a time; 3 not added · Five PDFs at a time; s5.pdf, s6.pdf not added · n.docx: export it as a PDF · big.png is 11 MB; ten at most · a.txt: not a picture or PDF");
    expect(dropNote(partitionDrop([{ name: "chapter2.docx", type: "", size: 1 }]).left)).toBe("chapter2.docx: export it as a PDF");
  });
});

describe("the tile list", () => {
  const ghost = q("g", "");
  const list: Item[] = [q("a"), marker, ghost];

  it("inserts before an id, at the end when the id is unknown; replaces and removes by id", () => {
    expect(insertBefore(list, "m", q("d")).map((x) => x.id)).toEqual(["a", "d", "m", "g"]);
    expect(insertBefore(list, "nope", q("d")).map((x) => x.id)).toEqual(["a", "m", "g", "d"]);
    expect(replaceItem(list, "m", q("r")).map((x) => x.id)).toEqual(["a", "r", "g"]);
    expect(removeItem(list, "m").map((x) => x.id)).toEqual(["a", "g"]);
    expect(list.map((x) => x.id)).toEqual(["a", "m", "g"]);
    expect(updateQuestion(list, "a", (x) => ({ ...x, text: "changed" })).map((x) => x.text)).toEqual(["changed", "", ""]);
    expect(updateQuestion(list, "m", (x) => ({ ...x, text: "changed" }))).toEqual(list);
  });

  it("knows a question from a marker, and an unconfirmed upload from a kept one or a typed one", () => {
    expect(isQuestion(q("a"))).toBe(true);
    expect(isQuestion(marker)).toBe(false);
    expect(isUnconfirmed(up("u"))).toBe(true);
    expect(isUnconfirmed(up("u", true))).toBe(false);
    expect(isUnconfirmed(q("t"))).toBe(false);
    expect(isUnconfirmed(marker)).toBe(false);
  });

  it("counts, keeps and discards the unconfirmed only", () => {
    const l: Item[] = [q("t"), up("u1"), up("u2", true), marker, up("u3"), ghost];
    expect(unconfirmedCount(l)).toBe(2);
    expect(confirmAll(l).map((x) => (isQuestion(x) ? `${x.id}:${x.confirmed ?? "-"}` : x.id))).toEqual(["t:-", "u1:true", "u2:true", "m", "u3:true", "g:-"]);
    expect(unconfirmedCount(confirmAll(l))).toBe(0);
    expect(discardUnconfirmed(l).map((x) => x.id)).toEqual(["t", "u2", "m", "g"]);
  });
});

describe("draftItem", () => {
  it("is an unconfirmed upload whose text is the stem then the TeX, carrying the file's thumbnail and the sheet's page and label when given", () => {
    expect(draftItem({ source: 0, stem: "Solve for x.", tex: "x^2 = 4" }, marker, "n1")).toEqual({ id: "n1", text: "Solve for x.\nx^2 = 4", uploaded: true, confirmed: false, sourceId: "s1", name: "sheet.png", thumb: "data:t" });
    expect(draftItem({ source: 0, stem: "", tex: "x^2 = 4", page: 2, label: "4(a)" }, { sourceId: "s", name: "w.pdf" }, "n2")).toEqual({ id: "n2", text: "x^2 = 4", uploaded: true, confirmed: false, sourceId: "s", name: "w.pdf", page: 2, label: "4(a)" });
    expect(draftItem({ source: 0, stem: "Prose only.", tex: null }, { sourceId: "s", name: "w.pdf" }, "n3").text).toBe("Prose only.\n");
  });
});

describe("the model's reading of a typed tile (ticket 173)", () => {
  let n = 0;
  const newId = () => `n${++n}`;
  const typed: QuestionItem = { id: "t", text: "half of x squared plus 3", reading: true };
  const ghost = q("g", "");

  it("lands as `model` on the tile when its text is unchanged, the reading flag off", () => {
    const out = applyRead([typed, ghost], "t", "half of x squared plus 3", [{ source: 0, stem: "", tex: "\\tfrac{1}{2}x^2 + 3" }], newId);
    expect(out).toEqual([{ id: "t", text: "half of x squared plus 3", model: { for: "half of x squared plus 3", stem: "", tex: "\\tfrac{1}{2}x^2 + 3" } }, ghost]);
  });

  it("is dropped when the text moved on, the flag still cleared; a marker with the id is left alone", () => {
    const moved: QuestionItem = { ...typed, text: "half of x squared plus 4" };
    expect(applyRead([moved, ghost], "t", "half of x squared plus 3", [{ source: 0, stem: "", tex: "x" }], newId)).toEqual([{ id: "t", text: "half of x squared plus 4" }, ghost]);
    expect(applyRead([marker, ghost], "m", "", [{ source: 0, stem: "x", tex: null }], newId)).toEqual([marker, ghost]);
    expect(applyRead([typed], "nope", "x", [], newId)).toEqual([typed]);
  });

  it("extra drafts (a typed list) become confirmed typed tiles after it; no drafts clears the flag and sets no model", () => {
    const out = applyRead([typed, ghost], "t", "half of x squared plus 3", [{ source: 0, stem: "A.", tex: "x=1" }, { source: 0, stem: "B.", tex: "x=2" }, { source: 0, stem: "C.", tex: null }], newId);
    expect(out.map((x) => x.id)).toEqual(["t", "n1", "n2", "g"]);
    expect(out[1]).toEqual({ id: "n1", text: "B.\nx=2" });
    expect(out[2]).toEqual({ id: "n2", text: "C.\n" });
    expect(applyRead([typed], "t", "half of x squared plus 3", [], newId)).toEqual([{ id: "t", text: "half of x squared plus 3" }]);
  });

  it("a fix replaces the text with the corrected stem then TeX, clears the model and the fixing flag, keeps everything else", () => {
    const u: QuestionItem = { ...up("u"), fixing: true, model: { for: "x", stem: "s", tex: null } };
    const out = applyFix([u, typed, ghost], "u", { source: 0, stem: "Solve for x.", tex: "x^2 + 5x + 8 = 0" });
    expect(out[0]).toEqual({ id: "u", text: "Solve for x.\nx^2 + 5x + 8 = 0", uploaded: true, confirmed: false, sourceId: "s", name: "a.png" });
    expect(out[1]).toEqual(typed);
  });
});

describe("failure tiles", () => {
  it("words every failure and offers Try again only where it could help", () => {
    expect(failureMessage("not-configured", "a.png")).toEqual({ message: "Upload needs the model. Not configured.", retry: false });
    expect(failureMessage("busy", "a.png")).toEqual({ message: "Couldn't read a.png.", retry: true });
    expect(failureMessage("unavailable", "a.png")).toEqual({ message: "Couldn't read a.png.", retry: true });
    expect(failureMessage("network", "a.png")).toEqual({ message: "Couldn't read a.png.", retry: true });
    expect(failureMessage("declined", "a.png")).toEqual({ message: "The model declined a.png.", retry: false });
    expect(failureMessage("empty", "a.png")).toEqual({ message: "No questions found in a.png.", retry: false });
    expect(failureMessage("too-large", "a.png")).toEqual({ message: "Couldn't send a.png.", retry: false });
    expect(failureMessage("bad-request", "a.png")).toEqual({ message: "Couldn't send a.png.", retry: false });
    expect(failureMessage("too-many-pages", "w.pdf", 14)).toEqual({ message: "w.pdf has 14 pages; 10 at most", retry: false });
    expect(messageItem(marker, "too-many-pages", 14).message).toBe("sheet.png has 14 pages; 10 at most");
  });

  it("a marker becomes its message tile with the same id and file, and back to a marker for Try again", () => {
    const m = messageItem(marker, "busy");
    expect(m).toEqual({ kind: "message", id: "m", text: "", sourceId: "s1", name: "sheet.png", thumb: "data:t", message: "Couldn't read sheet.png.", retry: true });
    expect(pendingItem(m)).toEqual(marker);
    expect(pendingItem(m, "m2").id).toBe("m2");
    const plain: MessageItem = messageItem({ kind: "pending", id: "p", text: "", sourceId: "s", name: "n.png" }, "empty");
    expect(plain.thumb).toBeUndefined();
  });
});
