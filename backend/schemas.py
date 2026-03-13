from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class JobOut(BaseModel):
    id: str
    title: str
    company: str
    company_domain: str | None = None
    location: str | None = None
    is_remote: bool = False
    salary_min: float | None = None
    salary_max: float | None = None
    currency: str | None = None
    experience_req: str | None = None
    job_type: str | None = None
    posted_date: datetime | None = None
    scraped_at: datetime
    source: str
    url: str
    description: str | None = None
    skills: list[str] = Field(default_factory=list)
    category: str | None = None


class JobsPage(BaseModel):
    items: list[JobOut]
    page: int
    limit: int
    total: int


class ScraperStatus(BaseModel):
    running: bool
    last_run_at: datetime | None
    next_run_at: datetime | None
    last_run_summary: dict[str, Any] | None = None


class SourceStatus(BaseModel):
    key: str
    name: str
    enabled: bool
    type: Literal["requests", "selenium", "api"]


class SettingsIn(BaseModel):
    keywords: list[str] | None = None
    enabled_sources: dict[str, bool] | None = None
    location_preference: str | None = None
    experience_max_years: int | None = None


class SettingsOut(BaseModel):
    keywords: list[str]
    enabled_sources: dict[str, bool]
    location_preference: str
    experience_max_years: int


class StatsOut(BaseModel):
    total_jobs_all_time: int
    jobs_last_24h: int
    top_hiring_company: str | None
    most_in_demand_skill: str | None
    jobs_by_category: list[dict[str, Any]]
    jobs_posted_last_7d: list[dict[str, Any]]
    jobs_by_source: list[dict[str, Any]]
    top_skills: list[dict[str, Any]]
    jobs_by_location: list[dict[str, Any]]
    remote_breakdown: list[dict[str, Any]]
    salary_histogram: list[dict[str, Any]]
    top_companies: list[dict[str, Any]]

