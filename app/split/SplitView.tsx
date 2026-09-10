"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import Brand from "@/components/Brand";
import { resetSession } from "@/lib/store";
import {
  DEFAULT_SIZES,
  frameFor,
  GUTTER,
  PANES,
  parseLayout,
  parsePanes,
  parseSizes,
  placeFor,
  resetSize,
  resize,
  serialisePanes,
  togglePane,
  type Divider,
  type Layout,
  type Pane,
  type PaneId,
  type Sizes,
} from "@/lib/split";

const KEY = "edexia-demo-split";

type Choice = { panes: PaneId[]; layout: Layout; sizes: Sizes };

/**
 * The last choice, kept in localStorage so plain /split reopens it, read as an external store:
 * the server snapshot is `undefined` (not yet known), the client's is the raw string or null.
 */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const readRaw = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const unknown = () => undefined;

const parseStored = (raw: string | null | undefined): Choice | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { panes?: string; layout?: string; sizes?: unknown };
    const panes = parsePanes(parsed.panes);
    return panes ? { panes, layout: parseLayout(parsed.layout), sizes: parseSizes(parsed.sizes) } : null;
  } catch {
    return null;
  }
};

/** The URL carries the panes and layout (a link reproduces the setup); the sizes are a local preference. */
const store = (c: Choice) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ panes: serialisePanes(c.panes), layout: c.layout, sizes: c.sizes }));
  } catch {
    // Storage blocked: the URL still carries the choice.
  }
  window.history.replaceState(null, "", `/split?panes=${serialisePanes(c.panes)}${c.layout === "beside" ? "&layout=beside" : ""}`);
  listeners.forEach((cb) => cb());
};

const chip = (on: boolean) => `rounded-full px-2.5 py-1 text-[12px] transition-colors ${on ? "bg-accent-soft text-accent-deep" : "text-ink-muted hover:bg-cream-deep hover:text-ink"}`;

/** The element's content box, kept current by a ResizeObserver; zero until measured. */
function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

const gutterCount = (tracks: string) => (tracks.match(/px/g) ?? []).length;

/**
 * The student iPad, the teacher view and the board in one tab, fitted to the window, a presenter
 * page rather than a product screen: the dashed toolbar picks which of the three to show and how
 * to arrange them (`placeFor`), a handle in every gutter drags the boundary (`resize`, double-click
 * to reset), and each pane is the real route in an iframe, laid out at its design viewport and
 * scaled to fit (`frameFor`). Same origin, so the demo stores keep the panes in step exactly as
 * they keep tabs.
 */
