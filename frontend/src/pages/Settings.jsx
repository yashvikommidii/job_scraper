import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, fetchSources, updateSettings } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

const locations = ["All", "Remote", "United States", "India", "UK", "Canada", "Germany"];

export default function Settings() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: sources } = useQuery({ queryKey: ["sources"], queryFn: fetchSources, staleTime: 60_000 });

  const [keywordInput, setKeywordInput] = useState("");
  const [log, setLog] = useState("");
  const [scraping, setScraping] = useState(false);

  const mut = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
  });

  const enabledSources = settings?.enabled_sources || {};
  const keywords = settings?.keywords || [];

  const toggleSource = (key) => {
    mut.mutate({ enabled_sources: { [key]: !enabledSources[key] } });
  };

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (!k) return;
    mut.mutate({ keywords: [...keywords, k] });
    setKeywordInput("");
  };

  const removeKeyword = (k) => {
    mut.mutate({ keywords: keywords.filter((x) => x !== k) });
  };

  const setLocation = (v) => mut.mutate({ location_preference: v });
  const setExp = (v) => mut.mutate({ experience_max_years: Number(v) });

  const scrapeNow = async () => {
    setLog("");
    setScraping(true);
    try {
      const res = await fetch("/api/scraper/run", { method: "POST" });
      if (!res.ok || !res.body) throw new Error("Failed to start scrape");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        // Parse SSE "data:" lines
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const p of parts) {
          const line = p
            .split("\n")
            .map((l) => l.trimStart())
            .find((l) => l.startsWith("data:"));
          if (line) setLog((prev) => prev + line.replace(/^data:\s?/, "") + "\n");
        }
      }
      qc.invalidateQueries({ queryKey: ["scraperStatus"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } catch (e) {
      setLog((prev) => prev + `Error: ${e?.message || e}\n`);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card>
        <CardHeader>
          <CardTitle>Scraper settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-white/50 mb-2">Search keywords</div>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Add keyword (e.g. data analyst)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addKeyword();
                }}
              />
              <Button onClick={addKeyword} disabled={!keywordInput.trim()}>
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k}
                  onClick={() => removeKeyword(k)}
                  className="text-xs rounded-full bg-white/5 border border-white/10 px-2 py-1 text-white/80 hover:bg-white/10"
                  title="Click to remove"
                >
                  {k} ×
                </button>
              ))}
              {!keywords.length && !isLoading ? <div className="text-sm text-white/50">—</div> : null}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/50 mb-2">Enabled sources</div>
            <div className="space-y-2">
              {(sources || []).map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div>
                    <div className="text-sm text-white">{s.name}</div>
                    <div className="text-xs text-white/50">{s.type}</div>
                  </div>
                  <Button variant={enabledSources[s.key] ? "default" : "secondary"} onClick={() => toggleSource(s.key)}>
                    {enabledSources[s.key] ? "On" : "Off"}
                  </Button>
                </div>
              ))}
              {!sources?.length ? <div className="text-sm text-white/50">—</div> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-white/50 mb-2">Location preference</div>
              <select
                className="h-10 w-full rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                value={settings?.location_preference || "All"}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locations.map((l) => (
                  <option key={l} value={l} className="bg-bg">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-white/50 mb-2">Max experience (years)</div>
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={settings?.experience_max_years ?? 3}
                onChange={(e) => setExp(e.target.value)}
                className="w-full"
              />
              <div className="text-xs text-white/60 mt-1">{settings?.experience_max_years ?? 3} years</div>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={scrapeNow} disabled={scraping}>
              {scraping ? "Scraping…" : "Scrape Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live scrape log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-emerald-200 h-[520px] overflow-auto whitespace-pre-wrap">
            {log || "Click “Scrape Now” to stream progress here."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

