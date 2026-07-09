import { AlertTriangle, Inbox, Loader2, ListTodo } from "lucide-react";

import {
  StatePanel,
  TaskDetailsModal,
  Badge,
  PageHeader,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
  Select,
  ConfirmationDialog,
} from "@/components";

import { useMyTasksPage } from "../../hooks";
import { type TaskStatus } from "../../types/task";
import { formatDate } from "@/lib/formatDate";

export default function MyTasks() {
  const {
    user,
    activeTask,
    setActiveTask,
    editingTask,
    setEditingTask,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    taskToArchive,
    setTaskToArchive,
    commentToDelete,
    setCommentToDelete,
    commentInput,
    setCommentInput,
    editingCommentId,
    setEditingCommentId,
    editingCommentText,
    setEditingCommentText,
    loading,
    error,
    myTasks,
    assignTask,
    changeTaskStatus,
    handleUpdate,
    handleDelete,
    handleArchiveClick,
    handleConfirmArchive,
    handleDeleteCommentClick,
    handleConfirmDeleteComment,
    getStatusBadgeVariant,
    getPriorityBadgeVariant,
    handlePostComment,
    handleSaveEditComment,
  } = useMyTasksPage();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
          title="Loading My Tasks"
          description="Fetching your assigned tasks..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load tasks"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <PageHeader
        label="Personal Space"
        title={
          <span className="flex items-center gap-2 select-none">
            <ListTodo className="h-8 w-8 text-primary" />
            My Tasks
          </span>
        }
        description="View, update, and collaborate on tasks assigned to you across all project boards."
      />

      {/* Filters Bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="my-tasks-search">Search</label>
          <Input
            id="my-tasks-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            autoComplete="off"
          />
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="my-tasks-status">Status</label>
          <Select
            id="my-tasks-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | TaskStatus)}
          >
            <option value="ALL">All statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </Select>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="my-tasks-priority">Priority</label>
          <Select
            id="my-tasks-priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")}
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </div>
      </div>

      {myTasks.length === 0 ? (
        <StatePanel
          icon={<Inbox className="h-6 w-6 text-slate-400" />}
          title="No tasks assigned"
          description="You don't have any matching tasks assigned to you in this workspace."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setStatusFilter("ALL");
            setPriorityFilter("ALL");
          }}
          buttonVariant="secondary"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="text-sm font-semibold text-foreground">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>
                  )}
                </TableCell>
                <TableCell>
                  {task.board?.name || "Global"}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(task.dueDate) || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => setActiveTask(task)}
                    className="text-primary hover:text-primary-dark transition hover:underline cursor-pointer"
                  >
                    View Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {activeTask && (
        <TaskDetailsModal
          activeTask={activeTask}
          setActiveTask={setActiveTask}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          canEditTasks={true}
          canManageBoard={user?.role === "ADMIN"}
          userBoardRole="MEMBER"
          userGlobalRole={user?.role}
          currentUserId={user?.id}
          boardMembers={[]} // Member selection is not required from My Tasks view as task is already assigned to the user
          onAssignTask={assignTask}
          onChangeTaskStatus={changeTaskStatus}
          onUpdateTask={handleUpdate}
          onArchiveTask={handleArchiveClick}
          onDeleteTask={handleDelete}

          commentInput={commentInput}
          setCommentInput={setCommentInput}
          onPostComment={handlePostComment}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentText={setEditingCommentText}
          onSaveEditComment={handleSaveEditComment}
          onDeleteComment={handleDeleteCommentClick}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!taskToArchive}
        onClose={() => setTaskToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Archive task"
        description="Are you sure you want to archive this task? It will be hidden from the active board."
        confirmLabel="Archive"
        variant="warning"
      />

      <ConfirmationDialog
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
