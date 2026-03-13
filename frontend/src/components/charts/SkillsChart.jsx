import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function SkillsChart({ data }) {
  const d = (data || []).slice(0, 15).reverse();
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={d} layout="vertical" margin={{ left: 40 }}>
        <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
          width={120}
        />
        <Tooltip contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)" }} />
        <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

