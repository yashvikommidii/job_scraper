from __future__ import annotations

import queue
import threading
from typing import Iterable

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ScraperStatus
from ..scrapers.scheduler import ScraperManager


router = APIRouter(prefix="/api/scraper", tags=["scraper"])


def _sse(lines: Iterable[str]):
    for line in lines:
        yield f"data: {line.rstrip()}\n\n"


@router.get("/status", response_model=ScraperStatus)
def status():
    m = _manager()
    return ScraperStatus(
        running=m.running,
        last_run_at=m.last_run_at,
        next_run_at=m.next_run_at,
        last_run_summary=m.last_run_summary,
    )


@router.post("/run")
def run_scrape(db: Session = Depends(get_db)):
    """
    Streams progress as Server-Sent Events.

    Note: EventSource only supports GET in browsers; the frontend uses fetch streaming.
    """
    m = _manager()

    def gen():
        q: queue.Queue[str | None] = queue.Queue()

        def cb(msg: str) -> None:
            for part in msg.splitlines(True):
                q.put(part)

        def worker():
            try:
                m.scrape_all(progress_cb=cb)
            finally:
                q.put(None)

        yield from _sse(["Starting...\n"])
        t = threading.Thread(target=worker, daemon=True)
        t.start()

        while True:
            item = q.get()
            if item is None:
                break
            yield from _sse([item])
        yield from _sse(["Done.\n"])

    return StreamingResponse(gen(), media_type="text/event-stream")


_SCRAPER_MANAGER: ScraperManager | None = None


def init_manager(m: ScraperManager) -> None:
    global _SCRAPER_MANAGER
    _SCRAPER_MANAGER = m


def _manager() -> ScraperManager:
    if not _SCRAPER_MANAGER:
        raise RuntimeError("Scraper manager not initialized")
    return _SCRAPER_MANAGER

