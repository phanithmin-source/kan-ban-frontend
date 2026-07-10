import type { TaskStatus, TaskPriority } from "@/types/task";
import { type BadgeProps } from "@/components/ui/Badge";

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const COLUMNS = STATUS_ORDER.map((status) => ({
  id: status,
  title: status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));

export const getStatusBadgeVariant = (status: TaskStatus): BadgeProps["variant"] => {
  switch (status) {
    case "DONE":
      return "success";
    case "REVIEW":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    default:
      return "secondary";
  }
};

export const getPriorityBadgeVariant = (priority: TaskPriority | string): BadgeProps["variant"] => {
  switch (priority) {
    case "HIGH":
      return "destructive";
    case "MEDIUM":
      return "warning";
    default:
      return "success";
  }
};

