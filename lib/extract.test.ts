import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FILE_FIXTURES, fixtureDrafts, fixtureFix, noFixture, TEXT_FIXTURES } from "@/data/extract-fixtures";
import manifest from "@/fixtures/extract/manifest.json";
import { toTex } from "./mathInput";
import { base64Bytes, base64ToBytes, extractMessages, extractSystem, LineBuffer, MAX_FILE_BYTES, MAX_IMAGES, MAX_PDFS, parseDraftLine, parseExtractEvent, parseExtractRequest, pdfPageCount, readExtractEvents, sourceHash, sourceName, type ExtractEvent, type Source } from "./extract";

const b64 = (s: string) => Buffer.from(s).toString("base64");
const png = (name = "shot.png"): Source => ({ kind: "image", name, mime: "image/png", data: b64("png-bytes") });
const pdf = (name = "sheet.pdf"): Source => ({ kind: "pdf", name, data: b64("%PDF-1.4 /Type /Page") });
const fixture = (name: string) => readFileSync(join(process.cwd(), "fixtures", "extract", name));

describe("parseExtractRequest", () => {
  it("reads text, image and pdf sources and nothing else", () => {
    const r = parseExtractRequest({ sources: [{ kind: "text", text: "Solve for x. x**2 = 4" }, png(), pdf()] });
    expect(r.ok && r.request.mode === "extract" && r.request.sources.map((s) => s.kind)).toEqual(["text", "image", "pdf"]);
    expect(parseExtractRequest({ mode: "extract", sources: [png()] }).ok).toBe(true);
    expect(parseExtractRequest({ mode: "other", sources: [png()] })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest(null)).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ sources: [] })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ sources: [{ kind: "text", text: "   " }] })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ sources: [{ kind: "image", name: "a.png", mime: "image/bmp", data: b64("x") }] })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ sources: [{ kind: "image", name: "a.png", mime: "image/png", data: "not base64!" }] })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ sources: [{ kind: "pdf", data: b64("x") }] })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ sources: [{ kind: "docx", name: "a.docx", data: b64("x") }] })).toEqual({ ok: false, failure: "bad-request" });
  });

  it("keeps a text source's name only when given", () => {
    const r = parseExtractRequest({ sources: [{ kind: "text", text: "x" }, { kind: "text", name: "pasted", text: "y" }] });
    expect(r.ok && r.request.mode === "extract" && r.request.sources).toEqual([
      { kind: "text", text: "x" },
      { kind: "text", name: "pasted", text: "y" },
    ]);
  });

  it("applies the caps: a sixth PDF, a twenty-first image, a file over ten MB, a very long text", () => {
    expect(parseExtractRequest({ sources: Array.from({ length: MAX_PDFS }, () => pdf()) }).ok).toBe(true);
    expect(parseExtractRequest({ sources: Array.from({ length: MAX_PDFS + 1 }, () => pdf()) })).toEqual({ ok: false, failure: "too-large" });
    expect(parseExtractRequest({ sources: Array.from({ length: MAX_IMAGES }, () => png()) }).ok).toBe(true);
    expect(parseExtractRequest({ sources: Array.from({ length: MAX_IMAGES + 1 }, () => png()) })).toEqual({ ok: false, failure: "too-large" });
    const big = "A".repeat(Math.ceil((MAX_FILE_BYTES + 3) / 3) * 4);
    expect(parseExtractRequest({ sources: [{ kind: "image", name: "big.png", mime: "image/png", data: big }] })).toEqual({ ok: false, failure: "too-large" });
    expect(parseExtractRequest({ sources: [{ kind: "text", text: "x".repeat(20_001) }] })).toEqual({ ok: false, failure: "too-large" });
  });
});

