"use client";

import { Scrim } from "@/app/student/screens/PracticePrompt";

/** A second way out of a help card beside the scrim and Escape (tickets 229, 231): a small × in the card's top-right corner. The card must be `relative`. */
export function CardClose({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[20px] leading-none text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink" data-card-close>
      ×
    </button>
  );
}

/** "hint" pressed while the previous hint is still to be acted on (ticket 86's stall): one sentence and the one way on, the same chat the hint card's "Talk it through" opens. */
export function StallNotice({ onTalk, onClose }: { onTalk: () => void; onClose: () => void }) {
  return (
    <Scrim onDismiss={onClose}>
      <div className="relative w-[300px] rounded-3xl bg-paper p-7 shadow-lift" data-stall-notice>
        <CardClose onClose={onClose} />
        <p className="font-display text-[22px] leading-snug text-ink">Let&rsquo;s talk through the previous hint before giving you another.</p>
        <button type="button" onClick={onTalk} className="mt-5 inline-flex items-center rounded-full border border-accent-deep bg-paper px-6 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-accent-soft" data-stall-talk>
          Talk it through
        </button>
      </div>
    </Scrim>
  );
}

/** One row of the help menu: `onPick` absent greys it (a hint with none left, a worked example already seen). */
export interface HelpOption {
  key: string;
  title: string;
  onPick?: () => void;
}

/**
 * "I need help" on the pad: pick how much help. Bare pills, one or a few words each, no side notes: hint, a worked example
 * (or "see the example again" on a question's practice), chat. No video: it assumes the student has headphones (the user,
 * 2026-09-15, ticket 312). Hints come one per ask; while the latest hint is stalled the row stays live and the caller shows
 * the stall notice instead of a hint.
 */
export default function HelpMenu({ options, onClose }: { options: HelpOption[]; onClose: () => void }) {
  const pill = "block w-full rounded-full border border-accent-deep bg-paper px-6 py-2.5 text-center text-[15px] font-medium text-ink";
  return (
    <Scrim onDismiss={onClose}>
      <div className="relative w-fit min-w-[248px] rounded-3xl bg-paper p-7 shadow-lift" data-help-menu>
        <CardClose onClose={onClose} />
        <h2 className="font-display text-[28px] leading-tight text-ink">I&rsquo;d like a…</h2>
        {/* A fit-width grid: every pill is the width of the widest one, no wider. */}
        <ul className="mt-5 grid w-fit gap-2">
          {options.map((o) => (
            <li key={o.key}>
              <button type="button" onClick={o.onPick} disabled={!o.onPick} className={`${pill} whitespace-nowrap transition-colors enabled:hover:bg-accent-soft disabled:opacity-40`} data-help-option={o.key}>
                {o.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Scrim>
  );
}
