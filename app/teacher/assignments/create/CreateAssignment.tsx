"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type DragEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import TeacherChrome from "../../TeacherChrome";
import QuestionTile, { type TileHandlers } from "./QuestionTile";
import BlankStart from "./BlankStart";
import { BackToClassroom } from "../../AssignmentContext";
import { MessageTile, PendingTile } from "./UploadTiles";
import { Button, Eyebrow } from "@/components/ui";
import { useReorder } from "@/components/useReorder";
import { ASSIGNMENT } from "@/data/assignment";
import { GOAL_MAX, type AssignmentDraft, type DraftQuestion } from "@/lib/classroom";
import { dispatchClassroom, getClassroom, useClassroom } from "@/lib/classroom-store";
import { generatedDraft, isGenerated } from "@/lib/draft";
import { cropFigure, cropFromImage, type Figure } from "@/lib/crops";
import type { Draft, FigureBox, Source } from "@/lib/extract";
import { bytesToBase64, ExtractError, extractSource, fileToSource, fixDraft } from "@/lib/extractClient";
import { parseQuestion, stemText } from "@/lib/mathInput";
import { moveItem } from "@/lib/reorder";
import { MAX_PAGES } from "@/lib/extract";
import { openPdf, pageThumb, renderPage, type OpenPdf } from "@/lib/pdfPages";
import { getSource, putSource, thumbOf } from "@/lib/sources";
import { applyFix, applyRead, confirmAll, discardUnconfirmed, draftItem, dropNote, insertBefore, isPdfFile, isQuestion, messageItem, partitionDrop, pendingItem, removeItem, replaceItem, unconfirmedCount, updateQuestion, without, type FigureRef, type Item, type MessageItem, type PendingItem, type QuestionItem, type ReadFailure } from "@/lib/upload";

export const REVIEW_PATH = "/teacher/assignments/create/review";

/** The gap between one generated tile fading in and the next (ticket 188). */
const TILE_IN_STEP_MS = 35;

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const ghostOf = (): QuestionItem => ({ id: newId(), text: "" });
const isGhost = (q: Item | undefined) => !!q && isQuestion(q) && q.text === "";
/** The list always ends with one empty question tile, the ghost the next question is typed into; a file's marker is never it. */
const withGhost = (qs: Item[]): Item[] => (isGhost(qs[qs.length - 1]) ? qs : [...qs, ghostOf()]);

/** The draft as the store keeps it: the questions with their parsed shape, the empties and the file markers dropped, an uploaded question's provenance kept. */
export function draftOf(title: string, goal: string, qs: Item[], at: number): AssignmentDraft {
  const questions: DraftQuestion[] = qs
    .filter(isQuestion)
    .filter((q) => q.text.trim())
    .map((q) => {
      // The model's reading of a typed line stands in for the parser's while the text is unchanged (ticket 173).
      const model = q.model && q.model.for === q.text ? q.model : null;
      const p = parseQuestion(q.text);
      const d: DraftQuestion = { id: q.id, text: q.text, stem: model ? model.stem : stemText(p.stem), tex: model ? model.tex : p.tex };
      if (q.figure) {
        d.figureId = q.figure.id;
        d.figureUrl = q.figure.url;
      }
      if (q.uploaded) {
        d.uploaded = true;
        d.confirmed = q.confirmed !== false;
        if (q.sourceId) d.sourceId = q.sourceId;
        if (q.name) d.name = q.name;
        if (q.thumb) d.thumb = q.thumb;
        if (q.page !== undefined) d.page = q.page;
        if (q.label !== undefined) d.label = q.label;
      }
      return d;
    });
  return { title: title.trim(), goal: goal.slice(0, GOAL_MAX), questions, updatedAt: at };
}

