"use client";

import { memo, useMemo, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrack } from "@/hooks/useTrackStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FEATURE_LANES } from "@/lib/constants";
import {
  generateTempoTicks,
  generateMelodyPath,
  generateBassRibbon,
} from "@/lib/mock-data";
import { LaneHeader } from "./TrackCanvas";
import Playhead from "./Playhead";
import type { FeatureType } from "@/lib/types";

/* ── Individual lane renderers ── */

const TempoLane = memo(function TempoLane({ duration, bpm }: { duration: number; bpm: number }) {
  const ticks = useMemo(() => generateTempoTicks(duration, bpm), [duration, bpm]);
  return (
    <div className="relative w-full h-full" aria-label="Tempo pulse lane">
      {ticks.map((t, i) => {
        const left = (t / duration) * 100;
        const isDownbeat = i % 4 === 0;
        return (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${left}%`,
              width: isDownbeat ? 6 : 4,
              height: isDownbeat ? 6 : 4,
              backgroundColor: "var(--color-tempo)",
              opacity: isDownbeat ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
});

const MelodyLane = memo(function MelodyLane({ duration }: { duration: number }) {
  const points = useMemo(() => generateMelodyPath(duration, 120), [duration]);
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => {
        const x = (p.time / duration) * 100;
        const y = (1 - p.pitch) * 100;
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");
  }, [points, duration]);

  return (
    <div className="relative w-full h-full" aria-label="Melody trace lane">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke="var(--color-melody)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
});

const BassLane = memo(function BassLane({ duration }: { duration: number }) {
  const points = useMemo(() => generateBassRibbon(duration, 100), [duration]);
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    const top = points.map((p, i) => {
      const x = (p.time / duration) * 100;
      const y = 50 - p.amplitude * 40;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(" ");
    const bottom = points.slice().reverse().map((p) => {
      const x = (p.time / duration) * 100;
      const y = 50 + p.amplitude * 40;
      return `L ${x} ${y}`;
    }).join(" ");
    return `${top} ${bottom} Z`;
  }, [points, duration]);

  return (
    <div className="relative w-full h-full" aria-label="Bass ribbon lane">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={pathD} fill="var(--color-bass)" fillOpacity="0.3" stroke="var(--color-bass)" strokeWidth="1" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
});

const HarmonyLane = memo(function HarmonyLane() {
  return (
    <div className="relative w-full h-full" aria-label="Harmony field lane">
      <div className="absolute inset-0 rounded" style={{
        background: "linear-gradient(90deg, var(--color-harmony) 0%, transparent 5%, var(--color-harmony) 10%, transparent 15%, var(--color-harmony) 20%, var(--color-harmony) 80%, transparent 85%, var(--color-harmony) 90%, transparent 100%)",
        opacity: 0.25,
      }} />
    </div>
  );
});

const PercussionLane = memo(function PercussionLane({ duration, bpm }: { duration: number; bpm: number }) {
  const ticks = useMemo(() => {
    const t: number[] = [];
    const interval = 60 / bpm / 2;
    for (let time = 0; time < duration; time += interval) t.push(time);
    return t;
  }, [duration, bpm]);

  return (
    <div className="relative w-full h-full" aria-label="Percussion ticks lane">
      {ticks.map((t, i) => {
        const left = (t / duration) * 100;
        const isHit = i % 2 === 0;
        return (
          <div key={i} className="absolute top-1 bottom-1" style={{ left: `${left}%`, width: 1, backgroundColor: "var(--color-percussion)", opacity: isHit ? 0.8 : 0.3 }} />
        );
      })}
    </div>
  );
});

const VocalsLane = memo(function VocalsLane({ duration }: { duration: number }) {
  const points = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = (i / 200) * 100;
      const t = (i / 200) * duration;
      const y = 50 + Math.sin(t * 2) * 20 + Math.sin(t * 5) * 8;
      pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    return pts.join(" ");
  }, [duration]);

  return (
    <div className="relative w-full h-full" aria-label="Vocals ribbon lane">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={points} fill="none" stroke="var(--color-vocals)" strokeWidth="2" strokeLinecap="round" opacity="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
});

const StructureLane = memo(function StructureLane({ duration, timeSignature, bpm }: { duration: number; timeSignature: string; bpm: number }) {
  const beatsPerBar = parseInt(timeSignature.split("/")[0]) || 4;
  const barDuration = (60 / bpm) * beatsPerBar;
  const bars = Math.ceil(duration / barDuration);

  return (
    <div className="relative w-full h-full" aria-label="Structure / meter lane">
      {Array.from({ length: bars }, (_, i) => {
        const left = ((i * barDuration) / duration) * 100;
        const width = (barDuration / duration) * 100;
        return (
          <div key={i} className="absolute top-0 h-full border-l border-[var(--color-structure)]/30 flex items-center" style={{ left: `${left}%`, width: `${width}%` }}>
            {i % 4 === 0 && <span className="pl-1 text-[8px] text-[var(--color-structure)] opacity-50 font-mono">{i + 1}</span>}
          </div>
        );
      })}
    </div>
  );
});

/* ── Lane map ── */

const LANE_MAP: Record<FeatureType, React.FC<{ duration: number; bpm: number; timeSignature: string }>> = {
  tempo: ({ duration, bpm }) => <TempoLane duration={duration} bpm={bpm} />,
  melody: ({ duration }) => <MelodyLane duration={duration} />,
  bass: ({ duration }) => <BassLane duration={duration} />,
  harmony: () => <HarmonyLane />,
  percussion: ({ duration, bpm }) => <PercussionLane duration={duration} bpm={bpm} />,
  vocals: ({ duration }) => <VocalsLane duration={duration} />,
  structure: ({ duration, timeSignature, bpm }) => <StructureLane duration={duration} timeSignature={timeSignature} bpm={bpm} />,
  extension: () => null,
};

const LANE_HEIGHT = "h-10";

/* ── Exported component ── */

interface FeatureLanesProps {
  timelineRef: RefObject<HTMLDivElement | null>;
  onSeek: (e: React.MouseEvent) => void;
}

export default function FeatureLanes({ timelineRef, onSeek }: FeatureLanesProps) {
  const { analysis, activeLayers, duration } = useTrack();
  const reducedMotion = useReducedMotion();

  if (!analysis) return null;

  const { tempo, timeSignature } = analysis;
  const trackDuration = duration || analysis.duration;

  return (
    <AnimatePresence mode="popLayout">
      {FEATURE_LANES.filter((lane) => activeLayers.has(lane.type)).map((lane) => {
        const Lane = LANE_MAP[lane.type];
        if (!Lane) return null;
        return (
          <motion.div
            key={lane.type}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex border-t border-[var(--border)]/30"
          >
            <LaneHeader label={lane.label} colorVar={lane.colorVar} />
            <div
              className={`flex-1 relative ${LANE_HEIGHT} cursor-crosshair`}
              onClick={onSeek}
            >
              <Lane duration={trackDuration} bpm={tempo} timeSignature={timeSignature} />
              <Playhead />
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
