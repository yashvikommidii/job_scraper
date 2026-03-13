import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../lib/api";

export function useJobs(params) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => fetchJobs(params),
  });
}

