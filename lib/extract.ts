import type Anthropic from "@anthropic-ai/sdk";

/**
 * Problem extraction (ticket 170): the one model call behind every way a question enters an
 * assignment. A typed line or pasted list, a screenshot, or a PDF goes in as a `Source`; what
 * comes back is a stream of `Draft`s, one per problem, each a stem and its TeX (no solution: a
 * symbolic grading engine is assumed behind every problem, see ASSUMPTIONS.md). Everything here
 * is pure and shared by both ends: the request shape and its caps, the brief, the line format
 * the model writes, the event format the route streams, and the reader the create screen uses.
 * `app/api/extract/route.ts` sends it to the model; `data/extract-fixtures.ts` stands in for
 * the model when `EXTRACT_FIXTURES=1`. See DECISION_LOG.md, "One extraction funnel".
 */

/** The model the extractor runs on, separate from the help chat's so either can move alone. */
export const EXTRACT_MODEL = "claude-opus-5";

/** Room for a long worksheet: ten pages of problems at a line each is far under this; streaming, so a ceiling not a target. */
export const EXTRACT_MAX_TOKENS = 16000;

/** The caps per request, enforced on the client before sending and again here. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES = 20;
export const MAX_PDFS = 5;
export const MAX_PAGES = 10;
export const MAX_TEXT_CHARS = 20_000;

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
export type ImageMime = (typeof IMAGE_TYPES)[number];

/** One thing to read: a typed line or pasted list, an image, or a PDF (`data` base64, no newlines). */
export type Source = { kind: "text"; name?: string; text: string } | { kind: "image"; name: string; mime: ImageMime; data: string } | { kind: "pdf"; name: string; data: string };

export interface ExtractRequest {
  sources: Source[];
}

