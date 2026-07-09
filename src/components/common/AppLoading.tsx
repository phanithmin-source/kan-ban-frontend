import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          Loading...
        </p>
      </div>
    </div>
  );
}
