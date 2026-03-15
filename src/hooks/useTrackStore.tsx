"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  AppMode,
  MainView,
  UploadState,
  ExtensionState,
  TrackAnalysis,
  FeatureType,
  SeparationReport,
} from "@/lib/types";

interface StemMixControl {
  volume: number;
  muted: boolean;
  solo: boolean;
}

interface MainMixControl {
  volume: number;
  muted: boolean;
}

interface TrackState {
  uploadState: UploadState;
  extensionState: ExtensionState;
  mode: AppMode;
  mainView: MainView;
  analysis: TrackAnalysis | null;
  file: File | null;
  fileName: string | null;
  audioUrl: string | null;
  stemUrls: Record<string, string> | null;
  stemMix: Record<string, StemMixControl>;
  stemLoadStatus: Record<string, "idle" | "loading" | "ready" | "error">;
  mainMix: MainMixControl;
  separationReport: SeparationReport | null;
  playing: boolean;
  currentTime: number;
  seekGeneration: number;
  duration: number;
  activeLayers: Set<FeatureType>;
  expandedInsight: string | null;
  contextPanelOpen: boolean;
  analysisProgress: number;
}

type TrackAction =
  | { type: "SET_UPLOAD_STATE"; payload: UploadState }
  | { type: "SET_EXTENSION_STATE"; payload: ExtensionState }
  | { type: "SET_MODE"; payload: AppMode }
  | { type: "SET_ANALYSIS"; payload: TrackAnalysis }
  | { type: "SET_FILE"; payload: File | null }
  | { type: "SET_FILE_NAME"; payload: string }
  | { type: "SET_AUDIO_URL"; payload: string }
  | { type: "SET_STEM_URLS"; payload: Record<string, string> | null }
  | {
      type: "SET_STEM_LOAD_STATUS";
      payload: { stemId: string; status: "idle" | "loading" | "ready" | "error" };
    }
  | { type: "SET_SEPARATION_REPORT"; payload: SeparationReport | null }
  | { type: "SET_STEM_VOLUME"; payload: { stemId: string; volume: number } }
  | { type: "TOGGLE_STEM_MUTE"; payload: { stemId: string } }
  | { type: "SET_STEM_MUTE"; payload: { stemId: string; muted: boolean } }
  | { type: "TOGGLE_STEM_SOLO"; payload: { stemId: string } }
  | { type: "SET_MAIN_VOLUME"; payload: number }
  | { type: "TOGGLE_MAIN_MUTE" }
  | { type: "SET_DURATION"; payload: number }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SEEK_TO"; payload: number }
  | { type: "TOGGLE_LAYER"; payload: FeatureType }
  | { type: "SET_EXPANDED_INSIGHT"; payload: string | null }
  | { type: "TOGGLE_CONTEXT_PANEL" }
  | { type: "SET_ANALYSIS_PROGRESS"; payload: number }
  | { type: "SET_MAIN_VIEW"; payload: MainView }
  | { type: "RESET" };

const DEFAULT_LAYERS = new Set<FeatureType>(["tempo", "melody", "structure"]);

const initialState: TrackState = {
  uploadState: "idle",
  extensionState: "idle",
  mode: "analyze",
  mainView: "analysis",
  analysis: null,
  file: null,
  fileName: null,
  audioUrl: null,
  stemUrls: null,
  stemMix: {},
  stemLoadStatus: {},
  mainMix: { volume: 1, muted: false },
  separationReport: null,
  playing: false,
  currentTime: 0,
  seekGeneration: 0,
  duration: 0,
  activeLayers: DEFAULT_LAYERS,
  expandedInsight: null,
  contextPanelOpen: true,
  analysisProgress: 0,
};

