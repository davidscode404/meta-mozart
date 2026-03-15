"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTrack, useTrackActions } from "./useTrackStore";

/**
 * Web Audio API engine that replaces <audio> elements.
 *
 * Node graph:
 *   [main buffer] → GainNode ─┐
 *   [stem buffers] → GainNode ─┼→ MasterGain → ctx.destination
 *                               ┘
 *
 * All sources start from the same offset so they stay perfectly in sync.
 */

interface ChannelState {
  buffer: AudioBuffer;
  gain: GainNode;
  source: AudioBufferSourceNode | null;
}

export function useAudioEngine() {
  const {
    audioUrl,
    stemUrls,
    stemMix,
    mainMix,
    playing,
    currentTime,
    seekGeneration,
  } = useTrack();
  const { setCurrentTime, setDuration, setPlaying, setStemLoadStatus } =
    useTrackActions();

  // --- refs (mutable, no re-renders) ---
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const channelsRef = useRef<Map<string, ChannelState>>(new Map());
  const isPlayingRef = useRef(false);
  const startWallTimeRef = useRef(0); // ctx.currentTime when playback started
  const startOffsetRef = useRef(0); // offset into the buffer
  const rafRef = useRef<number>(0);
  const mainDurationRef = useRef(0);

  // Track which URLs we've already started loading to avoid duplicate fetches
  const loadingUrlsRef = useRef<Set<string>>(new Set());

  // --- helpers ---

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    masterGainRef.current = master;
    return ctx;
  }, []);

  /** Call from a user-gesture handler to unlock AudioContext on Safari */
  const unlockContext = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
  }, []);

  // --- rAF time reporter ---

  const startTimeReporter = useCallback(() => {
    const tick = () => {
      const ctx = ctxRef.current;
      if (!ctx || !isPlayingRef.current) return;
      const elapsed = ctx.currentTime - startWallTimeRef.current;
      const t = startOffsetRef.current + elapsed;
      setCurrentTime(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [setCurrentTime]);

  const stopTimeReporter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // --- start / stop all sources ---

  const startAllSources = useCallback(
    (offset: number) => {
      const ctx = ctxRef.current;
      if (!ctx || !masterGainRef.current) return;

      // Stop any existing sources first
      for (const ch of channelsRef.current.values()) {
        if (ch.source) {
          try {
            ch.source.onended = null;
            ch.source.stop();
          } catch {
            /* already stopped */
          }
          ch.source = null;
        }
      }

      const clampedOffset = Math.max(0, offset);
      startOffsetRef.current = clampedOffset;
      startWallTimeRef.current = ctx.currentTime;

      const mainCh = channelsRef.current.get("__main__");

      for (const [id, ch] of channelsRef.current) {
        // Clamp offset to this buffer's duration
        if (clampedOffset >= ch.buffer.duration) continue;

        const src = ctx.createBufferSource();
        src.buffer = ch.buffer;
        src.connect(ch.gain);
        ch.source = src;

        // Only the main channel drives the "ended" event
        if (id === "__main__") {
          src.onended = () => {
            if (!isPlayingRef.current) return;
            isPlayingRef.current = false;
            stopTimeReporter();
            setPlaying(false);

            // Stop all sources
            for (const c of channelsRef.current.values()) {
              if (c.source) {
                try {
                  c.source.onended = null;
                  c.source.stop();
                } catch {
                  /* already stopped */
                }
                c.source = null;
              }
            }
          };
        }

        src.start(0, clampedOffset);
      }

      isPlayingRef.current = true;
      startTimeReporter();
    },
    [setPlaying, startTimeReporter, stopTimeReporter]
  );

  const stopAllSources = useCallback(() => {
    // Snapshot current offset before stopping
    const ctx = ctxRef.current;
    if (ctx && isPlayingRef.current) {
      const elapsed = ctx.currentTime - startWallTimeRef.current;
      startOffsetRef.current = startOffsetRef.current + elapsed;
    }

    isPlayingRef.current = false;
    stopTimeReporter();

    for (const ch of channelsRef.current.values()) {
      if (ch.source) {
        try {
          ch.source.onended = null;
          ch.source.stop();
        } catch {
          /* already stopped */
        }
        ch.source = null;
      }
    }
  }, [stopTimeReporter]);

  // --- loadBuffer ---

  const loadBuffer = useCallback(
    async (id: string, url: string) => {
      if (loadingUrlsRef.current.has(url)) return;
      loadingUrlsRef.current.add(url);

      const ctx = ensureContext();
      if (id !== "__main__") {
        setStemLoadStatus(id, "loading");
      }

      try {
        const resp = await fetch(url);
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);

        const gain = ctx.createGain();
        gain.connect(masterGainRef.current!);

        const ch: ChannelState = { buffer: audioBuf, gain, source: null };
        channelsRef.current.set(id, ch);

        if (id === "__main__") {
          mainDurationRef.current = audioBuf.duration;
          setDuration(audioBuf.duration);
        } else {
          setStemLoadStatus(id, "ready");
        }

        // If already playing, join mid-playback
        if (isPlayingRef.current) {
          const ctx2 = ctxRef.current!;
          const elapsed = ctx2.currentTime - startWallTimeRef.current;
          const currentOffset = startOffsetRef.current + elapsed;
          if (currentOffset < audioBuf.duration) {
            const src = ctx2.createBufferSource();
            src.buffer = audioBuf;
            src.connect(gain);
            ch.source = src;
            src.start(0, currentOffset);
          }
        }
      } catch {
        if (id !== "__main__") {
          setStemLoadStatus(id, "error");
        }
      }
    },
    [ensureContext, setDuration, setStemLoadStatus]
  );

  // --- play / pause effects ---

  useEffect(() => {
    if (playing) {
      const ctx = ensureContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      // Only start if we have at least the main buffer
      if (channelsRef.current.has("__main__")) {
        startAllSources(startOffsetRef.current);
      }
    } else {
      if (isPlayingRef.current) {
        stopAllSources();
      }
    }
  }, [playing, ensureContext, startAllSources, stopAllSources]);

  // --- seek effect (reacts to seekGeneration, NOT plain currentTime) ---

  const prevSeekGenRef = useRef(0);
  useEffect(() => {
    if (seekGeneration === prevSeekGenRef.current) return;
    prevSeekGenRef.current = seekGeneration;

    startOffsetRef.current = currentTime;

    if (isPlayingRef.current) {
      // Restart all sources at new offset
      startAllSources(currentTime);
    }
    // If paused, startOffsetRef is updated — next play() uses it
  }, [seekGeneration, currentTime, startAllSources]);

  // --- load main buffer when audioUrl changes ---

  useEffect(() => {
    if (!audioUrl) return;

    // Clear previous channels
    stopAllSources();
    channelsRef.current.clear();
    loadingUrlsRef.current.clear();
    startOffsetRef.current = 0;

    loadBuffer("__main__", audioUrl);
  }, [audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- load stem buffers when stemUrls changes ---

  useEffect(() => {
    if (!stemUrls) return;
    for (const [id, url] of Object.entries(stemUrls)) {
      if (!channelsRef.current.has(id)) {
        loadBuffer(id, url);
      }
    }
  }, [stemUrls]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- volume control: main ---

  useEffect(() => {
    const ch = channelsRef.current.get("__main__");
    if (!ch) return;
    const vol = mainMix.muted ? 0 : mainMix.volume;
    ch.gain.gain.setTargetAtTime(vol, ch.gain.context.currentTime, 0.02);
  }, [mainMix.muted, mainMix.volume]);

  // --- volume control: stems ---

  const anySoloActive = Object.values(stemMix).some((c) => c.solo);

  useEffect(() => {
    for (const [id, ch] of channelsRef.current) {
      if (id === "__main__") continue;
      const ctrl = stemMix[id];
      if (!ctrl) continue;
      const audible = !ctrl.muted && (!anySoloActive || ctrl.solo);
      const vol = audible ? ctrl.volume : 0;
      ch.gain.gain.setTargetAtTime(vol, ch.gain.context.currentTime, 0.02);
    }
  }, [stemMix, anySoloActive]);

  // --- cleanup on unmount ---

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      for (const ch of channelsRef.current.values()) {
        if (ch.source) {
          try {
            ch.source.onended = null;
            ch.source.stop();
          } catch {
            /* already stopped */
          }
        }
      }
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);

  return { unlockContext };
}
