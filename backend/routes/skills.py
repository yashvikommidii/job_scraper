from __future__ import annotations

import json
from collections import Counter

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Job


router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("")
def list_skills(limit: int = Query(default=200, ge=1, le=1000), db: Session = Depends(get_db)):
    rows = db.scalars(select(Job.skills).where(Job.skills.is_not(None)).limit(10000)).all()
    c: Counter[str] = Counter()
    for s in rows:
        try:
            arr = json.loads(s or "[]")
        except Exception:
            arr = []
        for item in arr:
            if isinstance(item, str) and item.strip():
                c[item.strip().lower()] += 1
    return [{"name": k, "count": v} for k, v in c.most_common(limit)]

