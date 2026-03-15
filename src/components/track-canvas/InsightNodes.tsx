"use client";

import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import type { Insight } from "@/lib/types";

const InsightMarker = memo(function InsightMarker({
  insight,
  duration,
  isExpanded,
  onToggle,
}: {
  insight: Insight;
  duration: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const left = (insight.timestamp / duration) * 80;

  return (
    <div
      className="absolute"
      style={{
        left: `${left}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: isExpanded ? 40 : 30,
      }}
    >
      <button
        onClick={onToggle}
        role="button"
        aria-label={insight.text}
        aria-expanded={isExpanded}
        className={`
          touch-target relative w-8 h-8 rounded-full flex items-center justify-center
          border transition-all duration-150
          ${
            isExpanded
              ? "bg-[var(--secondary)] border-[var(--secondary)] scale-110"
              : "bg-[var(--color-ai-node)] border-[var(--color-ai-node-border)] hover:bg-[var(--secondary)]/20 hover:scale-105"
          }
        `}
        style={{ willChange: "transform" }}
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--foreground)]" />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 max-w-[80vw] z-[var(--z-hover-card)]"
            role="dialog"
            aria-label="AI insight detail"
          >
            <div
              className="rounded-md border border-[var(--color-ai-node-border)] bg-[var(--bg-elevated)] p-4 shadow-xl"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-medium text-[var(--foreground-muted)]">
                  {insight.type === "suggestion"
                    ? "Suggestion"
                    : insight.type === "highlight"
                      ? "Highlight"
                      : "Observation"}
                </span>
                <button
                  onClick={onToggle}
                  className="touch-target w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface)]"
                  aria-label="Close insight"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[var(--foreground)]">
                {insight.text}
              </p>
              <div className="mt-2 text-[10px] text-[var(--foreground-muted)] font-mono">
                {Math.floor(insight.timestamp / 60)}:
                {String(Math.floor(insight.timestamp % 60)).padStart(2, "0")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function InsightNodes() {
  const { analysis, expandedInsight } = useTrack();
  const { setExpandedInsight } = useTrackActions();

  const toggle = useCallback(
    (id: string) => {
      setExpandedInsight(expandedInsight === id ? null : id);
    },
    [expandedInsight, setExpandedInsight]
  );

  if (!analysis) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-label="AI insight markers">
      {analysis.insights.map((insight) => (
        <div key={insight.id} className="pointer-events-auto">
          <InsightMarker
            insight={insight}
            duration={analysis.duration}
            isExpanded={expandedInsight === insight.id}
            onToggle={() => toggle(insight.id)}
          />
        </div>
      ))}
    </div>
  );
}
