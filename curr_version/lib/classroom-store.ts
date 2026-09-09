"use client";

import { useSyncExternalStore } from "react";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomAction, type ClassroomState } from "./classroom";
import { activeAssignment, type ActiveAssignment } from "./assignment";

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
    return raw ? (JSON.parse(raw) as ClassroomState) : INITIAL_CLASSROOM;
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

export function setClassroom(next: ClassroomState) {
  wire();
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: stay in-memory */
  }
  channel?.postMessage(next);
  emit();
}

export function dispatchClassroom(action: ClassroomAction) {
  const stamped: ClassroomAction = action.type === "assignment/create" ? { ...action, at: action.at ?? Date.now() } : action;
  setClassroom(classroomReducer(getClassroom(), stamped));
}

export function resetClassroom() {
  setClassroom(INITIAL_CLASSROOM);
}

const serverSnapshot = () => INITIAL_CLASSROOM;

export function useClassroom(): ClassroomState {
  return useSyncExternalStore(subscribeClassroom, getClassroom, serverSnapshot);
}

/** The assignment in force (created or fixture), live in every tab. */
export function useAssignment(): ActiveAssignment {
  return activeAssignment(useClassroom());
}
