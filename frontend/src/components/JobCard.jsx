import React, { useMemo } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { cn } from "../lib/utils";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return null;
  const m = Math.floor(diffMs / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  const days = Math.floor(h / 24);
  return `${days} days ago`;
}

export default function JobCard({ job, onOpen }) {
  const saved = useMemo(() => {
    const ids = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    return ids.includes(job.id);
  }, [job.id]);

  const toggleSaved = (e) => {
    e.stopPropagation();
    const ids = new Set(JSON.parse(localStorage.getItem("savedJobs") || "[]"));
    const data = JSON.parse(localStorage.getItem("savedJobsData") || "{}");
    if (ids.has(job.id)) {
      ids.delete(job.id);
      delete data[job.id];
    } else {
      ids.add(job.id);
      data[job.id] = job;
    }
    localStorage.setItem("savedJobs", JSON.stringify([...ids]));
    localStorage.setItem("savedJobsData", JSON.stringify(data));
    window.dispatchEvent(new Event("savedJobsUpdated"));
  };

  const logoUrl = job.company_domain ? `https://logo.clearbit.com/${job.company_domain}` : null;
  const posted = timeAgo(job.posted_date || job.scraped_at);

  const sourceVariant = {
    linkedin: "primary",
    indeed: "accent",
    remoteok: "success",
  }[job.source] || "default";

  return (
    <div
      className="group cursor-pointer rounded-xl bg-card/80 backdrop-blur border border-white/10 hover:border-primary/30 hover:shadow-glow transition p-4 animate-fade-up"
      onClick={() => onOpen?.(job)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${job.company} logo`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-white/70 font-semibold">{(job.company || "?")[0]}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-heading text-white font-semibold leading-snug line-clamp-2">
              {job.title}
            </div>
            <div className="text-sm text-white/70 truncate">{job.company}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleSaved} aria-label="Save job">
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.open(job.url, "_blank", "noopener,noreferrer");
            }}
            aria-label="Apply"
          >
            <ExternalLink size={18} />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={sourceVariant} className="uppercase tracking-wide">
          {job.source}
        </Badge>
        {job.is_remote ? (
          <Badge variant="success">Remote</Badge>
        ) : job.location ? (
          <Badge className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </Badge>
        ) : null}
        {posted ? <span className="text-xs text-white/50 ml-auto">{posted}</span> : null}
      </div>

      {job.salary_min || job.salary_max ? (
        <div className="mt-2 text-sm text-emerald-300">
          {job.currency || "$"}
          {job.salary_min ? Math.round(job.salary_min).toLocaleString() : "—"} -{" "}
          {job.salary_max ? Math.round(job.salary_max).toLocaleString() : "—"}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {(job.skills || []).slice(0, 4).map((s) => (
          <span key={s} className="text-xs rounded-full bg-white/5 border border-white/10 px-2 py-1">
            {s}
          </span>
        ))}
        {job.skills?.length > 4 ? (
          <span className="text-xs text-white/50">+{job.skills.length - 4} more</span>
        ) : null}
      </div>

      {job.description ? (
        <div className={cn("mt-3 text-sm text-white/65 line-clamp-3")}>{job.description}</div>
      ) : null}
    </div>
  );
}

