import type { FigureBox } from "./extract";
import { thumbSize } from "./sources";

/**
 * Figure crops (ticket 173): the region the model boxed as a diagram, cut from the picture it
 * was read from, at full resolution for the source store and small for the tile. `cropRect` is
 * the pure part; the drawing needs a canvas and runs in the browser only.
 */

export interface PxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A normalised box on a picture of `width` × `height` as whole pixels, clamped inside it, at least one pixel each way. */
export function cropRect(box: FigureBox, width: number, height: number): PxRect {
  const x0 = Math.max(0, Math.min(width, Math.round(box.x0 * width)));
  const y0 = Math.max(0, Math.min(height, Math.round(box.y0 * height)));
  const x1 = Math.max(0, Math.min(width, Math.round(box.x1 * width)));
  const y1 = Math.max(0, Math.min(height, Math.round(box.y1 * height)));
  return { x: Math.min(x0, width - 1), y: Math.min(y0, height - 1), w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}

/** The longest side of the small copy a tile shows. */
export const FIGURE_SIDE = 480;

export interface Figure {
  /** The crop at the picture's own resolution, as a PNG. */
  full: Blob;
  /** The crop scaled to at most `FIGURE_SIDE`, as a JPEG data URL. */
  url: string;
  width: number;
  height: number;
}

/** The box cut out of a drawn picture (an image bitmap or a rendered page). Null where the browser cannot draw. */
export async function cropFigure(picture: ImageBitmap | HTMLCanvasElement, box: FigureBox): Promise<Figure | null> {
  if (typeof document === "undefined") return null;
  const rect = cropRect(box, picture.width, picture.height);
  const full = document.createElement("canvas");
  full.width = rect.w;
  full.height = rect.h;
  const ctx = full.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, rect.w, rect.h);
  ctx.drawImage(picture, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  const small = document.createElement("canvas");
  const size = thumbSize(rect.w, rect.h, FIGURE_SIDE);
  small.width = size.width;
  small.height = size.height;
  small.getContext("2d")?.drawImage(full, 0, 0, size.width, size.height);
  const blob = await new Promise<Blob | null>((resolve) => full.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return { full: blob, url: small.toDataURL("image/jpeg", 0.85), width: rect.w, height: rect.h };
}

/** The box cut out of an image file. */
export async function cropFromImage(blob: Blob, box: FigureBox): Promise<Figure | null> {
  if (typeof createImageBitmap === "undefined") return null;
  try {
    const bmp = await createImageBitmap(blob);
    const out = await cropFigure(bmp, box);
    bmp.close();
    return out;
  } catch {
    return null;
  }
}