describe("parseExtractRequest in fix mode (ticket 173)", () => {
  it("reads the draft, the instruction and an optional picture; refuses an empty draft, an empty instruction or a text source", () => {
    expect(parseExtractRequest({ mode: "fix", stem: "Solve.", tex: "x^2 = 4", instruction: " the 4 should be 9 " })).toEqual({ ok: true, request: { mode: "fix", stem: "Solve.", tex: "x^2 = 4", instruction: "the 4 should be 9" } });
    expect(parseExtractRequest({ mode: "fix", stem: "", tex: "x^2 = 4", instruction: "x", source: png("a.png") })).toEqual({ ok: true, request: { mode: "fix", stem: "", tex: "x^2 = 4", instruction: "x", source: png("a.png") } });
    expect(parseExtractRequest({ mode: "fix", stem: "Prose.", tex: "", instruction: "x" })).toEqual({ ok: true, request: { mode: "fix", stem: "Prose.", tex: null, instruction: "x" } });
    expect(parseExtractRequest({ mode: "fix", stem: "", tex: null, instruction: "x" })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ mode: "fix", stem: "Solve.", tex: null, instruction: "  " })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ mode: "fix", stem: "Solve.", tex: null, instruction: "x", source: { kind: "text", text: "t" } })).toEqual({ ok: false, failure: "bad-request" });
    expect(parseExtractRequest({ mode: "fix", stem: "Solve.", tex: null, instruction: "x".repeat(501) })).toEqual({ ok: false, failure: "too-large" });
    expect(parseExtractRequest({ mode: "fix", stem: "Solve.", tex: 5, instruction: "x" })).toEqual({ ok: false, failure: "bad-request" });
  });

  it("the fix brief asks for one line, the correction applied and nothing else changed, TeX taken as the expression", () => {
    const s = extractSystem("fix");
    expect(s).toContain("Write exactly one JSON object on one line");
    expect(s).toContain("Apply the correction and change nothing else");
    expect(s).toContain("a line of TeX replaces the expression");
    expect(s).toContain("read the correction against it");
    expect(s).toContain("Never write solutions");
    expect(extractSystem()).toBe(extractSystem("extract"));
  });

  it("the fix turn carries the draft, the picture when given, and the correction", () => {
    const [m] = extractMessages({ mode: "fix", stem: "Solve.", tex: "x^2 = 4", instruction: "the 4 should be 9", source: png("q.png") });
    const c = m.content as unknown as Array<Record<string, unknown>>;
    expect(c.map((b) => b.type)).toEqual(["text", "text", "image", "text"]);
    expect(c[0].text).toBe('The problem as it stands:\nstem: "Solve."\ntex: "x^2 = 4"');
    expect(c[1].text).toBe("The picture it was read from: q.png");
    expect(c[3].text).toBe("The teacher's correction: the 4 should be 9");
    const [n] = extractMessages({ mode: "fix", stem: "Prose.", tex: null, instruction: "x" });
    expect((n.content as unknown as Array<Record<string, unknown>>).map((b) => b.text)).toEqual(['The problem as it stands:\nstem: "Prose."\ntex: null', "The teacher's correction: x"]);
  });

  it("fixtureFix: TeX replaces the expression, 'A should be B' swaps in the expression then the stem, anything else leaves the draft", () => {
    expect(fixtureFix({ stem: "Solve for x.", tex: "x^2 + 5x + 6 = 0", instruction: "the 6 should be 8" })).toEqual({ source: 0, stem: "Solve for x.", tex: "x^2 + 5x + 8 = 0" });
    expect(fixtureFix({ stem: "Solve for x.", tex: "x^2 + 5x + 6 = 0", instruction: "5x should be 3x." })).toEqual({ source: 0, stem: "Solve for x.", tex: "x^2 + 3x + 6 = 0" });
    expect(fixtureFix({ stem: "Solve for x.", tex: "x^2 + 5x + 6 = 0", instruction: "replace 6 with 8" })).toEqual({ source: 0, stem: "Solve for x.", tex: "x^2 + 5x + 8 = 0" });
    expect(fixtureFix({ stem: "Solve for y.", tex: "x^2 = 4", instruction: "the y should be x" })).toEqual({ source: 0, stem: "Solve for x.", tex: "x^2 = 4" });
    expect(fixtureFix({ stem: "Solve.", tex: "x^2 = 4", instruction: "\\frac{1}{2}x^2 = 4" })).toEqual({ source: 0, stem: "Solve.", tex: "\\frac{1}{2}x^2 = 4" });
    expect(fixtureFix({ stem: "Solve.", tex: "x^2 = 4", instruction: "x^2 = 9" })).toEqual({ source: 0, stem: "Solve.", tex: "x^2 = 9" });
    expect(fixtureFix({ stem: "Solve.", tex: "x^2 = 4", instruction: "make it harder" })).toEqual({ source: 0, stem: "Solve.", tex: "x^2 = 4" });
  });
});

