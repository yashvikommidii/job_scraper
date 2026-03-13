import React from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Badge } from "./ui/badge.jsx";

export default function JobDetailPanel({ job, open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-bg border-l border-white/10 p-4 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-heading text-xl font-semibold text-white">{job?.title}</div>
            <div className="text-sm text-white/70">{job?.company}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {job?.source ? <Badge variant="primary">{job.source}</Badge> : null}
              {job?.is_remote ? <Badge variant="success">Remote</Badge> : null}
              {job?.location ? <Badge>{job.location}</Badge> : null}
              {job?.category ? <Badge variant="accent">{job.category}</Badge> : null}
            </div>
          </div>
          <Button variant="secondary" size="icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => window.open(job?.url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink size={16} /> Apply
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>

        {job?.salary_min || job?.salary_max ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-card/70 p-3">
            <div className="text-xs text-white/50">Salary</div>
            <div className="text-sm text-emerald-300">
              {job.currency || "$"}
              {job.salary_min ? Math.round(job.salary_min).toLocaleString() : "—"} -{" "}
              {job.salary_max ? Math.round(job.salary_max).toLocaleString() : "—"}
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="text-sm font-semibold text-white">Skills</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(job?.skills || []).map((s) => (
              <span key={s} className="text-xs rounded-full bg-white/5 border border-white/10 px-2 py-1">
                {s}
              </span>
            ))}
            {!job?.skills?.length ? <span className="text-sm text-white/50">—</span> : null}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold text-white">Description</div>
          <div className="mt-2 text-sm text-white/70 whitespace-pre-wrap">
            {job?.description || "No description available."}
          </div>
        </div>
      </div>
    </div>
  );
}

