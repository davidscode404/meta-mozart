"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTrack } from "@/hooks/useTrackStore";
import { generateWaveformData } from "@/lib/mock-data";

const SAMPLE_COUNT = 500;
const BAR_WIDTH = 2;
const BAR_GAP = 1;

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const { analysis, currentTime, duration } = useTrack();

  useEffect(() => {
    dataRef.current = generateWaveformData(SAMPLE_COUNT);
  }, [analysis]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const data = dataRef.current;
    const dur = duration || analysis?.duration || 42;
    const progress = dur > 0 ? currentTime / dur : 0;

    ctx.clearRect(0, 0, w, h);

    const totalBars = data.length;
    const barStep = w / totalBars;

    for (let i = 0; i < totalBars; i++) {
      const x = i * barStep;
      const barH = data[i] * h * 0.85;
      const y = (h - barH) / 2;
      const pos = i / totalBars;

      if (pos <= progress) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#4338CA";
      } else {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#94A3B8";
      }

      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(1, barStep - BAR_GAP), barH, 1);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [analysis, currentTime, duration]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24 md:h-28"
      aria-label={
        analysis
          ? `Waveform visualization. Duration: ${Math.round(duration || analysis.duration)}s`
          : "Waveform visualization"
      }
      role="img"
    />
  );
}