describe("base64", () => {
  it("counts bytes without decoding and decodes to the same bytes", () => {
    for (const s of ["", "a", "ab", "abc", "abcd", "hello world"]) {
      expect(base64Bytes(b64(s))).toBe(s.length);
      expect(new TextDecoder().decode(base64ToBytes(b64(s)))).toBe(s);
    }
  });
});

describe("pdfPageCount", () => {
  it("counts the page objects of a Chrome-printed PDF and reads nothing as unknown", () => {
    expect(pdfPageCount(fixture("worksheet.pdf"))).toBe(3);
    expect(pdfPageCount(new TextEncoder().encode("%PDF-1.7\n1 0 obj << /Type /Pages /Count 2 >>\n2 0 obj << /Type /Page >>\n3 0 obj <</Type/Page>>"))).toBe(2);
    expect(pdfPageCount(new TextEncoder().encode("%PDF-1.7 compressed object streams"))).toBeNull();
  });
});

describe("extractSystem", () => {
  const s = extractSystem();

  it("states the line shape and every field", () => {
    expect(s).toContain("one JSON object per line");
    for (const f of ["source", "page", "label", "stem", "tex", "figure"]) expect(s).toContain(`- ${f}:`);
    expect(s).toContain("in reading order");
  });

  it("states the rules the tiles depend on: sub-parts one each with the stem repeated, typed shorthand and plain English normalised, a pasted list split, no solutions, nothing invented", () => {
    expect(s).toContain("Sub-parts (a), (b), (c) of one question are one line each, the shared stem repeated in each");
    expect(s).toContain("calculator shorthand (x**2, 1/3x^2, sqrt(2), pi, <=), plain English");
    expect(s).toContain("A pasted list is one problem per line or per number; split it.");
    expect(s).toContain("Never write solutions, answers, hints, marks or difficulty");
    expect(s).toContain("Skip headings, instructions to the class, page numbers");
    expect(s).toContain("A source with no problems in it gets no lines at all.");
    expect(s).toContain("Do not invent a figure");
  });
});

describe("extractMessages", () => {
  it("is one user turn: each source named, text as text, an image as an image block, a PDF as a document block", () => {
    const [m] = extractMessages({ mode: "extract", sources: [{ kind: "text", text: "x**2 = 4" }, png("q.png"), pdf("w.pdf")] });
    expect(m.role).toBe("user");
    const c = m.content as unknown as Array<Record<string, unknown>>;
    expect(c.map((b) => b.type)).toEqual(["text", "text", "text", "image", "text", "document"]);
    expect(c[0]).toEqual({ type: "text", text: "Source 0: typed text 1" });
    expect(c[1]).toEqual({ type: "text", text: "x**2 = 4" });
    expect(c[2]).toEqual({ type: "text", text: "Source 1: q.png" });
    expect(c[3]).toEqual({ type: "image", source: { type: "base64", media_type: "image/png", data: b64("png-bytes") } });
    expect(c[4]).toEqual({ type: "text", text: "Source 2: w.pdf" });
    expect(c[5]).toEqual({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64("%PDF-1.4 /Type /Page") }, title: "w.pdf" });
  });

  it("names a source by its file name, or by its kind and number", () => {
    expect(sourceName({ kind: "text", text: "x" }, 2)).toBe("typed text 3");
    expect(sourceName({ kind: "text", name: "pasted", text: "x" }, 2)).toBe("pasted");
    expect(sourceName(png("a.png"), 0)).toBe("a.png");
  });
});

