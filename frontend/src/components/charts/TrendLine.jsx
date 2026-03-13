import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function TrendLine({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data || []}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <Tooltip contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)" }} />
        <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

