import type { FeatureLaneConfig } from "./types";

export const FEATURE_LANES: FeatureLaneConfig[] = [
  {
    type: "tempo",
    label: "Tempo",
    colorVar: "--color-tempo",
    icon: "metronome",
    pattern: "dots",
    shortcutKey: "1",
  },
  {
    type: "harmony",
    label: "Harmony",
    colorVar: "--color-harmony",
    icon: "music",
    pattern: "gradient",
    shortcutKey: "2",
  },
  {
    type: "structure",
    label: "Structure",
    colorVar: "--color-structure",
    icon: "grid-3x3",
    pattern: "solid",
    shortcutKey: "3",
  },
  {
    type: "melody",
    label: "Melody",
    colorVar: "--color-melody",
    icon: "audio-waveform",
    pattern: "solid",
    shortcutKey: "4",
  },
  {
    type: "bass",
    label: "Bass",
    colorVar: "--color-bass",
    icon: "speaker",
    pattern: "dashed",
    shortcutKey: "5",
  },
  {
    type: "percussion",
    label: "Percussion",
    colorVar: "--color-percussion",
    icon: "drum",
    pattern: "ticks",
    shortcutKey: "6",
  },
  {
    type: "vocals",
    label: "Vocals",
    colorVar: "--color-vocals",
    icon: "mic",
    pattern: "wavy",
    shortcutKey: "7",
  },
];

export const ACCEPTED_FORMATS = [".mp3", ".wav", ".flac", ".ogg"];
export const MIN_CLIP_SECONDS = 3;
export const MAX_CLIP_SECONDS = 60;
export const ANALYSIS_TIMEOUT_MS = 30000;

export const HERO_TIMING = {
  featureLockIn: 300,
  staggerDelay: 400,
  scanLineSpeed: 2000,
  ghostMaterialization: 600,
} as const;