describe("parseDraftLine", () => {
  it("reads a full line, a minimal one, and fills the source when there is only one", () => {
    expect(parseDraftLine('{"source": 1, "page": 2, "label": "4(a)", "stem": "Solve for x.", "tex": "x^2 = 4", "figure": {"page": 2, "x0": 0.1, "y0": 0.2, "x1": 0.5, "y1": 0.6}}', 3)).toEqual({
      source: 1,
      page: 2,
      label: "4(a)",
      stem: "Solve for x.",
      tex: "x^2 = 4",
      figure: { page: 2, x0: 0.1, y0: 0.2, x1: 0.5, y1: 0.6 },
    });
    expect(parseDraftLine('{"stem": "Prose only.", "tex": null}', 1)).toEqual({ source: 0, stem: "Prose only.", tex: null });
    expect(parseDraftLine('{"stem": "", "tex": "x^2"}', 1)).toEqual({ source: 0, stem: "", tex: "x^2" });
    expect(parseDraftLine('  {"source": 0, "stem": " Solve. ", "tex": " x = 1 "}  ', 1)).toEqual({ source: 0, stem: "Solve.", tex: "x = 1" });
  });

  it("drops what is not a draft: prose, a fence, bad JSON, an unknown source, a draft with nothing in it, a bad tex", () => {
    expect(parseDraftLine("Here are the problems:", 1)).toBeNull();
    expect(parseDraftLine("```json", 1)).toBeNull();
    expect(parseDraftLine('{"stem": "x", "tex": ', 1)).toBeNull();
    expect(parseDraftLine('{"stem": "x", "tex": null}', 2)).toBeNull();
    expect(parseDraftLine('{"source": 2, "stem": "x", "tex": null}', 2)).toBeNull();
    expect(parseDraftLine('{"source": 0, "stem": "", "tex": null}', 1)).toBeNull();
    expect(parseDraftLine('{"source": 0, "stem": "x", "tex": 5}', 1)).toBeNull();
    expect(parseDraftLine("[1, 2]", 1)).toBeNull();
  });

  it("keeps the draft and drops a figure that does not parse; ignores a bad page or label", () => {
    expect(parseDraftLine('{"source": 0, "stem": "x", "tex": null, "figure": {"x0": 0.5, "y0": 0, "x1": 0.2, "y1": 1}}', 1)).toEqual({ source: 0, stem: "x", tex: null });
    expect(parseDraftLine('{"source": 0, "stem": "x", "tex": null, "figure": {"x0": 0, "y0": 0, "x1": 2, "y1": 1}}', 1)).toEqual({ source: 0, stem: "x", tex: null });
    expect(parseDraftLine('{"source": 0, "stem": "x", "tex": null, "page": 0, "label": "  "}', 1)).toEqual({ source: 0, stem: "x", tex: null });
    expect(parseDraftLine('{"source": 0, "stem": "x", "tex": null, "figure": {"x0": 0, "y0": 0, "x1": 1, "y1": 1, "page": 0}}', 1)).toEqual({ source: 0, stem: "x", tex: null, figure: { x0: 0, y0: 0, x1: 1, y1: 1 } });
  });
});

