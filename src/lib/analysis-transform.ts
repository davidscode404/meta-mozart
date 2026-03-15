import { MOCK_ANALYSIS } from "@/lib/mock-data";
import type {
  AnalyzeResponse,
  SeparateResponse,
  StemPresence,
  TrackAnalysis,
} from "@/lib/types";

const EMPTY_STEM_PRESENCE: StemPresence = {
  bass: 0,
  melody: 0,
  vocals: 0,
  percussion: 0,
  harmony: 0,
};

export function mapDemucsStemsToPresence(
  stems: Record<string, string>
): StemPresence {
  const presence: StemPresence = { ...EMPTY_STEM_PRESENCE };

  if (stems.drums) presence.percussion = 1;
  if (stems.vocals) presence.vocals = 1;
  if (stems.guitar) presence.melody = 1;
  if (stems.other) presence.harmony = 1;
  if (stems.bass || stems.bass_other) presence.bass = 1;

  return presence;
}

function scaleSectionsToDuration(duration: number): TrackAnalysis["sections"] {
  const sourceDuration = MOCK_ANALYSIS.duration || 1;
  const ratio = duration / sourceDuration;
  return MOCK_ANALYSIS.sections.map((section, index, all) => {
    const startTime = section.startTime * ratio;
    const endTime =
      index === all.length - 1
        ? duration
        : Math.min(duration, section.endTime * ratio);
    return { ...section, startTime, endTime };
  });
}

export function buildTrackAnalysis(
  separation: SeparateResponse,
  audioAnalysis: AnalyzeResponse | null,
  fallbackDuration: number
): TrackAnalysis {
  const duration = audioAnalysis?.duration ?? fallbackDuration;
  const safeDuration = Math.max(
    1,
    Number.isFinite(duration) ? duration : MOCK_ANALYSIS.duration
  );

  return {
    tempo: audioAnalysis?.tempo ?? MOCK_ANALYSIS.tempo,
    key: audioAnalysis?.key ?? MOCK_ANALYSIS.key,
    timeSignature: audioAnalysis?.time_signature ?? MOCK_ANALYSIS.timeSignature,
    duration: safeDuration,
    energy: audioAnalysis?.energy ?? MOCK_ANALYSIS.energy,
    stems: mapDemucsStemsToPresence(separation.stems),
    sections: scaleSectionsToDuration(safeDuration),
    mood: MOCK_ANALYSIS.mood,
    insights: MOCK_ANALYSIS.insights,
  };
}
