from __future__ import annotations

import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Job
from ..schemas import JobOut, JobsPage


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("", response_model=JobsPage)
def list_jobs(
    q: str | None = None,
    category: str | None = None,
    source: str | None = Query(default=None),
    location: str | None = None,
    job_type: str | None = None,
    skills: str | None = None,  # comma-separated
    hours: int = Query(default=24, ge=1, le=168),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="newest"),
    db: Session = Depends(get_db),
):
    stmt = select(Job).where(Job.is_active.is_(True))

    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Job.title.ilike(like),
                Job.company.ilike(like),
                Job.description.ilike(like),
                Job.skills.ilike(like),
            )
        )

    if category and category != "all":
        stmt = stmt.where(Job.category == category)

    if source:
        sources = [s.strip() for s in source.split(",") if s.strip()]
        if sources:
            stmt = stmt.where(Job.source.in_(sources))

    if location and location.lower() != "all":
        if location.lower() == "remote":
            stmt = stmt.where(Job.is_remote.is_(True))
        else:
            stmt = stmt.where(Job.location.ilike(f"%{location}%"))

    if job_type and job_type != "all":
        stmt = stmt.where(Job.job_type == job_type)

    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        for s in skill_list:
            stmt = stmt.where(Job.skills.ilike(f"%{s}%"))

    cutoff = datetime.utcnow() - timedelta(hours=hours)
    stmt = stmt.where(func.coalesce(Job.posted_date, Job.scraped_at) >= cutoff)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    if sort == "salary_desc":
        stmt = stmt.order_by(desc(Job.salary_max).nullslast(), desc(Job.posted_date).nullslast(), desc(Job.scraped_at))
    else:
        stmt = stmt.order_by(desc(Job.posted_date).nullslast(), desc(Job.scraped_at))

    stmt = stmt.offset((page - 1) * limit).limit(limit)
    rows = db.scalars(stmt).all()

    items: list[JobOut] = []
    for r in rows:
        try:
            skills_list = json.loads(r.skills or "[]")
        except Exception:
            skills_list = []
        items.append(
            JobOut(
                id=r.id,
                title=r.title,
                company=r.company,
                company_domain=r.company_domain,
                location=r.location,
                is_remote=bool(r.is_remote),
                salary_min=r.salary_min,
                salary_max=r.salary_max,
                currency=r.currency,
                experience_req=r.experience_req,
                job_type=r.job_type,
                posted_date=r.posted_date,
                scraped_at=r.scraped_at,
                source=r.source,
                url=r.url,
                description=r.description,
                skills=skills_list,
                category=r.category,
            )
        )

    return JobsPage(items=items, page=page, limit=limit, total=total)


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    r = db.get(Job, job_id)
    if not r:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Job not found")
    try:
        skills_list = json.loads(r.skills or "[]")
    except Exception:
        skills_list = []
    return JobOut(
        id=r.id,
        title=r.title,
        company=r.company,
        company_domain=r.company_domain,
        location=r.location,
        is_remote=bool(r.is_remote),
        salary_min=r.salary_min,
        salary_max=r.salary_max,
        currency=r.currency,
        experience_req=r.experience_req,
        job_type=r.job_type,
        posted_date=r.posted_date,
        scraped_at=r.scraped_at,
        source=r.source,
        url=r.url,
        description=r.description,
        skills=skills_list,
        category=r.category,
    )

