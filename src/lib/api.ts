import type { AnalyzeResponse, SeparateResponse } from "@/lib/types";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export function stemProxyUrl(stemName: string, cacheBust?: string): string {
  const cb = cacheBust ?? String(Date.now());
  return `${BACKEND_BASE_URL}/proxy-stem/${encodeURIComponent(stemName)}?v=${cb}`;
}

export async function separateAudio(
  file: File,
  options?: { signal?: AbortSignal }
): Promise<SeparateResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_BASE_URL}/separate`, {
    method: "POST",
    body: formData,
    signal: options?.signal,
  });

  if (!response.ok) {
    let detail = `Separation failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // Keep default detail when response body is not JSON.
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as SeparateResponse;

  const cacheBust = String(Date.now());
  const proxiedStems: Record<string, string> = {};
  for (const stemName of Object.keys(data.stems)) {
    proxiedStems[stemName] = stemProxyUrl(stemName, cacheBust);
  }

  return { ...data, stems: proxiedStems };
}

export async function analyzeAudio(
  file: File,
  options?: { signal?: AbortSignal }
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
    signal: options?.signal,
  });

  if (!response.ok) {
    let detail = `Analysis failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // fallback
    }
    throw new Error(detail);
  }

  return (await response.json()) as AnalyzeResponse;
}
