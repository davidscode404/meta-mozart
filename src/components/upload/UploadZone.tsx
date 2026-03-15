"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileAudio, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrack, useTrackActions } from "@/hooks/useTrackStore";
import { ACCEPTED_FORMATS, MIN_CLIP_SECONDS, MAX_CLIP_SECONDS } from "@/lib/constants";

export default function UploadZone() {
  const { uploadState } = useTrack();
  const {
    setUploadState,
    setFileName,
    setAudioUrl,
    setFile,
    setStemUrls,
    setSeparationReport,
  } = useTrackActions();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_FORMATS.includes(ext)) {
        setError(
          `Unsupported format. Accepted: ${ACCEPTED_FORMATS.join(", ")}`
        );
        return;
      }

      const url = URL.createObjectURL(file);
      setFile(file);
      setAudioUrl(url);
      setFileName(file.name);
      setStemUrls(null);
      setSeparationReport(null);
      setUploadState("uploading");

      setTimeout(() => setUploadState("analyzing"), 800);
    },
    [
      setAudioUrl,
      setFile,
      setFileName,
      setSeparationReport,
      setStemUrls,
      setUploadState,
    ]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (uploadState !== "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center min-h-[70vh] px-4"
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload audio file"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`
            relative flex flex-col items-center justify-center gap-6
            w-full max-w-lg min-h-[280px] p-12
            rounded-lg border-2 border-dashed cursor-pointer
            transition-all duration-300
            ${
              dragOver
                ? "border-[var(--secondary)] bg-[var(--secondary)]/10 scale-[1.02]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)]"
            }
          `}
        >
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-colors duration-300
              ${dragOver ? "bg-[var(--secondary)]/20" : "bg-[var(--surface)]"}
            `}
          >
            {dragOver ? (
              <FileAudio className="w-8 h-8 text-[var(--secondary)]" />
            ) : (
              <Upload className="w-8 h-8 text-[var(--foreground-muted)]" />
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {dragOver ? "Drop your track" : "Upload audio"}
            </p>
            <p className="text-sm text-[var(--foreground-muted)]">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-[var(--foreground-muted)] font-mono">
              {ACCEPTED_FORMATS.join("  ")} &middot; {MIN_CLIP_SECONDS}s–
              {MAX_CLIP_SECONDS}s
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 text-sm text-[var(--destructive)]"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FORMATS.join(",")}
            onChange={onChange}
            className="hidden"
            aria-label="Choose audio file"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
