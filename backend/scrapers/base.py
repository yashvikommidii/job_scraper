from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class ScrapeJob:
    id: str
    title: str
    company: str
    url: str
    source: str
    scraped_at: datetime
    location: str | None = None
    is_remote: bool = False
    description: str | None = None
    posted_date: datetime | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    currency: str | None = None
    job_type: str | None = None
    experience_req: str | None = None
    skills: list[str] | None = None
    category: str | None = None
    company_domain: str | None = None

    def to_orm_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "company_domain": self.company_domain,
            "location": self.location,
            "is_remote": self.is_remote,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "currency": self.currency,
            "experience_req": self.experience_req,
            "job_type": self.job_type,
            "posted_date": self.posted_date,
            "scraped_at": self.scraped_at,
            "source": self.source,
            "url": self.url,
            "description": self.description,
            "skills": __import__("json").dumps(self.skills or []),
            "category": self.category,
            "is_active": True,
        }


class BaseScraper(ABC):
    key: str
    name: str
    kind: str  # requests|selenium|api

    @abstractmethod
    def scrape(self, *, keywords: list[str], hours: int = 24) -> list[ScrapeJob]:
        raise NotImplementedError

