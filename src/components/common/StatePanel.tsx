import { type ReactNode } from "react";
import clsx from "clsx";
import Button from "./Button";

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
        "rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm",
        className
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-900">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

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
