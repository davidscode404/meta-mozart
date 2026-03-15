"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Hand,
  Speaker,
  Mic,
  Music,
  Drum,
  AudioWaveform,
  Layers,
  SlidersHorizontal,
  Play,
  Pause,
} from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import HandTracker, { type HandGesture } from "./HandTracker";

interface StemControl {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  presence: number;
  volume: number;
  muted: boolean;
  solo: boolean;
  gestureHint: string;
}

const STEM_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; gestureHint: string }
> = {
  bass: {
    label: "Bass",
    icon: <Speaker className="w-6 h-6" />,
    color: "var(--color-bass)",
    gestureHint: "Pinch -> filter",
  },
  vocals: {
    label: "Vocals",
    icon: <Mic className="w-6 h-6" />,
    color: "var(--color-vocals)",
    gestureHint: "Raise/Lower -> gain",
  },
  drums: {
    label: "Drums",
    icon: <Drum className="w-6 h-6" />,
    color: "var(--color-percussion)",
    gestureHint: "Fist -> mute",
  },
  other: {
    label: "Other",
    icon: <Music className="w-6 h-6" />,
    color: "var(--color-harmony)",
    gestureHint: "Spread -> width",
  },
  guitar: {
    label: "Guitar",
    icon: <AudioWaveform className="w-6 h-6" />,
    color: "var(--color-melody)",
    gestureHint: "Point -> focus",
  },
  bass_other: {
    label: "Bass Other",
    icon: <Speaker className="w-6 h-6" />,
    color: "var(--color-bass)",
    gestureHint: "Pinch -> filter",
  },
};

