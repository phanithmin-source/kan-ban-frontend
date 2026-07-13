import { useMemo, useOptimistic, useTransition } from "react";
import { useQuery } from "@apollo/client/react";
import { type DragEndEvent } from "@dnd-kit/core";
import { TasksDocument, TaskPriority } from "../gql/graphql";
import { type Task, type TaskStatus } from "../types/task";
import { COLUMNS } from "../lib/taskConstants";

interface UseBoardTasksProps {
  boardId: string;
  search: string;
  priorityFilter: "ALL" | TaskPriority;
  canEditTasks: boolean;
  changeTaskStatus: (task: Task, status: TaskStatus) => Promise<unknown>;
  skip?: boolean;
}

export function useBoardTasks({
  boardId,
  search,
  priorityFilter,
  canEditTasks,
  changeTaskStatus,
  skip,
}: UseBoardTasksProps) {
  const [, startTransition] = useTransition();

  // Kanban task queries (fully backend-filtered and backend-searched)
  const {
    data: kanbanTasksData,
    loading: kanbanTasksLoading,
    error: kanbanTasksError,
    refetch: refetchKanbanTasks,
  } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 100,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
    },
    skip: skip || !boardId,
  });

  const filteredTasks = useMemo(() => {
    return (kanbanTasksData?.tasks?.data ?? []) as Task[];
  }, [kanbanTasksData]);

  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    filteredTasks,
    (state, update: { id: string; status: TaskStatus }) => {
      return state.map((task) =>
        task.id === update.id
          ? ({ ...task, status: update.status } as Task)
          : task
      );
    }
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || !canEditTasks) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = optimisticTasks.find((task) => task.id === activeId);
    if (!currentTask) return;

    const overColumn = COLUMNS.find((column) => column.id === overId);
    if (overColumn) {
      const targetStatus = overColumn.id;
      if (currentTask.status === targetStatus) return;
      startTransition(async () => {
        setOptimisticTasks({ id: currentTask.id, status: targetStatus });
        await changeTaskStatus(currentTask, targetStatus);
      });
      return;
    }

    const targetTask = optimisticTasks.find((task) => task.id === overId);
    if (targetTask && targetTask.status !== currentTask.status) {
      const targetStatus = targetTask.status;
      startTransition(async () => {
        setOptimisticTasks({ id: currentTask.id, status: targetStatus });
        await changeTaskStatus(currentTask, targetStatus);
      });
    }
  };

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = optimisticTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [optimisticTasks]);

  return {
    optimisticTasks,
    tasksByColumn,
    handleDragEnd,
    kanbanTasksLoading,
    kanbanTasksError,
    refetchKanbanTasks,
  };
}
