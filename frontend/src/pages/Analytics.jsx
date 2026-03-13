import React from "react";
import { useStats } from "../hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import JobsByCategory from "../components/charts/JobsByCategory.jsx";
import TrendLine from "../components/charts/TrendLine.jsx";
import SourceDonut from "../components/charts/SourceDonut.jsx";
import SkillsChart from "../components/charts/SkillsChart.jsx";

export default function Analytics() {
  const { data, isLoading, isError } = useStats();

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-100">
        Failed to load analytics.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Kpi title="Total jobs scraped" value={isLoading ? "—" : data?.total_jobs_all_time ?? 0} />
        <Kpi title="Jobs in last 24h" value={isLoading ? "—" : data?.jobs_last_24h ?? 0} />
        <Kpi title="Top hiring company" value={isLoading ? "—" : data?.top_hiring_company ?? "—"} />
        <Kpi title="Most in-demand skill" value={isLoading ? "—" : data?.most_in_demand_skill ?? "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Jobs by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <JobsByCategory data={data?.jobs_by_category} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Jobs posted (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLine data={data?.jobs_posted_last_7d} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceDonut data={data?.jobs_by_source} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsChart data={data?.top_skills} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleList data={data?.top_companies} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Salary distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleHistogram data={data?.salary_histogram} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-xs text-white/50">{title}</div>
      </CardHeader>
      <CardContent>
        <div className="font-heading text-2xl font-semibold text-white">{String(value)}</div>
      </CardContent>
    </Card>
  );
}

function SimpleList({ data }) {
  const rows = data || [];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
        >
          <div className="text-sm text-white/80 truncate">{r.name}</div>
          <div className="text-sm text-white/60">{r.value}</div>
        </div>
      ))}
      {!rows.length ? <div className="text-sm text-white/50">—</div> : null}
    </div>
  );
}

function SimpleHistogram({ data }) {
  const rows = data || [];
  const max = Math.max(1, ...rows.map((r) => r.value || 0));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.bin} className="flex items-center gap-3">
          <div className="w-28 text-xs text-white/50">{r.bin}</div>
          <div className="h-2 flex-1 rounded bg-white/5 border border-white/10 overflow-hidden">
            <div className="h-full bg-accent/70" style={{ width: `${(100 * r.value) / max}%` }} />
          </div>
          <div className="w-10 text-xs text-white/60 text-right">{r.value}</div>
        </div>
      ))}
      {!rows.length ? <div className="text-sm text-white/50">No salary data yet.</div> : null}
    </div>
  );
}

