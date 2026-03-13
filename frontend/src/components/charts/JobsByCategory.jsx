import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function JobsByCategory({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data || []}>
        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <Tooltip contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)" }} />
        <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

