"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { BarChart3, AudioWaveform } from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { MainView } from "@/lib/types";
import TopBar from "./TopBar";
import UploadZone from "./upload/UploadZone";
import AnalysisProgress from "./upload/AnalysisProgress";
import TrackCanvas from "./track-canvas/TrackCanvas";
import ContextPanel from "./context-panel/ContextPanel";
import CommandDock from "./command-dock/CommandDock";

const PerformMode = dynamic(
  () => import("./perform-mode/PerformMode"),
  { ssr: false }
);

const StemMixer = dynamic(
  () => import("./stem-mixer/StemMixer"),
  { ssr: false }
);

const VIEW_TABS: { id: MainView; label: string; icon: React.ReactNode }[] = [
  { id: "analysis", label: "Analysis", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "mixer", label: "Mixer", icon: <AudioWaveform className="w-3.5 h-3.5" /> },
];

export default function SonicBlueprint() {
  useKeyboardShortcuts();

  const {
    uploadState,
    playing,
    analysis,
    audioUrl,
    mode,
    stemUrls,
    stemMix,
    mainMix,
    mainView,
  } = useTrack();
  const {
    setCurrentTime,
    setPlaying,
    setDuration,
    setStemLoadStatus,
    setMainView,
  } = useTrackActions();
  const isPerformMode = mode === "perform" && uploadState === "complete";
  const audioRef = useRef<HTMLAudioElement>(null);
  const stemAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const stemIds = useMemo(
    () => Object.keys(stemUrls ?? {}),
    [stemUrls]
  );

  useEffect(() => {
    stemAudioRefs.current = {};
  }, [stemUrls]);

  const hasStemPlayback = stemIds.length > 0;
  const anySoloActive = Object.values(stemMix).some((c) => c.solo);
  const shouldUseStemPlayback = hasStemPlayback;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = mainMix.muted ? 0 : mainMix.volume;
  }, [mainMix.muted, mainMix.volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;

    if (playing) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }

    for (const id of stemIds) {
      const stemEl = stemAudioRefs.current[id];
      if (!stemEl) continue;

      if (playing && shouldUseStemPlayback) {
        if (stemEl.paused) {
          stemEl.currentTime = el.currentTime;
          void stemEl.play().catch(() => undefined);
        }
      } else {
        stemEl.pause();
      }
    }
  }, [audioUrl, playing, setPlaying, shouldUseStemPlayback, stemIds]);

  useEffect(() => {
    for (const id of stemIds) {
      const stemEl = stemAudioRefs.current[id];
      if (!stemEl) continue;
      if (!shouldUseStemPlayback) {
        stemEl.volume = 0;
        continue;
      }
      const ctrl = stemMix[id] ?? { volume: 1, muted: false, solo: false };
      const audible = !ctrl.muted && (!anySoloActive || ctrl.solo);
      stemEl.volume = audible ? ctrl.volume : 0;
    }
  }, [anySoloActive, shouldUseStemPlayback, stemIds, stemMix]);

  const onTimeUpdate = useCallback(() => {
    const el = audioRef.current;
    if (el) setCurrentTime(el.currentTime);
  }, [setCurrentTime]);

  const onLoadedMetadata = useCallback(() => {
    const el = audioRef.current;
    if (el && isFinite(el.duration)) {
      setDuration(el.duration);
    }
  }, [setDuration]);

  const onEnded = useCallback(() => {
    setPlaying(false);
  }, [setPlaying]);

  const onStemCanPlay = useCallback(
    (stemId: string) => {
      setStemLoadStatus(stemId, "ready");
      const stemEl = stemAudioRefs.current[stemId];
      const el = audioRef.current;
      if (!stemEl || !el || !playing || !shouldUseStemPlayback) return;
      stemEl.currentTime = el.currentTime;
      void stemEl.play().catch(() => undefined);
    },
    [playing, setStemLoadStatus, shouldUseStemPlayback]
  );

  const { currentTime } = useTrack();
  const prevTimeRef = useRef(0);
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !isFinite(el.duration)) return;
    if (Math.abs(el.currentTime - currentTime) > 0.5) {
      el.currentTime = currentTime;
      for (const id of stemIds) {
        const stemEl = stemAudioRefs.current[id];
        if (stemEl && Math.abs(stemEl.currentTime - currentTime) > 0.15) {
          stemEl.currentTime = currentTime;
        }
      }
    }
    prevTimeRef.current = currentTime;
  }, [currentTime, stemIds]);

  const showMainUI = uploadState === "complete" && analysis;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <a href="#track-canvas" className="skip-link">
        Skip to track canvas
      </a>

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onEnded}
            preload="auto"
          />
          {stemIds.map((id) => (
            <audio
              key={id}
              ref={(node) => {
                stemAudioRefs.current[id] = node;
              }}
              src={stemUrls![id]}
              onLoadedMetadata={() => setStemLoadStatus(id, "ready")}
              onCanPlay={() => onStemCanPlay(id)}
              onError={() => setStemLoadStatus(id, "error")}
              preload="auto"
            />
          ))}
        </>
      )}

      <TopBar />

      {uploadState === "idle" && <UploadZone />}
      {(uploadState === "uploading" ||
        uploadState === "analyzing" ||
        uploadState === "error") && (
        <AnalysisProgress />
      )}

      {showMainUI && (
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-36">
            {/* View tab bar */}
            <div
              className="inline-flex items-center bg-[var(--surface)] rounded-md border border-[var(--border)] p-0.5 mb-4"
              role="tablist"
              aria-label="Content view"
            >
              {VIEW_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMainView(tab.id)}
                  role="tab"
                  aria-selected={mainView === tab.id}
                  className={`
                    touch-target flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium
                    transition-all duration-150
                    ${
                      mainView === tab.id
                        ? "bg-[var(--secondary)] text-[var(--foreground)]"
                        : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {mainView === "analysis" ? <TrackCanvas /> : <StemMixer />}
          </main>

          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <ContextPanel />
          </div>
          <div className="lg:hidden">
            <ContextPanel />
          </div>
        </div>
      )}

      <CommandDock />

      <AnimatePresence>
        {isPerformMode && <PerformMode />}
      </AnimatePresence>
    </div>
  );
}
