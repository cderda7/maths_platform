"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Stage } from "@/data/types";
import { INITIAL_SESSION, hydrateSession, sessionAt, sessionReducer, type RunKindParam, type SessionAction, type StudentSession } from "./session";
import { pathwayOf } from "./classroom";
import { getClassroom, resetClassroom } from "./classroom-store";

/**
 * The demo session store: one student session, shared between browser tabs on the same machine.
 * In-memory in each tab, mirrored to localStorage (so a tab opened late catches up and a reload
 * doesn't lose the run) and announced over a BroadcastChannel (so the teacher tab moves the moment
 * the student does). No backend. See DECISION_LOG.md.
 */
const KEY = "edexia-maths-demo/session/v1";
const CHANNEL = "edexia-maths-demo";

let current: StudentSession | null | undefined; // undefined = not read yet
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
let wired = false;

function load(): StudentSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    // Fields added since the snapshot was written fall back to their initial value, nested slices too.
    return raw ? hydrateSession(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function emit() {
  for (const l of listeners) l();
}

function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e: MessageEvent<StudentSession | null>) => {
      current = e.data;
      emit();
    };
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      current = load();
      emit();
    }
  });
}

export function getSnapshot(): StudentSession | null {
  if (current === undefined) current = typeof window === "undefined" ? null : load();
  return current;
}

export function subscribe(cb: () => void): () => void {
  wire();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setSession(next: StudentSession | null) {
  wire();
  current = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: stay in-memory */
  }
  channel?.postMessage(next);
  emit();
}

/**
 * Dispatches an action under the pathway in force, stamping the time on the transitions that
 * are worth dating.
 */
export function dispatch(action: SessionAction) {
  const stamped: SessionAction =
    action.type === "hand-in" || (action.type === "goto" && action.stage === "feedback") || action.type === "rework/done" ? { ...action, at: Date.now() } : action;
  setSession(sessionReducer(getSnapshot() ?? INITIAL_SESSION, stamped, { pathway: pathwayOf(getClassroom()) }));
}

/** Back to the start in every tab: a fresh session and an empty classroom, so deep-linked tabs move too. */
export function resetSession() {
  resetClassroom();
  setSession(INITIAL_SESSION);
}

const serverSnapshot = () => null;

/**
 * The student tab. An explicit `?stage=` deep link wins over whatever is stored; otherwise the
 * stored run continues. With nothing stored the session starts fresh.
 */
export function useStudentSession(initStage: Stage, explicit: boolean, run: RunKindParam = "weak"): StudentSession {
  const snap = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  useEffect(() => {
    if (explicit) setSession(sessionAt(initStage, run));
    else if (getSnapshot() === null) setSession(INITIAL_SESSION);
    // Runs once per mount by design: the URL is read on arrival, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return snap ?? sessionAt(initStage, run);
}

/**
 * The teacher tab: the same session, but refreshed in batches every `everyMs` rather than on
 * every stroke, plus when the batch landed. Implemented as a second external store whose
 * subscribers are only notified on the interval, so there is no setState-in-effect.
 */
interface Batch {
  session: StudentSession | null;
  updatedAt: number | null;
}
let batch: Batch = { session: null, updatedAt: null };
const batchListeners = new Set<() => void>();
let batchTimer: ReturnType<typeof setInterval> | null = null;
let batchUnsub: (() => void) | null = null;
const emptyBatch: Batch = { session: null, updatedAt: null };

function batchTick() {
  batch = { session: getSnapshot(), updatedAt: Date.now() };
  for (const l of batchListeners) l();
}

const batchSubscribers = new Map<number, (cb: () => void) => () => void>();

/** One stable subscribe function per interval, so React doesn't resubscribe on every render. */
function subscribeBatch(everyMs: number) {
  const cached = batchSubscribers.get(everyMs);
  if (cached) return cached;
  const fn = (cb: () => void) => {
    batchListeners.add(cb);
    if (batchListeners.size === 1) {
      batchUnsub = subscribe(() => {});
      batchTimer = setInterval(batchTick, everyMs);
      queueMicrotask(batchTick);
    }
    return () => {
      batchListeners.delete(cb);
      if (batchListeners.size === 0) {
        if (batchTimer) clearInterval(batchTimer);
        batchTimer = null;
        batchUnsub?.();
        batchUnsub = null;
      }
    };
  };
  batchSubscribers.set(everyMs, fn);
  return fn;
}

export function useBatchedSession(everyMs = 3000): Batch & { everyMs: number } {
  const b = useSyncExternalStore(subscribeBatch(everyMs), () => batch, () => emptyBatch);
  return { ...b, everyMs };
}

/** A clock that ticks every second, for "updated 4s ago" labels. 0 on the server and before the first tick. */
let clock = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;
function clockTick() {
  clock = Date.now();
  for (const l of clockListeners) l();
}
function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (clockListeners.size === 1) {
    clockTimer = setInterval(clockTick, 1000);
    queueMicrotask(clockTick);
  }
  return () => {
    clockListeners.delete(cb);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}
export function useNow(): number {
  return useSyncExternalStore(subscribeClock, () => clock, () => 0);
}
