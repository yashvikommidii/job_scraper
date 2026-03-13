from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import engine
from .models import Base
from .routes import jobs, scraper, settings, skills, sources, stats
from .scrapers.scheduler import ScraperManager


load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobRadar AI", version="0.1.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(stats.router)
app.include_router(scraper.router)
app.include_router(sources.router)
app.include_router(settings.router)
app.include_router(skills.router)


@app.get("/api/health")
def health():
    return {"ok": True}


_manager = ScraperManager()
scraper.init_manager(_manager)
sources.init_manager(_manager)
settings.init_manager(_manager)


@app.on_event("startup")
def _startup():
    _manager.start()


def _mount_frontend():
    static_dir = Path(__file__).parent / "static"
    index_html = static_dir / "index.html"
    assets_dir = static_dir / "assets"
    if index_html.exists() and assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/{full_path:path}")
        def spa_fallback(full_path: str):
            # Serve the built React app for all non-API routes.
            if full_path.startswith("api/"):
                from fastapi import HTTPException

                raise HTTPException(status_code=404, detail="Not found")
            if index_html.exists():
                return FileResponse(str(index_html))
            return {"detail": "Frontend not built"}


_mount_frontend()

