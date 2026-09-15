"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useEscape } from "@/components/useEscape";
import { addDays, addMonths, addMonthsToDay, DEMO_TODAY, dayLabel, dayName, laterOf, monthLabel, monthOf, monthWeeks, weekEnd, weekStart, type IsoDay, type Month } from "@/lib/dueDate";

const WEEKDAY_HEADS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * The due-date picker (ticket 289): a field that reads the day as cards show it ("Thu 10 Sep") and, pressed, a small
 * month calendar over whatever lies below it. Shared: Create's Questions page puts it beside the title for an in-class
 * set, and ticket 291 reuses it for homework with its own earliest day (`min`) and a line under the date (`note`).
 *
 * - Days before `min` are shown but cannot be chosen; the months before `min`'s cannot be reached.
 * - The calendar is an overlay anchored under the field's right edge, so opening it moves nothing on the page.
 * - Keyboard: the arrows walk the days (a week up and down), Home and End the week, Page Up and Page Down the month,
 *   Enter or Space choose; Escape closes it and gives the focus back to the field, as does a choice.
 * - A press outside closes it without choosing, and the press still lands where it was aimed.
 *
 * It never gates anything: the field always holds a day, and a choice is stored at once.
 */
export default function DuePicker({ value, onChange, min = DEMO_TODAY, today = DEMO_TODAY, note, label = "Due" }: { value: IsoDay; onChange: (day: IsoDay) => void; /** The earliest day that can be chosen. */ min?: IsoDay; /** The day marked as today. */ today?: IsoDay; /** A line under the date (ticket 291's "Mistakes from this set go into Homework N"). */ note?: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  useEscape(open, close, () => field.current);

  // A press anywhere outside the picker closes it; the press itself carries on to what it was aimed at.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  return (
    <div
      ref={root}
      className="relative shrink-0"
      // Tabbing out of the open calendar closes it, as a press outside does.
      onBlur={(e) => {
        if (open && e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      data-due-picker
    >
      <button
        ref={field}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${dayName(value)}`}
        className={`flex items-center gap-3 rounded-xl border bg-paper py-[5px] pr-3 pl-3.5 text-left transition-colors ${open ? "border-accent" : "border-line hover:border-ink-muted"}`}
        data-due-field={value}
      >
        <CalendarIcon />
        <span className="flex flex-col">
          <span className="text-[11px] leading-[14px] font-semibold tracking-[0.12em] text-ink-muted uppercase">{label}</span>
          {/* As wide as the widest day ("Mon 28 May"), so a new date never changes the field's width or the title's beside it. */}
          <span className="min-w-[104px] text-[17px] leading-[22px] font-medium whitespace-nowrap text-ink tabular-nums" data-due-value>
            {dayLabel(value)}
          </span>
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`ml-1 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Under the field's right edge and out of the flow (ticket 291), so a note appearing moves neither the title beside it nor what is below. */}
      {note && (
        <p className="pointer-events-none absolute top-full right-0 mt-1 text-right text-[12.5px] leading-[16px] whitespace-nowrap text-ink-muted" data-due-note>
          {note}
        </p>
      )}
      {open && (
        <Calendar
          value={value}
          min={min}
          today={today}
          onChoose={(day) => {
            onChange(day);
            setOpen(false);
            field.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0 text-accent-deep">
      <rect x="2.25" y="3.5" width="13.5" height="12" rx="2.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.25 7.25h13.5M6 1.75v3M12 1.75v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** The open calendar: mounted on open, so its month and its focused day start from the field's value every time. */
function Calendar({ value, min, today, onChoose }: { value: IsoDay; min: IsoDay; today: IsoDay; onChoose: (day: IsoDay) => void }) {
  const [focus, setFocus] = useState<IsoDay>(() => laterOf(value, min));
  const [view, setView] = useState<Month>(() => monthOf(laterOf(value, min)));
  const grid = useRef<HTMLTableElement>(null);
  /** Whether the focus should follow `focus` into the grid: from a key, not from a month button pressed with the mouse. */
  const moved = useRef(true);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus({ preventScroll: true });
  }, [focus, view]);

  const minMonth = monthOf(min);
  const canPrev = view.year * 12 + view.month > minMonth.year * 12 + minMonth.month;
  const go = (day: IsoDay) => {
    const next = laterOf(day, min);
    moved.current = true;
    setFocus(next);
    setView(monthOf(next));
  };
  const turn = (n: number) => {
    const m = addMonths(view, n);
    // Back to `min`'s month the previous-month button turns off under the press: the focus goes to the day, not to nowhere.
    if (m.year * 12 + m.month <= minMonth.year * 12 + minMonth.month) moved.current = true;
    setView(m);
    // The focused day follows into the shown month, on the same date where it can (31 Oct back is 30 Sep), never before `min`.
    setFocus(laterOf(addMonthsToDay(focus, n), min));
  };

  const onKey = (e: KeyboardEvent<HTMLTableElement>) => {
    const moves: Record<string, () => IsoDay> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      Home: () => weekStart(focus),
      End: () => weekEnd(focus),
      PageUp: () => addMonthsToDay(focus, -1),
      PageDown: () => addMonthsToDay(focus, 1),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      go(move());
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focus >= min) onChoose(focus);
    }
  };

  return (
    <div role="dialog" aria-label="Choose a due date" className="absolute top-full right-0 z-30 mt-2 w-[308px] rounded-2xl border border-line bg-paper p-3 shadow-lift" data-due-calendar>
      <div className="flex items-center justify-between px-1 pb-2">
        <MonthButton dir={-1} disabled={!canPrev} onClick={() => turn(-1)} />
        <p className="font-display text-[18px] leading-none text-ink" aria-live="polite" data-due-month>
          {monthLabel(view)}
        </p>
        <MonthButton dir={1} onClick={() => turn(1)} />
      </div>
      <table ref={grid} role="grid" aria-label={monthLabel(view)} className="w-full border-collapse" onKeyDown={onKey}>
        <thead>
          <tr>
            {WEEKDAY_HEADS.map((d) => (
              <th key={d} scope="col" abbr={d} className="h-7 text-center text-[10.5px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                {d.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(view).map((week, w) => (
            <tr key={w}>
              {week.map((day, i) => (
                <td key={day ?? `pad-${w}-${i}`} className="p-0.5 text-center">
                  {day && <Day day={day} chosen={day === value} today={day === today} before={day < min} focused={day === focus} onChoose={() => onChoose(day)} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Day({ day, chosen, today, before, focused, onChoose }: { day: IsoDay; chosen: boolean; today: boolean; before: boolean; focused: boolean; onChoose: () => void }) {
  const look = chosen ? "bg-accent text-white font-semibold" : before ? "text-ink-muted/45 cursor-default" : "text-ink hover:bg-accent-soft";
  return (
    <button
      type="button"
      tabIndex={focused ? 0 : -1}
      aria-disabled={before || undefined}
      aria-pressed={chosen}
      aria-label={`${dayName(day)}${today ? ", today" : ""}`}
      onClick={() => !before && onChoose()}
      className={`relative mx-auto grid h-9 w-9 place-items-center rounded-full text-[14px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${look}`}
      data-day={day}
      data-chosen={chosen || undefined}
      data-today={today || undefined}
      data-disabled={before || undefined}
    >
      {Number(day.slice(8))}
      {today && <span aria-hidden className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${chosen ? "bg-white" : "bg-accent"}`} data-today-dot />}
    </button>
  );
}

function MonthButton({ dir, disabled = false, onClick }: { dir: -1 | 1; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous month" : "Next month"}
      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
      data-due-month-step={dir}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className={dir < 0 ? "rotate-90" : "-rotate-90"}>
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
