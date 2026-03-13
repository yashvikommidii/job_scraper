import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSources } from "../lib/api";
import { Input } from "./ui/input.jsx";
import { Button } from "./ui/button.jsx";
import { Badge } from "./ui/badge.jsx";
import { Filter, RotateCcw } from "lucide-react";

const categories = [
  { value: "all", label: "All" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "data_scientist", label: "Data Scientist" },
  { value: "ml_engineer", label: "ML Engineer" },
  { value: "ai_engineer", label: "AI Engineer" },
  { value: "other", label: "Other" },
];

const locations = ["All", "Remote", "United States", "India", "UK", "Canada", "Germany"];
const hoursOptions = [
  { value: "6", label: "Last 6h" },
  { value: "12", label: "Last 12h" },
  { value: "24", label: "Last 24h" },
];

export default function FilterSidebar({ compact = false }) {
  const [sp, setSp] = useSearchParams();
  const { data: sources } = useQuery({ queryKey: ["sources"], queryFn: fetchSources, staleTime: 60_000 });

  const q = sp.get("q") || "";
  const category = sp.get("category") || "all";
  const location = sp.get("location") || "All";
  const hours = sp.get("hours") || "24";
  const sort = sp.get("sort") || "newest";
  const skills = sp.get("skills") || "";
  const source = sp.get("source") || "";
  const selectedSources = useMemo(
    () => new Set(source.split(",").map((s) => s.trim()).filter(Boolean)),
    [source]
  );

  const [skillsInput, setSkillsInput] = useState(skills);

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "" || v === "all") next.delete(k);
      else next.set(k, String(v));
    });
    next.delete("page");
    setSp(next, { replace: true });
  };

  const toggleSource = (key) => {
    const next = new Set(selectedSources);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update({ source: [...next].join(",") });
  };

  const reset = () => {
    setSkillsInput("");
    setSp(new URLSearchParams(), { replace: true });
  };

  return (
    <div className={compact ? "" : "sticky top-4"}>
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Filter size={16} /> Filters
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>

        <div className="mt-3">
          <div className="text-xs text-white/50 mb-2">Search</div>
          <Input
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Title, company, skills…"
          />
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/50 mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => update({ category: c.value })}
                className={
                  category === c.value
                    ? "px-3 py-2 rounded-md bg-primary/20 border border-primary/30 text-primary text-sm"
                    : "px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm"
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/50 mb-2">Sources</div>
          <div className="flex flex-wrap gap-2">
            {(sources || []).map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSource(s.key)}
                className={
                  selectedSources.has(s.key)
                    ? "px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm"
                    : "px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm"
                }
              >
                {s.name}
              </button>
            ))}
            {!sources?.length ? <Badge>—</Badge> : null}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/50 mb-2">Location</div>
          <select
            className="h-10 w-full rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
            value={location}
            onChange={(e) => update({ location: e.target.value })}
          >
            {locations.map((l) => (
              <option key={l} value={l} className="bg-bg">
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/50 mb-2">Posted within</div>
          <div className="flex flex-wrap gap-2">
            {hoursOptions.map((h) => (
              <button
                key={h.value}
                onClick={() => update({ hours: h.value })}
                className={
                  hours === h.value
                    ? "px-3 py-2 rounded-md bg-accent/15 border border-accent/25 text-accent text-sm"
                    : "px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm"
                }
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/50 mb-2">Skills (comma separated)</div>
          <Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="python, sql, pytorch" />
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => update({ skills: skillsInput })}
            >
              Apply skills
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/50 mb-2">Sort by</div>
          <select
            className="h-10 w-full rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="newest" className="bg-bg">
              Newest
            </option>
            <option value="salary_desc" className="bg-bg">
              Salary High-Low
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

