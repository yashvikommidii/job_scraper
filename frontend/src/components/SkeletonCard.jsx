import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-xl bg-card/70 border border-white/10 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-2/3 bg-white/10 rounded" />
          <div className="mt-2 h-3 w-1/3 bg-white/10 rounded" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="mt-4 h-3 w-full bg-white/10 rounded" />
      <div className="mt-2 h-3 w-5/6 bg-white/10 rounded" />
      <div className="mt-2 h-3 w-3/6 bg-white/10 rounded" />
    </div>
  );
}

