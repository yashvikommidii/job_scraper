import React from "react";
import { cn } from "../../lib/utils";

export function Button({ className, variant = "default", size = "md", ...props }) {
  const variants = {
    default:
      "bg-primary text-white hover:brightness-110 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
    secondary:
      "bg-white/5 text-white hover:bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
    ghost: "bg-transparent text-white hover:bg-white/10",
    outline:
      "bg-transparent text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm rounded-md",
    md: "h-10 px-4 text-sm rounded-md",
    lg: "h-11 px-5 text-base rounded-lg",
    icon: "h-10 w-10 rounded-md",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

