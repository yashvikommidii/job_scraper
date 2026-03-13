from __future__ import annotations

import hashlib


def make_job_id(title: str, company: str, url: str) -> str:
    raw = f"{title.strip().lower()}|{company.strip().lower()}|{url.strip()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