describe("parseExtractEvent", () => {
  it("reads the three event kinds and skips anything else", () => {
    expect(parseExtractEvent('{"type":"draft","source":0,"stem":"Solve.","tex":"x=1"}')).toEqual({ type: "draft", source: 0, stem: "Solve.", tex: "x=1" });
    expect(parseExtractEvent('{"type":"draft","source":3,"stem":"","tex":"x","page":1,"label":"2"}')).toEqual({ type: "draft", source: 3, stem: "", tex: "x", page: 1, label: "2" });
    expect(parseExtractEvent('{"type":"done","source":1}')).toEqual({ type: "done", source: 1 });
    expect(parseExtractEvent('{"type":"done","source":1,"dropped":2}')).toEqual({ type: "done", source: 1, dropped: 2 });
    expect(parseExtractEvent('{"type":"done","source":1,"dropped":0}')).toEqual({ type: "done", source: 1 });
    expect(parseExtractEvent('{"type":"error","source":0,"reason":"declined"}')).toEqual({ type: "error", source: 0, reason: "declined" });
    expect(parseExtractEvent("")).toBeNull();
    expect(parseExtractEvent("not json")).toBeNull();
    expect(parseExtractEvent('{"type":"draft","stem":"x","tex":null}')).toBeNull();
    expect(parseExtractEvent('{"type":"draft","source":0,"stem":"","tex":null}')).toBeNull();
    expect(parseExtractEvent('{"type":"other","source":0}')).toBeNull();
  });
});

describe("LineBuffer", () => {
  it("cuts chunks into complete lines and holds the tail for its newline", () => {
    const b = new LineBuffer();
    expect(b.push('{"a":1}\n{"b":')).toEqual(['{"a":1}']);
    expect(b.push('2}\r\n{"c"')).toEqual(['{"b":2}']);
    expect(b.push(":3}")).toEqual([]);
    expect(b.end()).toEqual(['{"c":3}']);
    expect(b.end()).toEqual([]);
    expect(b.push("\n\n")).toEqual(["", ""]);
    expect(b.push("   ")).toEqual([]);
    expect(b.end()).toEqual([]);
  });
});

describe("readExtractEvents", () => {
  const stream = (chunks: string[]) =>
    new ReadableStream<Uint8Array>({
      start(c) {
        for (const ch of chunks) c.enqueue(new TextEncoder().encode(ch));
        c.close();
      },
    });
  const all = async (chunks: string[]) => {
    const out: ExtractEvent[] = [];
    for await (const ev of readExtractEvents(stream(chunks))) out.push(ev);
    return out;
  };

  it("yields events as lines complete, across chunk boundaries and a multi-byte character, and a last line with no newline", async () => {
    const evs = await all(['{"type":"draft","source":0,"stem":"Solve for ', 'x.","tex":"x^2 = 4"}\n{"type":"draft","source":0,"stem":"Find θ","tex":null}\n', '{"type":"done","source":0}']);
    expect(evs).toEqual([
      { type: "draft", source: 0, stem: "Solve for x.", tex: "x^2 = 4" },
      { type: "draft", source: 0, stem: "Find θ", tex: null },
      { type: "done", source: 0 },
    ]);
  });

  it("skips lines that are not events", async () => {
    expect(await all(["garbage\n", '{"type":"done","source":0}\n', "\n"])).toEqual([{ type: "done", source: 0 }]);
    expect(await all([])).toEqual([]);
  });
});

describe("sourceHash", () => {
  it("is SHA-256 hex of the bytes, the same for a string and its bytes", async () => {
    expect(await sourceHash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await sourceHash(new TextEncoder().encode("abc"))).toBe(await sourceHash("abc"));
  });
});

