"use client";

import { useEffect } from "react";
import { useTrack, useTrackActions } from "./useTrackStore";
import { FEATURE_LANES } from "@/lib/constants";
import type { FeatureType } from "@/lib/types";

export function useKeyboardShortcuts() {
  const { playing, currentTime, analysis, mode } = useTrack();
  const {
    togglePlay,
    setCurrentTime,
    toggleLayer,
    setMode,
    setExpandedInsight,
  } = useTrackActions();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const duration = analysis?.duration ?? 0;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 1 : 5)));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentTime(
            Math.min(duration, currentTime + (e.shiftKey ? 1 : 5))
          );
          break;
        case "Escape":
          setExpandedInsight(null);
          if (mode === "perform") setMode("analyze");
          break;
        case "m":
        case "M":
          break;
        case "a":
          if (!e.metaKey && !e.ctrlKey) setMode("analyze");
          break;
        case "e":
          if (!e.metaKey && !e.ctrlKey) setMode("extend");
          break;
        case "p":
          if (!e.metaKey && !e.ctrlKey) setMode("perform");
          break;
        default: {
          const lane = FEATURE_LANES.find((l) => l.shortcutKey === e.key);
          if (lane) {
            e.preventDefault();
            toggleLayer(lane.type as FeatureType);
          }
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    playing,
    currentTime,
    analysis?.duration,
    mode,
    togglePlay,
    setCurrentTime,
    toggleLayer,
    setMode,
    setExpandedInsight,
  ]);
}
