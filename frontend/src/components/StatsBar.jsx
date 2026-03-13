import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchScraperStatus } from "../lib/api";
import { Badge } from "./ui/badge.jsx";

function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "soon";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function StatsBar({ total }) {
  const { data } = useQuery({
    queryKey: ["scraperStatus"],
    queryFn: fetchScraperStatus,
    refetchInterval: 15_000,
  });

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const last = data?.last_run_at ? new Date(data.last_run_at) : null;
  const next = data?.next_run_at ? new Date(data.next_run_at) : null;
  const nextIn = useMemo(() => (next ? next.getTime() - now : null), [next, now]);

  return (
    <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-2 justify-between">
      <div className="text-sm text-white/80">
        <span className="font-semibold text-white">{total}</span> jobs found
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <Badge className="bg-white/5 border border-white/10 text-white/70">
          Last scraped: {last ? last.toLocaleString() : "—"}
        </Badge>
        <Badge className="bg-white/5 border border-white/10 text-white/70">
          Next scrape in: {nextIn != null ? formatCountdown(nextIn) : "—"}
        </Badge>
      </div>
    </div>
  );
}

