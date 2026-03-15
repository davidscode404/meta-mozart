export type AppMode = "analyze" | "extend" | "perform";

export type MainView = "analysis" | "mixer";

export type UploadState =
  | "idle"
  | "uploading"
  | "analyzing"
  | "complete"
  | "error";

export type ExtensionState = "idle" | "generating" | "complete" | "error";

export interface TrackAnalysis {
  tempo: number;
  key: string;
  timeSignature: string;
  duration: number;
  sections: Section[];
  stems: StemPresence;
  mood: string[];
  energy: number;
  insights: Insight[];
}

export interface Section {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  dominantStems: string[];
}

export interface StemPresence {
  bass: number;
  melody: number;
  vocals: number;
  percussion: number;
  harmony: number;
}

export interface SeparateResponse {
  stems: Record<string, string>;
  skipped_silent: string[];
  model: string;
  source_file: string | null;
}

export interface AnalyzeResponse {
  tempo: number;
  key: string;
  time_signature: string;
  duration: number;
  energy: number;
}

export interface SeparationReport {
  model: string;
  sourceFile: string | null;
  separatedStemNames: string[];
  skippedSilentStemNames: string[];
}

export interface Insight {
  id: string;
  timestamp: number;
  text: string;
  type: "observation" | "suggestion" | "highlight";
  relatedFeature: FeatureType;
}

export type FeatureType =
  | "tempo"
  | "harmony"
  | "structure"
  | "melody"
  | "bass"
  | "percussion"
  | "vocals"
  | "extension";

export interface FeatureLaneConfig {
  type: FeatureType;
  label: string;
  colorVar: string;
  icon: string;
  pattern: "dots" | "solid" | "dashed" | "dotted" | "wavy" | "gradient" | "ticks";
  shortcutKey: string;
}
