# JobRadar AI — Job Scraper Dashboard

Full-stack dashboard that scrapes **early-career (0–3 years)** roles across **Data Analytics, Data Science, AI Engineering, and Machine Learning** and displays them in a sleek UI.

## Features
- **FastAPI** backend (REST) + serves built React frontend in production
- **APScheduler** background scraping every 6 hours (configurable)
- **SQLite (dev)** / **PostgreSQL (Render)** via `DATABASE_URL`
- Scrapers included:
  - **RemoteOK** (public JSON API)
  - **Indeed** (requests + BeautifulSoup; best-effort)
- **React 18 + Vite** frontend with Tailwind, Recharts, React Query, Axios
- **Saved jobs** stored in `localStorage`
- **Manual “Scrape Now”** with live **SSE progress log**

## One-click Deploy to Render
- **Render blueprint**: `render.yaml`
- **Docker**: multi-stage build (frontend → backend)

After you push this repo to GitHub, you can deploy via Render’s “Deploy from blueprint” flow.

If you want a single-click button, replace `<YOUR_GITHUB_REPO_URL>` below:

`https://render.com/deploy?repo=<YOUR_GITHUB_REPO_URL>`

## Local development

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api/*` to `http://localhost:8000`.

## Docker (production-like)
```bash
docker build -t job-radar .
docker run -p 8000:8000 --env PORT=8000 job-radar
```
Then open `http://localhost:8000`.

## Environment variables
See `.env.example`.

