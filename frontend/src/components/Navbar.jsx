import React from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchScraperStatus } from "../lib/api";
import { Button } from "./ui/button.jsx";
import { cn } from "../lib/utils";
import { Moon, Sun } from "lucide-react";

const nav = [
  { to: "/", label: "Feed" },
  { to: "/analytics", label: "Analytics" },
  { to: "/saved", label: "Saved" },
  { to: "/settings", label: "Settings" },
];

export default function Navbar() {
  const { data } = useQuery({
    queryKey: ["scraperStatus"],
    queryFn: fetchScraperStatus,
    refetchInterval: 15_000,
  });

  const running = Boolean(data?.running);
  const lastRun = data?.last_run_at ? new Date(data.last_run_at).toLocaleString() : "—";

  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-card/70 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_20px_rgba(99,102,241,0.55)]" />
        </div>
        <div className="leading-tight">
          <div className="font-heading text-white text-lg font-semibold">JobRadar AI</div>
          <div className="text-xs text-white/50">Last updated: {lastRun}</div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              cn(
                "px-3 py-2 text-sm rounded-md transition",
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
              )
            }
          >
            {n.label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 h-10">
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              running ? "bg-emerald-400 animate-pulseSoft" : "bg-white/30"
            )}
          />
          <div className="text-xs text-white/70">{running ? "Scraper running" : "Idle"}</div>
        </div>
        <Button variant="secondary" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </div>
  );
}

