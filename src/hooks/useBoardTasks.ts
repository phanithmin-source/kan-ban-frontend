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

  // Kanban task queries (fully backend-filtered and backend-searched, status-specific)
  const {
    data: todoData,
    loading: todoLoading,
    error: todoError,
    refetch: refetchTodo,
  } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 50,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
      status: "TODO",
    },
    skip: skip || !boardId,
  });

  const {
    data: inProgressData,
    loading: inProgressLoading,
    error: inProgressError,
    refetch: refetchInProgress,
  } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 50,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
      status: "IN_PROGRESS",
    },
    skip: skip || !boardId,
  });

  const {
    data: reviewData,
    loading: reviewLoading,
    error: reviewError,
    refetch: refetchReview,
  } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 50,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
      status: "REVIEW",
    },
    skip: skip || !boardId,
  });

  const {
    data: doneData,
    loading: doneLoading,
    error: doneError,
    refetch: refetchDone,
  } = useQuery(TasksDocument, {
    variables: {
      page: 1,
      limit: 50,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      boardId: boardId || undefined,
      status: "DONE",
    },
    skip: skip || !boardId,
  });

  const kanbanTasksLoading = todoLoading || inProgressLoading || reviewLoading || doneLoading;
  const kanbanTasksError = todoError || inProgressError || reviewError || doneError;

  const refetchKanbanTasks = async () => {
    await Promise.all([
      refetchTodo(),
      refetchInProgress(),
      refetchReview(),
      refetchDone(),
    ]);
  };

  const filteredTasks = useMemo(() => {
    return [
      ...(todoData?.tasks?.data ?? []),
      ...(inProgressData?.tasks?.data ?? []),
      ...(reviewData?.tasks?.data ?? []),
      ...(doneData?.tasks?.data ?? []),
    ] as Task[];
  }, [todoData, inProgressData, reviewData, doneData]);

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
