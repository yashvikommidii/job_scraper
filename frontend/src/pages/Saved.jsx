import React, { useEffect, useMemo, useState } from "react";
import JobCard from "../components/JobCard.jsx";
import JobDetailPanel from "../components/JobDetailPanel.jsx";
import { Button } from "../components/ui/button.jsx";

function loadSavedJobs() {
  const data = JSON.parse(localStorage.getItem("savedJobsData") || "{}");
  return Object.values(data);
}

export default function Saved() {
  const [jobs, setJobs] = useState(() => loadSavedJobs());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fn = () => setJobs(loadSavedJobs());
    window.addEventListener("savedJobsUpdated", fn);
    return () => window.removeEventListener("savedJobsUpdated", fn);
  }, []);

  const clear = () => {
    localStorage.removeItem("savedJobs");
    localStorage.removeItem("savedJobsData");
    setJobs([]);
    window.dispatchEvent(new Event("savedJobsUpdated"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-heading text-white text-xl font-semibold">Saved jobs</div>
          <div className="text-sm text-white/60">Stored locally in your browser.</div>
        </div>
        <Button variant="danger" onClick={clear} disabled={!jobs.length}>
          Clear all
        </Button>
      </div>

      {!jobs.length ? (
        <div className="rounded-xl border border-white/10 bg-card/60 p-8 text-center">
          <div className="font-heading text-white text-lg font-semibold">No saved jobs yet</div>
          <div className="mt-1 text-sm text-white/60">Bookmark jobs from the Feed page.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} onOpen={setSelected} />
          ))}
        </div>
      )}

      <JobDetailPanel job={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>
  );
}