/** A diagram that belongs to a problem: its box normalised 0..1 on the page (`page` 1-based, PDFs only) or the image. */
export interface FigureBox {
  page?: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** One problem as the model read it. `label` is the source's own numbering ("4(a)"); `stem` is prose with inline maths as `$…$`; `tex` the centred expression or null. */
export interface Draft {
  source: number;
  page?: number;
  label?: string;
  stem: string;
  tex: string | null;
  figure?: FigureBox;
}

/** One line of the route's stream. `done` closes a source (`dropped`: lines the model wrote that did not parse); `error` is a source the model declined. */
export type ExtractEvent = ({ type: "draft" } & Draft) | { type: "done"; source: number; dropped?: number } | { type: "error"; source: number; reason: string };

/** The HTTP failures the create screen reads; `not-configured` is the one it words differently. */
export type ExtractFailure = "bad-request" | "not-configured" | "busy" | "unavailable" | "too-large";

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** The byte length a base64 string decodes to, without decoding it. */
export function base64Bytes(data: string): number {
  if (!data) return 0;
  const pad = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  return Math.floor((data.length * 3) / 4) - pad;
}

const isImageMime = (m: unknown): m is ImageMime => typeof m === "string" && (IMAGE_TYPES as readonly string[]).includes(m);

function parseSource(raw: unknown): Source | null {
  if (!isRecord(raw)) return null;
  const { kind, name, text, mime, data } = raw;
  if (name !== undefined && typeof name !== "string") return null;
  if (kind === "text") {
    if (typeof text !== "string" || text.trim() === "") return null;
    return name === undefined ? { kind, text } : { kind, name, text };
  }
  if (typeof name !== "string" || typeof data !== "string" || !BASE64.test(data) || data.length % 4 !== 0 || data === "") return null;
  if (kind === "image") return isImageMime(mime) ? { kind, name, mime, data } : null;
  if (kind === "pdf") return { kind, name, data };
  return null;
}

/**
 * A request body checked field by field. `bad-request` is a shape the client never sends;
 * `too-large` is a cap the client should have applied (a file over ten MB, a sixth PDF, a
 * twenty-first image, a very long text) and the message the bar can still word.
 */
export function parseExtractRequest(raw: unknown): { ok: true; request: ExtractRequest } | { ok: false; failure: "bad-request" | "too-large" } {
  if (!isRecord(raw) || !Array.isArray(raw.sources) || raw.sources.length === 0) return { ok: false, failure: "bad-request" };
  const sources: Source[] = [];
  for (const s of raw.sources) {
    const parsed = parseSource(s);
    if (!parsed) return { ok: false, failure: "bad-request" };
    sources.push(parsed);
  }
  const images = sources.filter((s) => s.kind === "image").length;
  const pdfs = sources.filter((s) => s.kind === "pdf").length;
  if (images > MAX_IMAGES || pdfs > MAX_PDFS) return { ok: false, failure: "too-large" };
  for (const s of sources) {
    if (s.kind === "text" && s.text.length > MAX_TEXT_CHARS) return { ok: false, failure: "too-large" };
    if (s.kind !== "text" && base64Bytes(s.data) > MAX_FILE_BYTES) return { ok: false, failure: "too-large" };
  }
  return { ok: true, request: { sources } };
}

/**
 * How many pages a PDF has, read from its page objects without a PDF library: every page is a
 * `/Type /Page` dictionary (the `/Pages` tree nodes end in `s`). Compressed object streams hide
 * their dictionaries, so a count of zero is "unknown" (null), never "no pages"; the browser
 * counts for real with pdfjs before sending (ticket 172).
 */
export function pdfPageCount(bytes: Uint8Array): number | null {
  const text = new TextDecoder("latin1").decode(bytes);
  const n = (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
  return n === 0 ? null : n;
}

/** The label the model sees before each source, and the tile names the file by. */
export const sourceName = (s: Source, i: number): string => s.name ?? (s.kind === "text" ? `typed text ${i + 1}` : `${s.kind} ${i + 1}`);

/**
 * The extractor's brief. The rules are what make the output one problem per line in the
 * shape the tile expects, sub-parts split, typed shorthand and plain English both normalised,
 * and nothing extracted that the engine or the teacher does not want (solutions, headings,
 * printed answers).
 */
export function extractSystem(): string {
  return [
    "You turn maths problems from a teacher's sources into drafts for an assignment.",
    "",
    'You are given one or more sources, each introduced by a line "Source N: <name>": a typed line or pasted list of problems, a screenshot or photo, or a PDF.',
    "",
    "Write one JSON object per line and nothing else: no prose, no code fence, no blank lines. One line per problem, in reading order (page by page, top to bottom, the left column before the right).",
    "",
    'Each line: {"source": 0, "page": 2, "label": "4(a)", "stem": "Solve for x.", "tex": "x^2 + 5x + 6 = 0", "figure": {"page": 2, "x0": 0.1, "y0": 0.4, "x1": 0.5, "y1": 0.7}}',
    "- source: the source number, always.",
    "- page: the 1-based page the problem is on, for a PDF only; leave it out otherwise.",
    '- label: the source\'s own numbering when it prints one ("3", "4(a)", "Q7"); leave it out otherwise.',
    '- stem: the problem\'s prose in plain text, inline maths as $…$ in KaTeX-supported TeX; "" when the problem is an expression alone.',
    "- tex: the problem's main expression or equation as KaTeX-supported TeX (no $, no \\[ \\]); null when the problem is prose alone.",
    "- figure: only when a diagram, graph or picture is part of the problem: its box on that page or image, every coordinate a fraction 0..1 of the page's width or height, x0 < x1 and y0 < y1; page as above for a PDF. Leave it out when there is no figure.",
    "",
    "Rules:",
    '- Sub-parts (a), (b), (c) of one question are one line each, the shared stem repeated in each, the label carrying the part ("4(a)", "4(b)").',
    "- A typed line may be calculator shorthand (x**2, 1/3x^2, sqrt(2), pi, <=), plain English (\"half of x squared plus 3\") or TeX; read all three and write the same clean stem and tex.",
    "- A pasted list is one problem per line or per number; split it.",
    "- Never write solutions, answers, hints, marks or difficulty; the stem and tex only.",
    "- Skip headings, instructions to the class, page numbers, dates, names, and answers printed on the page.",
    "- A source with no problems in it gets no lines at all.",
    "- Do not invent a figure for a problem that mentions a graph but shows none.",
  ].join("\n");
}

/** The one user turn: each source under its name, an image as an image block, a PDF as a document block, text as text. */
export function extractMessages(sources: Source[]): Anthropic.Beta.BetaMessageParam[] {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  sources.forEach((s, i) => {
    content.push({ type: "text", text: `Source ${i}: ${sourceName(s, i)}` });
    if (s.kind === "text") content.push({ type: "text", text: s.text });
    else if (s.kind === "image") content.push({ type: "image", source: { type: "base64", media_type: s.mime, data: s.data } });
    else content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: s.data }, title: s.name });
  });
  return [{ role: "user", content }];
}

