import type { TrackAnalysis } from "./types";

export const MOCK_ANALYSIS: TrackAnalysis = {
  tempo: 124,
  key: "A minor",
  timeSignature: "4/4",
  duration: 42,
  sections: [
    { id: "s1", name: "Intro", startTime: 0, endTime: 8, dominantStems: ["harmony", "percussion"] },
    { id: "s2", name: "Verse", startTime: 8, endTime: 18, dominantStems: ["bass", "vocals"] },
    { id: "s3", name: "Pre-Chorus", startTime: 18, endTime: 24, dominantStems: ["melody", "vocals"] },
    { id: "s4", name: "Chorus", startTime: 24, endTime: 36, dominantStems: ["bass", "vocals", "percussion"] },
    { id: "s5", name: "Outro", startTime: 36, endTime: 42, dominantStems: ["harmony"] },
  ],
  stems: {
    bass: 0.85,
    melody: 0.7,
    vocals: 0.9,
    percussion: 0.8,
    harmony: 0.6,
  },
  mood: ["nocturnal", "cinematic", "driving", "melancholic"],
  energy: 0.72,
  insights: [
    {
      id: "i1",
      timestamp: 10,
      text: "Bass anchors the groove here with a syncopated pattern",
      type: "observation",
      relatedFeature: "bass",
    },
    {
      id: "i2",
      timestamp: 20,
      text: "Pre-chorus builds tension via ascending melody line",
      type: "highlight",
      relatedFeature: "melody",
    },
    {
      id: "i3",
      timestamp: 26,
      text: "Chorus energy peaks — all stems converge",
      type: "observation",
      relatedFeature: "vocals",
    },
    {
      id: "i4",
      timestamp: 34,
      text: "Harmonic tension suggests extending with brighter percussion",
      type: "suggestion",
      relatedFeature: "harmony",
    },
    {
      id: "i5",
      timestamp: 42,
      text: "Extension point: maintain harmonic tension, add layered pads",
      type: "suggestion",
      relatedFeature: "extension",
    },
  ],
};

export function generateWaveformData(length: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const base = Math.sin(t * Math.PI * 8) * 0.3;
    const detail = Math.sin(t * Math.PI * 47) * 0.15;
    const envelope =
      t < 0.1 ? t / 0.1 :
      t < 0.6 ? 1 :
      t < 0.85 ? 1 - (t - 0.6) * 0.4 :
      0.9 - (t - 0.85) * 2;
    data.push(Math.max(0.05, Math.min(1, (0.4 + base + detail) * Math.max(0.1, envelope))));
  }
  return data;
}

export function generateTempoTicks(duration: number, bpm: number): number[] {
  const interval = 60 / bpm;
  const ticks: number[] = [];
  for (let t = 0; t < duration; t += interval) {
    ticks.push(t);
  }
  return ticks;
}

export function generateMelodyPath(duration: number, sampleCount: number): { time: number; pitch: number }[] {
  const points: { time: number; pitch: number }[] = [];
  let pitch = 0.5;
  for (let i = 0; i < sampleCount; i++) {
    const t = (i / sampleCount) * duration;
    pitch += (Math.random() - 0.5) * 0.12;
    pitch = Math.max(0.15, Math.min(0.85, pitch));
    points.push({ time: t, pitch });
  }
  return points;
}

export function generateBassRibbon(duration: number, sampleCount: number): { time: number; amplitude: number }[] {
  const points: { time: number; amplitude: number }[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const t = (i / sampleCount) * duration;
    const amp = 0.3 + Math.sin(t * 1.2) * 0.2 + Math.sin(t * 3.7) * 0.1;
    points.push({ time: t, amplitude: Math.max(0.1, Math.min(0.7, amp)) });
  }
  return points;
}
