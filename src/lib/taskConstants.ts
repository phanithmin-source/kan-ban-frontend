import type { TaskStatus } from "@/types/task";

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const COLUMNS = STATUS_ORDER.map((status) => ({
  id: status,
  title: status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));
