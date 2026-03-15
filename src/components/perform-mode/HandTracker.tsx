"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";

export interface HandGesture {
  landmarks: { x: number; y: number; z: number }[] | null;
  gesture: "open" | "fist" | "pinch" | "point" | "none";
  pinchDistance: number;
  palmY: number;
  spreadX: number;
}

const DEFAULT_GESTURE: HandGesture = {
  landmarks: null,
  gesture: "none",
  pinchDistance: 1,
  palmY: 0.5,
  spreadX: 0.5,
};

interface HandTrackerProps {
  active: boolean;
  onGesture: (g: HandGesture) => void;
  className?: string;
}

export default function HandTracker({
  active,
  onGesture,
  className = "",
}: HandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initHandLandmarker = useCallback(async () => {
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { HandLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handLandmarkerRef.current = landmarker;
    } catch (err) {
      console.error("HandLandmarker init failed:", err);
      setError("Failed to load hand tracking model");
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const classifyGesture = useCallback(
    (result: HandLandmarkerResult): HandGesture => {
      if (!result.landmarks || result.landmarks.length === 0) {
        return DEFAULT_GESTURE;
      }

      const lm = result.landmarks[0];

      const thumbTip = lm[4];
      const indexTip = lm[8];
      const middleTip = lm[12];
      const ringTip = lm[16];
      const pinkyTip = lm[20];
      const wrist = lm[0];
      const indexMcp = lm[5];
      const pinkyMcp = lm[17];

      // Pinch: thumb tip close to index tip
      const pinchDist = Math.hypot(
        thumbTip.x - indexTip.x,
        thumbTip.y - indexTip.y,
        thumbTip.z - indexTip.z
      );

      // Palm Y: average y of fingertips (0=top, 1=bottom)
      const palmY = (thumbTip.y + indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 5;

      // Spread: distance between index and pinky MCP
      const spreadX = Math.hypot(indexMcp.x - pinkyMcp.x, indexMcp.y - pinkyMcp.y);

      // Fist: all fingertips close to wrist
      const avgDist =
        [indexTip, middleTip, ringTip, pinkyTip].reduce(
          (sum, tip) => sum + Math.hypot(tip.x - wrist.x, tip.y - wrist.y),
          0
        ) / 4;
      const isFist = avgDist < 0.15;

      // Point: index extended, others curled
      const indexExt = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y) > 0.2;
      const othersCurled =
        [middleTip, ringTip, pinkyTip].every(
          (tip) => Math.hypot(tip.x - wrist.x, tip.y - wrist.y) < 0.18
        );
      const isPoint = indexExt && othersCurled;

      let gesture: HandGesture["gesture"] = "open";
      if (isFist) gesture = "fist";
      else if (pinchDist < 0.06) gesture = "pinch";
      else if (isPoint) gesture = "point";

      return {
        landmarks: lm.map((l) => ({ x: l.x, y: l.y, z: l.z })),
        gesture,
        pinchDistance: pinchDist,
        palmY,
        spreadX,
      };
    },
    []
  );

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const result = landmarker.detectForVideo(video, performance.now());
    const gesture = classifyGesture(result);
    onGesture(gesture);

    // Draw video feed + landmarks on canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        if (gesture.landmarks) {
          ctx.fillStyle = "#22C55E";
          for (const pt of gesture.landmarks) {
            const x = (1 - pt.x) * canvas.width;
            const y = pt.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [classifyGesture, onGesture]);

  useEffect(() => {
    if (active) {
      initHandLandmarker().then(() => startCamera());
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopCamera();
    };
  }, [active, initHandLandmarker, startCamera, stopCamera]);

  useEffect(() => {
    if (active && cameraReady && handLandmarkerRef.current) {
      rafRef.current = requestAnimationFrame(detect);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, cameraReady, detect]);

  if (!active) return null;

  return (
    <div
      className={`relative w-full aspect-[4/3] max-w-sm rounded-lg overflow-hidden border border-[var(--border)] bg-black ${className}`}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-sm text-[var(--destructive)] p-4 text-center">
          {error}
        </div>
      )}
      {!cameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-[var(--foreground-muted)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
