import React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40",
        className
      )}
      {...props}
    />
  );
}

