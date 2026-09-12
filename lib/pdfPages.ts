import { THUMB_SIDE } from "./sources";

/**
 * PDF pages drawn in the browser (ticket 172): the page count checked before a file is sent,
 * the thumbnail of the page a draft came from, and (ticket 173) the page at full size for a
 * figure crop. `pdfjs-dist` is loaded on first use only, so no other screen pays for it; its
 * worker is the package's own, bundled by Next through `new URL(…, import.meta.url)`. The API
 * reads the PDF itself (a native document block, ticket 170); this is only for pixels. See
 * DECISION_LOG.md, "PDFs go to the API natively and are drawn in the browser by pdfjs-dist".
 */

type PdfJs = typeof import("pdfjs-dist");
type PdfDocument = import("pdfjs-dist").PDFDocumentProxy;

let lib: Promise<PdfJs> | null = null;

function pdfjs(): Promise<PdfJs> {
  if (!lib) {
    lib = import("pdfjs-dist").then((m) => {
      m.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      return m;
    });
  }
  return lib;
}

/** The scale that fits a page of `width` × `height` (at scale 1) inside `side` on its longer edge, never above 1. */
export function fitScale(width: number, height: number, side: number): number {
  return Math.min(1, side / Math.max(width, height, 1));
}

/** An open PDF: its document, its page count, and `close` to free the worker's copy; the caller closes it. */
export interface OpenPdf {
  doc: PdfDocument;
  pages: number;
  close: () => Promise<void>;
}

/** The document opened from its bytes. */
export async function openPdf(blob: Blob): Promise<OpenPdf> {
  const { getDocument } = await pdfjs();
  const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
  const doc = await task.promise;
  return { doc, pages: doc.numPages, close: () => task.destroy() };
}

/** How many pages, or null when the file cannot be opened as a PDF at all (a wrong extension, a broken file). */
export async function pageCount(blob: Blob): Promise<number | null> {
  try {
    const open = await openPdf(blob);
    await open.close();
    return open.pages;
  } catch {
    return null;
  }
}

/**
 * One page drawn to a canvas at `scale` (1 = the PDF's own 72 dpi points), or, with `side`, at
 * whatever scale fits its longer edge in `side` px. Null where the browser cannot draw.
 */
export async function renderPage(doc: PdfDocument, page: number, opts: { scale?: number; side?: number }): Promise<HTMLCanvasElement | null> {
  if (typeof document === "undefined") return null;
  const p = await doc.getPage(page);
  const base = p.getViewport({ scale: 1 });
  const scale = opts.side !== undefined ? fitScale(base.width, base.height, opts.side) : (opts.scale ?? 1);
  const viewport = p.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  await p.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}

/** A page's thumbnail as a JPEG data URL for a tile's corner, or undefined where the browser cannot draw. */
export async function pageThumb(doc: PdfDocument, page: number, side = THUMB_SIDE): Promise<string | undefined> {
  try {
    const canvas = await renderPage(doc, page, { side });
    return canvas?.toDataURL("image/jpeg", 0.8);
  } catch {
    return undefined;
  }
}
