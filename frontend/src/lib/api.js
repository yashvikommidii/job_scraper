import axios from "axios";

export const api = axios.create({
  baseURL: "/",
});

export async function fetchJobs(params) {
  const res = await api.get("/api/jobs", { params });
  return res.data;
}

export async function fetchJob(id) {
  const res = await api.get(`/api/jobs/${id}`);
  return res.data;
}

export async function fetchStats() {
  const res = await api.get("/api/stats");
  return res.data;
}

export async function fetchScraperStatus() {
  const res = await api.get("/api/scraper/status");
  return res.data;
}

export async function fetchSources() {
  const res = await api.get("/api/sources");
  return res.data;
}

export async function fetchSettings() {
  const res = await api.get("/api/settings");
  return res.data;
}

export async function updateSettings(payload) {
  const res = await api.put("/api/settings", payload);
  return res.data;
}

