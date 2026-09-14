"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Stage } from "@/data/types";
import { INITIAL_SESSION, hydrateSession, sessionAt, sessionReducer, type RunKindParam, type SessionAction, type StudentSession } from "./session";
import { activeAssignment } from "./assignment";
import { adoptClassroom, getClassroom, setClassroom } from "./classroom-store";
import { INITIAL_CLASSROOM, pathwayOf, type ClassroomState } from "./classroom";

/**
 * The demo session store: one student session, shared between browser tabs on the same machine.
 * In-memory in each tab, mirrored to localStorage (so a tab opened late catches up and a reload
 * doesn't lose the run) and announced over a BroadcastChannel (so the teacher tab moves the moment
 * the student does). No backend. See DECISION_LOG.md.
 */
const KEY = "edexia-maths-demo/session/v1";
const CHANNEL = "edexia-maths-demo";
/** The classroom and the session moved as one change (`setLesson`, ticket 263): its own key and channel. */
const LESSON_KEY = "edexia-maths-demo/lesson/v1";
const LESSON_CHANNEL = "edexia-maths-demo/lesson";
let lessonChannel: BroadcastChannel | null = null;

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
    lessonChannel = new BroadcastChannel(LESSON_CHANNEL);
    lessonChannel.onmessage = (e: MessageEvent<Lesson>) => adoptLesson(e.data);
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      current = load();
      emit();
    }
    if (e.key === LESSON_KEY && e.newValue) {
      try {
        adoptLesson(JSON.parse(e.newValue));
      } catch {
        /* unreadable: the two keys' own events follow */
      }
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

export function setSession(next: StudentSession | null, announce = true) {
  wire();
  current = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: stay in-memory */
  }
  if (announce) channel?.postMessage(next);
  emit();
}

interface Lesson {
  classroom: ClassroomState;
  session: StudentSession;
}

/** Both halves of a lesson from another tab, taken in one task so no screen renders the new classroom against the old session. */
function adoptLesson(l: Lesson) {
  current = hydrateSession(l.session);
  adoptClassroom(l.classroom);
  emit();
}

/**
 * The classroom and the session moved as one change (ticket 263): a presenter jump or Reset demo. Announced separately,
 * another tab could render the new classroom against the old session for a moment, and the iPad's clockwork acts on
 * what it renders (class review ended while Sam is still frozen: release him to his report, over the homework the jump
 * gave him). So both go out in one message and one storage write, read in one task by every other tab; the two stores'
 * own keys are written after it, for a tab opened later.
 */
export function setLesson(next: Lesson) {
  wire();
  try {
    localStorage.setItem(LESSON_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the channel still carries it */
  }
  lessonChannel?.postMessage(next);
  setClassroom(next.classroom, false);
  setSession(next.session, false);
}

/**
 * Dispatches an action under the pathway in force, stamping the time on the transitions that
 * are worth dating.
 */
export function dispatch(action: SessionAction) {
  const stamped: SessionAction =
    action.type === "hand-in" || action.type === "hand-in/confirm" || (action.type === "goto" && action.stage === "feedback") || action.type === "rework/done" ? { ...action, at: Date.now() } : action;
  setSession(sessionReducer(getSnapshot() ?? INITIAL_SESSION, stamped, { pathway: pathwayOf(getClassroom()), goal: activeAssignment(getClassroom()).goal }));
}

/** Back to the start in every tab: a fresh session and an empty classroom, so deep-linked tabs move too. */
export function resetSession() {
  setLesson({ classroom: INITIAL_CLASSROOM, session: INITIAL_SESSION });
}

const serverSnapshot = () => null;

/**
 * A live, read-only view of the session for a surface that doesn't own it and mustn't lag it
 * (the smartboard). The teacher's views read in batches instead (`useBatchedSession`).
 */
export function useLiveSession(): StudentSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}

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

/**
 * Lands the batch now rather than at the next interval: for a discrete move of the whole lesson made in this tab (the
 * teacher's presenter jumps, ticket 263), so the teacher's views never read the new classroom against the old session.
 */
export function refreshBatchedSession() {
  if (batchListeners.size > 0) batchTick();
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
/**
 * A clock that ticks every animation frame, for the few things that must move smoothly and stay in step
 * with a number beside them (the group intro's bar and time left, ticket 232). Runs only while `active`
 * and some component is subscribed; 0 on the server and before the first frame.
 */
let frameClock = 0;
const frameListeners = new Set<() => void>();
let frameId: number | null = null;
function frameTick() {
  frameClock = Date.now();
  for (const l of frameListeners) l();
  frameId = frameListeners.size > 0 ? requestAnimationFrame(frameTick) : null;
}
function subscribeFrame(cb: () => void) {
  frameListeners.add(cb);
  if (frameId === null) frameId = requestAnimationFrame(frameTick);
  return () => {
    frameListeners.delete(cb);
    if (frameListeners.size === 0 && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
const noSubscribe = () => () => {};
export function useFrameNow(active: boolean): number {
  return useSyncExternalStore(active ? subscribeFrame : noSubscribe, () => (active ? frameClock : 0), () => 0);
}

export function useNow(): number {
  return useSyncExternalStore(subscribeClock, () => clock, () => 0);
}
