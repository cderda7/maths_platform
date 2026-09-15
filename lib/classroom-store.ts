"use client";

import { useSyncExternalStore } from "react";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, type ClassroomAction, type ClassroomState } from "./classroom";
import { activeAssignment, type ActiveAssignment } from "./assignment";
import type { ChainAction } from "./diagnosticChain";
import { openHomeworks } from "./homeworks";

/**
 * The classroom store: teacher-owned state shared between every tab on this machine, same shape
 * as the student session store (localStorage snapshot + BroadcastChannel), its own key so the
 * two never clobber each other. Read live on both sides; the chip and the student flow need the
 * pathway the moment it changes.
 */
const KEY = "edexia-maths-demo/classroom/v1";
const CHANNEL = "edexia-maths-demo/classroom";

let current: ClassroomState | undefined;
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
let wired = false;

function load(): ClassroomState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrateClassroom(JSON.parse(raw)) : INITIAL_CLASSROOM;
  } catch {
    return INITIAL_CLASSROOM;
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
    channel.onmessage = (e: MessageEvent<ClassroomState>) => {
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

export function getClassroom(): ClassroomState {
  if (current === undefined) current = typeof window === "undefined" ? INITIAL_CLASSROOM : load();
  return current;
}

export function subscribeClassroom(cb: () => void): () => void {
  wire();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * `announce` false leaves the other tabs to hear of it some other way: the demo's one-change move of the classroom and the
 * session together (`setLesson` in `lib/store.ts`, ticket 263). It is still written, for a tab opened later.
 */
export function setClassroom(written: ClassroomState, announce = true) {
  wire();
  // A homework whose last lesson just ended opens with this change (ticket 292), stamped the same in whichever tab writes it.
  const next = openHomeworks(written);
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: stay in-memory */
  }
  if (announce) channel?.postMessage(next);
  emit();
}

/** Another tab's classroom taken as it is, nothing written or announced (`setLesson`, ticket 263). */
export function adoptClassroom(next: unknown) {
  wire();
  current = openHomeworks(migrateClassroom(next));
  emit();
}

const isChainAction = (a: ClassroomAction): a is ChainAction => a.type.startsWith("diagnostic/");

export function dispatchClassroom(action: ClassroomAction) {
  // Every diagnostic chain action carries its moment (ticket 241): a step's close is derived from them.
  const stamped: ClassroomAction =
    action.type === "assignment/create" || action.type === "advance/start" || action.type === "wc/project" || action.type === "group/check" || action.type === "group/scripted" || isChainAction(action)
      ? { ...action, at: action.at ?? Date.now() }
      : action;
  setClassroom(classroomReducer(getClassroom(), stamped));
}

const serverSnapshot = () => INITIAL_CLASSROOM;

export function useClassroom(): ClassroomState {
  return useSyncExternalStore(subscribeClassroom, getClassroom, serverSnapshot);
}

/** The assignment in force (created or fixture), live in every tab. */
export function useAssignment(): ActiveAssignment {
  return activeAssignment(useClassroom());
}