/**
 * The create screen, step one of a new assignment (ticket 119): the title, the goal for the class
 * (ticket 154: one or two sentences the student reads between the overview and the check-in; blank
 * means no goal screen), then the questions as tiles in the five-wide grid the student's overview uses. Every tile is one question and the
 * grid is the editor; see `QuestionTile`. The draft is saved to the classroom store on every
 * change and read back on load, so a reload keeps it. Continue floats bottom right, on once a
 * question has text, and opens the review screen. The unit, the pathway, the skills and the
 * difficulty are the review screen's business, not this one's. A press held on a tile lifts it
 * to drag to another slot, the labels renumbering as the others slide (ticket 150,
 * `useReorder`); the ghost stays last and takes no drop.
 *
 * Questions also arrive as pictures (ticket 171) and PDFs (ticket 172): a screenshot or a
 * worksheet dropped anywhere on the grid, pasted with ⌘V, or chosen through the ghost's Upload
 * link. Each file gets a shimmer tile at
 * the end of the grid while `POST /api/extract` reads it, and its drafts stream in before that
 * marker as tinted, unconfirmed tiles with keep and discard; the bar gains "Add N" and
 * "Discard N" while any are unconfirmed, and Continue, never gated, keeps them all on the way
 * through. The file itself goes to the browser's source store (`lib/sources`); the draft
 * carries its id and a thumbnail.
 *
 * Ticket 173: a typed tile's text goes to the same route as the focus leaves it, and the
 * model's reading (`model` on the item) stands in for the shorthand parser's while the text is
 * unchanged; not configured, the parser's stands and nothing is said. A Fix line on every focused
 * tile sends the stem, the TeX, the instruction and the source picture, and the answer becomes
 * the tile's text. A figure the model boxed is cut from the source and shown under the question.
 */
export default function CreateAssignment() {
  // The draft lives in localStorage, so the editor mounts on the client only and reads it as its first state.
  const client = useSyncExternalStore(noSubscribe, isClient, isServer);
  return (
    <TeacherChrome>
      {client ? (
        <Start />
      ) : (
        <>
          <BackToClassroom />
          <Eyebrow className="mt-3">{ASSIGNMENT.className}</Eyebrow>
        </>
      )}
    </TeacherChrome>
  );
}

/**
 * Blank until generated (ticket 188): "New assignment" opens `BlankStart`, whose one live control
 * stores the demo teacher's set as the draft (`generatedDraft`); the editor then opens over it, and
 * stays across reloads while the draft is flagged generated. Create and Reset demo clear the draft, so
 * the next visit is blank again. `fresh` is this mount's own Generate: the tiles fade in once.
 */
function Start() {
  const generated = isGenerated(useClassroom());
  const [fresh, setFresh] = useState(false);
  if (!generated)
    return (
      <BlankStart
        onGenerate={() => {
          setFresh(true);
          dispatchClassroom({ type: "draft/set", draft: generatedDraft(Date.now()) });
        }}
      />
    );
  return <Editor fresh={fresh} />;
}

const noSubscribe = () => () => {};

/**
 * The draft in the store: the generated set as the teacher left it (ticket 188; before it, an empty
 * store seeded the set here, ticket 121). The editor only mounts over a generated draft, so the seed
 * fallback is for a draft cleared from another tab mid-render.
 */
function storedOrSeed(): { title: string; goal: string; questions: QuestionItem[] } {
  const d = getClassroom().draft ?? generatedDraft(0);
  return { title: d.title, goal: d.goal ?? "", questions: d.questions.map(itemOf) };
}

/** A stored question back as a tile; an uploaded one keeps its provenance and its unconfirmed state across a reload. */
function itemOf(q: DraftQuestion): QuestionItem {
  const item: QuestionItem = { id: q.id, text: q.text };
  if (q.figureId && q.figureUrl) item.figure = { id: q.figureId, url: q.figureUrl };
  // A typed line the model has read keeps that reading (the stored stem and TeX differ from the parser's only then).
  if (!q.uploaded) {
    const p = parseQuestion(q.text);
    if (stemText(p.stem) !== q.stem || p.tex !== q.tex) item.model = { for: q.text, stem: q.stem, tex: q.tex };
  }
  if (q.uploaded) {
    item.uploaded = true;
    item.confirmed = q.confirmed !== false;
    if (q.sourceId) item.sourceId = q.sourceId;
    if (q.name) item.name = q.name;
    if (q.thumb) item.thumb = q.thumb;
    if (q.page !== undefined) item.page = q.page;
    if (q.label !== undefined) item.label = q.label;
  }
  return item;
}
const isClient = () => true;
const isServer = () => false;

