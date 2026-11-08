"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

/**
 * One "active" state for mouse hover AND finger touch.
 * - Mouse: active while the cursor is over the element.
 * - Touch/pen: active on touch, and stays active briefly after the
 *   finger lifts, so the glow is actually visible on a phone.
 */
export function usePointerActive(touchHoldMs = 700) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onPointerEnter = useCallback(() => {
    clear();
    setActive(true);
  }, [clear]);

  const onPointerLeave = useCallback(
    (e: PointerEvent) => {
      clear();
      if (e.pointerType === "mouse") {
        setActive(false); // instant for mouse
      } else {
        timer.current = setTimeout(() => setActive(false), touchHoldMs);
      }
    },
    [clear, touchHoldMs]
  );

  useEffect(() => clear, [clear]); // cleanup on unmount

  return {
    active,
    // spread this onto any element
    bind: {
      onPointerEnter,
      onPointerLeave,
      onPointerCancel: onPointerLeave,
      "data-active": String(active),
    },
  };
}