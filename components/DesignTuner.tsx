"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StatusDot } from "@/components/Tag";
import { BORDER_KINDS, BORDER_MAX_PX, BORDER_STYLES, changedValues, colorFamilies, CORNER_TOKENS, EMPTY_PROPOSAL, LINKS, proposedColors, scaleLength, type Family, type Proposal, type Token } from "@/lib/designTokens";
import { hexToOklch, oklchToHex, rgbToHex, type Oklch } from "@/lib/oklch";

/**
 * The design tuner (ticket 296), mounted by the root layout under `next dev` only. ⌥C opens it. It proposes new
 * values for the tokens in app/globals.css as one unlayered `:root:root` rule over the page, so every element painted
 * with a token changes as a slider moves; holding Space disables that rule (the saved design) and letting go
 * restores it. Save posts the changed values to app/api/dev/design-tokens, which writes them into the file.
 */
const STORE = "edexia-design-tuner/v1";
const STYLE_ID = "design-tuner-proposal";
const noop = () => () => {};

export default function DesignTuner() {
  // Client only: the proposal lives in localStorage, so nothing renders on the server or before hydration.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? <Tuner /> : null;
}

type Saved = { proposal: Proposal; open: boolean; pos: { x: number; y: number } | null };

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? "null");
    if (raw && raw.proposal) return { proposal: { ...EMPTY_PROPOSAL, ...raw.proposal }, open: !!raw.open, pos: raw.pos ?? null };
  } catch {}
  return { proposal: EMPTY_PROPOSAL, open: false, pos: null };
}

const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || (el instanceof HTMLInputElement && el.type !== "range" && el.type !== "checkbox") || el instanceof HTMLTextAreaElement);

type Section = "colours" | "markers" | "corners" | "borders";
const BORDER_COLORS: string[] = BORDER_KINDS.map((k) => k.color);