const fraction = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;

function parseFigure(raw: unknown): FigureBox | null {
  if (!isRecord(raw)) return null;
  const { page, x0, y0, x1, y1 } = raw;
  if (!fraction(x0) || !fraction(y0) || !fraction(x1) || !fraction(y1) || x0 >= x1 || y0 >= y1) return null;
  const box: FigureBox = { x0, y0, x1, y1 };
  if (typeof page === "number" && Number.isInteger(page) && page >= 1) box.page = page;
  return box;
}

/**
 * One line the model wrote, as a draft, or null when it is not one (a stray word, a fence, a
 * malformed object). A line without `source` belongs to the only source when there is one.
 * `tex` missing is read as null; a figure that does not parse is dropped, the draft kept.
 */
export function parseDraftLine(line: string, sourceCount: number): Draft | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!isRecord(raw)) return null;
  const { source, page, label, stem, tex, figure } = raw;
  const src = source === undefined && sourceCount === 1 ? 0 : source;
  if (typeof src !== "number" || !Number.isInteger(src) || src < 0 || src >= sourceCount) return null;
  if (typeof stem !== "string") return null;
  if (tex !== undefined && tex !== null && typeof tex !== "string") return null;
  const draft: Draft = { source: src, stem: stem.trim(), tex: typeof tex === "string" && tex.trim() !== "" ? tex.trim() : null };
  if (draft.stem === "" && draft.tex === null) return null;
  if (typeof page === "number" && Number.isInteger(page) && page >= 1) draft.page = page;
  if (typeof label === "string" && label.trim() !== "") draft.label = label.trim();
  const box = parseFigure(figure);
  if (box) draft.figure = box;
  return draft;
}

/** One line of the route's stream, as an event, or null when it is not one. The route wrote it, so a null is a bug, not a model slip; the reader skips it. */
export function parseExtractEvent(line: string): ExtractEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!isRecord(raw) || typeof raw.source !== "number") return null;
  if (raw.type === "draft") {
    const draft = parseDraftLine(JSON.stringify({ ...raw, type: undefined }), raw.source + 1);
    return draft ? { type: "draft", ...draft } : null;
  }
  if (raw.type === "done") return typeof raw.dropped === "number" && raw.dropped > 0 ? { type: "done", source: raw.source, dropped: raw.dropped } : { type: "done", source: raw.source };
  if (raw.type === "error" && typeof raw.reason === "string") return { type: "error", source: raw.source, reason: raw.reason };
  return null;
}

/** Text arriving in chunks, cut into complete lines; the tail waits for its newline until `end()`. */
export class LineBuffer {
  private tail = "";
  push(chunk: string): string[] {
    const parts = (this.tail + chunk).split(/\r?\n/);
    this.tail = parts.pop() ?? "";
    return parts;
  }
  end(): string[] {
    const last = this.tail;
    this.tail = "";
    return last.trim() ? [last] : [];
  }
}

/** The events in a route response, one by one as its lines arrive; lines that are not events are skipped. */
export async function* readExtractEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ExtractEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const lines = new LineBuffer();
  const emit = function* (ls: string[]) {
    for (const l of ls) {
      const ev = parseExtractEvent(l);
      if (ev) yield ev;
    }
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      yield* emit(lines.push(decoder.decode(value, { stream: true })));
    }
    yield* emit(lines.push(decoder.decode()));
    yield* emit(lines.end());
  } finally {
    reader.releaseLock();
  }
}

/** The bytes of a source as the fixtures key them: SHA-256, hex; text by its exact string. */
export async function sourceHash(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A base64 string as bytes, on either end (no Buffer). */
export function base64ToBytes(data: string): Uint8Array {
  const bin = atob(data);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
