from __future__ import annotations

import re


MASTER_SKILLS = sorted(
    {
        "python",
        "sql",
        "excel",
        "tableau",
        "power bi",
        "pandas",
        "numpy",
        "scikit-learn",
        "sklearn",
        "pytorch",
        "tensorflow",
        "keras",
        "spark",
        "databricks",
        "snowflake",
        "aws",
        "gcp",
        "azure",
        "docker",
        "kubernetes",
        "mlops",
        "airflow",
        "dbt",
        "nlp",
        "computer vision",
        "llm",
        "langchain",
        "rag",
        "fastapi",
        "flask",
        "git",
        "linux",
        "statistics",
        "a/b testing",
        "bayesian",
        "xgboost",
        "lightgbm",
        "catboost",
        "transformers",
    }
)


_SKILL_PATTERNS: list[tuple[str, re.Pattern[str]]] = []
for s in MASTER_SKILLS:
    escaped = re.escape(s)
    # Word boundaries where it makes sense; keep phrases flexible.
    if " " in s or "/" in s or "+" in s:
        pat = re.compile(rf"(?i)\b{escaped}\b")
    else:
        pat = re.compile(rf"(?i)\b{escaped}\b")
    _SKILL_PATTERNS.append((s, pat))


def extract_skills(text: str | None, max_skills: int = 20) -> list[str]:
    if not text:
        return []
    found: list[str] = []
    for skill, pat in _SKILL_PATTERNS:
        if pat.search(text):
            found.append(skill)
        if len(found) >= max_skills:
            break
    # Normalize common aliases
    if "sklearn" in found and "scikit-learn" not in found:
        found = [("scikit-learn" if x == "sklearn" else x) for x in found]
    return sorted(set(found))


def classify_category(title: str) -> str:
    t = title.lower()
    if any(k in t for k in ["data analyst", "analytics", "bi analyst", "business intelligence"]):
        return "data_analyst"
    if any(k in t for k in ["data scientist", "research scientist"]):
        return "data_scientist"
    if any(k in t for k in ["ml engineer", "machine learning engineer", "mlops", "mle"]):
        return "ml_engineer"
    if any(k in t for k in ["ai engineer", "applied ai", "llm", "genai", "generative ai"]):
        return "ai_engineer"
    return "other"

