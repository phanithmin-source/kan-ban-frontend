import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  FolderKanban,
  Users,
} from "lucide-react";
import { useAuth } from "../../hooks";
import StatCard from "./StatCard";

interface Props {
  boards: number;
  tasks: number;
  progress: number;
  completed: number;
  users?: number;
}

export default function StatsGrid({
  boards,
  tasks,
  progress,
  completed,
  users = 0,
}: Props) {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={user?.role === "ADMIN" ? "System Boards" : "My Boards"}
        value={boards}
        icon={FolderKanban}
      />

      <StatCard
        title={user?.role === "ADMIN" ? "System Tasks" : "Total Tasks"}
        value={tasks}
        icon={ClipboardList}
      />

      {user?.role === "ADMIN" ? (
        <StatCard
          title="Total Users"
          value={users}
          icon={Users}
        />
      ) : (
        <StatCard
          title="In Progress"
          value={progress}
          icon={Clock3}
        />
      )}

      <StatCard
        title="Completed"
        value={completed}
        icon={CheckCircle2}
      />
    </div>
  );
}