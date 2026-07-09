import { useAuth } from "../../hooks";
import TaskRow from "./TaskRow";
import EmptyState from "./EmptyState";
import type { DashboardTasksQuery } from "../../gql/graphql";

type RecentTask =
  DashboardTasksQuery["tasks"]["data"][number];

interface Props {
  tasks: RecentTask[];
}

export default function RecentTasks({
  tasks,
}: Props) {
  const { user } = useAuth();

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">

      <h2 className="text-lg font-semibold text-foreground">
        Recent Tasks
      </h2>


      <div className="mt-4 space-y-3">

        {tasks.length === 0 ? (

          <EmptyState
            title="No tasks yet"
            description={
              user?.role === "USER"
                ? "You do not have any tasks assigned to you yet. Ask your manager to assign you to a board."
                : "Create your first task to get started."
            }
          />

        ) : (

          tasks.map((task) => (
            <TaskRow
              key={task.id}
              title={task.title}
              board={task.board.name}
              status={task.status}
              priority={task.priority}
            />
          ))

        )}

      </div>

    </div>
  );
}