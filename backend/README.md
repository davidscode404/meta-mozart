# meta-mozart backend

FastAPI backend for stem separation using fal.ai Demucs and audio analysis using librosa.

## Run locally

1. Create and activate a Python environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Configure environment variables:
   - `cp .env.example .env`
   - set `FAL_KEY` in `.env`
4. Start the API:
   - `uvicorn main:app --reload --port 8000`

## Deploy to Render

1. Push this repo to GitHub.
2. Go to [render.com/new](https://render.com/new), select **Blueprint**, and connect this repo.
3. Render reads `render.yaml` from the repo root and creates the service.
4. In Render dashboard, set environment variables:
   - `FAL_KEY` - your fal.ai API key
   - `BACKEND_CORS_ORIGINS` - your Vercel frontend URL (e.g. `https://frontend-xxx.vercel.app`)
5. Deploy. The backend will be available at `https://meta-mozart-backend.onrender.com` (or similar).

Then set `NEXT_PUBLIC_BACKEND_URL` in Vercel to the Render URL.

## Environment variables

- `FAL_KEY`: fal.ai API key (required)
- `BACKEND_CORS_ORIGINS`: comma-separated origins allowed by CORS
  - default: `http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001`

## Endpoints

- `GET /health`
- `POST /separate` - stem separation via fal.ai Demucs
- `POST /analyze` - tempo/key/duration/energy extraction via librosa
- `GET /proxy-stem/{stem_name}` - proxy separated stem audio