function trackReducer(state: TrackState, action: TrackAction): TrackState {
  switch (action.type) {
    case "SET_UPLOAD_STATE":
      return { ...state, uploadState: action.payload };
    case "SET_EXTENSION_STATE":
      return { ...state, extensionState: action.payload };
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_ANALYSIS":
      return { ...state, analysis: action.payload, uploadState: "complete" };
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_FILE_NAME":
      return { ...state, fileName: action.payload };
    case "SET_AUDIO_URL":
      return { ...state, audioUrl: action.payload };
    case "SET_STEM_URLS":
      return {
        ...state,
        stemUrls: action.payload,
        stemMix: Object.keys(action.payload ?? {}).reduce<Record<string, StemMixControl>>(
          (acc, stemId) => {
            acc[stemId] = state.stemMix[stemId] ?? {
              volume: 1,
              muted: false,
              solo: false,
            };
            return acc;
          },
          {}
        ),
        stemLoadStatus: Object.keys(action.payload ?? {}).reduce<
          Record<string, "idle" | "loading" | "ready" | "error">
        >((acc, stemId) => {
          acc[stemId] = "loading";
          return acc;
        }, {}),
      };
    case "SET_STEM_LOAD_STATUS": {
      const { stemId, status } = action.payload;
      return {
        ...state,
        stemLoadStatus: {
          ...state.stemLoadStatus,
          [stemId]: status,
        },
      };
    }
    case "SET_SEPARATION_REPORT":
      return { ...state, separationReport: action.payload };
    case "SET_STEM_VOLUME": {
      const { stemId, volume } = action.payload;
      const current = state.stemMix[stemId] ?? { volume: 1, muted: false, solo: false };
      return {
        ...state,
        stemMix: {
          ...state.stemMix,
          [stemId]: { ...current, volume: Math.max(0, Math.min(1, volume)) },
        },
      };
    }
    case "TOGGLE_STEM_MUTE": {
      const { stemId } = action.payload;
      const current = state.stemMix[stemId] ?? { volume: 1, muted: false, solo: false };
      return {
        ...state,
        stemMix: {
          ...state.stemMix,
          [stemId]: { ...current, muted: !current.muted },
        },
      };
    }
    case "SET_STEM_MUTE": {
      const { stemId, muted } = action.payload;
      const current = state.stemMix[stemId] ?? { volume: 1, muted: false, solo: false };
      if (current.muted === muted) return state;
      return {
        ...state,
        stemMix: {
          ...state.stemMix,
          [stemId]: { ...current, muted },
        },
      };
    }
    case "TOGGLE_STEM_SOLO": {
      const { stemId } = action.payload;
      const current = state.stemMix[stemId] ?? { volume: 1, muted: false, solo: false };
      return {
        ...state,
        stemMix: {
          ...state.stemMix,
          [stemId]: { ...current, solo: !current.solo },
        },
      };
    }
    case "SET_MAIN_VOLUME":
      return {
        ...state,
        mainMix: {
          ...state.mainMix,
          volume: Math.max(0, Math.min(1, action.payload)),
        },
      };
    case "TOGGLE_MAIN_MUTE":
      return {
        ...state,
        mainMix: { ...state.mainMix, muted: !state.mainMix.muted },
      };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "TOGGLE_PLAY":
      return { ...state, playing: !state.playing };
    case "SET_PLAYING":
      return { ...state, playing: action.payload };
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    case "SEEK_TO":
      return { ...state, currentTime: action.payload, seekGeneration: state.seekGeneration + 1 };
    case "TOGGLE_LAYER": {
      const next = new Set(state.activeLayers);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return { ...state, activeLayers: next };
    }
    case "SET_EXPANDED_INSIGHT":
      return { ...state, expandedInsight: action.payload };
    case "TOGGLE_CONTEXT_PANEL":
      return { ...state, contextPanelOpen: !state.contextPanelOpen };
    case "SET_ANALYSIS_PROGRESS":
      return { ...state, analysisProgress: action.payload };
    case "SET_MAIN_VIEW":
      return { ...state, mainView: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const TrackContext = createContext<TrackState>(initialState);
const TrackDispatchContext = createContext<Dispatch<TrackAction>>(() => {});

export function TrackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trackReducer, initialState);

  return (
    <TrackContext.Provider value={state}>
      <TrackDispatchContext.Provider value={dispatch}>
        {children}
      </TrackDispatchContext.Provider>
    </TrackContext.Provider>
  );
}

export function useTrack() {
  return useContext(TrackContext);
}

export function useTrackDispatch() {
  return useContext(TrackDispatchContext);
}

export function useTrackActions() {
  const dispatch = useTrackDispatch();

  const setUploadState = useCallback(
    (s: UploadState) => dispatch({ type: "SET_UPLOAD_STATE", payload: s }),
    [dispatch]
  );
  const setExtensionState = useCallback(
    (s: ExtensionState) => dispatch({ type: "SET_EXTENSION_STATE", payload: s }),
    [dispatch]
  );
  const setMode = useCallback(
    (m: AppMode) => dispatch({ type: "SET_MODE", payload: m }),
    [dispatch]
  );
  const setAnalysis = useCallback(
    (a: TrackAnalysis) => dispatch({ type: "SET_ANALYSIS", payload: a }),
    [dispatch]
  );
  const setFile = useCallback(
    (f: File | null) => dispatch({ type: "SET_FILE", payload: f }),
    [dispatch]
  );
  const setFileName = useCallback(
    (n: string) => dispatch({ type: "SET_FILE_NAME", payload: n }),
    [dispatch]
  );
  const setAudioUrl = useCallback(
    (u: string) => dispatch({ type: "SET_AUDIO_URL", payload: u }),
    [dispatch]
  );
  const setStemUrls = useCallback(
    (urls: Record<string, string> | null) =>
      dispatch({ type: "SET_STEM_URLS", payload: urls }),
    [dispatch]
  );
  const setStemLoadStatus = useCallback(
    (stemId: string, status: "idle" | "loading" | "ready" | "error") =>
      dispatch({ type: "SET_STEM_LOAD_STATUS", payload: { stemId, status } }),
    [dispatch]
  );
  const setSeparationReport = useCallback(
    (report: SeparationReport | null) =>
      dispatch({ type: "SET_SEPARATION_REPORT", payload: report }),
    [dispatch]
  );
  const setStemVolume = useCallback(
    (stemId: string, volume: number) =>
      dispatch({ type: "SET_STEM_VOLUME", payload: { stemId, volume } }),
    [dispatch]
  );
  const toggleStemMute = useCallback(
    (stemId: string) =>
      dispatch({ type: "TOGGLE_STEM_MUTE", payload: { stemId } }),
    [dispatch]
  );
  const setStemMute = useCallback(
    (stemId: string, muted: boolean) =>
      dispatch({ type: "SET_STEM_MUTE", payload: { stemId, muted } }),
    [dispatch]
  );
  const toggleStemSolo = useCallback(
    (stemId: string) =>
      dispatch({ type: "TOGGLE_STEM_SOLO", payload: { stemId } }),
    [dispatch]
  );
  const setMainVolume = useCallback(
    (volume: number) => dispatch({ type: "SET_MAIN_VOLUME", payload: volume }),
    [dispatch]
  );
  const toggleMainMute = useCallback(
    () => dispatch({ type: "TOGGLE_MAIN_MUTE" }),
    [dispatch]
  );
  const setDuration = useCallback(
    (d: number) => dispatch({ type: "SET_DURATION", payload: d }),
    [dispatch]
  );
  const togglePlay = useCallback(
    () => dispatch({ type: "TOGGLE_PLAY" }),
    [dispatch]
  );
  const setPlaying = useCallback(
    (p: boolean) => dispatch({ type: "SET_PLAYING", payload: p }),
    [dispatch]
  );
  const setCurrentTime = useCallback(
    (t: number) => dispatch({ type: "SET_CURRENT_TIME", payload: t }),
    [dispatch]
  );
  const seekTo = useCallback(
    (t: number) => dispatch({ type: "SEEK_TO", payload: t }),
    [dispatch]
  );
  const toggleLayer = useCallback(
    (l: FeatureType) => dispatch({ type: "TOGGLE_LAYER", payload: l }),
    [dispatch]
  );
  const setExpandedInsight = useCallback(
    (id: string | null) => dispatch({ type: "SET_EXPANDED_INSIGHT", payload: id }),
    [dispatch]
  );
  const toggleContextPanel = useCallback(
    () => dispatch({ type: "TOGGLE_CONTEXT_PANEL" }),
    [dispatch]
  );
  const setAnalysisProgress = useCallback(
    (p: number) => dispatch({ type: "SET_ANALYSIS_PROGRESS", payload: p }),
    [dispatch]
  );
  const setMainView = useCallback(
    (v: MainView) => dispatch({ type: "SET_MAIN_VIEW", payload: v }),
    [dispatch]
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), [dispatch]);

  return {
    setUploadState,
    setExtensionState,
    setMode,
    setAnalysis,
    setFile,
    setFileName,
    setAudioUrl,
    setStemUrls,
    setStemLoadStatus,
    setSeparationReport,
    setStemVolume,
    toggleStemMute,
    setStemMute,
    toggleStemSolo,
    setMainVolume,
    toggleMainMute,
    setDuration,
    togglePlay,
    setPlaying,
    setCurrentTime,
    seekTo,
    toggleLayer,
    setExpandedInsight,
    toggleContextPanel,
    setAnalysisProgress,
    setMainView,
    reset,
  };
}
