"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DEVICE_H, DEVICE_W, STAGE_MARGIN as MARGIN } from "@/lib/ipad";

/**
 * Renders children on a landscape iPad screen (1180 × 820 logical points) inside a bezel,
 * centred in the desktop viewport. When the viewport is narrower than the device the whole thing
 * scales down uniformly, so the layout inside is always designed at true iPad size.
 */
export default function IpadStage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () =>
      setScale(Math.min(1, (window.innerWidth - MARGIN) / DEVICE_W, (window.innerHeight - MARGIN) / DEVICE_H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="min-h-screen grid place-items-center hero-glow">
      <div style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}>
        <div className="ipad-bezel origin-top-left" style={{ transform: `scale(${scale})`, width: DEVICE_W, height: DEVICE_H }}>
          <div className="ipad-screen">{children}</div>
        </div>
      </div>
    </div>
  );
}
