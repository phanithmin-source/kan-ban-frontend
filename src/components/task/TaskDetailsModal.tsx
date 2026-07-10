import { Button } from "../common";
import TaskForm from "./TaskForm";
import CommentsPanel from "./CommentsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Select } from "../ui";
import type { Task, TaskStatus } from "../../types/task";
import type { BoardQuery } from "../../gql/graphql";
import { formatDate } from "@/lib/formatDate";
import { STATUS_ORDER } from "@/lib/taskConstants";

type BoardMembersType = NonNullable<BoardQuery["board"]>["members"];

interface TaskDetailsModalProps {
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  canEditTasks: boolean;
  canManageBoard: boolean;
  userBoardRole?: string;
  userGlobalRole?: string;
  currentUserId?: string;
  boardMembers: BoardMembersType;
  onAssignTask: (taskId: string, userId: string, selectedMemberUser: Task["assignee"]) => void | Promise<unknown>;
  onChangeTaskStatus: (task: Task, status: TaskStatus) => void | Promise<unknown>;
  onUpdateTask: (updatedData: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "isArchived" | "creator" | "comments" | "board">) => void | Promise<void>;
  onDeleteTask: (taskId: string) => void | Promise<unknown>;
  onArchiveTask: (taskId: string) => void | Promise<unknown>;
  onDeleteComment: (commentId: string) => void | Promise<unknown>;
  onPostComment: (e: React.FormEvent) => void | Promise<void>;
  commentInput: string;
  setCommentInput: (value: string) => void;
  editingCommentId: string | null;
  setEditingCommentId: (value: string | null) => void;
  editingCommentText: string;
  setEditingCommentText: (value: string) => void;
  onSaveEditComment: (commentId: string) => void | Promise<void>;
}

const infoCardClass = "rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 shadow-xs";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500";
const valueSmClass = "mt-2 text-sm font-semibold text-slate-805 dark:text-slate-205";

export default function TaskDetailsModal({
  activeTask,
  setActiveTask,
  editingTask,
  setEditingTask,
  canEditTasks,
  canManageBoard,
  userBoardRole,
  userGlobalRole,
  currentUserId,
  boardMembers,
  onAssignTask,
  onChangeTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onArchiveTask,
  onDeleteComment,
  onPostComment,
  commentInput,
  setCommentInput,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  onSaveEditComment,
}: TaskDetailsModalProps) {
  if (!activeTask) return null;

  return (
    <Dialog open={!!activeTask} onOpenChange={(open) => { if (!open) setActiveTask(null); }}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh] p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Task Details</span>
            <span>•</span>
            <span className="text-primary">{activeTask.board?.name ?? "Board"}</span>
          </div>
          <DialogTitle className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activeTask.title}
          </DialogTitle>
        </DialogHeader>

        {editingTask ? (
          <div className="mt-4">
            <TaskForm
              initial={activeTask}
              onSubmit={async (updatedData) => {
                await onUpdateTask(updatedData);
                setEditingTask(null);
              }}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Task Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className={infoCardClass}>
                <p className={labelClass}>Status</p>
                {canEditTasks ? (
                  <div className="mt-1">
                    <Select
                      value={activeTask.status}
                      onChange={async (e) =>
                        await onChangeTaskStatus(activeTask, e.target.value as TaskStatus)
                      }
                      className="py-1 cursor-pointer h-8 text-xs"
                    >
                      {STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activeTask.status.replace("_", " ")}
                  </p>
                )}
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Priority</p>
                <div className="mt-2.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase border ${activeTask.priority === "HIGH"
                        ? "bg-rose-500/10 text-danger border-rose-500/20"
                        : activeTask.priority === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-505 dark:text-amber-405 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-505 dark:text-emerald-405 border-emerald-500/20"
                      }`}
                  >
                    {activeTask.priority}
                  </span>
                </div>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Due Date</p>
                <p className={valueSmClass}>
                  {activeTask.dueDate ? formatDate(activeTask.dueDate) : "No due date"}
                </p>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Created</p>
                <p className={valueSmClass}>
                  {formatDate(activeTask.createdAt)}
                </p>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Assignee</p>
                {canEditTasks ? (
                  <Select
                    value={activeTask.assignee?.id ?? ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (val) {
                        const selectedMember = boardMembers?.find((m) => m.user.id === val);
                        await onAssignTask(
                          activeTask.id,
                          val,
                          selectedMember ? selectedMember.user : null
                        );
                      }
                    }}
                    className="mt-1 w-full py-1 cursor-pointer h-8 text-xs"
                  >
                    <option value="">Unassigned</option>
                    {boardMembers?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <p className={valueSmClass}>
                    {activeTask.assignee?.name || "Unassigned"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {canEditTasks && (
                <Button
                  type="button"
                  onClick={() => setEditingTask(activeTask)}
                  variant="primary"
                  className="rounded-2xl px-4 py-3"
                >
                  Edit task
                </Button>
              )}
              {canEditTasks && (
                <button
                  type="button"
                  onClick={() => onArchiveTask(activeTask.id)}
                  className="rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400 transition hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer"
                >
                  Archive task
                </button>
              )}
              {canManageBoard && (
                <button
                  type="button"
                  onClick={() => onDeleteTask(activeTask.id)}
                  className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition hover:border-danger/40 cursor-pointer"
                >
                  Delete task
                </button>
              )}
            </div>

            {/* Comments discussions panel */}
            <CommentsPanel
              comments={activeTask.comments ?? []}
              commentInput={commentInput}
              setCommentInput={setCommentInput}
              onPostComment={onPostComment}
              editingCommentId={editingCommentId}
              setEditingCommentId={setEditingCommentId}
              editingCommentText={editingCommentText}
              setEditingCommentText={setEditingCommentText}
              onSaveEditComment={onSaveEditComment}
              onDeleteComment={onDeleteComment}
              currentUserId={currentUserId}
              userBoardRole={userBoardRole}
              userGlobalRole={userGlobalRole}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