function toTitleCase(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function PerformMode() {
  const {
    setMode,
    setStemVolume,
    toggleStemMute,
    toggleStemSolo,
    setMainVolume,
    toggleMainMute,
    togglePlay,
  } = useTrackActions();
  const { analysis, stemUrls, stemMix, stemLoadStatus, separationReport, mainMix, playing } =
    useTrack();
  const [handActive, setHandActive] = useState(true);
  const [gesture, setGesture] = useState<HandGesture | null>(null);

  const stemControls: StemControl[] = useMemo(() => {
    if (!analysis || !stemUrls) return [];
    return Object.keys(stemUrls)
      .sort()
      .map((id) => {
        const mix = stemMix[id] ?? { volume: 1, muted: false, solo: false };
        const presenceProxy =
          id === "drums"
            ? analysis.stems.percussion
            : id === "vocals"
              ? analysis.stems.vocals
              : id === "guitar"
                ? analysis.stems.melody
                : id === "other"
                  ? analysis.stems.harmony
                  : id === "bass" || id === "bass_other"
                    ? analysis.stems.bass
                    : 0.5;

        const meta = STEM_META[id] ?? {
          label: toTitleCase(id),
          icon: <Layers className="w-6 h-6" />,
          color: "var(--accent)",
          gestureHint: "Manual control",
        };

        return {
          id,
          ...meta,
          presence: presenceProxy,
          volume: mix.volume,
          muted: mix.muted,
          solo: mix.solo,
        };
      });
  }, [analysis, stemMix, stemUrls]);

  const onGesture = useCallback(
    (g: HandGesture) => {
      setGesture(g);
      const ids = stemControls.map((s) => s.id);
      if (g.gesture === "pinch" && ids.includes("bass")) {
        setStemVolume("bass", 1 - Math.min(1, g.pinchDistance * 12));
      }
      if (g.gesture === "open" && ids.includes("vocals")) {
        setStemVolume("vocals", 1 - g.palmY);
      }
      if (g.gesture === "open" && g.spreadX > 0 && ids.includes("other")) {
        setStemVolume("other", Math.min(1, g.spreadX * 3));
      }
      if (g.gesture === "fist" && ids.includes("drums")) {
        toggleStemMute("drums");
      }
    },
    [setStemVolume, stemControls, toggleStemMute]
  );

  const adjustStem = useCallback(
    (id: string, delta: number) => {
      const current = stemMix[id]?.volume ?? 1;
      setStemVolume(id, Math.max(0, Math.min(1, current + delta)));
    },
    [setStemVolume, stemMix]
  );

  const adjustMain = useCallback(
    (delta: number) => {
      setMainVolume(Math.max(0, Math.min(1, mainMix.volume + delta)));
    },
    [mainMix.volume, setMainVolume]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[var(--z-modal)] bg-[var(--bg-deep)] flex flex-col"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 h-16 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">Perform Mode</h2>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={togglePlay}
            className="touch-target w-11 h-11 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors"
            aria-label={playing ? "Pause playback" : "Start playback"}
          >
            {playing ? (
              <Pause className="w-5 h-5 text-[var(--foreground)]" />
            ) : (
              <Play className="w-5 h-5 text-[var(--foreground)] ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setHandActive((p) => !p)}
            className={`touch-target flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              handActive
                ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
            }`}
            aria-label={handActive ? "Disable hand tracking" : "Enable hand tracking"}
          >
            <Hand className="w-4 h-4" />
            {handActive ? "Tracking On" : "Hand Track"}
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setMode("analyze")}
            className="touch-target w-10 h-10 flex items-center justify-center rounded-md hover:bg-[var(--surface)] transition-colors"
            aria-label="Exit perform mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        <section className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.5px] text-[var(--foreground-muted)]">
                Camera Tracking
              </p>
              {gesture && gesture.gesture !== "none" && (
                <div className="text-sm text-[var(--foreground-muted)] font-mono">
                  Gesture:{" "}
                  <span className="text-[var(--accent)] font-semibold">{gesture.gesture}</span>
                </div>
              )}
            </div>
            {handActive ? (
              <HandTracker active={handActive} onGesture={onGesture} className="max-w-4xl" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center text-sm text-[var(--foreground-muted)]">
                Enable Hand Track to start camera control
              </div>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-start justify-center gap-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className={`w-36 h-36 rounded-full flex items-center justify-center border-2 transition-all duration-150 ${
                    mainMix.muted ? "opacity-25 grayscale" : ""
                  }`}
                  style={{
                    borderColor: "var(--secondary)",
                    backgroundColor: `color-mix(in srgb, var(--secondary) ${Math.round(
                      mainMix.volume * 25
                    )}%, transparent)`,
                  }}
                >
                  <div className="text-[var(--foreground)]">
                    <SlidersHorizontal className="w-7 h-7" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-[var(--secondary)]">Main Track</span>
                <span className="text-lg font-mono font-bold text-[var(--foreground)]">
                  {Math.round(mainMix.volume * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustMain(-0.1)}
                  className="touch-target w-11 h-11 flex items-center justify-center rounded-md bg-[var(--surface)] border border-[var(--border)] text-base font-mono hover:bg-[var(--bg-elevated)] transition-colors"
                  aria-label="Decrease main track volume"
                >
                  -
                </button>
                <button
                  onClick={toggleMainMute}
                  className={`touch-target w-11 h-11 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                    mainMix.muted
                      ? "bg-[var(--destructive)]/20 text-[var(--destructive)] border border-[var(--destructive)]/40"
                      : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]"
                  }`}
                  aria-label={mainMix.muted ? "Unmute main track" : "Mute main track"}
                >
                  {mainMix.muted ? "OFF" : "ON"}
                </button>
                <button
                  onClick={() => adjustMain(0.1)}
                  className="touch-target w-11 h-11 flex items-center justify-center rounded-md bg-[var(--surface)] border border-[var(--border)] text-base font-mono hover:bg-[var(--bg-elevated)] transition-colors"
                  aria-label="Increase main track volume"
                >
                  +
                </button>
              </div>
            </div>

            {stemControls.map((stem, idx) => {
              const val = stem.volume;
              const muted = stem.muted;
              const isActive =
                gesture?.gesture !== "none" &&
                ((stem.id === "bass" && gesture?.gesture === "pinch") ||
                  (stem.id === "vocals" && gesture?.gesture === "open") ||
                  (stem.id === "drums" && gesture?.gesture === "fist") ||
                  (stem.id === "other" && gesture?.gesture === "open"));

              return (
                <div key={stem.id} className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div
                      className={`w-36 h-36 rounded-full flex items-center justify-center border-2 transition-all duration-150 ${
                        muted ? "opacity-25 grayscale" : ""
                      } ${isActive ? "scale-110" : ""}`}
                      style={{
                        borderColor: stem.color,
                        backgroundColor: `color-mix(in srgb, ${stem.color} ${Math.round(
                          val * 25
                        )}%, transparent)`,
                        boxShadow: isActive
                          ? `0 0 40px color-mix(in srgb, ${stem.color} 35%, transparent)`
                          : "0 0 0px transparent",
                      }}
                    >
                      <div className="text-[var(--foreground)]">{stem.icon}</div>
                    </div>
                    <div
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                      style={{
                        borderColor: stem.color,
                        backgroundColor: "var(--bg-deep)",
                        color: stem.color,
                      }}
                      title={`Model detected ${Math.round(stem.presence * 100)}% presence`}
                    >
                      {Math.round(stem.presence * 100)}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold" style={{ color: stem.color }}>
                      {stem.label}
                    </span>
                    <span className="text-lg font-mono font-bold text-[var(--foreground)]">
                      {Math.round(val * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustStem(stem.id, -0.1)}
                      className="touch-target w-11 h-11 flex items-center justify-center rounded-md bg-[var(--surface)] border border-[var(--border)] text-base font-mono hover:bg-[var(--bg-elevated)] transition-colors"
                      aria-label={`Decrease ${stem.label}`}
                    >
                      -
                    </button>
                    <button
                      onClick={() => toggleStemMute(stem.id)}
                      className={`touch-target w-11 h-11 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                        muted
                          ? "bg-[var(--destructive)]/20 text-[var(--destructive)] border border-[var(--destructive)]/40"
                          : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]"
                      }`}
                      aria-label={`${muted ? "Unmute" : "Mute"} ${stem.label}`}
                    >
                      {muted ? "OFF" : "ON"}
                    </button>
                    <button
                      onClick={() => toggleStemSolo(stem.id)}
                      className={`touch-target w-11 h-11 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                        stem.solo
                          ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40"
                          : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]"
                      }`}
                      aria-label={`${stem.solo ? "Disable solo" : "Solo"} ${stem.label}`}
                    >
                      {stem.solo ? "S" : "SOLO"}
                    </button>
                    <button
                      onClick={() => adjustStem(stem.id, 0.1)}
                      className="touch-target w-11 h-11 flex items-center justify-center rounded-md bg-[var(--surface)] border border-[var(--border)] text-base font-mono hover:bg-[var(--bg-elevated)] transition-colors"
                      aria-label={`Increase ${stem.label}`}
                    >
                      +
                    </button>
                  </div>

                  <kbd className="text-[10px] text-[var(--foreground-muted)]/50">{idx + 1}</kbd>
                </div>
              );
            })}
          </div>
        </section>

        {separationReport && (
          <div className="w-full max-w-2xl mx-auto rounded-md border border-[var(--border)] bg-[var(--surface)]/60 p-4">
            <h3 className="text-xs uppercase tracking-[0.5px] text-[var(--foreground-muted)] mb-2">
              Separation Report
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mb-2">
              Model:{" "}
              <span className="mono-value text-[var(--foreground)]">{separationReport.model}</span>
              {separationReport.sourceFile ? (
                <>
                  {" "}
                  · Source:{" "}
                  <span className="mono-value text-[var(--foreground)]">
                    {separationReport.sourceFile}
                  </span>
                </>
              ) : null}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[var(--foreground-muted)] mb-1">Separated stems</p>
                <div className="flex flex-wrap gap-1.5">
                  {separationReport.separatedStemNames.map((stemName) => (
                    <span
                      key={stemName}
                      className="px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                    >
                      {toTitleCase(stemName)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[var(--foreground-muted)] mb-1">Skipped as silent</p>
                <div className="flex flex-wrap gap-1.5">
                  {separationReport.skippedSilentStemNames.length === 0 ? (
                    <span className="text-[var(--foreground-muted)]">None</span>
                  ) : (
                    separationReport.skippedSilentStemNames.map((stemName) => (
                      <span
                        key={stemName}
                        className="px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                      >
                        {toTitleCase(stemName)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
            {!separationReport.separatedStemNames.includes("vocals") && (
              <p className="mt-3 text-xs text-[var(--warning)]">
                No vocals stem was returned.
                {separationReport.skippedSilentStemNames.includes("vocals")
                  ? " Vocals were detected but skipped as silent."
                  : " The model did not produce a vocals stem for this track."}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-xs uppercase tracking-[0.5px] text-[var(--foreground-muted)] mb-2">
                Stem Debug
              </p>
              <div className="space-y-1.5">
                {separationReport.separatedStemNames.map((stemName) => {
                  const loadStatus = stemLoadStatus[stemName] ?? "loading";
                  const mix = stemMix[stemName] ?? {
                    volume: 1,
                    muted: false,
                    solo: false,
                  };
                  return (
                    <div
                      key={`debug-${stemName}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-2 items-center text-[11px]"
                    >
                      <span className="text-[var(--foreground)] truncate">
                        {toTitleCase(stemName)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          loadStatus === "ready"
                            ? "text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10"
                            : loadStatus === "error"
                              ? "text-[var(--destructive)] border-[var(--destructive)]/30 bg-[var(--destructive)]/10"
                              : "text-[var(--foreground-muted)] border-[var(--border)] bg-[var(--surface)]"
                        }`}
                      >
                        {loadStatus}
                      </span>
                      <span className="text-[var(--foreground-muted)]">
                        vol {Math.round(mix.volume * 100)}%
                      </span>
                      <span className="text-[var(--foreground-muted)]">
                        {mix.muted ? "muted" : mix.solo ? "solo" : "active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--foreground-muted)]">
        <span className="opacity-60">Separated stem mixing and camera-driven performance controls</span>
        <div className="flex items-center gap-5">
          <span>
            <kbd className="mx-0.5 px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] font-mono">
              1-{stemControls.length}
            </kbd>{" "}
            focus
          </span>
          <span>
            <kbd className="mx-0.5 px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] font-mono">
              ↑↓
            </kbd>{" "}
            adjust
          </span>
          <span>
            <kbd className="mx-0.5 px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] font-mono">
              M
            </kbd>{" "}
            mute
          </span>
          <span>
            <kbd className="mx-0.5 px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] font-mono">
              S
            </kbd>{" "}
            solo
          </span>
          <span>
            <kbd className="mx-0.5 px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] font-mono">
              Esc
            </kbd>{" "}
            exit
          </span>
        </div>
      </div>
    </motion.div>
  );
}
