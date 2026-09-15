/**
 * The demo's placeholder on a teacher homework cell (ticket 324): pressing a cell on the teacher's Classroom shows this
 * message over it for a moment, standing in for the homework insight view scoped in FUTURE_FEATURES ("Homework insight").
 * A real control with placeholder content (DECISION_LOG, ticket 324): the press, focus and keyboard are the product's; only
 * what it opens is missing.
 */
export const HW_INSIGHT_MESSAGE = "HW insight scoped in FUTURE_FEATURES";

/** How long the message stays before the cell reads normally again. */
export const HW_INSIGHT_MS = 2500;

/**
 * A one-at-a-time flash: `press(id)` shows `id` and (re)starts the timer, so pressing the same cell again keeps the message
 * a full `ms` from the latest press and pressing another cell moves it there; `dispose()` clears the timer (unmount).
 * The timer lives here, set from the press handler, so the component never sets state from an effect.
 */
export function flasher<T>(show: (shown: T | null) => void, ms: number = HW_INSIGHT_MS) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    press(id: T) {
      clearTimeout(timer);
      show(id);
      timer = setTimeout(() => {
        timer = undefined;
        show(null);
      }, ms);
    },
    dispose() {
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
