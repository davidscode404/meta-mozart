"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ContextPanel() {
  const {
    analysis,
    contextPanelOpen,
    currentTime,
    duration: realDuration,
    separationReport,
  } = useTrack();
  const { toggleContextPanel } = useTrackActions();
  const reducedMotion = useReducedMotion();

  if (!analysis) return null;

  const currentSection = analysis.sections.find(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  ) ?? analysis.sections[0];

  return (
    <>
      {/* Toggle button (mobile/tablet) */}
      <button
        onClick={toggleContextPanel}
        className="lg:hidden fixed top-4 right-4 z-[var(--z-context-rail)] touch-target rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] p-2"
        aria-label={contextPanelOpen ? "Close context panel" : "Open context panel"}
      >
        {contextPanelOpen ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {contextPanelOpen && (
          <motion.aside
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`
              bg-[var(--bg-base)] border-l border-[var(--border)] p-6 overflow-y-auto
              fixed lg:relative inset-y-0 right-0 z-[var(--z-context-rail)]
              w-[300px] lg:w-full max-w-[350px]
            `}
            aria-label="Track context panel"
          >
            <div className="space-y-6">
              {/* Track info */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.5px] font-medium text-[var(--foreground-muted)] mb-3">
                  Track Info
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Tempo" value={`${analysis.tempo} BPM`} />
                  <InfoRow label="Key" value={analysis.key} />
                  <InfoRow label="Time Sig" value={analysis.timeSignature} />
                  <InfoRow
                    label="Duration"
                    value={`${Math.floor((realDuration || analysis.duration) / 60)}:${String(Math.floor((realDuration || analysis.duration) % 60)).padStart(2, "0")}`}
                  />
                </div>
              </section>

              <Divider />

              {/* Current region */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.5px] font-medium text-[var(--foreground-muted)] mb-3">
                  Current Region
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Section" value={currentSection?.name ?? "—"} />
                  <InfoRow
                    label="Dominant"
                    value={currentSection?.dominantStems.join(" + ") ?? "—"}
                  />
                </div>
              </section>

              <Divider />

              {/* Mood / energy */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.5px] font-medium text-[var(--foreground-muted)] mb-3">
                  Mood
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.mood.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--foreground-muted)]">Energy</span>
                    <span className="mono-value text-[var(--foreground)]">
                      {Math.round(analysis.energy * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${analysis.energy * 100}%` }}
                    />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">
                  Mood and energy are currently heuristic placeholders from the app template.
                  Stem presence is real from backend separation.
                </p>
              </section>

              <Divider />

              {/* Separation report */}
              {separationReport && (
                <>
                  <section>
                    <h3 className="text-[10px] uppercase tracking-[0.5px] font-medium text-[var(--foreground-muted)] mb-3">
                      Separation Report
                    </h3>
                    <div className="space-y-2">
                      <InfoRow label="Model" value={separationReport.model} />
                      <InfoRow
                        label="Separated"
                        value={String(separationReport.separatedStemNames.length)}
                      />
                      <InfoRow
                        label="Skipped Silent"
                        value={String(separationReport.skippedSilentStemNames.length)}
                      />
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-[var(--foreground-muted)] mb-1">Separated stems</p>
                      <div className="flex flex-wrap gap-1.5">
                        {separationReport.separatedStemNames.map((name) => (
                          <span
                            key={name}
                            className="px-2 py-1 text-[11px] rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>

                  <Divider />
                </>
              )}

              {/* Extension prompt preview */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.5px] font-medium text-[var(--foreground-muted)] mb-3">
                  Extension Prompt
                </h3>
                <textarea
                  className="w-full h-24 px-3 py-2 text-sm rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] resize-none focus:border-[var(--border-active)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] placeholder:text-[var(--foreground-muted)]/50"
                  placeholder="Describe the continuation, mood shift, or remix idea…"
                  aria-label="Extension prompt preview"
                  defaultValue={`Extend with retained harmonic tension in ${analysis.key}, maintain ${analysis.tempo} BPM groove, add brighter percussion over existing bass foundation.`}
                />
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--foreground-muted)]">{label}</span>
      <span className="mono-value text-sm text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[var(--border)]" />;
}
