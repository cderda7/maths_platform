"use client";

import { useEffect, useSyncExternalStore } from "react";
import { BEAT_MS, BOARD_CHANNEL, BOARD_WINDOW, boardMoments, CUE_MS, boardOpen, cues, FALLBACK_FEATURES, placement, projectorScreen, SETTLE_MS, type BoardMessage, type ScreenLike } from "./boardPresence";
import { getClassroom, subscribeClassroom } from "./classroom-store";

/**
 * The board launched from the teacher's laptop (ticket 333): the channel, the timers and the windows. Module state, so a
 * client navigation (Project to Board controls) keeps what the laptop knows; a reload starts over. The pure rules are
 * `lib/boardPresence.ts`.
 *
 * The laptop side: `usePresence` reads whether a board is open ("unknown" for the first moments after listening, so the
 * pill never flashes the wrong word), the "press again" note, and the latest cue; `presentBoard` is the pill's press.
 * The board side: `useBoardBeat` beats while `/board` is open, in a window or the split's pane alike.
 */

export type Presence = { state: "unknown" | "open" | "closed"; again: boolean; cue: { id: number; at: number } | null };

const seen = new Map<string, number>();
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
let startedAt = 0;
let again = false;
let cue: Presence["cue"] = null;
let moments: string[] | undefined;
let snapshot: Presence = { state: "unknown", again: false, cue: null };
/** The board this page opened, if any: `focus()` on it brings it forward, which a board can rarely do for itself. */
let opened: Window | null = null;

function refresh() {
  const now = Date.now();
  const open = boardOpen(seen, now);
  if (open) {
    again = false;
    cue = null;
  }
  const state = open ? "open" : now - startedAt < SETTLE_MS ? "unknown" : "closed";
  if (state !== snapshot.state || again !== snapshot.again || cue !== snapshot.cue) {
    snapshot = { state, again, cue };
    for (const l of listeners) l();
  }
}

function listen() {
  if (channel || typeof window === "undefined" || !("BroadcastChannel" in window)) return;
  startedAt = Date.now();
  channel = new BroadcastChannel(BOARD_CHANNEL);
  channel.onmessage = (e: MessageEvent<BoardMessage>) => {
    if (e.data.type === "beat") seen.set(e.data.id, Date.now());
    else if (e.data.type === "gone") seen.delete(e.data.id);
    else return;
    refresh();
  };
  channel.postMessage({ type: "ask" } satisfies BoardMessage);
  // The clock only notices a board that stopped beating without saying so (a crash), and ends "unknown".
  setInterval(refresh, 500);
  // A moment the board is for, new since the last look in this page, pulses the pill while no board is open.
  moments = boardMoments(getClassroom());
  subscribeClassroom(() => {
    const next = boardMoments(getClassroom());
    if (cues(moments, next, boardOpen(seen, Date.now()))) {
      const id = (cue?.id ?? 0) + 1;
      cue = { id, at: Date.now() };
      refresh();
      setTimeout(() => {
        if (cue?.id !== id) return;
        cue = null;
        refresh();
      }, CUE_MS);
    }
    moments = next;
  });
  setTimeout(refresh, SETTLE_MS);
}

function subscribe(cb: () => void) {
  listen();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => snapshot;
const serverSnapshot: Presence = { state: "unknown", again: false, cue: null };

export function usePresence(): Presence {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

type ScreenDetails = { screens: (ScreenLike & object)[]; currentScreen: ScreenLike | null };
type WindowManagement = Window & { getScreenDetails?: () => Promise<ScreenDetails> };

async function permission(): Promise<PermissionState | "unsupported"> {
  try {
    return (await navigator.permissions.query({ name: "window-management" as PermissionName })).state;
  } catch {
    return "unsupported";
  }
}

function open(features: string): Window | null {
  const w = window.open("/board", BOARD_WINDOW, features);
  if (w) opened = w;
  return w;
}

/**
 * The pill's press. A board already up comes forward. Otherwise, where the browser can place windows (Chrome, Edge), the
 * board opens sized to the projector; the first press asks for that permission, and if the prompt outlasted the press the
 * pill says "Press again to present". Refused, unsupported or one screen: an ordinary window to drag across.
 */
export async function presentBoard(): Promise<void> {
  if (boardOpen(seen, Date.now())) {
    if (opened && !opened.closed) opened.focus();
    else channel?.postMessage({ type: "focus" } satisfies BoardMessage);
    return;
  }
  const w = window as WindowManagement;
  const state = w.getScreenDetails ? await permission() : "unsupported";
  if (w.getScreenDetails && state !== "denied") {
    try {
      const details = await w.getScreenDetails();
      const target = projectorScreen(details.screens, details.currentScreen);
      // The laptop and the board stay connected (ASSUMPTIONS.md): one screen found falls through to the ordinary window.
      if (target) {
        if (open(placement(target))) {
          again = false;
        } else {
          // The permission prompt used up the press: the next one places it.
          again = true;
        }
        refresh();
        return;
      }
    } catch {
      // Refused at the prompt: the ordinary window below.
    }
  }
  if (!open(FALLBACK_FEATURES)) again = true;
  refresh();
}

/** The board's side: beat while open, answer the laptop's ask, come forward when asked, and say so when closing. */
export function useBoardBeat() {
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const ch = new BroadcastChannel(BOARD_CHANNEL);
    const beat = () => ch.postMessage({ type: "beat", id } satisfies BoardMessage);
    ch.onmessage = (e: MessageEvent<BoardMessage>) => {
      if (e.data.type === "ask") beat();
      if (e.data.type === "focus") window.focus();
    };
    beat();
    const timer = setInterval(beat, BEAT_MS);
    const gone = () => ch.postMessage({ type: "gone", id } satisfies BoardMessage);
    window.addEventListener("pagehide", gone);
    return () => {
      gone();
      clearInterval(timer);
      window.removeEventListener("pagehide", gone);
      ch.close();
    };
  }, []);
}
