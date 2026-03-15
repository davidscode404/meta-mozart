"use client";

import { useTrack } from "@/hooks/useTrackStore";

export default function Playhead() {
  const { currentTime, duration, analysis } = useTrack();
  const dur = duration || analysis?.duration || 0;
  if (!dur) return null;

  const pct = Math.min(100, (currentTime / dur) * 100);

  return (
    <div
      className="absolute top-0 bottom-0 w-[2px] bg-[var(--foreground)] pointer-events-none"
      style={{
        left: `${pct}%`,
        zIndex: 20,
        willChange: "left",
        boxShadow: "0 0 8px rgba(248,250,252,0.4)",
      }}
      aria-hidden="true"
    >
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--foreground)]" />
    </div>
  );
}