/** The files in a drag or a drop, if it carries any. */
const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/** A figure box cut from the picture a draft came from (an image, or a PDF page drawn at twice its size), kept in the source store with a small copy for the tile. */
async function figureFor(box: FigureBox, blob: Blob, open: OpenPdf | null, page: number | undefined, name: string): Promise<FigureRef | undefined> {
  let fig: Figure | null = null;
  try {
    if (open) {
      const p = box.page ?? page;
      if (p === undefined) return undefined;
      const canvas = await renderPage(open.doc, p, { scale: 2 });
      fig = canvas ? await cropFigure(canvas, box) : null;
    } else fig = await cropFromImage(blob, box);
  } catch {
    fig = null;
  }
  if (!fig) return undefined;
  const id = await putSource(fig.full, `${name} (figure)`, "image/png");
  return { id, url: fig.url };
}

/** A PDF's first page as its marker's thumbnail, or nothing when it will not open (the read then says so). */
async function firstPageThumb(blob: Blob): Promise<string | undefined> {
  try {
    const open = await openPdf(blob);
    const thumb = await pageThumb(open.doc, 1);
    await open.close();
    return thumb;
  } catch {
    return undefined;
  }
}

function Editor({ fresh }: { fresh: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(() => storedOrSeed().title);
  const [goal, setGoal] = useState(() => storedOrSeed().goal);
  const [qs, setQs] = useState<Item[]>(() => withGhost(storedOrSeed().questions));
  // Opened by Generate, nothing takes the focus: focusing the ghost would scroll the grid under the pointer that just pressed.
  const [focusId, setFocusId] = useState<string | null>(() => (fresh ? null : qs[qs.length - 1].id));
  /** The tiles Generate put on screen, which fade in one after another; a tile added later appears at once. */
  const [arrived] = useState<ReadonlySet<string> | null>(() => (fresh ? new Set(qs.map((q) => q.id)) : null));
  const [removed, setRemoved] = useState<{ q: QuestionItem; index: number } | null>(null);
  /** What the bar says about the last drop's files that were left out; cleared by the next edit. */
  const [note, setNote] = useState<string | null>(null);
  /** How many nested drag targets the pointer is inside: above zero, the overlay shows. */
  const [over, setOver] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatchClassroom({ type: "draft/set", draft: { ...draftOf(title, goal, qs, Date.now()), generated: true } });
  }, [title, goal, qs]);

  /** A change by the teacher's hand: clears the undo line and the drop note. */
  const edit = (f: (qs: Item[]) => Item[]) => {
    setRemoved(null);
    setNote(null);
    setQs((cur) => withGhost(f(cur)));
  };
  /** A change from a file being read: the list moves, the undo line and the note stay. */
  const patch = (f: (qs: Item[]) => Item[]) => setQs((cur) => withGhost(f(cur)));

  /** Remove a question tile (never the ghost); Backspace steps the caret back, × leaves nothing focused. */
  const remove = (index: number, stepBack: boolean) => {
    const q = qs[index];
    if (!q || !isQuestion(q) || index === qs.length - 1) return;
    setRemoved({ q, index });
    setNote(null);
    setFocusId(stepBack ? (qs[index - 1]?.id ?? null) : null);
    setQs(withGhost(qs.filter((_, i) => i !== index)));
  };

  const undoRemove = () => {
    if (!removed) return;
    const { q, index } = removed;
    setRemoved(null);
    setQs((cur) => {
      const at = Math.min(index, cur.length - 1);
      return withGhost([...cur.slice(0, at), q, ...cur.slice(at)]);
    });
    setFocusId(q.id);
  };

  const gridKey = (e: KeyboardEvent<HTMLElement>) => {
    if (removed && (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undoRemove();
    }
  };

  /**
   * One file read by the route: its drafts inserted before its marker as they arrive, the
   * marker removed at the end, or turned into a message tile when the read fails or finds
   * nothing. A PDF is opened once in the browser (ticket 172) for the page count, refused past
   * the cap before anything is sent, and for each draft's page thumbnail, drawn once per page.
   */
  const run = async (marker: PendingItem, blob: Blob, mime: string) => {
    let count = 0;
    const pdf = isPdfFile({ name: marker.name, type: mime, size: blob.size });
    const open = pdf ? await openPdf(blob).catch(() => null) : null;
    const thumbs = new Map<number, Promise<string | undefined>>();
    const thumbFor = (page: number | undefined) => {
      if (!open || page === undefined) return Promise.resolve(marker.thumb);
      if (!thumbs.has(page)) thumbs.set(page, pageThumb(open.doc, page));
      return thumbs.get(page)!;
    };
    try {
      if (open && open.pages > MAX_PAGES) {
        patch((cur) => replaceItem(cur, marker.id, messageItem(marker, "too-many-pages", open.pages)));
        return;
      }
      const source = await fileToSource(blob, marker.name, mime);
      for await (const ev of extractSource(source)) {
        if (ev.type === "draft") {
          count++;
          const thumb = await thumbFor(ev.page);
          const figure = ev.figure ? await figureFor(ev.figure, blob, open, ev.page, marker.name) : undefined;
          const item = draftItem(ev, { sourceId: marker.sourceId, name: marker.name, thumb, figure }, newId());
          patch((cur) => insertBefore(cur, marker.id, item));
        } else if (ev.type === "error") throw new ExtractError("declined");
      }
      patch((cur) => (count ? removeItem(cur, marker.id) : replaceItem(cur, marker.id, messageItem(marker, "empty"))));
    } catch (e) {
      const reason: ReadFailure = e instanceof ExtractError ? e.failure : "network";
      patch((cur) => replaceItem(cur, marker.id, messageItem(marker, reason)));
    } finally {
      void open?.close();
    }
  };

  /** A drop, a paste or a pick: the files the caps allow get a marker each, in order, then read in parallel. A PDF's marker carries its first page. */
  const addFiles = async (files: File[]) => {
    const { accepted, left } = partitionDrop(files);
    setRemoved(null);
    setNote(dropNote(left));
    if (!accepted.length) return;
    const jobs = await Promise.all(
      accepted.map(async (file) => {
        const sourceId = await putSource(file, file.name, file.type);
        const thumb = isPdfFile(file) ? await firstPageThumb(file) : await thumbOf(file);
        const marker: PendingItem = { kind: "pending", id: newId(), text: "", sourceId, name: file.name };
        if (thumb) marker.thumb = thumb;
        return { marker, file };
      }),
    );
    patch((cur) => {
      const ghost = cur[cur.length - 1];
      return jobs.reduce<Item[]>((list, j) => insertBefore(list, ghost.id, j.marker), cur);
    });
    for (const j of jobs) void run(j.marker, j.file, j.file.type);
  };

  /** The picture a question was read from, as a source for a Fix: the image itself, or its PDF page drawn at 1.5×. Nothing for a typed question. */
  const sourceFor = async (q: QuestionItem): Promise<Source | undefined> => {
    if (!q.sourceId) return undefined;
    const stored = await getSource(q.sourceId);
    if (!stored) return undefined;
    if (!isPdfFile({ name: stored.name, type: stored.mime, size: stored.blob.size })) return fileToSource(stored.blob, stored.name, stored.mime);
    if (q.page === undefined) return undefined;
    const open = await openPdf(stored.blob).catch(() => null);
    if (!open) return undefined;
    try {
      const canvas = await renderPage(open.doc, q.page, { scale: 1.5 });
      const png = canvas ? await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png")) : null;
      if (!png) return undefined;
      return { kind: "image", name: `${stored.name} p. ${q.page}`, mime: "image/png", data: bytesToBase64(new Uint8Array(await png.arrayBuffer())) };
    } finally {
      void open.close();
    }
  };

  /** A typed tile's text sent to the model as the focus leaves it (ticket 173); the reading lands only if the text is still the same. Not configured: the parser's reading stands, quietly. */
  const inFlight = useRef(new Map<string, string>());
  /** Said once per screen when a typed line could not be read by the model: typing works without it, so the screen stays quiet. */
  const warnedRead = useRef(false);
  const read = async (q: QuestionItem) => {
    const text = q.text;
    if (!text.trim() || (q.model && q.model.for === text) || inFlight.current.get(q.id) === text) return;
    inFlight.current.set(q.id, text);
    patch((cur) => updateQuestion(cur, q.id, (x) => ({ ...x, reading: true })));
    const drafts: Draft[] = [];
    try {
      for await (const ev of extractSource({ kind: "text", text })) if (ev.type === "draft") drafts.push(ev);
      patch((cur) => applyRead(cur, q.id, text, drafts, newId));
    } catch (e) {
      if (!warnedRead.current) {
        warnedRead.current = true;
        console.warn("The model could not read the typed question; the shorthand reading stands.", e instanceof ExtractError ? e.failure : e);
      }
      patch((cur) => updateQuestion(cur, q.id, (x) => without(x, "reading")));
    } finally {
      if (inFlight.current.get(q.id) === text) inFlight.current.delete(q.id);
    }
  };

  /** A correction from the tile's Fix line (ticket 173): the current stem and TeX, the instruction and the picture it was read from go to the model; the answer replaces the tile's text. */
  const fix = async (q: QuestionItem, instruction: string) => {
    if (q.fixing) return;
    setNote(null);
    patch((cur) => updateQuestion(cur, q.id, (x) => ({ ...x, fixing: true })));
    try {
      const d = draftOf("", "", [q], 0).questions[0];
      const source = await sourceFor(q);
      const fixed = await fixDraft({ stem: d?.stem ?? "", tex: d?.tex ?? null, instruction, source });
      if (fixed) patch((cur) => applyFix(cur, q.id, fixed));
      else {
        patch((cur) => updateQuestion(cur, q.id, (x) => without(x, "fixing")));
        setNote(`Nothing came back for the fix on Q${qs.findIndex((x) => x.id === q.id) + 1}.`);
      }
    } catch (e) {
      patch((cur) => updateQuestion(cur, q.id, (x) => without(x, "fixing")));
      const failure = e instanceof ExtractError ? e.failure : "network";
      setNote(failure === "not-configured" ? "Fix needs the model. Not configured." : `Couldn't fix Q${qs.findIndex((x) => x.id === q.id) + 1}. Try again.`);
    }
  };

  const retry = async (m: MessageItem) => {
    const stored = await getSource(m.sourceId);
    if (!stored) {
      patch((cur) => replaceItem(cur, m.id, messageItem(m, "unavailable")));
      return;
    }
    const marker = pendingItem(m);
    patch((cur) => replaceItem(cur, m.id, marker));
    void run(marker, stored.blob, stored.mime);
  };

  // ⌘V with a picture on the clipboard anywhere on the screen is a drop; text pastes are the tiles' own.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (!files.length) return;
      e.preventDefault();
      void addFiles(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setOver((d) => d + 1);
  };
  const dragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const dragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    setOver((d) => Math.max(0, d - 1));
  };
  const drop = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setOver(0);
    void addFiles(Array.from(e.dataTransfer.files));
  };

  const handlers = (index: number, q: QuestionItem): TileHandlers => ({
    onChange: (text) => edit((cur) => updateQuestion(cur, q.id, (x) => ({ ...x, text }))),
    onFocus: () => setFocusId(q.id),
    onBlur: () => setFocusId((cur) => (cur === q.id ? null : cur)),
    onNext: () => {
      const next = qs[index + 1];
      if (next) setFocusId(next.id);
    },
    onBackspaceEmpty: () => {
      if (index === qs.length - 1) {
        const prev = qs[index - 1];
        if (prev) setFocusId(prev.id);
      } else remove(index, true);
    },
    onRemove: () => remove(index, false),
    onPasteLines: (first, rest) => {
      const added: QuestionItem[] = rest.map((text) => ({ id: newId(), text }));
      edit((cur) => cur.flatMap((x) => (x.id === q.id && isQuestion(x) ? [{ ...x, text: first }, ...added] : [x])));
      setFocusId(added[added.length - 1].id);
    },
    onKeep: () => edit((cur) => updateQuestion(cur, q.id, (x) => ({ ...x, confirmed: true }))),
    onUpload: () => fileInput.current?.click(),
    onRead: () => void read(q),
    onFix: (instruction) => void fix(q, instruction),
  });

  // Every tile but the ghost can be held and dropped on; a move is an edit like any other (it clears the undo line). A file's marker or message is not a question and never lifts.
  const reorder = useReorder({ count: qs.length - 1, columns: 5, ignore: "button, [data-pending], [data-message]", name: (i) => `Q${i + 1}`, onMove: (from, to) => edit((cur) => moveItem(cur, from, to)) });

  const any = qs.some((q) => isQuestion(q) && q.text.trim());
  const unconfirmed = unconfirmedCount(qs);
  const addAll = () => edit(confirmAll);
  const discardAll = () => edit(discardUnconfirmed);
  const proceed = () => {
    if (!any) return;
    const kept = confirmAll(qs);
    dispatchClassroom({ type: "draft/set", draft: { ...draftOf(title, goal, kept, Date.now()), generated: true } });
    router.push(REVIEW_PATH);
  };

  return (
    <div className="pb-24">
      <BackToClassroom />
      <Eyebrow className="mt-3">{ASSIGNMENT.className}</Eyebrow>
      <input
        value={title}
        onChange={(e) => {
          setRemoved(null);
          setTitle(e.target.value);
        }}
        placeholder="Untitled assignment"
        aria-label="Title"
        className="mt-3 w-full bg-transparent font-display text-[40px] leading-[1.05] text-ink outline-none placeholder:text-ink-muted/50 md:text-[48px]"
        data-title
      />

      <div className="mt-6 max-w-3xl" data-goal>
        <label htmlFor="goal" className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-muted">
          Goal for the class
        </label>
        <p className="mt-1 text-[13.5px] text-ink-muted">Write a goal-oriented message for the class. This will be displayed on student screens before they start the assignment.</p>
        <textarea
          id="goal"
          value={goal}
          rows={3}
          maxLength={GOAL_MAX}
          onChange={(e) => {
            setRemoved(null);
            setGoal(e.target.value.slice(0, GOAL_MAX));
          }}
          placeholder="By the end of this set I want you to…"
          className="mt-2 w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-[15px] leading-[1.45] text-ink outline-none transition-colors placeholder:text-ink-muted/50 focus:border-accent"
          data-goal-input
        />
        <p className="mt-1 text-right text-[12px] tabular-nums text-ink-muted" data-goal-count>
          {goal.length} / {GOAL_MAX}
        </p>
      </div>

      <div className="relative mt-6" onDragEnter={dragEnter} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop} onKeyDownCapture={gridKey} data-dropzone data-over={over > 0 || undefined}>
        <ol className="grid grid-cols-5 gap-4" data-questions data-dragging={reorder.drag ? reorder.drag.from + 1 : undefined}>
          {qs.map((q, i) => {
            const item = reorder.item(i);
            const arriving = arrived?.has(q.id) === true;
            return (
            <li key={q.id} className={`aspect-square min-h-0 ${arriving ? "tile-in" : ""}`} data-question={i + 1} {...item} style={arriving ? { ...item.style, animationDelay: `${i * TILE_IN_STEP_MS}ms` } : item.style}>
              {q.kind === "pending" ? (
                <PendingTile index={i} item={q} />
              ) : q.kind === "message" ? (
                <MessageTile index={i} item={q} onRetry={() => void retry(q)} onDismiss={() => edit((cur) => removeItem(cur, q.id))} />
              ) : (
                <QuestionTile index={i} slot={reorder.slot(i)} item={q} ghost={i === qs.length - 1} focused={focusId === q.id} h={handlers(i, q)} />
              )}
            </li>
            );
          })}
        </ol>
        {over > 0 && (
          <div className="pointer-events-none absolute -inset-2 z-20 grid place-items-center rounded-2xl border-2 border-dashed border-standout-line bg-standout-soft/80" data-drop-overlay>
            <p className="font-display text-[24px] text-standout">Drop to add questions</p>
          </div>
        )}
      </div>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void addFiles(files);
        }}
        data-file-input
      />
      <p className="sr-only" aria-live="polite" data-announce>
        {reorder.announced}
      </p>

      {removed && (
        <p className="mt-4 text-[13px] text-ink-muted" data-removed>
          Q{removed.index + 1} removed.{" "}
          <button type="button" onClick={undoRemove} className="font-medium text-accent-deep hover:underline" data-undo>
            Undo
          </button>
        </p>
      )}

      <div className="fixed bottom-16 right-6 z-30 flex items-center gap-3" data-bar>
        {note && (
          <p className="max-w-[440px] rounded-2xl border border-line bg-paper/95 px-4 py-2 text-right text-[13px] leading-snug text-ink-muted shadow-card" data-note>
            {note}
          </p>
        )}
        {unconfirmed > 0 && (
          <>
            <Button variant="secondary" size="lg" onClick={discardAll} className="shadow-lift" data-discard-all>
              Discard {unconfirmed}
            </Button>
            <Button variant="sky" size="lg" onClick={addAll} className="shadow-lift" data-add-all>
              Add {unconfirmed}
            </Button>
          </>
        )}
        <Button size="lg" hit disabled={!any} onClick={proceed} className="shadow-lift" data-continue>
          Continue
        </Button>
      </div>
    </div>
  );
}
