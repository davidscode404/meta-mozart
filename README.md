# Sonic Blueprint

Frontend app for interactive track analysis and performance, integrated with the meta-mozart stem-separation backend.

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

### Frontend (Vercel)

1. Push to GitHub.
2. Import repo in [vercel.com](https://vercel.com).
3. Set env var `NEXT_PUBLIC_BACKEND_URL` to your deployed backend URL.
4. Deploy.

### Backend (Render)

1. Go to [render.com/new](https://render.com/new) and select **Blueprint**.
2. Connect this GitHub repo. Render reads `render.yaml` and creates the service.
3. Set env vars in Render dashboard:
   - `FAL_KEY` - your fal.ai API key
   - `BACKEND_CORS_ORIGINS` - your Vercel frontend URL
4. Deploy. Copy the Render URL and set it as `NEXT_PUBLIC_BACKEND_URL` in Vercel.
