from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import SettingsIn, SettingsOut
from ..scrapers.scheduler import DEFAULT_SETTINGS, ScraperManager


router = APIRouter(prefix="/api/settings", tags=["settings"])


_MANAGER: ScraperManager | None = None


def init_manager(m: ScraperManager) -> None:
    global _MANAGER
    _MANAGER = m


def _manager() -> ScraperManager:
    if not _MANAGER:
        raise RuntimeError("Scraper manager not initialized")
    return _MANAGER


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    m = _manager()
    data = m.get_settings(db)
    return SettingsOut(
        keywords=data.get("keywords") or DEFAULT_SETTINGS["keywords"],
        enabled_sources=data.get("enabled_sources") or DEFAULT_SETTINGS["enabled_sources"],
        location_preference=data.get("location_preference") or "All",
        experience_max_years=int(data.get("experience_max_years") or 3),
    )


@router.put("", response_model=SettingsOut)
def update_settings(payload: SettingsIn, db: Session = Depends(get_db)):
    m = _manager()
    current = m.get_settings(db)
    next_settings = {**current}
    if payload.keywords is not None:
        next_settings["keywords"] = [k.strip() for k in payload.keywords if k.strip()][:30]
    if payload.enabled_sources is not None:
        next_settings["enabled_sources"] = {**(current.get("enabled_sources") or {}), **payload.enabled_sources}
    if payload.location_preference is not None:
        next_settings["location_preference"] = payload.location_preference
    if payload.experience_max_years is not None:
        next_settings["experience_max_years"] = max(0, min(3, int(payload.experience_max_years)))

    m.set_settings(db, next_settings)
    return get_settings(db)

