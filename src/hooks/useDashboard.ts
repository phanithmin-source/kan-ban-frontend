import { useQuery } from "@apollo/client/react";
import { useAuth } from "./useAuth";
import {
  BoardsDocument,
  DashboardTasksDocument,
  GetUsersDocument,
} from "../gql/graphql";

export function useDashboard() {
  const { user } = useAuth();

  const {
    data: boardsData,
    loading: boardsLoading,
    error: boardsError,
  } = useQuery(BoardsDocument);

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
  } = useQuery(DashboardTasksDocument);

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GetUsersDocument, {
    skip: user?.role !== "ADMIN" && user?.role !== "MANAGER",
  });

  const tasks = tasksData?.tasks.data ?? [];

  return {
    dashboard: {
      boards: boardsData?.boards.length ?? 0,
      tasks: tasksData?.tasks.total ?? 0,
      users: usersData?.users.length ?? 0,
      completed: tasks.filter(task => task.status === "DONE").length,
      progress: tasks.filter(task => task.status === "IN_PROGRESS").length,
      recentTasks: tasks,
    },
    loading: boardsLoading || tasksLoading || (usersLoading && (user?.role === "ADMIN" || user?.role === "MANAGER")),
    error: boardsError || tasksError || usersError,
  };
}