describe("the fixtures", () => {
  it("the files on disk still match the manifest's hashes (re-run scripts/render-extract-fixtures.mjs after changing either)", async () => {
    for (const [name, f] of Object.entries(manifest.files)) {
      expect(await sourceHash(fixture(name)), name).toBe(f.hash);
      expect(FILE_FIXTURES[f.hash]?.drafts.length, name).toBe(f.drafts.length);
    }
  });

  it("one problem, four on the worksheet with a figure on the third, ten on the PDF over three pages with 9(a) and 9(b) and figures on pages 2 and 3", () => {
    const m = manifest.files;
    expect(m["one-problem.png"].drafts).toEqual([{ source: 0, stem: "Solve for x.", tex: "x^2 + 5x + 6 = 0" }]);
    expect(m["worksheet.png"].drafts.map((d) => d.label)).toEqual(["1", "2", "3", "4"]);
    expect(m["worksheet.png"].drafts.map((d) => !!d.figure)).toEqual([false, false, true, false]);
    const pdfDrafts = m["worksheet.pdf"].drafts;
    expect(pdfDrafts.length).toBe(10);
    expect(m["worksheet.pdf"].pages).toBe(3);
    expect(pdfDrafts.map((d) => d.page)).toEqual([1, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
    expect(pdfDrafts.map((d) => d.label)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9(a)", "9(b)"]);
    expect(pdfDrafts.filter((d) => d.figure).map((d) => d.figure?.page)).toEqual([2, 3]);
    expect(pdfDrafts[9]).toEqual({ source: 0, page: 3, label: "9(b)", stem: "Say what that means for the graph of $y = x^2 + 4x + 5$.", tex: null });
    for (const d of [...m["worksheet.png"].drafts, ...pdfDrafts]) {
      if (!d.figure) continue;
      expect(d.figure.x0).toBeLessThan(d.figure.x1);
      expect(d.figure.y0).toBeLessThan(d.figure.y1);
      for (const v of [d.figure.x0, d.figure.y0, d.figure.x1, d.figure.y1]) expect(v).toBeGreaterThanOrEqual(0);
      for (const v of [d.figure.x0, d.figure.y0, d.figure.x1, d.figure.y1]) expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("a rendered file gets its drafts with the request's source index; an unknown file the no-fixture draft", async () => {
    const one: Source = { kind: "image", name: "one-problem.png", mime: "image/png", data: fixture("one-problem.png").toString("base64") };
    expect(await fixtureDrafts(one, 2)).toEqual([{ source: 2, stem: "Solve for x.", tex: "x^2 + 5x + 6 = 0" }]);
    const sheet: Source = { kind: "pdf", name: "worksheet.pdf", data: fixture("worksheet.pdf").toString("base64") };
    const drafts = await fixtureDrafts(sheet, 0);
    expect(drafts.length).toBe(10);
    expect(drafts[4].figure).toEqual(manifest.files["worksheet.pdf"].drafts[4].figure);
    expect(await fixtureDrafts(png("stranger.png"), 1)).toEqual([noFixture(png("stranger.png"), 1)]);
    expect(noFixture(png("stranger.png"), 1)).toEqual({ source: 1, stem: "No fixture for stranger.png", tex: null });
  });

  it("typed text reads through the shorthand parser, a pasted list one draft per line, and the plain-English lines from the table", async () => {
    expect(await fixtureDrafts({ kind: "text", text: "Solve for x. x**2 + 5x + 6 = 0" }, 0)).toEqual([{ source: 0, stem: "Solve for x.", tex: toTex("x**2 + 5x + 6 = 0") }]);
    expect(toTex("x**2 + 5x + 6 = 0")).toBe("x^{2} + 5x + 6 = 0");
    expect(await fixtureDrafts({ kind: "text", text: "Solve for x. x**2 = 4\n\nFactorise fully. 1/3x**2 + 2x + 8/3\n" }, 1)).toEqual([
      { source: 1, stem: "Solve for x.", tex: toTex("x**2 = 4") },
      { source: 1, stem: "Factorise fully.", tex: toTex("1/3x**2 + 2x + 8/3") },
    ]);
    expect(await fixtureDrafts({ kind: "text", text: "  Half of x squared plus 3 " }, 0)).toEqual([{ source: 0, ...TEXT_FIXTURES["half of x squared plus 3"][0] }]);
    expect(await fixtureDrafts({ kind: "text", text: "A ball is thrown." }, 0)).toEqual([{ source: 0, stem: "A ball is thrown.", tex: null }]);
  });
});
