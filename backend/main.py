import io
import os
import wave
import tempfile
import requests
import numpy as np
import fal_client
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

BASE_DIR = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE_DIR, ".env"))


def _parse_cors_origins() -> list[str]:
    raw = os.getenv(
        "BACKEND_CORS_ORIGINS",
        ",".join(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ]
        ),
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

app = FastAPI(
    title="Audio Stem Separator",
    description="Separates audio files into individual stems using fal.ai Demucs.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_FORMATS = {
    "audio/wav", "audio/x-wav",
    "audio/mpeg", "audio/mp3",
    "audio/flac", "audio/x-flac",
    "audio/ogg", "audio/aac",
}


def is_silent(audio_bytes: bytes, threshold: float = 0.01) -> bool:
    """Return True if the WAV audio is below the silence threshold."""
    with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
        frames = wf.readframes(wf.getnframes())
        audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32)
        audio /= 32768.0
        return np.abs(audio).mean() < threshold


@app.post("/separate", summary="Separate audio into stems")
async def separate_audio(
    file: UploadFile = File(..., description="Audio file to separate"),
    model: str = "htdemucs_6s",
    shifts: int = 1,
    overlap: float = 0.25,
) -> JSONResponse:
    """
    Upload an audio file and receive URLs for each separated stem.

    - **file**: Audio file (WAV, MP3, FLAC, OGG, AAC)
    - **model**: Demucs model to use (`htdemucs`, `htdemucs_6s`, `mdx_extra`, etc.)
    - **shifts**: Number of random shifts for equivariant stabilisation (higher = slower but better)
    - **overlap**: Overlap between split segments (0.0–1.0)
    """
    if file.content_type not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported media type '{file.content_type}'. "
                f"Accepted formats: {', '.join(SUPPORTED_FORMATS)}"
            ),
        )

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Write to a temp file so fal_client can upload it
    suffix = os.path.splitext(file.filename or "audio")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        audio_url = fal_client.upload_file(tmp_path)
    finally:
        os.remove(tmp_path)

    # Submit the Demucs job
    handler = fal_client.submit(
        "fal-ai/demucs",
        arguments={
            "audio_url": audio_url,
            "model": model,
            "stems": None,
            "shifts": shifts,
            "overlap": overlap,
            "output_format": "wav",
        },
    )

    result = fal_client.result("fal-ai/demucs", handler.request_id)

    stems: dict[str, str] = {}
    skipped: list[str] = []

    for stem_name, stem_data in result.items():
        url = stem_data["url"]
        response = requests.get(url)
        response.raise_for_status()

        if is_silent(response.content):
            skipped.append(stem_name)
        else:
            stems[stem_name] = url

    _stem_cache.clear()
    _stem_cache.update(stems)

    return JSONResponse(
        content={
            "stems": stems,
            "skipped_silent": skipped,
            "model": model,
            "source_file": file.filename,
        }
    )


_stem_cache: dict[str, str] = {}


@app.get("/proxy-stem/{stem_name}", summary="Proxy a separated stem audio file")
def proxy_stem(stem_name: str):
    """Stream a previously separated stem. Avoids cross-origin issues with
    fal.ai CDN URLs and lets the browser cache from our own origin."""
    url = _stem_cache.get(stem_name)
    if not url:
        raise HTTPException(status_code=404, detail=f"Stem '{stem_name}' not found in cache.")
    resp = requests.get(url, stream=True)
    resp.raise_for_status()
    from starlette.responses import StreamingResponse

    return StreamingResponse(
        resp.iter_content(chunk_size=64 * 1024),
        media_type=resp.headers.get("content-type", "audio/wav"),
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    )


@app.post("/analyze", summary="Analyze audio features")
async def analyze_audio(
    file: UploadFile = File(..., description="Audio file to analyze"),
) -> JSONResponse:
    """Extract tempo, key, duration, and energy from an audio file using librosa."""
    import librosa

    if file.content_type not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}'.",
        )

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    suffix = os.path.splitext(file.filename or "audio")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        y, sr = librosa.load(tmp_path, sr=None, mono=True)
    finally:
        os.remove(tmp_path)

    duration = float(librosa.get_duration(y=y, sr=sr))

    tempo_arr = librosa.beat.tempo(y=y, sr=sr)
    tempo = float(tempo_arr[0]) if len(tempo_arr) > 0 else 120.0

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    key_idx = int(np.argmax(np.mean(chroma, axis=1)))
    key_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    key_name = key_names[key_idx]

    minor_energy = float(np.mean(chroma[(key_idx + 3) % 12]))
    major_energy = float(np.mean(chroma[(key_idx + 4) % 12]))
    mode = "minor" if minor_energy > major_energy else "major"

    rms = librosa.feature.rms(y=y)
    energy = float(np.clip(np.mean(rms) * 5, 0, 1))

    return JSONResponse(
        content={
            "tempo": round(tempo, 1),
            "key": f"{key_name} {mode}",
            "time_signature": "4/4",
            "duration": round(duration, 2),
            "energy": round(energy, 3),
        }
    )


@app.get("/health", summary="Health check")
def health() -> dict:
    return {"status": "ok"}