import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { StatePanel } from "@/components";
import type { AuthUser } from "../../context/AuthContext";

interface BoardEmptyStateProps {
  boardsLoading: boolean;
  boardsError: Error | undefined;
  user: AuthUser | null;
  onCreateBoard: () => void;
}

export default function BoardEmptyState({
  boardsLoading,
  boardsError,
  user,
  onCreateBoard,
}: BoardEmptyStateProps) {
  const wrap = (children: React.ReactNode) => (
    <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
  );

  if (boardsLoading) {
    return wrap(
      <StatePanel
        icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
        title="Loading workspace"
        description="Fetching your boards..."
      />
    );
  }

  if (boardsError) {
    return wrap(
      <StatePanel
        icon={<AlertTriangle className="h-6 w-6 text-danger" />}
        title="Failed to load boards"
        description={boardsError.message}
      />
    );
  }

  return wrap(
    <StatePanel
      icon={<Inbox className="h-6 w-6 text-slate-400" />}
      title="No boards found"
      description={
        user?.role === "USER"
          ? "You do not have any boards assigned to you yet. Ask your manager to assign you to a board."
          : "Create your first board to start managing your projects and tasks."
      }
      actionLabel={user?.role === "USER" ? undefined : "Create first board"}
      onAction={user?.role === "USER" ? undefined : onCreateBoard}
    />
  );
}
