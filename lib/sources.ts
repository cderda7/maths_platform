/**
 * The browser's store of what the teacher dropped (ticket 171): the file itself, kept for the
 * thumbnails, the figure crops and the "Fix" that sends the region along (ticket 173). Five
 * ten-MB files do not fit localStorage, where the classroom store lives, so sources go in
 * IndexedDB and a draft carries only the id (see DECISION_LOG.md, "sources live in IndexedDB").
 * Where there is no IndexedDB (tests, the server) a Map stands in, so the same calls work
 * everywhere and the store is tested; nothing here is shared between browsers or devices.
 */

export interface StoredSource {
  id: string;
  name: string;
  mime: string;
  blob: Blob;
  addedAt: number;
}

const DB_NAME = "edexia-sources";
const STORE = "sources";
const VERSION = 1;

const memory = new Map<string, StoredSource>();

const hasIdb = () => typeof indexedDB !== "undefined";

let opening: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return opening;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const newSourceId = (): string => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

/** The file kept; its id, which the draft carries. */
export async function putSource(blob: Blob, name: string, mime: string, id = newSourceId()): Promise<string> {
  const rec: StoredSource = { id, name, mime, blob, addedAt: Date.now() };
  if (hasIdb()) await tx("readwrite", (s) => s.put(rec));
  else memory.set(id, rec);
  return id;
}

export async function getSource(id: string): Promise<StoredSource | null> {
  if (hasIdb()) return (await tx<StoredSource | undefined>("readonly", (s) => s.get(id))) ?? null;
  return memory.get(id) ?? null;
}

export async function deleteSource(id: string): Promise<void> {
  if (hasIdb()) await tx("readwrite", (s) => s.delete(id));
  else memory.delete(id);
}

/** For tests: the in-memory stand-in emptied. */
export function clearMemorySources(): void {
  memory.clear();
}

/** The longest side a tile thumbnail is drawn at; small enough that twenty of them sit in the draft in localStorage. */
export const THUMB_SIDE = 160;

/** The size a thumbnail is drawn at: the image's size scaled so its longer side is `side`, never scaled up. */
export function thumbSize(width: number, height: number, side = THUMB_SIDE): { width: number; height: number } {
  const scale = Math.min(1, side / Math.max(width, height, 1));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * A small JPEG data URL of an image blob for the tile's corner, or undefined where the browser
 * cannot draw (no `createImageBitmap`, no canvas: the server, a test) or the blob is not an
 * image it can decode.
 */
export async function thumbOf(blob: Blob, side = THUMB_SIDE): Promise<string | undefined> {
  if (typeof createImageBitmap === "undefined" || typeof document === "undefined") return undefined;
  try {
    const bmp = await createImageBitmap(blob);
    const { width, height } = thumbSize(bmp.width, bmp.height, side);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bmp, 0, 0, width, height);
    bmp.close();
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return undefined;
  }
}
