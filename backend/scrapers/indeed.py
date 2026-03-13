from __future__ import annotations

import random
import re
import time
from datetime import datetime
from urllib.parse import quote_plus, urljoin

import requests
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential

from ..utils.deduplicator import make_job_id
from ..utils.keyword_extractor import classify_category, extract_skills
from .base import BaseScraper, ScrapeJob


class IndeedScraper(BaseScraper):
    key = "indeed"
    name = "Indeed"
    kind = "requests"

    BASE = "https://www.indeed.com"

    def scrape(self, *, keywords: list[str], hours: int = 24) -> list[ScrapeJob]:
        # Indeed HTML changes often; this is a best-effort scraper and fails gracefully.
        queries = keywords or [
            "data analyst",
            "data scientist",
            "machine learning engineer",
            "ai engineer",
            "mlops",
        ]
        out: list[ScrapeJob] = []
        for q in queries[:6]:
            time.sleep(random.uniform(2, 5))
            try:
                out.extend(self._scrape_query(q=q, hours=hours))
            except Exception:
                continue
        return out

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def _scrape_query(self, *, q: str, hours: int) -> list[ScrapeJob]:
        params = {
            "q": q,
            "fromage": "1" if hours <= 24 else "3",
            "explvl": "entry_level",
        }
        url = f"{self.BASE}/jobs?q={quote_plus(params['q'])}&fromage={params['fromage']}&explvl={params['explvl']}"
        headers = {"User-Agent": random.choice(_USER_AGENTS), "Accept-Language": "en-US,en;q=0.9"}
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        cards = soup.select("[data-jk]") or soup.select("a.tapItem")
        out: list[ScrapeJob] = []
        for card in cards[:40]:
            jk = card.get("data-jk") or card.get("data-jk".upper())
            link = None
            if card.name == "a" and card.get("href"):
                link = card.get("href")
            else:
                a = card.select_one("a[href]")
                link = a.get("href") if a else None
            if not link:
                continue

            job_url = urljoin(self.BASE, link)

            title_el = card.select_one("h2.jobTitle") or card.select_one("[data-testid='jobTitle']") or card.select_one("h2")
            title = (title_el.get_text(" ", strip=True) if title_el else "").replace("new", "").strip()
            if not title:
                continue

            company_el = card.select_one("[data-testid='company-name']") or card.select_one("span.companyName")
            company = company_el.get_text(" ", strip=True) if company_el else "Unknown"

            loc_el = card.select_one("[data-testid='text-location']") or card.select_one("div.companyLocation")
            location = loc_el.get_text(" ", strip=True) if loc_el else None
            is_remote = bool(location and re.search(r"remote", location, re.I))

            sal_el = card.select_one("[data-testid='salary-snippet']") or card.select_one("div.salary-snippet")
            salary_text = sal_el.get_text(" ", strip=True) if sal_el else None
            smin, smax, cur = _parse_salary(salary_text)

            snippet_el = card.select_one("div.job-snippet") or card.select_one("[data-testid='job-snippet']")
            snippet = snippet_el.get_text(" ", strip=True) if snippet_el else None

            skills = extract_skills(snippet)
            category = classify_category(title)

            out.append(
                ScrapeJob(
                    id=make_job_id(title, company, job_url),
                    title=title,
                    company=company,
                    url=job_url,
                    source=self.key,
                    scraped_at=datetime.utcnow(),
                    location=location,
                    is_remote=is_remote,
                    description=snippet,
                    salary_min=smin,
                    salary_max=smax,
                    currency=cur,
                    skills=skills,
                    category=category,
                )
            )
        return out


def _parse_salary(text: str | None) -> tuple[float | None, float | None, str | None]:
    if not text:
        return None, None, None
    cur = "$" if "$" in text else None
    nums = re.findall(r"[\d,.]+", text)
    vals: list[float] = []
    for n in nums[:2]:
        try:
            vals.append(float(n.replace(",", "")))
        except Exception:
            pass
    if not vals:
        return None, None, cur
    if len(vals) == 1:
        return vals[0], vals[0], cur
    return min(vals), max(vals), cur


_USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
]

