"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { generateWaveformData } from "@/lib/mock-data";

const STEM_COLORS: Record<string, string> = {
  bass: "var(--color-bass)",
  vocals: "var(--color-vocals)",
  drums: "var(--color-percussion)",
  other: "var(--color-harmony)",
  guitar: "var(--color-melody)",
  bass_other: "var(--color-bass)",
};

function toLabel(stemId: string): string {
  return stemId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

interface MixerRowProps {
  label: string;
  color: string;
  volume: number;
  muted: boolean;
  solo?: boolean;
  loadStatus?: "idle" | "loading" | "ready" | "error";
  progress: number;
  duration: number;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  onToggleSolo?: () => void;
  onSeek: (t: number) => void;
  waveformSeed: number;
}

const WAVEFORM_BARS = 200;

function MixerRow({
  label,
  color,
  volume,
  muted,
  solo,
  loadStatus,
  progress,
  duration,
  onVolumeChange,
  onToggleMute,
  onToggleSolo,
  onSeek,
  waveformSeed,
}: MixerRowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dataRef.current = generateWaveformData(WAVEFORM_BARS);
  }, [waveformSeed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const data = dataRef.current;
    const pct = duration > 0 ? progress / duration : 0;

    ctx.clearRect(0, 0, w, h);

    const barStep = w / data.length;
    for (let i = 0; i < data.length; i++) {
      const x = i * barStep;
      const barH = data[i] * h * 0.8;
      const y = (h - barH) / 2;
      const pos = i / data.length;

      ctx.globalAlpha = muted ? 0.15 : pos <= pct ? 1 : 0.3;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(1, barStep - 1), barH, 1);
      ctx.fill();
    }

    if (pct > 0 && pct <= 1) {
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "var(--foreground)";
      ctx.lineWidth = 1.5;
      const px = pct * w;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [color, duration, muted, progress]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  const handleSeek = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current || !duration) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(pct * duration);
    },
    [duration, onSeek]
  );

  const statusDot = loadStatus
    ? loadStatus === "ready"
      ? "bg-[var(--success)]"
      : loadStatus === "error"
        ? "bg-[var(--destructive)]"
        : "bg-[var(--warning)]"
    : null;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--border)]/30 last:border-b-0">
      {/* Label gutter */}
      <div className="w-24 md:w-28 flex-shrink-0 flex items-center gap-2 pl-3">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, opacity: muted ? 0.3 : 1 }}
        />
        <span className={`text-xs font-semibold truncate ${muted ? "text-[var(--foreground-muted)]" : "text-[var(--foreground)]"}`}>
          {label}
        </span>
        {statusDot && (
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
        )}
      </div>

      {/* Waveform area */}
      <div
        ref={timelineRef}
        className="flex-1 relative cursor-crosshair h-14 rounded-md overflow-hidden bg-[var(--bg-deep)]/40"
        onClick={handleSeek}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Volume slider */}
      <div className="flex-shrink-0 flex items-center gap-1.5 w-28">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="w-full h-1.5 appearance-none bg-[var(--surface)] rounded-full cursor-pointer accent-[var(--secondary)]"
          aria-label={`${label} volume`}
        />
        <span className="mono-value text-[10px] text-[var(--foreground-muted)] w-9 text-right tabular-nums">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Mute button */}
      <button
        onClick={onToggleMute}
        className={`touch-target w-9 h-9 flex items-center justify-center rounded-md text-[10px] font-bold transition-colors duration-150 ${
          muted
            ? "bg-[var(--destructive)]/20 text-[var(--destructive)] border border-[var(--destructive)]/40"
            : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]"
        }`}
        aria-label={`${muted ? "Unmute" : "Mute"} ${label}`}
      >
        {muted ? <VolumeX className="w-3.5 h-3.5" /> : "M"}
      </button>

      {/* Solo button */}
      {onToggleSolo ? (
        <button
          onClick={onToggleSolo}
          className={`touch-target w-9 h-9 flex items-center justify-center rounded-md text-[10px] font-bold transition-colors duration-150 ${
            solo
              ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40"
              : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]"
          }`}
          aria-label={`${solo ? "Disable solo" : "Solo"} ${label}`}
        >
          S
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  );
}

export default function StemMixer() {
  const {
    stemUrls,
    stemMix,
    stemLoadStatus,
    mainMix,
    currentTime,
    duration,
  } = useTrack();
  const {
    setStemVolume,
    toggleStemMute,
    toggleStemSolo,
    setMainVolume,
    toggleMainMute,
    setCurrentTime,
  } = useTrackActions();
  const reducedMotion = useReducedMotion();

  const stemIds = useMemo(() => Object.keys(stemUrls ?? {}).sort(), [stemUrls]);

  const handleMainVolume = useCallback(
    (v: number) => setMainVolume(v),
    [setMainVolume]
  );

  const handleStemVolume = useCallback(
    (id: string, v: number) => setStemVolume(id, v),
    [setStemVolume]
  );

  const handleSeek = useCallback(
    (t: number) => setCurrentTime(t),
    [setCurrentTime]
  );

  if (stemIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--foreground-muted)]">
        Upload and separate a track to see the mixer.
      </div>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full bg-[var(--bg-base)] rounded-lg border border-[var(--border)] overflow-hidden"
      role="region"
      aria-label="Stem mixer - multi-track audio controls"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border)]/50 flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.5px] font-medium text-[var(--foreground-muted)]">
          Multi-Track Mixer
        </h3>
        <span className="text-[10px] text-[var(--foreground-muted)] font-mono">
          {stemIds.length} stem{stemIds.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Original track row */}
      <MixerRow
        label="Original"
        color="var(--secondary)"
        volume={mainMix.volume}
        muted={mainMix.muted}
        progress={currentTime}
        duration={duration}
        onVolumeChange={handleMainVolume}
        onToggleMute={toggleMainMute}
        onSeek={handleSeek}
        waveformSeed={0}
      />

      {/* Separated stem rows */}
      {stemIds.map((id, idx) => {
        const mix = stemMix[id] ?? { volume: 1, muted: false, solo: false };
        const status = stemLoadStatus[id] ?? "loading";
        const color = STEM_COLORS[id] ?? "var(--accent)";

        return (
          <MixerRow
            key={id}
            label={toLabel(id)}
            color={color}
            volume={mix.volume}
            muted={mix.muted}
            solo={mix.solo}
            loadStatus={status}
            progress={currentTime}
            duration={duration}
            onVolumeChange={(v) => handleStemVolume(id, v)}
            onToggleMute={() => toggleStemMute(id)}
            onToggleSolo={() => toggleStemSolo(id)}
            onSeek={handleSeek}
            waveformSeed={idx + 1}
          />
        );
      })}
    </motion.div>
  );
}
