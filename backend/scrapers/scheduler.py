from __future__ import annotations

import json
import os
import threading
from collections.abc import Callable, Iterable
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Job, ScrapeRun, Setting
from . import get_all_scrapers


DEFAULT_SETTINGS = {
    "keywords": [
        "data analyst",
        "data scientist",
        "machine learning engineer",
        "ai engineer",
        "mlops",
        "nlp engineer",
        "computer vision engineer",
    ],
    "enabled_sources": {
        "remoteok": True,
        "indeed": True,
    },
    "location_preference": "All",
    "experience_max_years": 3,
}


class ScraperManager:
    def __init__(self) -> None:
        self.scheduler = BackgroundScheduler(timezone=str(timezone.utc))
        self._lock = threading.Lock()
        self.running = False
        self.last_run_at: datetime | None = None
        self.next_run_at: datetime | None = None
        self.last_run_summary: dict | None = None

    def start(self) -> None:
        interval_hours = int(os.getenv("SCRAPE_INTERVAL_HOURS", "6"))
        self.scheduler.add_job(
            func=self.scrape_all,
            trigger=IntervalTrigger(hours=interval_hours),
            id="scrape_all",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        self.scheduler.start()
        self._refresh_next_run()

        # Kick off one initial scrape in background.
        t = threading.Thread(target=self.scrape_all, daemon=True)
        t.start()

    def _refresh_next_run(self) -> None:
        job = self.scheduler.get_job("scrape_all")
        self.next_run_at = job.next_run_time if job else None

    def get_settings(self, db: Session) -> dict:
        row = db.get(Setting, "scraper_settings")
        if not row or not row.value_json:
            return DEFAULT_SETTINGS.copy()
        try:
            data = json.loads(row.value_json)
            merged = DEFAULT_SETTINGS.copy()
            merged.update({k: v for k, v in data.items() if v is not None})
            merged["enabled_sources"] = {
                **DEFAULT_SETTINGS["enabled_sources"],
                **(merged.get("enabled_sources") or {}),
            }
            return merged
        except Exception:
            return DEFAULT_SETTINGS.copy()

    def set_settings(self, db: Session, settings: dict) -> dict:
        existing = db.get(Setting, "scraper_settings")
        payload = json.dumps(settings)
        if existing:
            existing.value_json = payload
            existing.updated_at = datetime.utcnow()
        else:
            db.add(Setting(key="scraper_settings", value_json=payload))
        db.commit()
        return settings

    def scrape_all(
        self,
        *,
        progress_cb: Callable[[str], None] | None = None,
    ) -> dict:
        with self._lock:
            if self.running:
                return {"ok": False, "message": "Scraper already running"}
            self.running = True

        started = datetime.utcnow()
        summary: dict = {"started_at": started.isoformat(), "sources": {}}

        def emit(msg: str) -> None:
            if progress_cb:
                progress_cb(msg)

        emit("Starting scrape run...\n")

        try:
            with SessionLocal() as db:
                settings = self.get_settings(db)
                keywords: list[str] = settings.get("keywords") or DEFAULT_SETTINGS["keywords"]
                enabled_sources: dict[str, bool] = settings.get("enabled_sources") or {}

                scrapers = get_all_scrapers()
                for key, scraper in scrapers.items():
                    if not enabled_sources.get(key, False):
                        emit(f"[skip] {scraper.name}\n")
                        continue

                    run = ScrapeRun(source=key, status="running", started_at=datetime.utcnow())
                    db.add(run)
                    db.commit()

                    emit(f"[run] {scraper.name}...\n")
                    jobs_found = 0
                    jobs_new = 0
                    try:
                        scraped = scraper.scrape(keywords=keywords, hours=24)
                        jobs_found = len(scraped)
                        jobs_new = _upsert_jobs(db, scraped)
                        run.status = "success"
                        run.jobs_found = jobs_found
                        run.jobs_new = jobs_new
                        emit(f"[ok]  {scraper.name}: found {jobs_found}, new {jobs_new}\n")
                    except Exception as e:
                        run.status = "failed"
                        run.error_message = str(e)[:2000]
                        emit(f"[err] {scraper.name}: {e}\n")
                    finally:
                        run.finished_at = datetime.utcnow()
                        db.commit()

                    summary["sources"][key] = {
                        "found": jobs_found,
                        "new": jobs_new,
                        "status": run.status,
                    }

            summary["ok"] = True
            self.last_run_at = datetime.utcnow()
            self.last_run_summary = summary
            emit("Scrape run complete.\n")
            return summary
        finally:
            with self._lock:
                self.running = False
            self._refresh_next_run()


def _upsert_jobs(db: Session, scraped_jobs: Iterable) -> int:
    new_count = 0
    for sj in scraped_jobs:
        existing = db.get(Job, sj.id)
        if existing:
            # Keep freshest scrape timestamp and mark active.
            existing.scraped_at = sj.scraped_at
            existing.is_active = True
            continue
        db.add(Job(**sj.to_orm_dict()))
        new_count += 1
    db.commit()
    return new_count

