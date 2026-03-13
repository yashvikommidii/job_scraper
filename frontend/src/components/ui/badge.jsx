import React from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-white/10 text-white",
    primary: "bg-primary/20 text-primary border border-primary/30",
    accent: "bg-accent/15 text-accent border border-accent/25",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

