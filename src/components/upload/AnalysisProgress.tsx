"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { separateAudio, analyzeAudio } from "@/lib/api";
import { buildTrackAnalysis } from "@/lib/analysis-transform";
import { HERO_TIMING } from "@/lib/constants";

const ANALYSIS_STEPS = [
  { label: "Tempo", icon: "♪" },
  { label: "Key", icon: "♫" },
  { label: "Time signature", icon: "#" },
  { label: "Sections", icon: "◌" },
  { label: "Stem layers", icon: "✦" },
];

export default function AnalysisProgress() {
  const { uploadState, analysisProgress, file, duration } = useTrack();
  const {
    setAnalysis,
    setUploadState,
    setAnalysisProgress,
    setExtensionState,
    setStemUrls,
    setSeparationReport,
    setFile,
  } = useTrackActions();
  const reducedMotion = useReducedMotion();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const progressRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const clearAsyncState = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!file) {
      setErrorMessage("No file available for analysis. Please upload again.");
      setUploadState("error");
      return;
    }

    setErrorMessage(null);
    setAnalysisProgress(0);

    let step = 0;
    progressRef.current = setInterval(() => {
      step = Math.min(step + 1, ANALYSIS_STEPS.length - 1);
      setAnalysisProgress(step);
    }, reducedMotion ? 80 : HERO_TIMING.staggerDelay);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const [separation, audioAnalysis] = await Promise.all([
        separateAudio(file, { signal: controller.signal }),
        analyzeAudio(file, { signal: controller.signal }).catch(() => null),
      ]);
      if (progressRef.current) clearInterval(progressRef.current);
      setStemUrls(separation.stems);
      setSeparationReport({
        model: separation.model,
        sourceFile: separation.source_file,
        separatedStemNames: Object.keys(separation.stems),
        skippedSilentStemNames: separation.skipped_silent,
      });
      setAnalysisProgress(ANALYSIS_STEPS.length);
      setAnalysis(buildTrackAnalysis(separation, audioAnalysis, duration));
      timerRef.current = setTimeout(
        () => setExtensionState("complete"),
        reducedMotion ? 50 : HERO_TIMING.ghostMaterialization
      );
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      if (progressRef.current) clearInterval(progressRef.current);
      setAnalysisProgress(0);
      setUploadState("error");
      setSeparationReport(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Stem separation failed."
      );
    } finally {
      abortRef.current = null;
    }
  }, [
    duration,
    file,
    reducedMotion,
    setAnalysis,
    setAnalysisProgress,
    setExtensionState,
    setSeparationReport,
    setStemUrls,
    setUploadState,
  ]);

  useEffect(() => {
    if (uploadState === "analyzing") {
      runAnalysis();
    }
    return () => {
      clearAsyncState();
    };
  }, [clearAsyncState, runAnalysis, uploadState]);

  const handleCancel = useCallback(() => {
    clearAsyncState();
    setUploadState("idle");
    setAnalysisProgress(0);
    setErrorMessage(null);
    setSeparationReport(null);
    setFile(null);
  }, [
    clearAsyncState,
    setAnalysisProgress,
    setFile,
    setSeparationReport,
    setUploadState,
  ]);

  const handleRetry = useCallback(() => {
    setUploadState("analyzing");
  }, [setUploadState]);

  if (
    uploadState !== "uploading" &&
    uploadState !== "analyzing" &&
    uploadState !== "error"
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center min-h-[70vh] px-4"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              {uploadState === "uploading"
                ? "Uploading track…"
                : uploadState === "error"
                  ? "Analysis failed"
                  : "Analyzing track…"}
            </h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              {uploadState === "error"
                ? "Fix the issue and retry separation"
                : "Extracting musical features"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 rounded-full bg-[var(--surface)] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--secondary)]"
              initial={{ width: "0%" }}
              animate={{
                width:
                  uploadState === "uploading"
                    ? "15%"
                    : uploadState === "error"
                      ? "100%"
                    : `${Math.min(100, (analysisProgress / ANALYSIS_STEPS.length) * 100)}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={
                uploadState === "error"
                  ? { backgroundColor: "var(--destructive)" }
                  : undefined
              }
            />
          </div>

          {uploadState === "error" && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-3 py-2 text-sm text-[var(--destructive)]"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage ?? "Unexpected analysis error."}</span>
            </div>
          )}

          {/* Feature lock-in steps */}
          <div className="space-y-3" role="list" aria-label="Analysis steps">
            {ANALYSIS_STEPS.map((step, i) => {
              const done = analysisProgress > i;
              const active = analysisProgress === i && uploadState === "analyzing";

              return (
                <motion.div
                  key={step.label}
                  role="listitem"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                  animate={
                    done || active
                      ? { opacity: 1, x: 0 }
                      : reducedMotion
                        ? { opacity: 0.3 }
                        : { opacity: 0.3, x: 0 }
                  }
                  transition={{
                    duration: reducedMotion ? 0 : HERO_TIMING.featureLockIn / 1000,
                    ease: "easeOut",
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="w-6 text-center text-sm opacity-60">
                    {step.icon}
                  </span>
                  <span
                    className={`text-sm flex-1 ${done ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}`}
                  >
                    {step.label}
                  </span>
                  <span className="w-6 flex items-center justify-center">
                    {done ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check className="w-4 h-4 text-[var(--success)]" />
                      </motion.span>
                    ) : active ? (
                      <span className="w-3 h-3 rounded-full border-2 border-[var(--secondary)] border-t-transparent animate-spin" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[var(--foreground-muted)]/30" />
                    )}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Cancel */}
          <div className="flex justify-center">
            {uploadState === "error" ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRetry}
                  className="touch-target rounded-md bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                  aria-label="Retry analysis"
                >
                  Retry
                </button>
                <button
                  onClick={handleCancel}
                  className="touch-target text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Back to upload"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Back
                </button>
              </div>
            ) : (
              <button
                onClick={handleCancel}
                className="touch-target text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Cancel analysis"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
