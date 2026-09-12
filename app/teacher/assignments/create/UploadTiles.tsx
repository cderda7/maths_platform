"use client";

import type { MessageItem, PendingItem } from "@/lib/upload";

/**
 * The two tiles a dropped file shows on the create screen while it is not yet questions
 * (ticket 171). `PendingTile` holds the file's place in the grid while the route reads it: the
 * next label, three shimmer lines the shape of a question, and the file's name; each draft the
 * route streams is inserted before it, so it is always the last of its file's group and goes
 * when the read ends. `MessageTile` is what the marker becomes when the read fails or finds
 * nothing: the words from `failureMessage`, "Try again" when trying could help, and Dismiss.
 */
export function PendingTile({ index, item }: { index: number; item: PendingItem }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-standout-line bg-paper p-5" data-tile={index + 1} data-pending aria-busy="true" aria-label={`Reading ${item.name}`}>
      <span className="font-display text-[20px] text-ink-muted" data-label>
        Q{index + 1}
      </span>
      <div className="shimmer mt-3.5 h-3 w-4/5 rounded" />
      <div className="shimmer mt-2 h-3 w-3/5 rounded" />
      <div className="shimmer mt-4 h-6 w-2/3 rounded" />
      <p className="mt-auto truncate text-[12px] text-ink-muted" data-pending-name>
        Reading {item.name}…
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- a data URL the browser drew; next/image has nothing to optimise */}
      {item.thumb && <img src={item.thumb} alt="" className="absolute bottom-3 right-3 h-10 w-10 rounded-md border border-line object-cover" data-thumb />}
    </div>
  );
}

export function MessageTile({ index, item, onRetry, onDismiss }: { index: number; item: MessageItem; onRetry: () => void; onDismiss: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-line-strong bg-cream-deep/60 p-5" data-tile={index + 1} data-message role="status">
      <span className="font-display text-[20px] text-ink-muted" data-label>
        Q{index + 1}
      </span>
      <p className="mt-2.5 text-[13.5px] leading-snug text-ink-soft" data-message-text>
        {item.message}
      </p>
      <div className="mt-auto flex items-center gap-3 text-[13px] font-medium">
        {item.retry && (
          <button type="button" onClick={onRetry} className="text-accent-deep hover:underline" data-retry>
            Try again
          </button>
        )}
        <button type="button" onClick={onDismiss} className="text-ink-muted hover:text-ink hover:underline" data-dismiss>
          Dismiss
        </button>
      </div>
    </div>
  );
}
