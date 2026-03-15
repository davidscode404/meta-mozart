"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { BarChart3, AudioWaveform } from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAudioEngine } from "@/hooks/useAudioEngine";
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
  const { unlockContext } = useAudioEngine();

  const {
    uploadState,
    analysis,
    mode,
    mainView,
  } = useTrack();
  const { setMainView } = useTrackActions();
  const isPerformMode = mode === "perform" && uploadState === "complete";

  const showMainUI = uploadState === "complete" && analysis;

  return (
    <div className="flex flex-col h-screen overflow-hidden" onClickCapture={unlockContext}>
      <a href="#track-canvas" className="skip-link">
        Skip to track canvas
      </a>

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