function Tuner() {
  const [initial] = useState(load);
  const [open, setOpen] = useState(initial.open);
  const [pos, setPos] = useState(initial.pos);
  const [proposal, setProposal] = useState(initial.proposal);
  const [history, setHistory] = useState<Proposal[]>([]);
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [sections, setSections] = useState<Section[]>(["colours"]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ rows: string[]; at: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const lastEdit = useRef({ key: "", at: 0 });
  const panel = useRef<HTMLDivElement>(null);
  const rowEls = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    let live = true;
    fetch("/api/dev/design-tokens")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`design tokens: ${r.status}`))))
      .then((d: { tokens: Token[] }) => live && setTokens(d.tokens))
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, []);

  const changed = tokens ? changedValues(tokens, proposal) : {};
  const changedCount = Object.keys(changed).length;
  const css = changedCount ? `:root:root{${Object.entries(changed).map(([k, v]) => `${k}:${v};`).join("")}}` : "";

  useEffect(() => {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
    if (el.sheet) el.sheet.disabled = comparing;
  }, [css, comparing]);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ proposal, open, pos }));
    } catch {}
  }, [proposal, open, pos]);

  const edit = (key: string, next: Proposal) => {
    const now = performance.now();
    // One slider drag is one undo step: edits to the same control in quick succession coalesce.
    if (key !== lastEdit.current.key || now - lastEdit.current.at > 700) setHistory((h) => [...h.slice(-99), proposal]);
    lastEdit.current = { key, at: now };
    setProposal(next);
  };
  const undo = () => {
    if (!history.length) return;
    lastEdit.current = { key: "", at: 0 };
    setProposal(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const colors = tokens ? proposedColors(tokens, proposal) : {};
  const families = tokens ? colorFamilies(tokens) : [];
  const fileValue = (name: string) => tokens?.find((t) => t.name === name)?.value ?? "";
  const valueOf = (name: string) => proposal.values[name] ?? fileValue(name);
  const rows = familyRows(
    families.filter((f) => !f.main || !BORDER_COLORS.includes(f.main)),
    proposal.split,
  );
  const rowOfToken = (name: string) => rows.find((r) => r.tokens.includes(name))?.key;

  // Keyboard: ⌥C toggles; with the panel open, Space held compares and ⌘Z undoes.
  const live = useRef({ open, undo });
  useEffect(() => {
    live.current = { open, undo };
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyC") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!live.current.open || isTyping(e.target)) return;
      if (e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) setComparing(true);
      } else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.code === "KeyZ") {
        e.preventDefault();
        live.current.undo();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !live.current.open || isTyping(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      setComparing(false);
    };
    const blur = () => setComparing(false);
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // ⌥-click on the page: open the colours the element paints with (and the markers, for a status marker).
  const pickRef = useRef<(el: Element) => void>(() => {});
  useEffect(() => {
    pickRef.current = (target: Element) => {
      const byHex = new Map<string, string[]>();
      for (const [name, c] of Object.entries(colors)) {
        const hex = oklchToHex(c);
        byHex.set(hex, [...(byHex.get(hex) ?? []), name]);
      }
      const found: string[] = [];
      for (let el: Element | null = target, depth = 0; el && depth < 4 && el !== document.body; el = el.parentElement, depth++) {
        const cs = getComputedStyle(el);
        for (const prop of ["--marker-color", "background-color", "border-top-color", "fill", "stroke", "color"]) {
          const raw = cs.getPropertyValue(prop).trim();
          const hex = raw.startsWith("#") ? raw.toLowerCase() : rgbToHex(raw);
          for (const name of (hex && byHex.get(hex)) || []) {
            const key = rowOfToken(name);
            if (key && !found.includes(key)) found.push(key);
          }
        }
        if (found.length) break;
      }
      const marker = target.closest("[data-status], .marker-half");
      // A Classroom box (ticket 321): its border lives in Borders, not in the Colours rows.
      const box = target.closest(".set-card-edge, .hw-card-edge, [data-hw-cell]");
      setOpen(true);
      setSections((s) => [...new Set<Section>([...s, ...(found.length ? (["colours"] as const) : []), ...(marker ? (["markers"] as const) : []), ...(box ? (["borders"] as const) : [])])]);
      if (found.length) setExpanded(found[0]);
      setPicked({ rows: found, at: Date.now() });
    };
  });
  useEffect(() => {
    const stop = (e: MouseEvent | PointerEvent) => {
      if (!e.altKey || panel.current?.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "click" && e.target instanceof Element) pickRef.current(e.target);
    };
    window.addEventListener("pointerdown", stop, true);
    window.addEventListener("mousedown", stop, true);
    window.addEventListener("click", stop, true);
    return () => {
      window.removeEventListener("pointerdown", stop, true);
      window.removeEventListener("mousedown", stop, true);
      window.removeEventListener("click", stop, true);
    };
  }, []);
  useEffect(() => {
    if (picked?.rows[0]) rowEls.current.get(picked.rows[0])?.scrollIntoView({ block: "nearest" });
  }, [picked]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/dev/design-tokens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ values: changed }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `save failed: ${r.status}`);
      // The proposal stays over the page until the rewritten stylesheet has reloaded, so nothing flickers back.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTokens(d.tokens);
      setProposal(EMPTY_PROPOSAL);
      setHistory([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const drag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = panel.current!.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    const move = (m: PointerEvent) => setPos({ x: Math.min(Math.max(0, m.clientX - dx), window.innerWidth - 80), y: Math.min(Math.max(0, m.clientY - dy), window.innerHeight - 40) });
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const toggleSection = (s: Section) => setSections((all) => (all.includes(s) ? all.filter((x) => x !== s) : [...all, s]));
  const setColor = (name: string, c: Oklch) => edit(name, { ...proposal, colors: { ...proposal.colors, [name]: c } });
  const relink = (name: string) => {
    const rest = { ...proposal.colors };
    delete rest[name];
    edit(`relink${name}`, { ...proposal, colors: rest });
  };
  const setValue = (name: string, value: string) => edit(name, { ...proposal, values: { ...proposal.values, [name]: value } });
  const setValues = (key: string, values: Record<string, string>) => edit(key, { ...proposal, values: { ...proposal.values, ...values } });
  const setSplit = (follower: string, split: boolean) => {
    const rest = { ...proposal.colors };
    if (split) rest[follower] = colors[follower];
    else delete rest[follower];
    edit(`split${follower}`, { ...proposal, colors: rest, split: split ? [...proposal.split, follower] : proposal.split.filter((s) => s !== follower) });
  };

  if (!open)
    return (
      <>
        <style>{TUNER_CSS}</style>
        {changedCount > 0 && (
          <button type="button" className="dt-tag" onClick={() => setOpen(true)} data-design-tuner-tag>
            Design: {changedCount} unsaved · ⌥C
          </button>
        )}
      </>
    );

  const half = valueOf("--marker-half-stripe");
  const hatched = !half.endsWith("%");
  const cornerK = (() => {
    const from = parseFloat(fileValue("--radius-md"));
    return from ? parseFloat(valueOf("--radius-md")) / from : 1;
  })();

  return (
    <div ref={panel} className="dt-panel" style={pos ? { left: pos.x, top: pos.y } : { right: 16, top: 16 }} data-design-tuner>
      <style>{TUNER_CSS}</style>
      <header className="dt-head" onPointerDown={drag}>
        <strong>Design</strong>
        <span className={`dt-compare ${comparing ? "dt-on" : ""}`}>{comparing ? "saved design" : "hold Space: saved"}</span>
        <button type="button" className="dt-icon" onClick={undo} disabled={!history.length} title="Undo (⌘Z)" aria-label="Undo">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4.5 2.5 2 5l2.5 2.5" />
            <path d="M2.5 5H8a3.5 3.5 0 0 1 0 7H5.5" />
          </svg>
        </button>
        <button type="button" className="dt-icon" onClick={() => setOpen(false)} title="Close (⌥C)" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
          </svg>
        </button>
      </header>
      <div className="dt-body">
        {error && <p className="dt-error">{error}</p>}
        {!tokens && !error && <p className="dt-muted">Reading app/globals.css…</p>}
        {tokens && (
          <>
            <p className="dt-muted dt-hint">⌥-click anything on the page to find its colours.</p>

            <SectionHead title="Colours" open={sections.includes("colours")} onClick={() => toggleSection("colours")} />
            {sections.includes("colours") && (
              <ul className="dt-rows">
                {rows.map((row) => {
                  const isOpen = expanded === row.key;
                  const flash = picked?.rows.includes(row.key);
                  return (
                    <li key={flash ? `${row.key}-${picked!.at}` : row.key} ref={(el) => void (el ? rowEls.current.set(row.key, el) : rowEls.current.delete(row.key))} className={flash ? "dt-flash" : ""} data-tuner-row={row.key}>
                      <button type="button" className={`dt-row ${isOpen ? "dt-row-open" : ""}`} onClick={() => setExpanded(isOpen ? null : row.key)}>
                        <span className="dt-swatches">
                          {row.tokens.map((t) => (
                            <span key={t} className="dt-swatch" style={{ background: colors[t] ? oklchToHex(colors[t]) : undefined }} />
                          ))}
                        </span>
                        <span className="dt-label">{row.label}</span>
                        <span className="dt-hex">{row.main ? oklchToHex(colors[row.main]) : ""}</span>
                        {row.tokens.some((t) => changed[t]) && <span className="dt-dot" title="changed" />}
                      </button>
                      {isOpen && (
                        <div className="dt-editor">
                          {row.main && <ColorEditor name={row.main} value={colors[row.main]} onChange={(c) => setColor(row.main!, c)} />}
                          {row.link && (
                            <label className="dt-check">
                              <input type="checkbox" checked={proposal.split.includes(row.link.follower)} onChange={(e) => setSplit(row.link!.follower, e.target.checked)} data-tuner-split />
                              Split {row.link.follower.slice(8)} from {row.link.leader.slice(8)}
                            </label>
                          )}
                          {row.shades.map((s) => (
                            <ShadeEditor key={s.name} name={s.name} value={colors[s.name]} follows={s.follows && !proposal.colors[s.name]} canFollow={s.follows} onChange={(c) => setColor(s.name, c)} onRelink={() => relink(s.name)} />
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <SectionHead title="Markers" open={sections.includes("markers")} onClick={() => toggleSection("markers")} />
            {sections.includes("markers") && (
              <div className="dt-editor dt-section">
                <div className="dt-preview">
                  <StatusDot status="gap" shape="pill" />
                  <StatusDot status="gap" shape="pill" half />
                  <StatusDot status="developing" shape="pill" half />
                  <StatusDot status="secure" shape="pill" />
                  <StatusDot status="gap" size="h-[15px] w-[15px]" />
                  <StatusDot status="gap" size="h-[15px] w-[15px]" half />
                  <StatusDot status="unseen" size="h-[15px] w-[15px]" />
                </div>
                <Slider label="Pill corners" min={0} max={7} step={0.5} value={parseFloat(valueOf("--marker-pill-radius"))} format={(v) => `${v}px`} onChange={(v) => setValue("--marker-pill-radius", `${v}px`)} name="pill-radius" />
                <Slider label="Dot corners" min={0} max={50} step={1} value={parseFloat(valueOf("--marker-dot-radius"))} format={(v) => `${v}%`} onChange={(v) => setValue("--marker-dot-radius", `${v}%`)} name="dot-radius" />
                <div className="dt-field">
                  <span>Incomplete</span>
                  <span className="dt-seg">
                    <button type="button" className={hatched ? "" : "dt-seg-on"} onClick={() => setValue("--marker-half-stripe", "50%")} data-tuner-half="split">
                      Split
                    </button>
                    <button type="button" className={hatched ? "dt-seg-on" : ""} onClick={() => setValue("--marker-half-stripe", "2px")} data-tuner-half="hatched">
                      Hatched
                    </button>
                  </span>
                </div>
                <div className="dt-field">
                  <span>Line</span>
                  <span className="dt-seg">
                    {ANGLES.map((a) => (
                      <button key={a.value} type="button" className={valueOf("--marker-half-angle") === a.value ? "dt-seg-on" : ""} onClick={() => setValue("--marker-half-angle", a.value)} title={a.title} data-tuner-angle={a.value}>
                        {a.glyph}
                      </button>
                    ))}
                  </span>
                </div>
                <Slider label="Angle" min={0} max={180} step={5} value={angleDeg(valueOf("--marker-half-angle"))} format={(v) => (valueOf("--marker-half-angle").startsWith("to ") ? "corner" : `${v}°`)} onChange={(v) => setValue("--marker-half-angle", `${v}deg`)} name="half-angle" />
                {hatched && <Slider label="Stripe" min={1} max={5} step={0.5} value={parseFloat(half)} format={(v) => `${v}px`} onChange={(v) => setValue("--marker-half-stripe", `${v}px`)} name="half-stripe" />}
              </div>
            )}

            <SectionHead title="Corners" open={sections.includes("corners")} onClick={() => toggleSection("corners")} />
            {sections.includes("corners") && (
              <div className="dt-editor dt-section">
                <Slider
                  label="All corners"
                  min={0}
                  max={2}
                  step={0.05}
                  value={Number(cornerK.toFixed(2))}
                  format={(v) => `×${v.toFixed(2)}`}
                  onChange={(k) => setValues("corners", Object.fromEntries(CORNER_TOKENS.map((t) => [t, scaleLength(fileValue(t), k)])))}
                  name="corners"
                />
                <p className="dt-muted">
                  {CORNER_TOKENS.map((t) => `${t.slice(9)} ${Math.round(parseFloat(valueOf(t)) * 16 * 10) / 10}px`).join(" · ")}. Round chips (rounded-full) stay round.
                </p>
              </div>
            )}

            <SectionHead title="Borders" open={sections.includes("borders")} onClick={() => toggleSection("borders")} />
            {sections.includes("borders") && (
              <div className="dt-editor dt-section">
                {BORDER_KINDS.map((k) => (
                  <div key={k.key} className="dt-border" data-tuner-border={k.key}>
                    <div className="dt-border-head">
                      <strong>{k.label}</strong>
                      {[k.width, k.style, k.color].some((t) => changed[t]) && <span className="dt-dot" title="changed" />}
                    </div>
                    <Slider label="Width" min={0} max={BORDER_MAX_PX} step={0.5} value={parseFloat(valueOf(k.width))} format={(v) => `${v}px`} onChange={(v) => setValue(k.width, `${v}px`)} name={`${k.key}-border-width`} />
                    <div className="dt-field">
                      <span>Style</span>
                      <span className="dt-seg">
                        {BORDER_STYLES.map((s) => (
                          <button key={s} type="button" className={valueOf(k.style) === s ? "dt-seg-on" : ""} onClick={() => setValue(k.style, s)} data-tuner-border-style={`${k.key}-${s}`}>
                            {s[0].toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </span>
                    </div>
                    {colors[k.color] && <ShadeEditor name={k.color} value={colors[k.color]} follows={false} canFollow={false} onChange={(c) => setColor(k.color, c)} onRelink={() => {}} />}
                  </div>
                ))}
                <p className="dt-muted">Drawn inward from each box&apos;s edge, so nothing moves. Hover, To do, completed and missed boxes keep their own colour; a not-yet-open cell keeps its dashes.</p>
              </div>
            )}
          </>
        )}
      </div>
      <footer className="dt-foot">
        <span className="dt-muted">{changedCount ? `${changedCount} unsaved` : "matches the file"}</span>
        <button type="button" className="dt-btn" onClick={() => edit("reset", EMPTY_PROPOSAL)} disabled={!changedCount || saving}>
          Reset
        </button>
        <button type="button" className="dt-btn dt-primary" onClick={save} disabled={!changedCount || saving} data-tuner-save>
          {saving ? "Saving…" : "Save to globals.css"}
        </button>
      </footer>
    </div>
  );
}

/**
 * The incomplete split's line. A gradient at 90deg runs left to right, so its edge stands upright; toward a corner
 * (`to bottom right`) the edge runs exactly corner to corner of the marker, whatever its width, where 135deg would not.
 */
const ANGLES = [
  { value: "90deg", glyph: "│", title: "Upright" },
  { value: "to bottom right", glyph: "╱", title: "Corner to corner, colour top left" },
  { value: "to top right", glyph: "╲", title: "Corner to corner, colour bottom left" },
  { value: "0deg", glyph: "─", title: "Level, colour below" },
];
const angleDeg = (value: string) => (value === "to bottom right" ? 135 : value === "to top right" ? 45 : parseFloat(value));

type Row = { key: string; label: string; main: string | null; tokens: string[]; shades: { name: string; follows: boolean }[]; link: (typeof LINKS)[number] | null };

/** The panel's colour rows: a family each, except a linked follower, which joins its leader's row until split. */
function familyRows(families: Family[], split: string[]): Row[] {
  const byMain = new Map(families.filter((f) => f.main).map((f) => [f.main!, f]));
  const rows: Row[] = [];
  for (const f of families) {
    const asFollower = LINKS.find((k) => k.follower === f.main && !split.includes(k.follower) && byMain.has(k.leader));
    if (asFollower) continue;
    const link = LINKS.find((k) => k.leader === f.main && byMain.has(k.follower)) ?? null;
    const joined = link && !split.includes(link.follower) ? byMain.get(link.follower)! : null;
    const shades = [...f.shades.map((name) => ({ name, follows: !!f.main })), ...(joined ? [{ name: joined.main!, follows: true }, ...joined.shades.map((name) => ({ name, follows: true }))] : [])];
    rows.push({
      key: f.base,
      label: joined ? `${link!.label} · ${f.base} + ${joined.base}` : f.base,
      main: f.main,
      tokens: [...(f.main ? [f.main] : []), ...shades.map((s) => s.name)],
      shades: joined ? shades.filter((s) => s.name !== joined.main) : shades,
      link,
    });
  }
  return rows;
}

function SectionHead({ title, open, onClick }: { title: string; open: boolean; onClick: () => void }) {
  return (
    <button type="button" className="dt-section-head" onClick={onClick} aria-expanded={open} data-tuner-section={title.toLowerCase()}>
      <span>{open ? "▾" : "▸"}</span> {title}
    </button>
  );
}

const MAX_C = 0.37;
const track = (f: (t: number) => Oklch) => `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) => oklchToHex(f(i / 12))).join(", ")})`;

function ColorEditor({ name, value, onChange }: { name: string; value: Oklch; onChange: (c: Oklch) => void }) {
  const hex = oklchToHex(value);
  return (
    <div className="dt-color" data-tuner-color={name}>
      <div className="dt-color-top">
        <span className="dt-big-swatch" style={{ background: hex }} />
        <code>{name.slice(8)}</code>
        <HexInput hex={hex} onChange={(h) => onChange(hexToOklch(h)!)} />
      </div>
      <Slider label="Lightness" min={0} max={1} step={0.002} value={value.l} format={(v) => `${Math.round(v * 100)}`} background={track((t) => ({ ...value, l: t }))} onChange={(l) => onChange({ ...value, l })} name={`${name}-l`} />
      <Slider label="Vividness" min={0} max={MAX_C} step={0.002} value={Math.min(value.c, MAX_C)} format={(v) => `${Math.round((v / MAX_C) * 100)}`} background={track((t) => ({ ...value, c: t * MAX_C }))} onChange={(c) => onChange({ ...value, c })} name={`${name}-c`} />
      <Slider label="Hue" min={0} max={360} step={1} value={value.h} format={(v) => `${Math.round(v)}°`} background={track((t) => ({ ...value, h: t * 360 }))} onChange={(h) => onChange({ ...value, h })} name={`${name}-h`} />
    </div>
  );
}

function ShadeEditor({ name, value, follows, canFollow, onChange, onRelink }: { name: string; value: Oklch; follows: boolean; canFollow: boolean; onChange: (c: Oklch) => void; onRelink: () => void }) {
  const [open, setOpen] = useState(false);
  const hex = oklchToHex(value);
  return (
    <div className="dt-shade" data-tuner-shade={name}>
      <div className="dt-shade-row">
        <button type="button" className="dt-shade-name" onClick={() => setOpen((o) => !o)}>
          <span className="dt-swatch" style={{ background: hex }} />
          <code>{name.slice(8)}</code>
          <span className="dt-hex">{hex}</span>
        </button>
        {canFollow &&
          (follows ? (
            <span className="dt-muted" title="Moves with the main colour">
              follows
            </span>
          ) : (
            <button type="button" className="dt-link" onClick={onRelink} title="Follow the main colour again">
              relink
            </button>
          ))}
      </div>
      {open && <ColorEditor name={name} value={value} onChange={onChange} />}
    </div>
  );
}

function HexInput({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && hexToOklch(draft)) onChange(draft.startsWith("#") ? draft : `#${draft}`);
    setDraft(null);
  };
  return <input className="dt-hex-input" value={draft ?? hex} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} spellCheck={false} aria-label="Hex" />;
}

function Slider({ label, min, max, step, value, format, onChange, background, name }: { label: string; min: number; max: number; step: number; value: number; format: (v: number) => string; onChange: (v: number) => void; background?: string; name: string }) {
  return (
    <label className="dt-field">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={Number.isFinite(value) ? value : min} onChange={(e) => onChange(parseFloat(e.target.value))} className={background ? "dt-range dt-range-painted" : "dt-range"} style={background ? { background } : undefined} data-tuner-slider={name} />
      <output>{format(value)}</output>
    </label>
  );
}

/** The panel's own look, in fixed colours and sizes so tuning the page never restyles the tuner. */
const TUNER_CSS = `
.dt-panel{position:fixed;z-index:2147483000;width:340px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#fff;color:#1d1b33;border:1px solid #dcdae6;border-radius:12px;box-shadow:0 18px 50px -12px rgba(20,18,58,.35);font:12px/1.35 system-ui,-apple-system,sans-serif;cursor:default}
.dt-panel *{box-sizing:border-box;cursor:default}
.dt-panel input:not([type=range]):not([type=checkbox]){cursor:text}
.dt-head{display:flex;align-items:center;gap:8px;padding:10px 10px 10px 14px;border-bottom:1px solid #ecebf2;cursor:grab;user-select:none}
.dt-head strong{font-size:13px;font-weight:600}
.dt-compare{margin-left:auto;font-size:11px;color:#8a88a0;padding:2px 7px;border-radius:999px}
.dt-compare.dt-on{background:#1d1b33;color:#fff}
.dt-icon{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:#4a4863;padding:0}
.dt-icon:hover:not(:disabled){background:#f1f0f6}
.dt-icon:disabled{opacity:.35}
.dt-body{overflow:auto;padding:8px 12px 12px;flex:1}
.dt-hint{margin:2px 2px 6px}
.dt-muted{color:#8a88a0;font-size:11px}
.dt-error{color:#b3261e;margin:4px 2px}
.dt-section-head{display:flex;gap:6px;width:100%;border:0;background:transparent;padding:8px 2px 6px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#4a4863;text-align:left}
.dt-rows{list-style:none;margin:0;padding:0}
.dt-row{display:flex;align-items:center;gap:8px;width:100%;border:0;background:transparent;padding:5px 6px;border-radius:7px;text-align:left;color:inherit;font:inherit}
.dt-row:hover,.dt-row-open{background:#f5f4f9}
.dt-swatches{display:flex;flex-shrink:0;width:52px;height:14px;border-radius:3px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.dt-swatch{display:inline-block;width:14px;height:14px;border-radius:3px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);flex-shrink:0}
.dt-swatches .dt-swatch{flex:1 1 0;width:auto;height:14px;border-radius:0;box-shadow:none}
.dt-swatches .dt-swatch:first-child{flex-grow:2}
.dt-label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dt-hex{font:11px ui-monospace,Menlo,monospace;color:#8a88a0}
.dt-dot{width:6px;height:6px;border-radius:50%;background:#5b4ae8}
.dt-editor{padding:6px 6px 10px}
.dt-section{padding:2px 2px 8px}
.dt-color{display:flex;flex-direction:column;gap:4px;padding:4px 0}
.dt-color-top{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dt-color-top code,.dt-shade code{font:11px ui-monospace,Menlo,monospace;color:#4a4863}
.dt-big-swatch{width:22px;height:22px;border-radius:5px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.dt-hex-input{margin-left:auto;width:80px;border:1px solid #dcdae6;border-radius:6px;padding:3px 6px;font:11px ui-monospace,Menlo,monospace;color:#1d1b33;background:#fff}
.dt-field{display:grid;grid-template-columns:78px 1fr 40px;align-items:center;gap:8px;min-height:24px;color:#4a4863}
.dt-field output{text-align:right;font:11px ui-monospace,Menlo,monospace;color:#1d1b33}
.dt-range{-webkit-appearance:none;appearance:none;width:100%;height:14px;border-radius:7px;background:#e7e5ef;margin:0;outline:none}
.dt-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #1d1b33;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.dt-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #1d1b33}
.dt-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px rgba(91,74,232,.35)}
.dt-range-painted{box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.dt-check{display:flex;align-items:center;gap:6px;margin:6px 0 2px;color:#4a4863}
.dt-shade{border-top:1px solid #efeef4;padding-top:4px;margin-top:4px}
.dt-shade-row{display:flex;align-items:center;gap:8px}
.dt-shade-name{display:grid;grid-template-columns:14px 92px 1fr;align-items:center;gap:8px;flex:1;border:0;background:transparent;padding:3px 0;font:inherit;color:inherit;text-align:left}
.dt-link{border:0;background:transparent;color:#5b4ae8;font-size:11px;padding:0}
.dt-seg{display:inline-flex;grid-column:2 / 4;border:1px solid #dcdae6;border-radius:7px;overflow:hidden;justify-self:start}
.dt-seg button{border:0;background:#fff;padding:3px 10px;font:12px system-ui,sans-serif;color:#4a4863;min-width:34px}
.dt-seg button+button{border-left:1px solid #dcdae6}
.dt-seg .dt-seg-on{background:#1d1b33;color:#fff}
.dt-border{display:flex;flex-direction:column;gap:4px;padding:4px 0 8px}
.dt-border+.dt-border{border-top:1px solid #efeef4;padding-top:8px}
.dt-border-head{display:flex;align-items:center;gap:6px;color:#1d1b33;font-size:12px}
.dt-border-head strong{font-weight:600}
.dt-preview{display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:6px;background:#faf8f4;border-radius:8px}
.dt-foot{display:flex;align-items:center;gap:6px;padding:10px 12px;border-top:1px solid #ecebf2}
.dt-foot .dt-muted{margin-right:auto}
.dt-btn{border:1px solid #dcdae6;background:#fff;color:#1d1b33;border-radius:7px;padding:5px 10px;font:12px system-ui,sans-serif}
.dt-btn:disabled{opacity:.4}
.dt-primary{background:#1d1b33;border-color:#1d1b33;color:#fff}
.dt-flash>.dt-row{animation:dt-flash 1.2s ease-out}
@keyframes dt-flash{0%,30%{background:#e4e0fb}100%{background:transparent}}
.dt-tag{position:fixed;z-index:2147483000;top:6px;left:50%;transform:translateX(-50%);border:0;border-radius:999px;background:#1d1b33;color:#fff;padding:3px 10px;font:11px system-ui,sans-serif;opacity:.85;cursor:default}
`;