export default function SplitView({ init, explicit, initLayout }: { init: PaneId[]; explicit: boolean; initLayout: Layout }) {
  // A named URL is used as given until the first change; from then on, and for plain /split, the stored
  // choice is the truth. Nothing is drawn until it is known, so no pane loads twice.
  const raw = useSyncExternalStore(subscribe, readRaw, unknown);
  const storedChoice = useMemo(() => parseStored(raw), [raw]);
  const [touched, setTouched] = useState(false);
  const fromUrl = explicit && !touched;
  const fallback: Choice = { panes: init, layout: initLayout, sizes: storedChoice?.sizes ?? DEFAULT_SIZES };
  const choice: Choice | null = fromUrl ? fallback : raw === undefined ? null : (storedChoice ?? fallback);
  const choose = (next: Choice) => {
    setTouched(true);
    store(next);
  };

  // A drag shows its sizes live and stores them once on release.
  const mainRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState<{ sizes: Sizes; axis: Divider["axis"] } | null>(null);
  const drag = useRef<{ divider: Divider; x: number; y: number; from: Sizes; extent: number } | null>(null);
  const panes = choice?.panes ?? [];
  const layout = choice?.layout ?? initLayout;
  const sizes = live?.sizes ?? choice?.sizes ?? DEFAULT_SIZES;
  const placement = placeFor(panes, layout, sizes);

  const startDrag = (divider: Divider) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const main = mainRef.current;
    if (!choice || !main || e.button !== 0) return;
    const rect = main.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(main).paddingLeft) * 2;
    const extent = divider.axis === "column" ? rect.width - pad - GUTTER * gutterCount(placement.columns) : rect.height - pad - GUTTER * gutterCount(placement.rows);
    drag.current = { divider, x: e.clientX, y: e.clientY, from: choice.sizes, extent: Math.max(1, extent) };
    e.currentTarget.setPointerCapture(e.pointerId);
    setLive({ sizes: choice.sizes, axis: divider.axis });
  };
  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const px = d.divider.axis === "column" ? e.clientX - d.x : e.clientY - d.y;
    setLive({ sizes: resize(d.from, d.divider, px / d.extent, panes), axis: d.divider.axis });
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !choice) return;
    drag.current = null;
    const px = d.divider.axis === "column" ? e.clientX - d.x : e.clientY - d.y;
    const final = resize(d.from, d.divider, px / d.extent, panes);
    setLive(null);
    choose({ ...choice, sizes: final });
  };
  const reset = (divider: Divider) => () => choice && choose({ ...choice, sizes: resetSize(choice.sizes, divider) });

  return (
    <div className="flex h-screen flex-col bg-cream" data-split>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-dashed border-line-strong bg-paper/80 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Brand />
          <span className="text-[13px] text-ink-muted">Split view</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-dashed border-line-strong px-1.5 py-0.5" data-pane-toggles>
            <span className="pl-1.5 pr-0.5 text-[11px] uppercase tracking-wide text-ink-muted">show</span>
            {PANES.map((p) => {
              const on = panes.includes(p.id);
              return (
                <button key={p.id} type="button" aria-pressed={on} data-pane-toggle={p.id} onClick={() => choice && choose({ ...choice, panes: togglePane(choice.panes, p.id) })} className={chip(on)}>
                  {p.label}
                </button>
              );
            })}
          </div>
          {panes.length > 1 && (
            <div className="flex items-center gap-1 rounded-full border border-dashed border-line-strong px-1.5 py-0.5" data-layout-toggles>
              {(["stacked", "beside"] as const).map((l) => (
                <button key={l} type="button" aria-pressed={layout === l} data-layout={l} onClick={() => choice && choose({ ...choice, layout: l })} className={chip(layout === l)}>
                  {l === "stacked" ? "Stacked" : "Side by side"}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={() => resetSession()} className="rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink" data-reset>
            Reset demo
          </button>
        </div>
      </header>
      <main
        ref={mainRef}
        // While a handle is held the iframes must not take the pointer, or the drag stops at their edge.
        className={`grid min-h-0 flex-1 p-3 ${live ? `select-none [&_iframe]:pointer-events-none ${live.axis === "row" ? "cursor-row-resize" : "cursor-col-resize"}` : ""}`}
        style={{ gridTemplateColumns: placement.columns, gridTemplateRows: placement.rows }}
        data-layout={layout}
        data-dragging={live ? "" : undefined}
      >
        {placement.cells.map((cell) => (
          <PaneFrame key={cell.id} pane={PANES.find((p) => p.id === cell.id)!} area={cell.area} />
        ))}
        {placement.dividers.map((d) => (
          <DividerHandle key={d.key} divider={d} onPointerDown={startDrag(d)} onPointerMove={moveDrag} onPointerUp={endDrag} onDoubleClick={reset(d)} />
        ))}
      </main>
    </div>
  );
}

/**
 * The boundary between two panes: the gutter track, a bar along it and an arrowed handle at its
 * middle. Drag to move the boundary; double-click to put it back.
 */
function DividerHandle({
  divider,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDoubleClick,
}: {
  divider: Divider;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
}) {
  const column = divider.axis === "column";
  return (
    <div
      role="separator"
      aria-orientation={column ? "vertical" : "horizontal"}
      aria-label={`Resize ${divider.before} and ${divider.after}`}
      title="Drag to resize · double-click to reset"
      data-divider={divider.key}
      style={{ gridArea: divider.area }}
      className={`group relative z-10 flex touch-none select-none items-center justify-center ${column ? "cursor-col-resize" : "cursor-row-resize"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <span className={`rounded-full bg-line-strong transition-colors group-hover:bg-accent-line group-active:bg-accent ${column ? "h-full w-[3px]" : "h-[3px] w-full"}`} />
      <span className="absolute grid h-6 w-6 place-items-center rounded-full border border-dashed border-line-strong bg-paper text-ink-muted shadow-card transition-colors group-hover:border-accent-line group-hover:text-accent-deep group-active:bg-accent-soft">
        <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${column ? "" : "rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 4 2 8l4 4M10 4l4 4-4 4" />
        </svg>
      </span>
    </div>
  );
}

/** One surface in its grid cell: a caption with a link to the route in its own tab, and the route in an iframe scaled to the pane. */
function PaneFrame({ pane, area }: { pane: Pane; area: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const frame = frameFor(size, pane.design);
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-card" style={{ gridArea: area }} data-pane={pane.id}>
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-line px-3 text-[11px] uppercase tracking-wide text-ink-muted select-none">
        <span>{pane.label}</span>
        <a href={pane.href} target="_blank" rel="noreferrer" className="normal-case tracking-normal hover:text-ink">
          Open in a tab ↗
        </a>
      </div>
      <div ref={ref} className="relative min-h-0 flex-1 overflow-hidden bg-cream">
        {size.width > 0 && (
          <iframe
            title={pane.label}
            src={pane.href}
            className="absolute origin-top-left border-0"
            style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height, transform: `scale(${frame.scale})` }}
            data-scale={frame.scale.toFixed(3)}
          />
        )}
      </div>
    </section>
  );
}
