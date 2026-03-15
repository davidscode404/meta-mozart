"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FEATURE_LANES } from "@/lib/constants";
import Waveform from "./Waveform";
import Playhead from "./Playhead";
import SectionLabels from "./SectionLabels";
import FeatureLanes from "./FeatureLanes";
import GhostExtension from "./GhostExtension";

export default function TrackCanvas() {
  const { analysis, uploadState, duration, activeLayers } = useTrack();
  const { setCurrentTime } = useTrackActions();
  const reducedMotion = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current || !duration) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrentTime(pct * duration);
    },
    [duration, setCurrentTime]
  );

  if (uploadState !== "complete" || !analysis) return null;

  const activeLaneConfigs = FEATURE_LANES.filter((l) => activeLayers.has(l.type));

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      id="track-canvas"
      role="region"
      aria-label="Track canvas — DAW-style multi-lane timeline"
      className="relative w-full bg-[var(--bg-base)] rounded-lg border border-[var(--border)] overflow-hidden select-none"
    >
      {/* Section labels row */}
      <div className="flex">
        <div className="w-24 md:w-32 flex-shrink-0" />
        <div className="flex-1 relative">
          <SectionLabels />
        </div>
      </div>

      {/* ── Waveform lane (always visible) ── */}
      <div className="flex border-t border-[var(--border)]/50">
        <LaneHeader label="Waveform" colorVar="--secondary" />
        <div
          ref={timelineRef}
          className="flex-1 relative cursor-crosshair"
          onClick={handleSeek}
        >
          <Waveform />
          <Playhead />
          <GhostExtension />
        </div>
      </div>

      {/* ── Feature lanes ── */}
      <FeatureLanes timelineRef={timelineRef} onSeek={handleSeek} />

      {/* Time ruler at bottom */}
      <TimeRuler duration={duration} />
    </motion.div>
  );
}

function LaneHeader({ label, colorVar }: { label: string; colorVar: string }) {
  return (
    <div className="w-24 md:w-32 flex-shrink-0 flex items-center gap-2 px-3 border-r border-[var(--border)]/50 bg-[var(--bg-deep)]/60">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: `var(${colorVar})` }}
      />
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--foreground-muted)] truncate">
        {label}
      </span>
    </div>
  );
}

function TimeRuler({ duration }: { duration: number }) {
  if (!duration || !isFinite(duration)) return null;

  const interval = duration <= 30 ? 5 : duration <= 120 ? 10 : 30;
  const marks: number[] = [];
  for (let t = 0; t <= duration; t += interval) marks.push(t);

  return (
    <div className="flex border-t border-[var(--border)]/50">
      <div className="w-24 md:w-32 flex-shrink-0 bg-[var(--bg-deep)]/60" />
      <div className="flex-1 relative h-5">
        {marks.map((t) => (
          <span
            key={t}
            className="absolute top-0 text-[8px] font-mono text-[var(--foreground-muted)]/50 -translate-x-1/2"
            style={{ left: `${(t / duration) * 100}%` }}
          >
            {formatTime(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export { LaneHeader };
