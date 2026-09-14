/**
 * Escape closes what was opened last (ticket 247). Everything that can be closed (a popup, a flyout, an expanded view)
 * puts a layer on one stack while it is open; a press of Escape closes the top layer only, exactly as its own close
 * would, and a second press closes the next. A layer with no close is a wall: Escape does nothing at all while it is
 * open (the teacher's quick check on the student's iPad, which must be answered). A wall is a modal over the whole
 * screen, so a layer opened after it (a notice arriving) still sits under it on screen and must not close unseen.
 *
 * The stack is plain data so the rules are testable without a DOM; `components/useEscape.ts` binds it to React and
 * to the window's keydown.
 */

export type EscapeLayer = {
  /** What Escape does to this layer; null is a wall. */
  close: (() => void) | null;
  /** Where the keyboard focus goes after Escape closes it: the element that opened it, if it is still on the page. */
  returnFocus: () => void;
};

export type EscapeStack = {
  /** Put a layer on top; the function returned takes it off again, wherever it is by then. */
  push: (layer: EscapeLayer) => () => void;
  /** The layer Escape would act on, if any. */
  top: () => EscapeLayer | undefined;
  /** One press of Escape: true when a layer took it (the top one closed, or a wall held it), so the key goes no further. */
  escape: () => boolean;
};

export function createEscapeStack(): EscapeStack {
  const layers: EscapeLayer[] = [];
  const top = () => layers[layers.length - 1];
  return {
    push(layer) {
      layers.push(layer);
      return () => {
        const i = layers.lastIndexOf(layer);
        if (i >= 0) layers.splice(i, 1);
      };
    },
    top,
    escape() {
      const layer = top();
      if (!layer) return false;
      if (layers.some((l) => l.close === null)) return true;
      layer.close!();
      layer.returnFocus();
      return true;
    },
  };
}

/** The keydown Escape acts on: not one a control already used (a drag cancelled, a Fix box cleared), nor one ending an IME composition. */
export const isEscapePress = (e: Pick<KeyboardEvent, "key" | "defaultPrevented" | "isComposing">) => e.key === "Escape" && !e.defaultPrevented && !e.isComposing;
