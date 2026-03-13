from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

from ..utils.deduplicator import make_job_id
from ..utils.keyword_extractor import classify_category, extract_skills
from .base import BaseScraper, ScrapeJob


class RemoteOKScraper(BaseScraper):
    key = "remoteok"
    name = "RemoteOK"
    kind = "api"

    # Official API lives on remoteok.io; remoteok.com/api often returns 403.
    API_URL = "https://remoteok.io/api"

    def scrape(self, *, keywords: list[str], hours: int = 24) -> list[ScrapeJob]:
        # RemoteOK returns a list; first entry is metadata.
        timeout = 20
        headers = {
            "User-Agent": random.choice(_USER_AGENTS),
            "Accept": "application/json,text/plain,*/*",
        }
        r = requests.get(self.API_URL, headers=headers, timeout=timeout)
        r.raise_for_status()
        data: list[dict[str, Any]] = r.json()
        jobs = [x for x in data if isinstance(x, dict) and "position" in x]

        # Their free API is delayed by 24h; we do not hard-filter by time here
        # to avoid dropping everything. The dashboard still shows "posted time"
        # based on RemoteOK's date field.
        out: list[ScrapeJob] = []
        kw_lower = [k.lower() for k in (keywords or [])]

        for j in jobs:
            title = (j.get("position") or "").strip()
            company = (j.get("company") or "").strip() or "Unknown"
            url = (j.get("url") or "").strip()
            if not title or not url:
                continue

            desc = (j.get("description") or "").strip()
            if kw_lower:
                hay = f"{title}\n{company}\n{desc}".lower()
                if not any(k in hay for k in kw_lower):
                    continue

            date_str = j.get("date")
            posted_date = None
            if isinstance(date_str, str):
                try:
                    posted_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                except Exception:
                    posted_date = None

            location = "Remote"
            is_remote = True

            tags = j.get("tags") or []
            if isinstance(tags, list):
                tag_text = " ".join(str(t) for t in tags)
            else:
                tag_text = ""

            skills = extract_skills(f"{desc}\n{tag_text}")
            category = classify_category(title)

            out.append(
                ScrapeJob(
                    id=make_job_id(title, company, url),
                    title=title,
                    company=company,
                    url=url,
                    source=self.key,
                    scraped_at=datetime.utcnow(),
                    location=location,
                    is_remote=is_remote,
                    description=desc[:4000] if desc else None,
                    posted_date=posted_date,
                    skills=skills,
                    category=category,
                    company_domain=_guess_domain(j),
                )
            )

        return out


def _guess_domain(j: dict[str, Any]) -> str | None:
    # RemoteOK sometimes provides company_logo, but not domain; we keep null.
    return None


_USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
]

