"use client";

import { useCallback, useState } from "react";
import {
  Play,
  Pause,
  Search,
  Wand2,
  Zap,
  Music,
  Drum,
  Mic,
  Speaker,
  AudioWaveform,
  Grid3X3,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { FEATURE_LANES } from "@/lib/constants";
import type { AppMode, FeatureType } from "@/lib/types";

const MODE_CONFIG: { mode: AppMode; label: string; icon: React.ReactNode }[] = [
  { mode: "analyze", label: "Analyze", icon: <Search className="w-4 h-4" /> },
  { mode: "extend", label: "Extend", icon: <Wand2 className="w-4 h-4" /> },
  { mode: "perform", label: "Perform", icon: <Zap className="w-4 h-4" /> },
];

const LANE_ICONS: Record<string, React.ReactNode> = {
  "music": <Music className="w-3.5 h-3.5" />,
  "drum": <Drum className="w-3.5 h-3.5" />,
  "mic": <Mic className="w-3.5 h-3.5" />,
  "speaker": <Speaker className="w-3.5 h-3.5" />,
  "audio-waveform": <AudioWaveform className="w-3.5 h-3.5" />,
  "grid-3x3": <Grid3X3 className="w-3.5 h-3.5" />,
  "metronome": <Music className="w-3.5 h-3.5" />,
};

export default function CommandDock() {
  const { analysis, mode, playing, activeLayers, mainMix, mainView } = useTrack();
  const { setMode, togglePlay, toggleLayer, setMainVolume, toggleMainMute } =
    useTrackActions();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;
      setPrompt("");
    },
    [prompt]
  );

  if (!analysis) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[var(--z-command-dock)] bg-[var(--bg-base)]/95 backdrop-blur-md border-t border-[var(--border)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="toolbar"
      aria-label="Command dock"
    >
      {/* Feature toggles - scrollable row (analysis view only) */}
      {mainView === "analysis" && (
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none border-b border-[var(--border)]/50">
        {FEATURE_LANES.map((lane) => {
          const active = activeLayers.has(lane.type);
          return (
            <button
              key={lane.type}
              onClick={() => toggleLayer(lane.type as FeatureType)}
              aria-pressed={active}
              aria-label={`Toggle ${lane.label} layer`}
              className={`
                touch-target flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                text-xs font-medium transition-all duration-150
                ${
                  active
                    ? "bg-[var(--surface)] border border-[var(--border-active)] text-[var(--foreground)]"
                    : "bg-transparent border border-transparent text-[var(--foreground-muted)] hover:bg-[var(--surface)]"
                }
              `}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: `var(${lane.colorVar})`,
                  opacity: active ? 1 : 0.4,
                }}
              />
              {LANE_ICONS[lane.icon] ?? null}
              <span className="hidden sm:inline">{lane.label}</span>
              <kbd className="hidden md:inline text-[9px] opacity-40 ml-0.5">
                {lane.shortcutKey}
              </kbd>
            </button>
          );
        })}
      </div>
      )}

      {/* Main dock row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Play/pause */}
        <button
          onClick={togglePlay}
          className="touch-target flex-shrink-0 w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors"
          aria-label={playing ? "Pause playback" : "Start playback"}
        >
          {playing ? (
            <Pause className="w-4 h-4 text-[var(--foreground)]" />
          ) : (
            <Play className="w-4 h-4 text-[var(--foreground)] ml-0.5" />
          )}
        </button>

        {/* Main track volume/mute */}
        <div className="flex-shrink-0 flex items-center gap-1 rounded-md bg-[var(--surface)] border border-[var(--border)] p-1">
          <button
            onClick={() => setMainVolume(Math.max(0, mainMix.volume - 0.1))}
            className="touch-target w-8 h-8 flex items-center justify-center rounded text-sm font-mono text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Decrease main track volume"
          >
            -
          </button>
          <button
            onClick={toggleMainMute}
            className={`touch-target w-8 h-8 flex items-center justify-center rounded transition-colors ${
              mainMix.muted
                ? "text-[var(--destructive)] bg-[var(--destructive)]/10"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--bg-elevated)]"
            }`}
            aria-label={mainMix.muted ? "Unmute main track" : "Mute main track"}
          >
            {mainMix.muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMainVolume(Math.min(1, mainMix.volume + 0.1))}
            className="touch-target w-8 h-8 flex items-center justify-center rounded text-sm font-mono text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Increase main track volume"
          >
            +
          </button>
          <span className="mono-value text-[10px] text-[var(--foreground-muted)] w-10 text-right pr-1">
            {Math.round(mainMix.volume * 100)}%
          </span>
        </div>

        {/* Prompt input */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <label htmlFor="command-input" className="sr-only">
            Describe continuation, mood shift, or remix idea
          </label>
          <input
            id="command-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe continuation, mood shift, or remix idea…"
            className="w-full h-10 pl-4 pr-10 text-sm rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]/50 focus:border-[var(--border-active)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 touch-target w-7 h-7 flex items-center justify-center rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
            aria-label="Send prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Mode switch */}
        <div
          className="flex-shrink-0 flex items-center bg-[var(--surface)] rounded-md border border-[var(--border)] p-0.5"
          role="tablist"
          aria-label="Application mode"
        >
          {MODE_CONFIG.map((m) => (
            <button
              key={m.mode}
              onClick={() => setMode(m.mode)}
              role="tab"
              aria-selected={mode === m.mode}
              className={`
                touch-target flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium
                transition-all duration-150
                ${
                  mode === m.mode
                    ? "bg-[var(--secondary)] text-[var(--foreground)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }
              `}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
