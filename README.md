# Sonic Blueprint

Frontend app for interactive track analysis and performance, now integrated with the `meta-mozart` stem-separation backend.

## Local development

### 1) Start backend

```bash
cd backend
cp .env.example .env
# set FAL_KEY in .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2) Start frontend

```bash
cp .env.example .env.local
npm install
npm run dev
```

The frontend uses `NEXT_PUBLIC_BACKEND_URL` from `.env.local` and defaults to `http://localhost:8000`.

## Deployment

- Frontend: deploy to Vercel.
- Backend: deploy FastAPI service to Railway/Render/Fly.io.
- Set `NEXT_PUBLIC_BACKEND_URL` in Vercel to your deployed backend URL.
- Set `BACKEND_CORS_ORIGINS` in backend env to include frontend production origin.
