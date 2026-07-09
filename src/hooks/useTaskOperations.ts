import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import {
  CreateTaskDocument,
  UpdateTaskDocument,
  DeleteTaskDocument,
  ArchiveTaskDocument,
  AssignTaskDocument,
  UpdateTaskStatusDocument,
  type AssignTaskMutation,
  type UpdateTaskStatusMutation,
} from "../gql/graphql";
import type { Task, TaskStatus } from "../types/task";

interface UseTaskOperationsProps {
  boardId?: string;
  onSuccess?: () => void;
  onAssignSuccess?: (assignee: Task["assignee"]) => void;
}

export function useTaskOperations({
  boardId,
  onSuccess,
  onAssignSuccess,
}: UseTaskOperationsProps = {}) {
  const [createTaskMutation, { loading: creating }] = useMutation(
    CreateTaskDocument,
    {
      onCompleted: () => {
        toast.success("Task created successfully");
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create task");
      },
    }
  );

  const [updateTaskMutation] = useMutation(UpdateTaskDocument, {
    onCompleted: () => {
      toast.success("Task updated successfully");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update task");
    },
  });

  const [deleteTaskMutation] = useMutation(DeleteTaskDocument, {
    onCompleted: () => {
      toast.success("Task deleted successfully");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete task");
    },
  });

  const [archiveTaskMutation] = useMutation(ArchiveTaskDocument, {
    onCompleted: () => {
      toast.success("Task archived successfully");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to archive task");
    },
  });

  const [assignTaskMutation] = useMutation(AssignTaskDocument, {
    onCompleted: (data) => {
      toast.success("Task assignee updated");
      if (data?.assignTask?.assignee) {
        onAssignSuccess?.(data.assignTask.assignee);
      }
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to assign task");
    },
  });

  const [updateTaskStatusMutation] = useMutation(UpdateTaskStatusDocument, {
    onCompleted: () => {
      toast.success("Task status updated");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update task status");
    },
  });

  const createTask = async (
    newTask: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board"
    >
  ) => {
    if (!boardId) return;
    return createTaskMutation({
      variables: { input: { ...newTask, boardId } },
    });
  };

  const updateTask = async (
    id: string,
    updatedData: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board"
    >
  ) => {
    return updateTaskMutation({
      variables: { id, input: updatedData },
    });
  };

  const deleteTask = async (id: string) => {
    return deleteTaskMutation({
      variables: { id },
    });
  };

  const archiveTask = async (id: string) => {
    return archiveTaskMutation({
      variables: { id },
    });
  };

  const assignTask = async (taskId: string, userId: string, selectedMemberUser: Task["assignee"]) => {
    return assignTaskMutation({
      variables: { taskId, userId },
      optimisticResponse: {
        __typename: "Mutation" as const,
        assignTask: {
          __typename: "Task" as const,
          id: taskId,
          assignee: selectedMemberUser
            ? {
                __typename: "User" as const,
                id: selectedMemberUser.id,
                name: selectedMemberUser.name,
                email: selectedMemberUser.email,
              }
            : null,
        },
      } as AssignTaskMutation,
    });
  };

  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    return updateTaskStatusMutation({
      variables: { id: task.id, status },
      optimisticResponse: {
        __typename: "Mutation" as const,
        updateTaskStatus: {
          __typename: "Task" as const,
          id: task.id,
          status,
          updatedAt: new Date().toISOString(),
        },
      } as UpdateTaskStatusMutation,
    });
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    assignTask,
    changeTaskStatus,
    creatingTask: creating,
  };
}
