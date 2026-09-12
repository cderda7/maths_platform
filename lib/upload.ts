import { IMAGE_TYPES, MAX_FILE_BYTES, MAX_IMAGES, type Draft, type ExtractFailure } from "./extract";
import { draftText } from "./mathInput";

/**
 * The create screen's upload flow, the pure part (ticket 171): which dropped files are taken and
 * which are left out and why; the tile list with a pending marker per file, drafts arriving
 * before their marker, and the unconfirmed state a read question sits in until kept; and the
 * words the bar and a failed tile say. `CreateAssignment` holds the state and calls the route;
 * everything about the shape of the list is here and tested.
 */

/** What is needed of a `File` to decide whether it goes in. */
export interface DropFile {
  name: string;
  type: string;
  size: number;
}

/** Why a dropped file was left out. `pdf-later` is a PDF before ticket 172 lifts it. */
export type DropReason = "too-many-images" | "too-large" | "pdf-later" | "unsupported";

export interface Partition<F extends DropFile> {
  accepted: F[];
  left: { file: F; reason: DropReason }[];
}

const isImage = (f: DropFile) => (IMAGE_TYPES as readonly string[]).includes(f.type);
const isPdf = (f: DropFile) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

/**
 * One drop's files: images up to the cap in drop order, the rest named with a reason. A file the
 * caps refuse is left out on its own; the drop is never refused whole.
 */
export function partitionDrop<F extends DropFile>(files: readonly F[]): Partition<F> {
  const accepted: F[] = [];
  const left: Partition<F>["left"] = [];
  for (const file of files) {
    if (isPdf(file)) left.push({ file, reason: "pdf-later" });
    else if (!isImage(file)) left.push({ file, reason: "unsupported" });
    else if (file.size > MAX_FILE_BYTES) left.push({ file, reason: "too-large" });
    else if (accepted.length >= MAX_IMAGES) left.push({ file, reason: "too-many-images" });
    else accepted.push(file);
  }
  return { accepted, left };
}

const MB = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

/** What the bar says about the files left out of a drop, or null when none were: the cap once with its count, each other file by name. */
export function dropNote(left: Partition<DropFile>["left"]): string | null {
  if (!left.length) return null;
  const parts: string[] = [];
  const over = left.filter((l) => l.reason === "too-many-images").length;
  if (over) parts.push(`Twenty at a time; ${over} not added`);
  for (const l of left) {
    if (l.reason === "too-large") parts.push(`${l.file.name} is ${MB(l.file.size)}; ten at most`);
    else if (l.reason === "pdf-later") parts.push(`${l.file.name}: not yet`);
    else if (l.reason === "unsupported") parts.push(`${l.file.name}: not a picture`);
  }
  return parts.join(" · ");
}

/** A question tile: typed, or read from a file (`uploaded`) and then unconfirmed until kept. */
export interface QuestionItem {
  kind?: undefined;
  id: string;
  text: string;
  uploaded?: true;
  confirmed?: boolean;
  sourceId?: string;
  name?: string;
  thumb?: string;
  page?: number;
  label?: string;
}

/** The shimmer tile holding a file's place while its drafts are read; each draft is inserted before it. */
export interface PendingItem {
  kind: "pending";
  id: string;
  text: "";
  sourceId: string;
  name: string;
  thumb?: string;
}

/** What a file's marker becomes when its read fails or finds nothing: the words, and whether "Try again" is offered. */
export interface MessageItem {
  kind: "message";
  id: string;
  text: "";
  sourceId: string;
  name: string;
  thumb?: string;
  message: string;
  retry: boolean;
}

export type Item = QuestionItem | PendingItem | MessageItem;

export const isQuestion = (i: Item): i is QuestionItem => i.kind === undefined;
export const isUnconfirmed = (i: Item): i is QuestionItem => isQuestion(i) && i.uploaded === true && i.confirmed === false;

/** `item` placed just before the item with `id`; at the end when there is no such item. */
export function insertBefore(list: readonly Item[], id: string, item: Item): Item[] {
  const at = list.findIndex((x) => x.id === id);
  return at === -1 ? [...list, item] : [...list.slice(0, at), item, ...list.slice(at)];
}

/** The question with `id` changed by `f`; a marker or message with that id is left alone (they have no text to edit or state to keep). */
export function updateQuestion(list: readonly Item[], id: string, f: (q: QuestionItem) => QuestionItem): Item[] {
  return list.map((x) => (x.id === id && isQuestion(x) ? f(x) : x));
}

export function replaceItem(list: readonly Item[], id: string, item: Item): Item[] {
  return list.map((x) => (x.id === id ? item : x));
}

export function removeItem(list: readonly Item[], id: string): Item[] {
  return list.filter((x) => x.id !== id);
}

export const unconfirmedCount = (list: readonly Item[]): number => list.filter(isUnconfirmed).length;

/** Every unconfirmed question kept: what "Add N" and Continue do. */
export function confirmAll(list: readonly Item[]): Item[] {
  return list.map((x) => (isUnconfirmed(x) ? { ...x, confirmed: true } : x));
}

/** Every unconfirmed question dropped: what "Discard N" does. */
export function discardUnconfirmed(list: readonly Item[]): Item[] {
  return list.filter((x) => !isUnconfirmed(x));
}

/** A draft the route streamed, as the tile it becomes: unconfirmed, its text the stem then the TeX (`draftText`), carrying its file's thumbnail and the sheet's page and numbering. */
export function draftItem(draft: Draft, from: { sourceId: string; name: string; thumb?: string }, id: string): QuestionItem {
  const item: QuestionItem = { id, text: draftText(draft.stem, draft.tex), uploaded: true, confirmed: false, sourceId: from.sourceId, name: from.name };
  if (from.thumb) item.thumb = from.thumb;
  if (draft.page !== undefined) item.page = draft.page;
  if (draft.label !== undefined) item.label = draft.label;
  return item;
}

/** Why a file's read ended without tiles. `empty` is a clean read that found no problems; `network` the request never answered. */
export type ReadFailure = ExtractFailure | "declined" | "network" | "empty";

/** The words on a failed file's tile, and whether trying again could help. */
export function failureMessage(reason: ReadFailure, name: string): { message: string; retry: boolean } {
  switch (reason) {
    case "not-configured":
      return { message: "Upload needs the model. Not configured.", retry: false };
    case "busy":
    case "unavailable":
    case "network":
      return { message: `Couldn't read ${name}.`, retry: true };
    case "declined":
      return { message: `The model declined ${name}.`, retry: false };
    case "empty":
      return { message: `No questions found in ${name}.`, retry: false };
    case "too-large":
    case "bad-request":
      return { message: `Couldn't send ${name}.`, retry: false };
  }
}

/** A file's marker turned into its failure tile. */
export function messageItem(marker: PendingItem | MessageItem, reason: ReadFailure): MessageItem {
  const { message, retry } = failureMessage(reason, marker.name);
  const item: MessageItem = { kind: "message", id: marker.id, text: "", sourceId: marker.sourceId, name: marker.name, message, retry };
  if (marker.thumb) item.thumb = marker.thumb;
  return item;
}

/** A failure tile back to a marker, for "Try again". */
export function pendingItem(from: MessageItem | PendingItem, id = from.id): PendingItem {
  const item: PendingItem = { kind: "pending", id, text: "", sourceId: from.sourceId, name: from.name };
  if (from.thumb) item.thumb = from.thumb;
  return item;
}
