import { useQuery } from "@apollo/client/react";
import { useAuth } from "./useAuth";
import { DashboardDataDocument } from "../gql/graphql";

export function useDashboard() {
  const { user } = useAuth();

  const { data, loading, error } = useQuery(DashboardDataDocument, {
    variables: {
      recentTasksFilter: { page: 1, limit: 5 },
      doneFilter: { status: "DONE", page: 1, limit: 1 },
      progressFilter: { status: "IN_PROGRESS", page: 1, limit: 1 },
      includeUsers: user?.role === "ADMIN" || user?.role === "MANAGER",
    },
  });

  const boards = data?.boards ?? [];
  const recentTasks = data?.recentTasks.data ?? [];
  const totalTasks = data?.recentTasks.total ?? 0;
  const doneTasksTotal = data?.doneTasks.total ?? 0;
  const progressTasksTotal = data?.progressTasks.total ?? 0;
  const users = data?.users ?? [];

  return {
    dashboard: {
      boards: boards.length,
      tasks: totalTasks,
      users: users.length,
      completed: doneTasksTotal,
      progress: progressTasksTotal,
      recentTasks,
    },
    loading,
    error,
  };
}