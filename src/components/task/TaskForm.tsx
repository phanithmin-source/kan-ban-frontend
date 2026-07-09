import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../common";
import { type Task } from "../../types/task";

interface TaskFormProps {
  initial?: Partial<Task>;
  onSubmit(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">): void;
  onCancel?(): void;
}

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().optional().default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional().default(""),
});

export default function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "TODO",
      priority: initial?.priority ?? "MEDIUM",
      dueDate: (() => {
        if (!initial?.dueDate) return "";
        const num = Number(initial.dueDate);
        const d = !Number.isNaN(num) && String(num) === initial.dueDate.trim() ? new Date(num) : new Date(initial.dueDate);
        return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      })(),
    },
  });

  const onSubmitForm = (data: z.input<typeof taskSchema>) => {
    onSubmit({
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || null,
    });
  };

  const fieldClass = "w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60";
  const labelClass = "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div>
        <label className={labelClass} htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          {...register("title")}
          className={fieldClass}
        />
        {errors.title ? (
          <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          {...register("description")}
          className={fieldClass}
          rows={4}
        />
        {errors.description ? (
          <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            {...register("status")}
            className={fieldClass}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
          {errors.status ? (
            <p className="mt-1 text-xs text-danger">{errors.status.message}</p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            {...register("priority")}
            className={fieldClass}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {errors.priority ? (
            <p className="mt-1 text-xs text-danger">{errors.priority.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="task-duedate">
          Due date
        </label>
        <input
          id="task-duedate"
          type="date"
          {...register("dueDate")}
          className={fieldClass}
        />
        {errors.dueDate ? (
          <p className="mt-1 text-xs text-danger">{errors.dueDate.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="rounded-2xl"
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className="rounded-2xl">
          Save task
        </Button>
      </div>
    </form>
  );
}
