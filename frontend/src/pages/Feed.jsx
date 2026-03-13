import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar.jsx";
import JobCard from "../components/JobCard.jsx";
import JobDetailPanel from "../components/JobDetailPanel.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import StatsBar from "../components/StatsBar.jsx";
import { Button } from "../components/ui/button.jsx";
import { useJobs } from "../hooks/useJobs";

export default function Feed() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") || "1");
  const limit = Number(sp.get("limit") || "20");

  const params = useMemo(() => {
    const p = Object.fromEntries(sp.entries());
    return {
      ...p,
      page,
      limit,
    };
  }, [sp, page, limit]);

  const { data, isLoading, isError } = useJobs(params);
  const [selected, setSelected] = useState(null);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const setPage = (next) => {
    const n = new URLSearchParams(sp);
    n.set("page", String(next));
    setSp(n, { replace: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      <div className="hidden lg:block">
        <FilterSidebar />
      </div>

      <div className="space-y-4">
        <div className="lg:hidden">
          <FilterSidebar compact />
        </div>

        <StatsBar total={total} />

        {isError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">
            Failed to load jobs. Make sure the backend is running.
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((j) => <JobCard key={j.id} job={j} onOpen={setSelected} />)}
        </div>

        {!isLoading && !items.length ? (
          <div className="rounded-xl border border-white/10 bg-card/60 p-8 text-center">
            <div className="font-heading text-white text-lg font-semibold">No jobs match your filters</div>
            <div className="mt-1 text-sm text-white/60">Try widening the timeframe or clearing filters.</div>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="text-xs text-white/50">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <JobDetailPanel job={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </div>
  );
}

