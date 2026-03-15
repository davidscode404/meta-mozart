"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTrack } from "@/hooks/useTrackStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function GhostExtension() {
  const { extensionState } = useTrack();
  const reducedMotion = useReducedMotion();

  if (extensionState !== "complete") return null;

  return (
    <motion.div
      initial={
        reducedMotion
          ? { opacity: 1 }
          : { opacity: 0, scale: 0.98 }
      }
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 bottom-0 right-0 pointer-events-none"
      style={{ width: "20%", left: "80%" }}
      aria-label="Ghost extension region — projected continuation"
    >
      <div className="absolute inset-0 border-l-2 border-dashed border-[var(--color-extension)]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.06) 30%, rgba(139,92,246,0.1) 100%)",
        }}
      />

      {/* Ghost waveform bars */}
      <div className="absolute inset-0 flex items-center px-2 gap-[2px] overflow-hidden">
        {Array.from({ length: 40 }, (_, i) => {
          const h = 20 + Math.sin(i * 0.7) * 15 + Math.random() * 10;
          return (
            <div
              key={i}
              className="flex-shrink-0 rounded-sm"
              style={{
                width: 2,
                height: `${h}%`,
                backgroundColor: "var(--color-extension)",
                opacity: 0.5 - i * 0.008,
              }}
            />
          );
        })}
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-[var(--color-harmony)] opacity-60">
        <ArrowRight className="w-3 h-3" />
        <span>Future</span>
      </div>
    </motion.div>
  );
}
