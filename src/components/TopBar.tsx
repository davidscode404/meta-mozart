"use client";

import { Activity, Volume2, VolumeX } from "lucide-react";
import { useTrack } from "@/hooks/useTrackStore";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function TopBar() {
  const { analysis, playing, fileName, currentTime, duration, mainMix } = useTrack();
  const dur = duration || analysis?.duration || 0;

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-[var(--border)] bg-[var(--bg-deep)]/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold tracking-tight">
          Sonic Blueprint
        </h1>
        {fileName && (
          <span className="hidden sm:inline text-xs text-[var(--foreground-muted)] truncate max-w-[200px]">
            — {fileName}
          </span>
        )}
      </div>

      {analysis && (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Activity
              className={`w-3.5 h-3.5 ${playing ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}
            />
            <span className={playing ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]"}>
              {playing ? "Playing" : "Paused"}
            </span>
          </div>
          <span className="mono-value text-[var(--foreground)]">
            {fmt(currentTime)} / {fmt(dur)}
          </span>
          <span className="mono-value text-[var(--foreground-muted)]">
            {analysis.tempo} BPM
          </span>
          <span className="mono-value text-[var(--foreground-muted)]">
            {analysis.key}
          </span>
          <span className="mono-value text-[var(--foreground-muted)] hidden sm:inline">
            {analysis.timeSignature}
          </span>
          <span className="hidden md:flex items-center gap-1 text-[var(--foreground-muted)]">
            {mainMix.muted ? (
              <VolumeX className="w-3.5 h-3.5 text-[var(--destructive)]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span className="mono-value">{Math.round(mainMix.volume * 100)}%</span>
          </span>
        </div>
      )}
    </header>
  );
}
