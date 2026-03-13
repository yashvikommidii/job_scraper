from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import SourceStatus
from ..scrapers import get_all_scrapers
from ..scrapers.scheduler import DEFAULT_SETTINGS, ScraperManager


router = APIRouter(prefix="/api/sources", tags=["sources"])


_MANAGER: ScraperManager | None = None


def init_manager(m: ScraperManager) -> None:
    global _MANAGER
    _MANAGER = m


def _manager() -> ScraperManager:
    if not _MANAGER:
        raise RuntimeError("Scraper manager not initialized")
    return _MANAGER


@router.get("", response_model=list[SourceStatus])
def list_sources(db: Session = Depends(get_db)):
    m = _manager()
    settings = m.get_settings(db)
    enabled = settings.get("enabled_sources") or DEFAULT_SETTINGS["enabled_sources"]

    out: list[SourceStatus] = []
    for key, scraper in get_all_scrapers().items():
        out.append(
            SourceStatus(
                key=key,
                name=scraper.name,
                enabled=bool(enabled.get(key, False)),
                type=scraper.kind,  # type: ignore[arg-type]
            )
        )
    return out

