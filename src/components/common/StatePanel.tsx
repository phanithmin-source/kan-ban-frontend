import { type ReactNode } from "react";
import clsx from "clsx";
import { Button } from "../ui/button";

interface StatePanelProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  buttonVariant?: "primary" | "secondary";
  className?: string;
}

export default function StatePanel({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  buttonVariant = "primary",
  className,
}: StatePanelProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-8 text-center shadow-sm",
        className
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>

      {actionLabel && onAction ? (
        <div className="mt-6 flex justify-center">
          <Button type="button" variant={buttonVariant} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
