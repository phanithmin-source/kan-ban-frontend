import * as React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-900 dark:bg-slate-100 border-transparent text-slate-50 dark:text-slate-900 hover:bg-slate-900/80 dark:hover:bg-slate-100/80",
    secondary: "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-900 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80",
    destructive: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400",
    outline: "text-slate-950 dark:text-slate-50 border border-slate-200 dark:border-slate-850",
    success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400",
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
