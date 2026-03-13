from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Job
from ..schemas import StatsOut


router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    cutoff_24h = now - timedelta(hours=24)
    cutoff_7d = now - timedelta(days=7)

    total_jobs = db.scalar(select(func.count()).select_from(Job)) or 0
    jobs_24h = (
        db.scalar(
            select(func.count())
            .select_from(Job)
            .where((Job.posted_date.is_(None) & (Job.scraped_at >= cutoff_24h)) | (Job.posted_date >= cutoff_24h))
        )
        or 0
    )

    top_company = db.execute(
        select(Job.company, func.count().label("c")).group_by(Job.company).order_by(desc("c")).limit(1)
    ).first()
    top_company_name = top_company[0] if top_company else None

    recent = db.scalars(select(Job).where(Job.scraped_at >= cutoff_7d).limit(5000)).all()
    skill_counter: Counter[str] = Counter()
    loc_counter: Counter[str] = Counter()
    src_counter: Counter[str] = Counter()
    cat_counter: Counter[str] = Counter()
    remote_counter: Counter[str] = Counter()
    salary_vals: list[float] = []
    company_counter: Counter[str] = Counter()

    by_day: Counter[str] = Counter()
    for j in recent:
        src_counter[j.source] += 1
        cat_counter[j.category or "other"] += 1
        company_counter[j.company] += 1

        loc = j.location or ("Remote" if j.is_remote else "Unknown")
        loc_counter[loc] += 1

        if j.is_remote:
            remote_counter["remote"] += 1
        else:
            remote_counter["on_site"] += 1

        d = (j.posted_date or j.scraped_at) or now
        day = d.date().isoformat()
        if d >= cutoff_7d:
            by_day[day] += 1

        try:
            skills = json.loads(j.skills or "[]")
        except Exception:
            skills = []
        for s in skills:
            if isinstance(s, str) and s:
                skill_counter[s.lower()] += 1

        if j.salary_min:
            salary_vals.append(float(j.salary_min))
        if j.salary_max and j.salary_max != j.salary_min:
            salary_vals.append(float(j.salary_max))

    most_skill = skill_counter.most_common(1)
    most_skill_name = most_skill[0][0] if most_skill else None

    jobs_by_category = [{"name": k, "value": v} for k, v in cat_counter.most_common()]
    jobs_by_source = [{"name": k, "value": v} for k, v in src_counter.most_common()]
    top_skills = [{"name": k, "value": v} for k, v in skill_counter.most_common(15)]
    jobs_by_location = [{"name": k, "value": v} for k, v in loc_counter.most_common(25)]
    remote_breakdown = [{"name": k, "value": v} for k, v in remote_counter.most_common()]
    top_companies = [{"name": k, "value": v} for k, v in company_counter.most_common(10)]

    # 7d trend with zero-filled dates
    days = [(now.date() - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
    jobs_posted_last_7d = [{"date": d, "value": by_day.get(d, 0)} for d in days]

    salary_histogram = _histogram(salary_vals, bins=10)

    return StatsOut(
        total_jobs_all_time=total_jobs,
        jobs_last_24h=jobs_24h,
        top_hiring_company=top_company_name,
        most_in_demand_skill=most_skill_name,
        jobs_by_category=jobs_by_category,
        jobs_posted_last_7d=jobs_posted_last_7d,
        jobs_by_source=jobs_by_source,
        top_skills=top_skills,
        jobs_by_location=jobs_by_location,
        remote_breakdown=remote_breakdown,
        salary_histogram=salary_histogram,
        top_companies=top_companies,
    )


def _histogram(values: list[float], bins: int = 10) -> list[dict]:
    vals = [v for v in values if v is not None and v >= 0]
    if len(vals) < 5:
        return []
    lo = min(vals)
    hi = max(vals)
    if hi <= lo:
        return [{"bin": f"{lo:.0f}", "value": len(vals)}]
    step = (hi - lo) / bins
    counts = [0] * bins
    for v in vals:
        idx = int((v - lo) / step)
        if idx == bins:
            idx -= 1
        counts[idx] += 1
    out = []
    for i, c in enumerate(counts):
        a = lo + i * step
        b = a + step
        out.append({"bin": f"{a:.0f}-{b:.0f}", "value": c})
    return out

