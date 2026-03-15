"use client";

import { useTrack } from "@/hooks/useTrackStore";

export default function SectionLabels() {
  const { analysis, duration: realDuration } = useTrack();
  if (!analysis) return null;

  const { sections } = analysis;
  const duration = realDuration || analysis.duration;

  return (
    <div className="relative w-full h-7 flex" aria-label="Track sections">
      {sections.map((section) => {
        const left = (section.startTime / duration) * 100;
        const width = Math.min(
          ((section.endTime - section.startTime) / duration) * 100,
          100 - left
        );

        return (
          <div
            key={section.id}
            className="absolute top-0 h-full flex items-center border-l border-[var(--border)]/40 first:border-l-0"
            style={{ left: `${left}%`, width: `${width}%` }}
          >
            <span className="px-2 text-[9px] font-medium uppercase tracking-wider text-[var(--foreground-muted)] truncate">
              {section.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
