# meta-mozart backend

FastAPI backend for stem separation using fal.ai Demucs.

## Run locally

1. Create and activate a Python environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Configure environment variables:
   - `cp .env.example .env`
   - set `FAL_KEY` in `.env`
4. Start the API:
   - `uvicorn main:app --reload --port 8000`

## Environment variables

- `FAL_KEY`: fal.ai API key (required)
- `BACKEND_CORS_ORIGINS`: comma-separated origins allowed by CORS
  - default: `http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001`

## Endpoints

- `GET /health`
- `POST /separate`