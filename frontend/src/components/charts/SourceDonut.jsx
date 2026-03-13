import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

export default function SourceDonut({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)" }} />
        <Pie data={data || []} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {(data || []).map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

