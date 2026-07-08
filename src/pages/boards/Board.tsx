import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client/react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import StatePanel from "../../components/common/StatePanel";
import KanbanColumn from "../../components/task/KanbanColumn";
import TaskForm from "../../components/task/TaskForm";
import { type Task, type TaskStatus } from "../../types/task";

import { useBoard } from "../../hooks/useBoard";
import { useAuth } from "../../hooks/useAuth";
import {
  CreateTaskDocument,
  UpdateTaskDocument,
  DeleteTaskDocument,
  BoardsDocument,
  CreateBoardDocument,
  UpdateBoardDocument,
  DeleteBoardDocument,
  TasksDocument,
  GetUsersDocument,
  AssignTaskDocument,
} from "../../gql/graphql";

function formatDate(value: string | null | undefined) {
  if (!value) return null;

  const num = Number(value);
  const date = !Number.isNaN(num) && String(num) === value.trim() ? new Date(num) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const COLUMNS = STATUS_ORDER.map((status) => ({
  id: status,
  title: status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));

export default function Board({ boardId }: { boardId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST">("BOARD");
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  const { data: boardsData, loading: boardsLoading, error: boardsError } = useQuery(BoardsDocument);

  const [createBoard] = useMutation(CreateBoardDocument, {
    onCompleted: (data) => {
      if (data?.createBoard) {
        navigate(`/board/${data.createBoard.id}`);
      }
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [updateBoard] = useMutation(UpdateBoardDocument, {
    refetchQueries: [{ query: BoardsDocument }],
  });

  const [deleteBoard] = useMutation(DeleteBoardDocument, {
    onCompleted: () => {
      navigate("/board");
    },
    refetchQueries: [{ query: BoardsDocument }],
  });

  useEffect(() => {
    if (!boardId && boardsData?.boards && boardsData.boards.length > 0) {
      navigate(`/board/${boardsData.boards[0].id}`, { replace: true });
    }
  }, [boardId, boardsData, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, priorityFilter]);

  const { board, tasks, loading, error, refetch } = useBoard(boardId);

  const { data: usersData } = useQuery(GetUsersDocument, {
    skip: user?.role !== "ADMIN" && user?.role !== "MANAGER",
  });

  const [assignTask] = useMutation(AssignTaskDocument, {
    onCompleted: (data) => {
      if (activeTask && data?.assignTask) {
        setActiveTask({
          ...activeTask,
          assignee: data.assignTask.assignee,
        });
      }
      refetch();
      if (viewMode === "LIST") void refetchList();
    },
  });

  const { data: listData, loading: listLoading, error: listError, refetch: refetchList } = useQuery(TasksDocument, {
    variables: {
      page: currentPage,
      limit: limitPerPage,
      search: search || undefined,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
    },
    skip: viewMode !== "LIST",
  });

  const [createTask, { loading: creating }] = useMutation(CreateTaskDocument, {
    onCompleted: () => {
      setIsCreating(false);
      refetch();
      if (viewMode === "LIST") void refetchList();
    },
  });

  const [updateTask] = useMutation(UpdateTaskDocument, {
    onCompleted: () => {
      setEditingTask(null);
      setActiveTask(null);
      refetch();
      if (viewMode === "LIST") void refetchList();
    },
  });

  const [deleteTask] = useMutation(DeleteTaskDocument, {
    onCompleted: () => {
      setActiveTask(null);
      refetch();
      if (viewMode === "LIST") void refetchList();
    },
  });

  // Same mutation as `updateTask`, just called with different variables for a
  // pure status change — collapsed into one mutation instance (was duplicated).
  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    await updateTask({
      variables: { id: task.id, input: { status } },
      optimisticResponse: {
        __typename: "Mutation",
        updateTask: {
          __typename: "Task",
          id: task.id,
          title: task.title,
          description: task.description,
          status,
          priority: task.priority,
          dueDate: task.dueDate,
          updatedAt: new Date().toISOString(),
        },
      } as any,
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [filteredTasks]);

  const handleCreate = async (newTask: Omit<Task, "id" | "createdAt" | "assignee">) => {
    await createTask({ variables: { input: { ...newTask, boardId } } });
  };

  const handleUpdate = async (updatedData: Omit<Task, "id" | "createdAt" | "assignee">) => {
    if (!editingTask) return;
    await updateTask({ variables: { id: editingTask.id, input: updatedData } });
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask({ variables: { id: taskId } });
  };

  const handleCreateBoard = async () => {
    const name = prompt("Enter board name:");
    if (name) {
      await createBoard({ variables: { input: { name } } });
    }
  };

  const handleRenameBoard = async () => {
    if (!boardId || !board) return;
    const name = prompt("Enter new board name:", board.name);
    if (name && name !== board.name) {
      await updateBoard({ variables: { id: boardId, input: { name } } });
      refetch();
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardId) return;
    if (confirm("Are you sure you want to delete this board and all its tasks?")) {
      await deleteBoard({ variables: { id: boardId } });
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const currentTask = tasks.find((task) => task.id === activeTaskId);
    if (!currentTask) return;

    // Dropped directly on a column (including an empty one) — KanbanColumn's
    // useDroppable registers the column id itself as a valid drop target.
    const overColumn = COLUMNS.find((column) => column.id === overId);
    if (overColumn) {
      await changeTaskStatus(currentTask, overColumn.id);
      return;
    }

    // Dropped on another task — move into that task's column.
    const targetTask = tasks.find((task) => task.id === overId);
    if (targetTask && targetTask.status !== currentTask.status) {
      await changeTaskStatus(currentTask, targetTask.status);
    }
  };

  if (!boardId) {
    if (boardsLoading) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <StatePanel
            icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
            title="Loading workspace"
            description="Fetching your boards..."
          />
        </div>
      );
    }

    if (boardsError) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <StatePanel
            icon={<AlertTriangle className="h-6 w-6 text-danger" />}
            title="Failed to load boards"
            description={boardsError.message}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <StatePanel
          icon={<Inbox className="h-6 w-6 text-slate-400" />}
          title="No boards found"
          description={
            user?.role === "USER"
              ? "You do not have any boards assigned to you yet. Ask your manager to assign you to a board."
              : "Create your first board to start managing your projects and tasks."
          }
          actionLabel={user?.role === "USER" ? undefined : "Create first board"}
          onAction={user?.role === "USER" ? undefined : handleCreateBoard}
        />
      </div>
    );
  }

  const canManageBoard = user?.role === "ADMIN" || (board?.owner?.id && Number(board.owner.id) === Number(user?.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Board Selector and CRUD Controls Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider" htmlFor="board-select">
            Board:
          </label>
          <select
            id="board-select"
            value={boardId}
            onChange={(e) => {
              if (e.target.value === "CREATE_NEW") {
                handleCreateBoard();
              } else if (e.target.value) {
                navigate(`/board/${e.target.value}`);
              }
            }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer"
          >
            <option value="" disabled>Select a board</option>
            {boardsData?.boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            {user?.role === "ADMIN" || user?.role === "MANAGER" ? (
              <option value="CREATE_NEW">+ Create New Board</option>
            ) : null}
          </select>

          {canManageBoard && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleRenameBoard}
                className="rounded-2xl py-1.5 px-3 text-xs"
              >
                Rename
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteBoard}
                className="rounded-2xl py-1.5 px-3 text-xs border-danger/20 text-danger hover:bg-danger/5 hover:border-danger/30"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {board?.owner && (
          <p className="text-xs text-slate-500 font-medium">
            Owner: <span className="font-semibold text-slate-700">{board.owner.name}</span>
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Kanban Board</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {board?.name ?? "Workspace"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Create tasks, filter work, and move items across your workflow.
          </p>
        </div>

        {user?.role === "ADMIN" || user?.role === "MANAGER" ? (
          <Button
            type="button"
            onClick={() => {
              setIsCreating((value) => !value);
              setEditingTask(null);
              setActiveTask(null);
            }}
            variant="primary"
            className="rounded-2xl px-5 py-3"
          >
            {isCreating ? "Hide form" : "Create new task"}
          </Button>
        ) : null}
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("BOARD")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              viewMode === "BOARD"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode("LIST")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              viewMode === "LIST"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Task List
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search tasks</label>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Filter priority</label>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Results</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {viewMode === "BOARD" ? filteredTasks.length : listData?.tasks.total ?? 0}
          </p>
          <p className="text-sm text-slate-500">Matching tasks</p>
        </div>
      </div>

      {isCreating ? (
        <div className="mb-8">
          <TaskForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          {creating ? <p className="mt-4 text-sm text-slate-600">Creating task…</p> : null}
        </div>
      ) : null}

      {viewMode === "BOARD" ? (
        loading ? (
          <StatePanel
            icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
            title="Loading tasks"
            description="Fetching tasks from your boards. This should only take a moment."
          />
        ) : error ? (
          <StatePanel
            icon={<AlertTriangle className="h-6 w-6 text-danger" />}
            title="Failed to load tasks"
            description="There was an issue loading your tasks. Refresh or try again later."
            actionLabel="Retry"
            onAction={() => void refetch()}
            buttonVariant="secondary"
          />
        ) : filteredTasks.length === 0 ? (
          <StatePanel
            icon={<Inbox className="h-6 w-6 text-slate-400" />}
            title="No tasks found"
            description="Try a different search or filter to discover tasks in your board."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setPriorityFilter("ALL");
            }}
            buttonVariant="secondary"
          />
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid gap-6 lg:grid-cols-4">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={tasksByColumn[column.id] ?? []}
                  statusOrder={STATUS_ORDER}
                  onView={setActiveTask}
                  onEdit={user?.role === "ADMIN" || user?.role === "MANAGER" ? (taskToEdit) => {
                    setEditingTask(taskToEdit);
                    setActiveTask(taskToEdit);
                  } : undefined}
                  onMoveLeft={(taskToMove) =>
                    changeTaskStatus(
                      taskToMove,
                      STATUS_ORDER[Math.max(0, STATUS_ORDER.indexOf(taskToMove.status) - 1)]
                    )
                  }
                  onMoveRight={(taskToMove) =>
                    changeTaskStatus(
                      taskToMove,
                      STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, STATUS_ORDER.indexOf(taskToMove.status) + 1)]
                    )
                  }
                  disabled={false}
                  currentUserId={user?.role === "USER" ? user.id : undefined}
                />
              ))}
            </div>
          </DndContext>
        )
      ) : (
        listLoading ? (
          <StatePanel
            icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
            title="Loading task list"
            description="Querying server-side paginated tasks..."
          />
        ) : listError ? (
          <StatePanel
            icon={<AlertTriangle className="h-6 w-6 text-danger" />}
            title="Failed to load task list"
            description={listError.message}
            actionLabel="Retry"
            onAction={() => void refetchList()}
            buttonVariant="secondary"
          />
        ) : !listData?.tasks || listData.tasks.data.length === 0 ? (
          <StatePanel
            icon={<Inbox className="h-6 w-6 text-slate-400" />}
            title="No tasks found"
            description="Try a different search or filter to discover tasks in your workspace."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setPriorityFilter("ALL");
            }}
            buttonVariant="secondary"
          />
        ) : (
          <div>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Task</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assignee</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {listData.tasks.data.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-500 truncate max-w-xs">{task.description}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium border ${
                          task.status === "DONE"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : task.status === "REVIEW"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}>
                          {task.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium border ${
                          task.priority === "HIGH"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : task.priority === "MEDIUM"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {formatDate(task.dueDate) || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {task.assignee?.name || "Unassigned"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => setActiveTask(task as any)}
                          className="text-primary hover:text-primary-dark transition hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {listData.tasks.totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500 font-medium">
                  Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * limitPerPage + 1}</span> to{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * limitPerPage, listData.tasks.total)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-900">{listData.tasks.total}</span> tasks
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl px-3 py-1.5 text-xs"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: listData.tasks.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${
                        currentPage === p
                          ? "bg-primary text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <Button
                    variant="secondary"
                    disabled={currentPage >= listData.tasks.totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(listData.tasks.totalPages, p + 1))}
                    className="rounded-xl px-3 py-1.5 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {activeTask ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-10">
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Task details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeTask.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTask(null);
                  setEditingTask(null);
                }}
                className="text-slate-500 transition hover:text-slate-900"
              >
                ×
              </button>
            </div>

            {editingTask && editingTask.id === activeTask.id ? (
              <div className="mt-6">
                <TaskForm initial={activeTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{activeTask.status.replaceAll("_", " ")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Priority</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{activeTask.priority}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Description</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{activeTask.description || "No description added."}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Due date</p>
                    <p className="mt-2 text-sm text-slate-700">{formatDate(activeTask.dueDate) || "No due date"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Created</p>
                    <p className="mt-2 text-sm text-slate-700">{formatDate(activeTask.createdAt)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Assignee</p>
                    {user?.role === "ADMIN" || user?.role === "MANAGER" ? (
                      <select
                        value={activeTask.assignee?.id ?? ""}
                        onChange={async (e) => {
                          const val = e.target.value;
                          if (val) {
                            const selectedUser = usersData?.users.find((u) => u.id === val);
                            await assignTask({
                              variables: { taskId: activeTask.id, userId: val },
                              optimisticResponse: {
                                __typename: "Mutation",
                                assignTask: {
                                  __typename: "Task",
                                  id: activeTask.id,
                                  assignee: selectedUser ? {
                                    __typename: "User",
                                    id: selectedUser.id,
                                    name: selectedUser.name,
                                    email: selectedUser.email,
                                  } : null,
                                },
                              } as any,
                            });
                          }
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary/60 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {usersData?.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-2 text-sm text-slate-700">
                        {activeTask.assignee?.name || "Unassigned"}
                      </p>
                    )}
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Board action</p>
                    <p className="mt-2 text-sm text-slate-700">Open edit or delete below.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {user?.role === "ADMIN" || user?.role === "MANAGER" ? (
                    <Button
                      type="button"
                      onClick={() => setEditingTask(activeTask)}
                      variant="primary"
                      className="rounded-2xl px-4 py-3"
                    >
                      Edit task
                    </Button>
                  ) : null}
                  {user?.role === "ADMIN" ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(activeTask.id)}
                      className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition hover:border-danger/40"
                    >
                      Delete task
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}