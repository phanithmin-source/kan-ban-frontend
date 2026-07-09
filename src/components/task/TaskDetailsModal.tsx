import { Button } from "../common";
import TaskForm from "./TaskForm";
import CommentsPanel from "./CommentsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui";
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
  onArchiveTask: (taskId: string) => void | Promise<void>;
  onDeleteTask: (taskId: string) => void | Promise<void>;
  
  // comments panel forwarding props
  commentInput: string;
  setCommentInput: (value: string) => void;
  onPostComment: (e: React.FormEvent) => void | Promise<void>;
  editingCommentId: string | null;
  setEditingCommentId: (value: string | null) => void;
  editingCommentText: string;
  setEditingCommentText: (value: string) => void;
  onSaveEditComment: (commentId: string) => void | Promise<void>;
  onDeleteComment: (commentId: string) => void | Promise<void>;
}

const infoCardClass = "rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4";
const labelClass = "text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400";
const valueClass = "mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100";
const valueSmClass = "mt-2 text-sm text-slate-700 dark:text-slate-300";

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
  onArchiveTask,
  onDeleteTask,
  
  commentInput,
  setCommentInput,
  onPostComment,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  onSaveEditComment,
  onDeleteComment,
}: TaskDetailsModalProps) {
  if (!activeTask) return null;

  return (
    <Dialog open={!!activeTask} onOpenChange={(open) => { if (!open) { setActiveTask(null); setEditingTask(null); } }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pr-6">
        <DialogHeader>
          <DialogTitle>{activeTask.title}</DialogTitle>
        </DialogHeader>

        {editingTask && editingTask.id === activeTask.id ? (
          <div className="mt-2">
            <TaskForm
              initial={activeTask}
              onSubmit={onUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className={infoCardClass}>
                <p className={labelClass}>Status</p>
                <p className={valueClass}>
                  {activeTask.status.replaceAll("_", " ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {STATUS_ORDER.map((s) => {
                    const canMove =
                      canEditTasks &&
                      (userGlobalRole === "ADMIN" ||
                        userGlobalRole === "MANAGER" ||
                        userBoardRole === "OWNER" ||
                        activeTask.assignee?.id && String(activeTask.assignee.id) === String(currentUserId));
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={activeTask.status === s || !canMove}
                        onClick={async () => {
                          await onChangeTaskStatus(activeTask, s);
                          setActiveTask({ ...activeTask, status: s });
                        }}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          activeTask.status === s
                            ? "bg-primary text-white cursor-default"
                            : "border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                      >
                        {s.replaceAll("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Priority</p>
                <p className={valueClass}>
                  {activeTask.priority}
                </p>
              </div>
            </div>

            <div className={infoCardClass}>
              <p className={labelClass}>Description</p>
              <p className={valueSmClass}>
                {activeTask.description || "No description added."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className={infoCardClass}>
                <p className={labelClass}>Due date</p>
                <p className={valueSmClass}>
                  {formatDate(activeTask.dueDate) || "No due date"}
                </p>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Created</p>
                <p className={valueSmClass}>
                  {formatDate(activeTask.createdAt)}
                </p>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Creator</p>
                <p className={valueSmClass}>
                  {activeTask.creator?.name || "System"}
                </p>
              </div>
              <div className={infoCardClass}>
                <p className={labelClass}>Assignee</p>
                {canEditTasks ? (
                  <select
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
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary/60 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {boardMembers?.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
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
